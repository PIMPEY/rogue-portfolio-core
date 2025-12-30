import OpenAI from 'openai';

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function analyzeDocuments(documents: any[], investment: any) {
  const openai = getOpenAIClient();
  
  const documentContext = documents.map(doc => `
    - ${doc.fileName} (${doc.type})
  `).join('\n');

  const prompt = `
You are an investment analyst. Analyze the following investment documents and extract key information.

Investment Details:
- Company: ${investment.companyName}
- Sector: ${investment.sector}
- Stage: ${investment.stage}
- Committed Capital: $${investment.committedCapitalLcl}

Documents:
${documentContext}

Please extract and provide the following information in JSON format:
{
  "founders": [
    {"name": "Founder Name", "email": "email@example.com"}
  ],
  "metrics": {
    "revenue": 0,
    "growth": 0,
    "burn": 0,
    "runway": 0
  },
  "valuation": {
    "preMoney": 0,
    "postMoney": 0,
    "rationale": "Valuation rationale"
  },
  "market": {
    "tam": 0,
    "sam": 0,
    "som": 0,
    "analysis": "Market analysis"
  },
  "risks": [
    "Risk 1",
    "Risk 2"
  ],
  "opportunities": [
    "Opportunity 1",
    "Opportunity 2"
  ],
  "summary": "Brief investment summary"
}

If you cannot find specific information, use reasonable estimates or null values.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert investment analyst. Always respond with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content || '{}');
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to analyze documents with AI');
  }
}

export async function analyzeDocumentsDirect(documents: any[], investment: any) {
  const openai = getOpenAIClient();
  
  const documentContext = documents.map(doc => `
    - ${doc.fileName} (${doc.type})
  `).join('\n');

  const prompt = `
You are an investment analyst. Analyze the following investment documents and extract key information.

Investment Details:
- Company: ${investment.companyName || 'Unknown'}
- Sector: ${investment.sector || 'Unknown'}
- Stage: ${investment.stage || 'Unknown'}
- Committed Capital: $${investment.committedCapitalLcl || 0}

Documents:
${documentContext}

Please extract and provide the following information in JSON format:
{
  "founders": [
    {"name": "Founder Name", "email": "email@example.com"}
  ],
  "metrics": {
    "revenue": 0,
    "growth": 0,
    "burn": 0,
    "runway": 0
  },
  "valuation": {
    "preMoney": 0,
    "postMoney": 0,
    "rationale": "Valuation rationale"
  },
  "market": {
    "tam": 0,
    "sam": 0,
    "som": 0,
    "analysis": "Market analysis"
  },
  "risks": [
    "Risk 1",
    "Risk 2"
  ],
  "opportunities": [
    "Opportunity 1",
    "Opportunity 2"
  ],
  "summary": "Brief investment summary"
}

If you cannot find specific information, use reasonable estimates or null values.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert investment analyst. Always respond with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content || '{}');
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to analyze documents with AI');
  }
}
