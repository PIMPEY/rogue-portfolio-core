# Simple MVP - No AWS Required

This is a simplified version of the investment management system that doesn't require AWS S3. Documents are stored locally and analyzed using ChatGPT.

## Features

- **Create Investments**: Add new investments with basic information
- **Upload Documents**: Upload pitch decks, financial models, and other documents (stored locally as base64)
- **ChatGPT Analysis**: Analyze documents using OpenAI's GPT-4o-mini model
- **No AWS Required**: Everything runs locally without cloud storage

## Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

Add your OpenAI API key to `backend/.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL="file:./dev.db"
```

Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### 2. Frontend Setup

```bash
cd app-web
npm install
```

The frontend is already configured to connect to the backend at `http://localhost:3001`.

Start the frontend:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. Navigate to `http://localhost:3000/simple-mvp`
2. Fill in the investment details (company name, sector, stage, committed capital)
3. Upload documents (PDF, DOC, DOCX, TXT)
4. Click "Analyze with ChatGPT" to get AI-powered insights
5. Optionally click "Create Investment" to save to the database

## How It Works

### Document Storage
- Documents are converted to base64 and stored in memory
- No external storage required
- Documents are sent directly to ChatGPT for analysis

### ChatGPT Analysis
- Uses OpenAI's GPT-4o-mini model
- Extracts key information: founders, metrics, valuation, market analysis, risks, opportunities
- Returns structured JSON data

### Database
- Uses SQLite for local development
- Investments are stored in `backend/prisma/dev.db`
- Can be viewed with Prisma Studio: `cd backend && npx prisma studio`

## API Endpoints

### POST /api/review/analyze-direct
Analyzes documents using ChatGPT without requiring an existing investment.

Request body:
```json
{
  "investmentId": null,
  "documents": [
    {
      "fileName": "pitch-deck.pdf",
      "type": "PITCH_DECK",
      "content": "base64_encoded_content"
    }
  ],
  "investment": {
    "companyName": "TechStartup Inc.",
    "sector": "SaaS",
    "stage": "SEED",
    "committedCapitalLcl": 500000
  }
}
```

Response:
```json
{
  "success": true,
  "analysis": {
    "founders": [...],
    "metrics": {...},
    "valuation": {...},
    "market": {...},
    "risks": [...],
    "opportunities": [...],
    "summary": "..."
  }
}
```

### POST /api/investments/create
Creates a new investment in the database.

Request body:
```json
{
  "investment": {
    "companyName": "TechStartup Inc.",
    "sector": "SaaS",
    "stage": "SEED",
    "committedCapitalLcl": 500000,
    "currentFairValueEur": 500000,
    "icApprovalDate": "2024-01-01T00:00:00.000Z",
    "investmentExecutionDate": "2024-01-01T00:00:00.000Z",
    "icReference": "IC-1234567890",
    "dealOwner": "John Doe"
  },
  "files": [
    {
      "fileName": "pitch-deck.pdf",
      "fileSize": 12345,
      "filePath": "local://pitch-deck.pdf"
    }
  ]
}
```

## Limitations

- Documents are stored in memory only (not persisted to disk)
- File size limited by browser memory (typically ~10-50MB)
- No document preview or download functionality
- ChatGPT analysis is based on document metadata only (not actual content parsing)

## Future Enhancements

- Add document parsing to extract text from PDF/DOCX files
- Store documents on disk instead of memory
- Add document preview functionality
- Support for more document types
- Batch analysis of multiple investments
- Export analysis results to PDF/Excel

## Troubleshooting

### "OpenAI API key not configured"
Make sure you've added your OpenAI API key to `backend/.env`:
```
OPENAI_API_KEY=sk-...
```

### "Failed to analyze documents"
Check the backend console for error messages. Common issues:
- Invalid OpenAI API key
- Network connectivity issues
- OpenAI API rate limits

### "Backend not available"
Make sure the backend server is running:
```bash
cd backend
npm run dev
```

Check that it's running on `http://localhost:3001`
