# Berkshire Hathaway RAG System with Mastra

A Retrieval-Augmented Generation (RAG) system that allows you to query Warren Buffett's annual shareholder letters (2019-2024) using natural language. Built with Mastra, Node.js, PostgreSQL, and OpenAI.

## Features

- 🤖 **RAG Agent**: Intelligent agent that retrieves relevant information from shareholder letters
- 📚 **Document Processing**: Processes PDF documents and creates vector embeddings
- 🔍 **Semantic Search**: Uses OpenAI embeddings for accurate information retrieval
- 💬 **Interactive Chat**: Query the letters through Mastra Studio UI
- ✅ **Verification**: Built-in verification to ensure answers come from your database

## Tech Stack

- **Framework**: Mastra
- **Language**: TypeScript
- **Database**: PostgreSQL with pgvector extension
- **LLM**: OpenAI (GPT-4o-mini)
- **Embeddings**: OpenAI text-embedding-3-small

## Prerequisites

- Node.js >= 18 (<= 20)
- PostgreSQL database with pgvector extension
- OpenAI API key

> 📖 **For detailed setup instructions**, see [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Complete pre-requisites checklist for Pazago Drive participants

## Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd berkshire-hathaway-rag-mastra
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/berkshire_rag
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Set up the database**
   
   Ensure PostgreSQL is running and has the pgvector extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

5. **Ingest the documents**
   ```bash
   npm run ingest
   ```
   
   This will process the PDF files in `src/mastra/rag/data/` and store them in your database.

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Access Mastra Studio**
   
   Open your browser and navigate to `http://localhost:4111`

## Usage

### Using the Agent in Mastra Studio

1. Start the dev server: `npm run dev`
2. Open `http://localhost:4111` in your browser
3. Select the "Berkshire Hathaway RAG Agent"
4. Ask questions about the shareholder letters

Example questions:
- "What is Warren Buffett's investment philosophy?"
- "How does Berkshire benefit from retained earnings?"
- "What does he say about long-term investing?"

### Using the REST API

You can also access the RAG system via REST API endpoints, allowing others to test your application without pulling the GitHub repo.

1. **Start the API server**
   ```bash
   npm run api
   ```
   
   The server will run on `http://localhost:3000`

2. **Test the API**
   
   ```bash
   # Health check
   curl http://localhost:3000/api/health
   
   # Ask a question
   curl -X POST http://localhost:3000/api/query \
     -H "Content-Type: application/json" \
     -d '{"question": "What is Warren Buffett\'s investment philosophy?", "limit": 5}'
   ```

3. **API Documentation**
   
   See [API.md](./API.md) for complete API documentation including:
   - All available endpoints
   - Request/response formats
   - Example usage in multiple languages
   - RAG verification details

### Verify RAG Pipeline

To verify that answers are coming from your database (not OpenAI's training data):

```bash
npm run verify-rag
```

## Project Structure

```
├── src/
│   ├── api/
│   │   └── server.ts                 # Express API server
│   ├── mastra/
│   │   ├── agents/
│   │   │   └── berkshire-agent.ts    # Main RAG agent
│   │   ├── rag/
│   │   │   ├── answer.ts             # Answer generation
│   │   │   ├── retrieve.ts           # Vector search
│   │   │   ├── ingest.ts             # Document ingestion
│   │   │   ├── verify-rag.ts        # Verification script
│   │   │   └── data/                 # PDF files (2019-2024)
│   │   └── index.ts                  # Mastra configuration
│   └── README.md
├── package.json
├── tsconfig.json
├── README.md
└── API.md                            # REST API documentation
```

## Scripts

- `npm run dev` - Start Mastra development server (port 4111)
- `npm run api` - Start REST API server (port 3000)
- `npm run api:watch` - Start API server with auto-reload
- `npm run build` - Build the project
- `npm run start` - Start production server
- `npm run ingest` - Ingest PDF documents into database
- `npm run verify-rag` - Verify RAG pipeline is working correctly

## How It Works

1. **Document Ingestion**: PDFs are loaded, chunked, and embedded using OpenAI embeddings
2. **Vector Storage**: Embeddings are stored in PostgreSQL with pgvector
3. **Query Processing**: User questions are embedded and used to search for relevant chunks
4. **Answer Generation**: Retrieved chunks are used as context for OpenAI to generate answers
5. **Verification**: System includes metadata to verify answers come from your database

## Important Notes

- The agent is configured to **strictly use only information from the retrieved chunks**
- Answers include source citations (year and file) when available
- The system will explicitly state if information is not found in the letters

## Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete pre-requisites setup checklist for Pazago Drive participants
- **[API.md](./API.md)** - REST API documentation and usage examples
- **[README.md](./README.md)** - Project overview and quick start guide

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

