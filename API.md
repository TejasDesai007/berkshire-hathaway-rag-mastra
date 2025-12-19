# Berkshire Hathaway RAG API Documentation

This API allows you to query the Berkshire Hathaway shareholder letters (2019-2024) using REST endpoints.

## Base URL

```
http://localhost:3000/api
```

Or if deployed:
```
https://your-domain.com/api
```

## Endpoints

### 1. Health Check

Check if the API server is running.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-19T10:30:00.000Z",
  "service": "Berkshire Hathaway RAG API"
}
```

---

### 2. Status Check

Check database connection and data availability.

**Endpoint:** `GET /api/status`

**Response:**
```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "totalChunks": 1234,
    "totalDocuments": 6,
    "ready": true
  },
  "environment": {
    "hasOpenAIKey": true,
    "hasDatabaseUrl": true
  }
}
```

---

### 3. Query (Main Endpoint)

Ask a question and get an answer based on the shareholder letters.

**Endpoint:** `POST /api/query`

**Request Body:**
```json
{
  "question": "What is Warren Buffett's investment philosophy?",
  "limit": 5
}
```

**Parameters:**
- `question` (required, string): The question to ask
- `limit` (optional, number): Number of chunks to retrieve (default: 5)

**Response:**
```json
{
  "success": true,
  "question": "What is Warren Buffett's investment philosophy?",
  "answer": "Warren Buffett's investment philosophy emphasizes...",
  "ragVerification": {
    "chunksRetrieved": 5,
    "chunksUsed": [
      {
        "chunkNumber": 1,
        "source": "2023.pdf",
        "year": 2023,
        "relevanceScore": "0.8542",
        "preview": "Warren Buffett believes in long-term value investing..."
      }
    ],
    "contextLength": 2500,
    "verifiedFromDatabase": true
  },
  "sources": [
    {
      "source": "2023.pdf",
      "year": 2023,
      "score": 0.8542
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to process query",
  "message": "Error details here"
}
```

---

### 4. Retrieve Chunks Only

Retrieve relevant chunks without generating an answer.

**Endpoint:** `POST /api/retrieve`

**Request Body:**
```json
{
  "query": "retained earnings",
  "limit": 3
}
```

**Parameters:**
- `query` (required, string): Search query
- `limit` (optional, number): Number of chunks to retrieve (default: 5)

**Response:**
```json
{
  "success": true,
  "query": "retained earnings",
  "chunks": [
    {
      "index": 1,
      "content": "Berkshire Hathaway benefits from retained earnings...",
      "score": 0.8542,
      "source": "2023.pdf",
      "year": 2023
    }
  ],
  "total": 3,
  "summary": "Retrieved 3 relevant chunk(s) from Berkshire Hathaway letters."
}
```

---

## Example Usage

### Using cURL

```bash
# Health check
curl http://localhost:3000/api/health

# Check status
curl http://localhost:3000/api/status

# Ask a question
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How does Berkshire benefit from retained earnings?",
    "limit": 5
  }'

# Retrieve chunks only
curl -X POST http://localhost:3000/api/retrieve \
  -H "Content-Type: application/json" \
  -d '{
    "query": "long term investing",
    "limit": 3
  }'
```

### Using JavaScript (Fetch)

```javascript
// Query endpoint
const response = await fetch('http://localhost:3000/api/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    question: 'What is Warren Buffett\'s view on market volatility?',
    limit: 5
  })
});

const data = await response.json();
console.log(data.answer);
console.log(data.ragVerification);
```

### Using Python (Requests)

```python
import requests

# Query endpoint
response = requests.post(
    'http://localhost:3000/api/query',
    json={
        'question': 'What is Warren Buffett\'s investment philosophy?',
        'limit': 5
    }
)

data = response.json()
print(data['answer'])
print(data['ragVerification'])
```

---

## RAG Verification

All responses include `ragVerification` metadata to confirm that answers come from your database, not OpenAI's training data:

- `chunksRetrieved`: Number of chunks retrieved from database
- `chunksUsed`: Details of each chunk used (source, year, relevance score)
- `contextLength`: Length of context sent to OpenAI
- `verifiedFromDatabase`: Confirmation flag

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (missing or invalid parameters)
- `500`: Internal Server Error

Error responses include:
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

---

## CORS

The API has CORS enabled, so it can be accessed from any origin. For production, you may want to restrict this.

---

## Environment Variables

The API requires these environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key
- `PORT`: Server port (default: 3000)

---

## Starting the API Server

```bash
# Development
npm run api

# Development with auto-reload
npm run api:watch
```

The server will start on `http://localhost:3000` (or the port specified in `PORT`).

