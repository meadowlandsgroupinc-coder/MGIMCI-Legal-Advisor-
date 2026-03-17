import Anthropic from '@anthropic-ai/sdk';

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { messages, documentContext, analysisContext } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Messages array required' });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const docSection = documentContext ? `\n\nCURRENT DOCUMENT:\n${documentContext.substring(0, 8000)}` : '';
  const analysisSection = analysisContext
    ? `\n\nANALYSIS: Type: ${analysisContext.documentType} | Score: ${analysisContext.score}/100 | Risk: ${analysisContext.riskLevel} | Issues: ${(analysisContext.criticalIssues || []).slice(0, 3).join('; ')}`
    : '';

  const CHAT_SYSTEM = `You are LexAI, a highly knowledgeable AI legal assistant specializing in Canadian law, particularly Ontario law. You cover contract law, real estate, construction law, corporate law, employment law, family law, and litigation strategy.

Be direct, professional, and genuinely helpful. Use **bold** for key terms. Reference specific Ontario/Canadian statutes when relevant. Always note when a matter requires a licensed Ontario lawyer.${docSection}${analysisSection}`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: CHAT_SYSTEM,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages,
    });

    const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
    return res.status(200).json({ success: true, message: text });
  } catch (err) {
    console.error('[Chat Error]', err);
    return res.status(500).json({ error: err.message || 'Chat failed. Please try again.' });
  }
}
