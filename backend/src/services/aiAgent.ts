const TENSORIX_API_KEY = process.env.TENSORIX_API_KEY || '';
const TENSORIX_BASE_URL = 'https://api.tensorix.ai/v1';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const USE_OPENAI = true; // Set to true to use OpenAI instead of Tensorix

console.log('🔑 API Key loaded:', USE_OPENAI
  ? (OPENAI_API_KEY ? `OpenAI: ${OPENAI_API_KEY.substring(0, 10)}...` : 'OpenAI: NOT SET')
  : (TENSORIX_API_KEY ? `Tensorix: ${TENSORIX_API_KEY.substring(0, 10)}...` : 'Tensorix: NOT SET'));

export interface InvestmentData {
  companyName: string;
  sector?: string;
  stage?: 'SEED' | 'SERIES_A' | 'SERIES_B' | 'SERIES_C' | 'SERIES_D_PLUS';
  geography?: string;
  investmentType?: 'EQUITY' | 'SAFE' | 'CLN' | 'OTHER';
  committedCapital?: number;
  deployedCapital?: number;
  ownershipPercent?: number;
  investmentDate?: string;
  roundSize?: number;
  enterpriseValue?: number;
  initialCash?: number;
  monthlyBurn?: number;
  founderNames?: string[];
  founderEmails?: string[];
  notes?: string;
}

export interface ParsedInvestmentsResponse {
  investments: InvestmentData[];
  warnings: string[];
  confidence: 'high' | 'medium' | 'low';
}

/**
 * AI Agent for parsing and extracting investment data from unstructured text or documents
 */
export class InvestmentDataAgent {
  /**
   * Parse investment data from unstructured text using Claude via Tensorix
   */
  async parseInvestmentData(input: string): Promise<ParsedInvestmentsResponse> {
    try {
      const systemPrompt = `You are an expert VC portfolio data analyst. Your task is to extract structured investment data from unstructured text, documents, or tables.

Extract the following fields when available:
- companyName (required)
- sector (e.g., FinTech, HealthTech, CleanTech, EdTech, etc.)
- stage (SEED, SERIES_A, SERIES_B, SERIES_C, SERIES_D_PLUS)
- geography (country name)
- investmentType (EQUITY, SAFE, CLN, OTHER)
- committedCapital (in EUR, numeric)
- deployedCapital (in EUR, numeric)
- ownershipPercent (as decimal, e.g., 15.5 for 15.5%)
- investmentDate (ISO format YYYY-MM-DD)
- roundSize (in EUR, numeric)
- enterpriseValue (in EUR, numeric)
- initialCash (in EUR, numeric)
- monthlyBurn (in EUR, numeric)
- founderNames (array of strings)
- founderEmails (array of email strings)
- notes (any additional context)

IMPORTANT:
1. Convert all currency amounts to EUR (assume USD if not specified and convert 1:1 for simplicity)
2. Normalize company names (proper capitalization, remove extra spaces)
3. Infer sector if obvious from company name/description
4. If multiple investments are present, extract all of them
5. Flag any ambiguous or uncertain data in warnings
6. Return high confidence only if all critical fields (company, capital amounts) are clearly present

Return ONLY a JSON object with this exact structure:
{
  "investments": [
    {
      "companyName": "string",
      "sector": "string",
      "stage": "SERIES_A",
      "geography": "string",
      "investmentType": "EQUITY",
      "committedCapital": 1000000,
      "deployedCapital": 1000000,
      "ownershipPercent": 15.0,
      "investmentDate": "2024-01-15",
      "roundSize": 5000000,
      "enterpriseValue": 20000000,
      "initialCash": 2000000,
      "monthlyBurn": 80000,
      "founderNames": ["John Doe"],
      "founderEmails": ["john@company.com"],
      "notes": "Additional context"
    }
  ],
  "warnings": ["list of warnings about ambiguous data"],
  "confidence": "high" | "medium" | "low"
}`;

      const model = USE_OPENAI ? 'gpt-4o-mini' : 'deepseek/deepseek-chat-v3.1';
      const apiUrl = USE_OPENAI ? 'https://api.openai.com/v1/chat/completions' : `${TENSORIX_BASE_URL}/chat/completions`;
      const apiKey = USE_OPENAI ? OPENAI_API_KEY : TENSORIX_API_KEY;

      console.log('🤖 Making AI request with model:', model);
      console.log('🔑 API Key (first 10 chars):', apiKey.substring(0, 10));
      console.log('🌐 API URL:', apiUrl);

      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: `Please extract investment data from the following text:\n\n${input}`,
            },
          ],
          temperature: 0.1,
          max_tokens: 4096,
        }),
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('❌ API request failed:', {
          status: apiResponse.status,
          statusText: apiResponse.statusText,
          body: errorText,
        });
        throw new Error(`API request failed with status ${apiResponse.status}: ${errorText}`);
      }

      const response: any = await apiResponse.json();
      console.log('✅ AI request successful');

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from AI');
      }

      // Parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from AI response');
      }

      const parsed: ParsedInvestmentsResponse = JSON.parse(jsonMatch[0]);

      // Validate required fields
      parsed.investments.forEach((inv, idx) => {
        if (!inv.companyName) {
          throw new Error(`Investment ${idx + 1} is missing required field: companyName`);
        }
      });

      return parsed;
    } catch (error: any) {
      console.error('Error parsing investment data:', error);
      throw new Error(`AI parsing failed: ${error.message}`);
    }
  }

  /**
   * Analyze portfolio data and provide insights
   */
  async analyzePortfolio(investments: any[]): Promise<string> {
    try {
      const portfolioSummary = JSON.stringify(investments, null, 2);

      const apiResponse = await fetch(`${TENSORIX_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TENSORIX_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3.1',
          messages: [
            {
              role: 'user',
              content: `As a VC portfolio analyst, please analyze this portfolio and provide key insights about diversification, risk concentration, performance trends, and recommendations:\n\n${portfolioSummary}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });

      if (!apiResponse.ok) {
        throw new Error(`API request failed with status ${apiResponse.status}`);
      }

      const response: any = await apiResponse.json();
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from AI');
      }

      return content;
    } catch (error: any) {
      console.error('Error analyzing portfolio:', error);
      throw new Error(`Portfolio analysis failed: ${error.message}`);
    }
  }

  /**
   * Extract data from CSV/Excel text
   */
  async parseStructuredData(csvOrExcelText: string, headers?: string[]): Promise<ParsedInvestmentsResponse> {
    const prompt = headers
      ? `Parse this tabular data with headers: ${headers.join(', ')}\n\n${csvOrExcelText}`
      : `Parse this tabular investment data:\n\n${csvOrExcelText}`;

    return this.parseInvestmentData(prompt);
  }
}

export const investmentDataAgent = new InvestmentDataAgent();
