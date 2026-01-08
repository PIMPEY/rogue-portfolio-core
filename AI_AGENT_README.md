# AI Investment Data Ingestion Agent

## Overview

The AI Investment Ingestion Agent uses Claude (via Tensorix API) to intelligently parse and extract structured investment data from unstructured text sources. This eliminates manual data entry and makes it easy to import investment information from emails, documents, spreadsheets, or any text format.

## Features

- **Intelligent Parsing**: Automatically extracts investment data from unstructured text
- **Multi-Investment Support**: Can parse multiple investments in a single request
- **Data Normalization**: Normalizes company names, converts currencies, and infers missing data
- **Confidence Scoring**: Provides confidence levels (high/medium/low) for parsed data
- **Warning System**: Flags ambiguous or uncertain data points
- **Auto-Import**: Option to automatically save parsed data to the database
- **Portfolio Analysis**: AI-powered portfolio analysis and insights

## API Endpoints

### 1. Parse Investment Data

**Endpoint**: `POST /api/ai/ingest`

**Request Body**:
```json
{
  "text": "Company: PayFlow Solutions\nSector: FinTech\nInvestment: €2M...",
  "autoImport": false
}
```

**Parameters**:
- `text` (string, required): Unstructured text containing investment data
- `autoImport` (boolean, optional): If true, automatically saves parsed data to database

**Response**:
```json
{
  "success": true,
  "message": "Successfully parsed 1 investment(s)",
  "data": {
    "parsed": [
      {
        "companyName": "PayFlow Solutions",
        "sector": "FinTech",
        "stage": "SERIES_A",
        "geography": "UK",
        "investmentType": "EQUITY",
        "committedCapital": 2000000,
        "deployedCapital": 2000000,
        "ownershipPercent": 15.0,
        "investmentDate": "2024-01-15",
        "roundSize": 5000000,
        "enterpriseValue": 20000000,
        "initialCash": 1500000,
        "monthlyBurn": 80000,
        "founderNames": ["John Doe"],
        "founderEmails": ["john@payflow.com"],
        "notes": null
      }
    ],
    "warnings": [],
    "confidence": "high"
  }
}
```

### 2. Analyze Portfolio

**Endpoint**: `POST /api/ai/analyze`

**Request Body**: None (analyzes all investments in portfolio)

**Response**:
```json
{
  "success": true,
  "data": {
    "analysis": "Your portfolio shows strong diversification across...",
    "portfolioSize": 10
  }
}
```

## Usage Examples

### Example 1: Parse Single Investment from Plain Text

**Input**:
```
Company: TechCorp AI
Sector: DeepTech
Stage: Series B
We invested €5M at a €50M valuation
Ownership: 10%
Investment date: March 15, 2025
Total round: €15M
Founders: Alice Johnson (alice@techcorp.ai) and Bob Williams
Current cash: €8M, burning €150k/month
```

**Curl Command**:
```bash
curl -X POST http://localhost:3001/api/ai/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Company: TechCorp AI\nSector: DeepTech\nStage: Series B\nWe invested €5M at a €50M valuation\nOwnership: 10%\nInvestment date: March 15, 2025\nTotal round: €15M\nFounders: Alice Johnson (alice@techcorp.ai) and Bob Williams\nCurrent cash: €8M, burning €150k/month"
  }'
```

### Example 2: Parse Multiple Investments

**Input**:
```
Investment 1:
Company: HealthTech Diagnostics
Sector: HealthTech
Stage: SEED
€500k SAFE
8% ownership
February 2024

Investment 2:
Company: GreenEnergy AI
Sector: CleanTech
Stage: Series A
€3M equity, deployed €2.5M
12% ownership
April 2024
€8M round, €35M valuation
```

### Example 3: Parse from Email Content

**Input**:
```
Hi team,

Excited to announce we've closed our investment in PayFlow Solutions!

Details:
- Company: PayFlow Solutions (UK-based FinTech)
- Deal: €2M equity investment in their Series A
- Round: €5M total at €20M pre-money
- Our stake: 15%
- Founders: John Doe (john@payflow.com), Jane Smith (jane@payflow.com)
- Current metrics: €1.5M cash, burning €80k/month

Looking forward to working with them!
```

### Example 4: Parse CSV Data

**Input**:
```
Company Name,Sector,Stage,Investment,Ownership,Date
FinTech Startup,FinTech,SEED,500000,8%,2024-01-15
HealthTech Co,HealthTech,SERIES_A,2000000,12%,2024-02-20
AI Solutions,DeepTech,SERIES_B,5000000,10%,2024-03-10
```

## Web Interface

Access the AI ingestion interface at: `http://localhost:3000/ai-ingest`

### Features:
1. **Text Input**: Large textarea for pasting investment data
2. **Auto-Import Toggle**: Enable to automatically save parsed data
3. **Real-time Parsing**: Instant feedback on parsed data
4. **Confidence Indicators**: Visual badges showing confidence levels
5. **Warning Display**: Shows any ambiguities or uncertainties
6. **Example Data**: One-click example loading
7. **Portfolio Analysis**: Analyze entire portfolio with AI

## Data Fields Extracted

The AI agent can extract the following fields:

### Required Fields
- `companyName` (string): Company name

### Optional Fields
- `sector` (string): Business sector (e.g., FinTech, HealthTech, CleanTech)
- `stage` (enum): Investment stage (SEED, SERIES_A, SERIES_B, SERIES_C, SERIES_D_PLUS)
- `geography` (string): Country/region
- `investmentType` (enum): EQUITY, SAFE, CLN, OTHER
- `committedCapital` (number): Committed capital in EUR
- `deployedCapital` (number): Deployed capital in EUR
- `ownershipPercent` (number): Ownership percentage (e.g., 15.5)
- `investmentDate` (string): Date in ISO format (YYYY-MM-DD)
- `roundSize` (number): Total round size in EUR
- `enterpriseValue` (number): Enterprise valuation in EUR
- `initialCash` (number): Initial cash balance in EUR
- `monthlyBurn` (number): Monthly burn rate in EUR
- `founderNames` (array): List of founder names
- `founderEmails` (array): List of founder emails
- `notes` (string): Additional context or notes

## Configuration

### Environment Variables

Add to `.env` in the backend directory:

```bash
# Tensorix API Key for AI ingestion
TENSORIX_API_KEY=sk-0suw10az1ex4YaAdYGLmsQ
```

### Model Configuration

The agent uses `claude-sonnet-4-20250514` by default. You can modify this in:
- File: `backend/src/services/aiAgent.ts`
- Line: `model: 'claude-sonnet-4-20250514'`

## Error Handling

### Common Errors

1. **Missing Company Name**
   - Error: `Investment X is missing required field: companyName`
   - Solution: Ensure at least a company name is present in the text

2. **Low Confidence**
   - Warning: Ambiguous data flagged
   - Solution: Review warnings and manually correct uncertain fields

3. **API Key Not Set**
   - Error: `TENSORIX_API_KEY not configured`
   - Solution: Add the environment variable

4. **Rate Limiting**
   - Error: `Too many requests`
   - Solution: Implement request throttling or upgrade API plan

## Best Practices

1. **Provide Context**: Include as much detail as possible in the input text
2. **Use Structured Formats**: Even loose structure helps (labels, line breaks)
3. **Review Before Import**: Use `autoImport: false` first to review parsed data
4. **Include Dates**: Always specify investment dates for proper timeline tracking
5. **Add Founder Info**: Include founder names and emails for better relationship tracking

## Technical Architecture

### Components

1. **AI Service** (`backend/src/services/aiAgent.ts`)
   - Handles Claude API communication
   - Implements parsing and analysis logic
   - Provides data validation

2. **API Routes** (`backend/src/routes/aiIngest.ts`)
   - REST endpoints for ingestion and analysis
   - Database integration
   - Error handling

3. **Frontend UI** (`app-web/src/app/ai-ingest/page.tsx`)
   - User-friendly interface
   - Real-time feedback
   - Result visualization

### Data Flow

```
User Input (Text)
    ↓
Frontend API Call
    ↓
Backend /api/ai/ingest
    ↓
AI Agent (Claude via Tensorix)
    ↓
Structured Data + Warnings
    ↓
[Optional] Database Import
    ↓
Response to Frontend
    ↓
Display Results
```

## Testing

### Manual Testing

1. Navigate to `http://localhost:3000/ai-ingest`
2. Click "Load example data"
3. Review parsed output
4. Toggle "Auto-import" and submit
5. Check portfolio page for imported investment

### API Testing with Curl

```bash
# Test parsing without import
curl -X POST http://localhost:3001/api/ai/ingest \
  -H "Content-Type: application/json" \
  -d '{"text": "Company: Test Corp\nSector: FinTech\nInvestment: €1M", "autoImport": false}'

# Test parsing with auto-import
curl -X POST http://localhost:3001/api/ai/ingest \
  -H "Content-Type: application/json" \
  -d '{"text": "Company: Test Corp\nSector: FinTech\nInvestment: €1M", "autoImport": true}'

# Test portfolio analysis
curl -X POST http://localhost:3001/api/ai/analyze
```

## Limitations

1. **Currency Conversion**: Currently assumes 1:1 USD to EUR conversion
2. **Date Formats**: Prefers ISO format but can parse common formats
3. **Ambiguous Data**: May require manual review for complex scenarios
4. **API Costs**: Each request incurs Tensorix API costs
5. **Rate Limits**: Subject to Tensorix API rate limiting

## Future Enhancements

- [ ] File upload support (PDF, Excel, CSV)
- [ ] Batch processing for multiple files
- [ ] Historical data enrichment from external sources
- [ ] Real-time currency conversion
- [ ] Custom parsing templates
- [ ] Audit trail for AI-generated imports
- [ ] Confidence threshold configuration
- [ ] Multi-language support

## Support

For issues or questions:
1. Check the error message and warnings
2. Review the API response structure
3. Verify environment variables are set
4. Check Tensorix API status
5. Contact support with request details

## License

Part of the Rogue Portfolio Management System.
