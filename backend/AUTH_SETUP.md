# API Authentication Setup

## Overview

The backend API now requires authentication for write operations (POST, PUT, DELETE). Read operations (GET) remain public.

## Authentication Method

All write-protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-api-token>
```

## Protected Endpoints

### Investments
- `POST /api/investments` - Create new investment
- `PUT /api/investments/:id` - Update investment

### Valuations
- `POST /api/valuations` - Create valuation entry

### Actions
- `PUT /api/actions/:id` - Update action required
- `POST /api/actions/:id/clear` - Clear action required

## Change Rationale Requirement

All write operations require a `rationale` field in the request body explaining why the change is being made.

Example:
```json
{
  "companyName": "Updated Company Name",
  "rationale": "Correcting typo in company name"
}
```

## Setup Instructions

### 1. Generate API Token

Generate a secure random token:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### 2. Set API Token in Railway

1. Go to Railway dashboard: https://railway.app/project/bountiful-renewal
2. Select the backend service
3. Go to "Variables" tab
4. Add new variable:
   - Name: `API_TOKEN`
   - Value: `<your-generated-token>`
5. Redeploy the service

### 3. Test Authentication

**Test without token (should fail):**
```bash
curl -X POST https://rogue-portfolio-backend-production.up.railway.app/api/investments \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Test","rationale":"Test"}'
```

Expected response: `403 Forbidden`

**Test with token (should succeed):**
```bash
curl -X POST https://rogue-portfolio-backend-production.up.railway.app/api/investments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-api-token>" \
  -d '{
    "icReference": "TEST-001",
    "icApprovalDate": "2025-01-01T00:00:00Z",
    "investmentExecutionDate": "2025-01-01T00:00:00Z",
    "dealOwner": "Test User",
    "companyName": "Test Company",
    "sector": "Technology",
    "geography": "US",
    "stage": "SEED",
    "investmentType": "SAFE",
    "committedCapitalLcl": 100000,
    "currentFairValueEur": 100000,
    "rationale": "Creating test investment"
  }'
```

## Audit Logging

All write operations are automatically logged to the `AuditLog` table with:
- Investment ID
- Action type (INVESTMENT_CREATED, INVESTMENT_UPDATED, VALUATION_UPDATE, etc.)
- Field name changed
- Old and new values
- Rationale for change
- User who made the change
- Timestamp

### View Audit Logs

Audit logs are included in investment detail responses:

```bash
curl https://rogue-portfolio-backend-production.up.railway.app/api/investments/<id>
```

Response includes `auditLogs` array with all changes.

## Security Best Practices

1. **Keep API Token Secret**
   - Never commit API token to git
   - Use Railway's encrypted variables
   - Rotate token periodically

2. **Use HTTPS Only**
   - All API calls should use HTTPS
   - Railway provides HTTPS automatically

3. **Token Rotation**
   - Generate new token every 90 days
   - Update Railway variable
   - Update all clients using the token

4. **Access Control**
   - Share API token only with authorized users
   - Use different tokens for different environments (if staging is added)
   - Monitor audit logs for suspicious activity

## Error Responses

### Missing Authorization Header
```json
{
  "error": "Authorization header required"
}
```
Status: 401

### Invalid Token
```json
{
  "error": "Invalid or missing API token"
}
```
Status: 403

### Missing Rationale
```json
{
  "error": "Change rationale is required",
  "message": "Please provide a rationale explaining why this change is being made"
}
```
Status: 400

## Example Usage in Frontend

```typescript
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN; // Or fetch from secure storage

async function updateInvestment(id: string, data: any, rationale: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/investments/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({
        ...data,
        rationale,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update investment');
  }

  return response.json();
}
```

## Next Steps

1. Generate and set API_TOKEN in Railway
2. Test authentication with curl or Postman
3. Update frontend to include Authorization header
4. Monitor audit logs for changes
5. Implement token rotation schedule
