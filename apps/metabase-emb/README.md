# Metabase Embedding Backend

This service generates secure JWT tokens for embedding Metabase dashboards and manages API key distribution for action execution.

## Overview

This Express.js application provides an endpoint to generate Metabase embedding URLs with proper JWT authentication. It handles access control and permission checks before generating embedding tokens.

## Environment Variables

Create a `.env` file (see `.env.example`):

```
PORT=3002
NODE_ENV=development
METABASE_EMBEDDING_TOKEN=your_metabase_embedding_secret_key_here
```

## API Endpoints

### POST /api/v1/metabase/dashboards

Generates a secure embedding URL for a Metabase dashboard with optional API key for action execution.

**Request Body:**
```json
{
  "dashboard": "dashboard-id",
  "params": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

**Response:**
```json
{
  "iframeUrl": "https://your-metabase.com/embed/dashboard/jwt-token-here",
  "apiKey": "mb_api_key_xxxxx" // Optional - only included if user has permission to execute actions
}
```

## Security Flow

1. **Access Control**: The backend validates user permissions before generating any embedding URL
2. **JWT Generation**: The JWT token encodes the dashboard ID and parameters, ensuring the embedded dashboard can only access authorized resources
3. **API Key Distribution**: If the user has permission to execute actions, an API key is included in the response
4. **Token Exchange**: The embedded Metabase can request the API key via postMessage from the parent window

## Authentication Token Exchange

This backend works in conjunction with the frontend to enable secure token exchange:

1. The frontend requests a dashboard embedding URL from this service
2. This service:
   - Validates user permissions and access rights
   - Generates a JWT token encoding the dashboard info and parameters
   - Optionally includes an API key if the user can execute actions
   - Returns the iframe URL and optional API key
3. The embedded Metabase requests auth tokens via postMessage
4. The parent application responds with sessionToken and/or apiKey as received from this backend

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm start
```