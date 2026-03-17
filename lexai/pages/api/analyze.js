import Anthropic from '@anthropic-ai/sdk';

export const config = { api: { bodyParser: { sizeLimit: '20mb' } } };

const LEGAL_SYSTEM_PROMPT = `You are LexAI, an elite legal document analyst with 30+ years of experience as a senior partner specializing in Canadian law (Ontario), contract law, real estate law, construction law, corporate law, employment law, and litigation. You have reviewed thousands of legal documents.

Your task: Thoroughly analyze the provided legal document and return a comprehensive assessment.

CRITICAL: Respond with ONLY a valid JSON object — no preamble, no explanation, no markdown fences. Just raw JSON.

Required JSON structure:
{
  "documentType": "exact type (e.g. Construction Contract, Demand Letter, Lease Agreement)",
  "summary": "2-3 sentence executive summary",
  "score": integer 0-100,
  "scoreExplanation": "specific reasons for this score",
  "riskLevel": "LOW" or "MEDIUM" or "HIGH" or "CRITICAL",
  "riskExplanation": "specific risks identified",
  "pros": ["array of specific strengths"],
  "cons": ["array of specific weaknesses"],
  "criticalIssues": ["array of must-fix problems"],
  "recommendations": ["array of specific actionable improvements"],
  "missingClauses": ["array of important standard clauses that are absent"],
  "legalReferences": ["array of relevant Ontario/Canadian laws and statutes"],
  "keyParties": ["array of all parties and their roles"],
  "keyDates": ["array of important dates and deadlines"],
  "keyFinancialTerms": ["array of monetary amounts and payment terms"],
  "jurisdiction": "applicable jurisdiction",
  "enforceability": "STRONG" or "MODERATE" or "QUESTIONABLE" or "INVALID",
  "enforceabilityNotes": "enforceability concerns"
}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { fileBase64, mimeType, fileName, extractedText } = req.body;
  if (!fileBase64 && !extractedText) return res.status(400).json({ error: 'No document content provided' });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    let messageContent;
    let serverExtractedText = extractedText || '';

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') {
      try {
        const mammoth = (await import('mammoth')).default;
        const buffer = Buffer.from(fileBase64, 'base64');
        const result = await mammoth.extractRawText({ buffer });
        serverExtractedText = result.value;
      } catch (e) {
        serverExtractedText = extractedText || '';
      }
    }

    if (mimeType === 'application/pdf' && fileBase64) {
      messageContent = [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileBase64 } },
        { type: 'text', text: `Analyze this legal document. File: "${fileName}". Return ONLY the JSON object.` },
      ];
    } else if (mimeType && mimeType.startsWith('image/') && fileBase64) {
      messageContent = [
        { type: 'image', source: { type: 'base64', media_type: mimeType, data: fileBase64 } },
        { type: 'text', text: `Analyze this legal document image. File: "${fileName}". Return ONLY the JSON object.` },
      ];
    } else {
      const docText = (serverExtractedText || extractedText || '').substring(0, 120000);
      messageContent = `Analyze this legal document:\n\nFilename: "${fileName}"\n\nFULL DOCUMENT TEXT:\n${docText}\n\nReturn ONLY the JSON object.`;
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: LEGAL_SYSTEM_PROMPT,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: messageContent }],
    });

    const textBlocks = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const jsonMatch = textBlocks.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI returned invalid response format. Please try again.');

    const analysis = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ success: true, analysis, extractedText: serverExtractedText });
  } catch (err) {
    console.error('[Analyze Error]', err);
    return res.status(500).json({ error: err.message || 'Analysis failed. Please try again.' });
  }
}
