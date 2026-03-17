import Anthropic from '@anthropic-ai/sdk';

export const config = { api: { bodyParser: { sizeLimit: '5mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { documentText, analysis, fileName } = req.body;
  if (!documentText || !analysis) return res.status(400).json({ error: 'Document text and analysis required' });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const REVISE_PROMPT = `You are LexAI, an elite legal document drafter with deep expertise in Canadian and Ontario law. Produce a complete, professionally revised version of the provided legal document.

You must:
1. Fix every critical issue and weakness from the analysis
2. Add all missing clauses flagged
3. Strengthen weak or ambiguous language
4. Use proper legal formatting with numbered sections (1., 1.1, 1.2 etc.)
5. Apply Ontario/Canadian legal standards throughout
6. Include a proper signature block and governing law clause

Return ONLY the complete revised document text — no commentary, no preamble. Begin directly with the document title.`;

  try {
    const analysisContext = `
DOCUMENT TYPE: ${analysis.documentType}
SCORE: ${analysis.score}/100
CRITICAL ISSUES TO FIX:\n${(analysis.criticalIssues || []).map(i => `• ${i}`).join('\n')}
WEAKNESSES TO ADDRESS:\n${(analysis.cons || []).map(c => `• ${c}`).join('\n')}
RECOMMENDATIONS:\n${(analysis.recommendations || []).map(r => `• ${r}`).join('\n')}
MISSING CLAUSES TO ADD:\n${(analysis.missingClauses || []).map(m => `• ${m}`).join('\n')}
LEGAL REFERENCES:\n${(analysis.legalReferences || []).map(l => `• ${l}`).join('\n')}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: REVISE_PROMPT,
      messages: [{
        role: 'user',
        content: `Produce a complete revised version of this document:\n\n=== ORIGINAL (${fileName}) ===\n${documentText.substring(0, 80000)}\n\n=== REQUIRED IMPROVEMENTS ===\n${analysisContext}\n\nProduce the complete revised document now:`,
      }],
    });

    const revisedText = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
    return res.status(200).json({ success: true, revisedText });
  } catch (err) {
    console.error('[Revise Error]', err);
    return res.status(500).json({ error: err.message || 'Revision failed. Please try again.' });
  }
}
