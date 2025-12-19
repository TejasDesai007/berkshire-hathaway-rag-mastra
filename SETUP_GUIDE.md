# Pazago Drive — Pre-requisites Setup Guide

Welcome to the Pazago Drive! This comprehensive guide will help you set up your development environment and prepare for building AI agents with Mastra. Please complete **ALL** items before your scheduled session.

## 📋 Table of Contents

1. [Node.js and TypeScript Setup](#1-nodejs-and-typescript-setup)
2. [GitHub Account Setup](#2-github-account-setup)
3. [Postman Setup](#3-postman-setup)
4. [PostgreSQL and PgVector Setup](#4-postgresql-and-pgvector-setup)
5. [OpenAI Developer Account](#5-openai-developer-account)
6. [Development Environment](#6-development-environment)
7. [Mastra Documentation and Resources](#7-mastra-documentation-and-resources)
8. [Additional Preparations](#8-additional-preparations)
9. [Final Verification Checklist](#final-verification-checklist)

---

## ✅ 1. Node.js and TypeScript Setup

### Install Node.js

1. **Visit** [https://nodejs.org/](https://nodejs.org/)
2. **Download** the LTS (Long Term Support) version (recommended for most users)
3. **Run** the installer and follow the installation wizard
4. **Verify installation** by opening your terminal/command prompt and running:

```bash
node --version
npm --version
```

You should see version numbers displayed (**Node.js 18+ recommended**)

### Install TypeScript

1. **Open** your terminal/command prompt
2. **Install TypeScript globally** using npm:

```bash
npm install -g typescript
```

3. **Verify TypeScript installation**:

```bash
tsc --version
```

You should see the TypeScript version number

### Alternative: Using Package Managers

#### For Windows users (optional):

- **Chocolatey**: `choco install nodejs`
- **Winget**: `winget install OpenJS.NodeJS`

#### For macOS users (optional):

- **Homebrew**: `brew install node`

#### For Linux users (optional):

- **Ubuntu/Debian**: `sudo apt install nodejs npm`
- **Fedora**: `sudo dnf install nodejs npm`
- **Arch**: `sudo pacman -S nodejs npm`

---

## ✅ 2. GitHub Account Setup

### Create GitHub Account

1. **Visit** [https://github.com/](https://github.com/)
2. **Click** "Sign up" and create your account
3. **Choose** a professional username (this will be visible to employers)
4. **Verify** your email address

### Install Git

1. **Download Git** from [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. **Install Git** on your system
3. **Configure Git** with your details:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

4. **Verify Git installation**:

```bash
git --version
```

### GitHub Authentication Setup

**Option 1: SSH Keys (Recommended)**

1. **Generate SSH key**:

```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
```

2. **Add SSH key to GitHub**:
   - Copy your public key: `cat ~/.ssh/id_ed25519.pub` (or `type %USERPROFILE%\.ssh\id_ed25519.pub` on Windows)
   - Go to GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste your key and save

**Option 2: Personal Access Token (HTTPS)**

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when pushing/pulling

---

## ✅ 3. Postman Setup

### Install Postman

1. **Visit** [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
2. **Download Postman** for your operating system
3. **Install and launch** Postman
4. **Create a free Postman account** (optional but recommended)
5. **Familiarize yourself** with the interface

### Postman Basics

- ✅ Learn how to create a new request
- ✅ Understand GET, POST, PUT, DELETE methods
- ✅ Practice adding headers and request bodies
- ✅ Learn how to save requests in collections

### Quick Postman Tutorial

1. **Create a new request**:
   - Click "New" → "HTTP Request"
   - Enter URL: `http://localhost:3000/api/health`
   - Select method: GET
   - Click "Send"

2. **Create a POST request**:
   - Method: POST
   - URL: `http://localhost:3000/api/query`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
   ```json
   {
     "question": "What is Warren Buffett's investment philosophy?",
     "limit": 5
   }
   ```

3. **Save to collection**:
   - Click "Save"
   - Create new collection: "Berkshire RAG API"
   - Name your request and save

---

## ✅ 4. PostgreSQL and PgVector Setup

### Install PostgreSQL

1. **Download PostgreSQL** from [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
2. **Install PostgreSQL 14+** (required for PgVector extension)
3. **During installation**, remember your postgres user password
4. **Verify installation** by running:

```bash
psql --version
```

### Install PgVector Extension

#### For macOS (Homebrew):

```bash
brew install pgvector
```

#### For Ubuntu/Debian:

```bash
sudo apt install postgresql-14-pgvector
```

#### For Windows:

- Download pre-built binaries or compile from source
- Or use Docker (see below)

#### Alternative: Use Docker with PgVector pre-installed:

```bash
docker run -d --name pgvector-db -p 5432:5432 -e POSTGRES_PASSWORD=password pgvector/pgvector:pg16
```

### Database Setup

1. **Create a new database** for your Mastra project:

```sql
CREATE DATABASE mastra_rag_db;
```

2. **Connect to your database** and enable the vector extension:

```sql
\c mastra_rag_db
CREATE EXTENSION vector;
```

3. **Verify PgVector installation**:

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

You should see a row with the vector extension.

### Database Client Tools

**Install a PostgreSQL client:**

- **pgAdmin (GUI)**: [https://www.pgadmin.org/](https://www.pgadmin.org/)
- **DBeaver (GUI)**: [https://dbeaver.io/](https://dbeaver.io/)
- **psql (Command line)** - comes with PostgreSQL

**Test connection to your database:**

```bash
psql -U postgres -d mastra_rag_db
```

**Practice basic SQL queries:**

```sql
-- List all tables
\dt

-- Create a test table
CREATE TABLE test_table (id SERIAL PRIMARY KEY, name VARCHAR(100));

-- Insert data
INSERT INTO test_table (name) VALUES ('Test');

-- Query data
SELECT * FROM test_table;
```

---

## ✅ 5. OpenAI Developer Account

### Create OpenAI Account

1. **Visit** [https://platform.openai.com/](https://platform.openai.com/)
2. **Click** "Sign up" and create your account
3. **Verify** your email address and phone number
4. **Complete** the account setup process

### API Key Setup

1. **Navigate to** [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **If you have credits/payment method**: Click "Create new secret key" and securely store it
3. **If using provided keys**: Skip this step - keys will be provided during the session
4. **Important**: Never share your API key or commit it to version control

### Billing Setup (Required)

1. **Add a payment method** to your OpenAI account (credit/debit card required)
2. **Important**: OpenAI no longer provides free credits for new accounts
3. **Set a low spending limit** (e.g., $10-20) to control costs during the session
4. **Review** the pricing page to understand costs
5. **Estimated session cost**: $2-5 for typical API usage during learning
6. **Check your usage** at [https://platform.openai.com/usage](https://platform.openai.com/usage)

### Alternative Option

If you don't receive free credits or prefer not to add a payment method:

- ✅ Still create your OpenAI account and verify it
- ✅ We will provide API keys on the day of your session
- ✅ No additional setup required - just have your account ready

---

## ✅ 6. Development Environment

### Code Editor Setup

**Install Visual Studio Code** from [https://code.visualstudio.com/](https://code.visualstudio.com/)

**Install recommended extensions:**

1. **TypeScript and JavaScript Language Features** (built-in)
2. **Prettier - Code formatter** ([Extension ID: esbenp.prettier-vscode](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode))
3. **ESLint** ([Extension ID: dbaeumer.vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint))
4. **GitLens** ([Extension ID: eamodio.gitlens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens))
5. **REST Client** ([Extension ID: humao.rest-client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)) - for API testing
6. **PostgreSQL** ([Extension ID: ckolkman.vscode-postgres](https://marketplace.visualstudio.com/items?itemName=ckolkman.vscode-postgres)) - for database management
7. **SQL Tools** ([Extension ID: mtxr.sqltools](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools)) - for database queries and connections

### Terminal Setup

**Ensure you have a good terminal application:**

- **Windows**: Use PowerShell, Command Prompt, or Windows Terminal
- **macOS**: Use Terminal or iTerm2
- **Linux**: Use your preferred terminal emulator

---

## ✅ 7. Mastra Documentation and Resources

### Mastra Documentation

- ✅ **Bookmark** the Mastra documentation: [https://docs.mastra.ai/](https://docs.mastra.ai/)
- ✅ **Read** the "Getting Started" guide
- ✅ **Explore** the RAG (Retrieval-Augmented Generation) section
- ✅ **Review** code examples and tutorials
- ✅ **Join** the Mastra community Discord/forum if available

### Essential Reading

**Read the complete "Principles of Building AI Agents" book (PDF provided)**

Focus especially on:

- ✅ **Part I**: Prompting a Large Language Model (LLM)
- ✅ **Part II**: Building an Agent
- ✅ **Part IV**: Retrieval-Augmented Generation (RAG)
- ✅ **Part VII**: Development & Deployment

### Mastra Framework Preparation

- ✅ Understand what Mastra is and its core concepts
- ✅ Learn about agents, tools, and workflows
- ✅ Familiarize yourself with RAG pipelines
- ✅ Review vector databases and embedding concepts

---

## ✅ 8. Additional Preparations

### Knowledge Prerequisites

#### Core Programming Concepts:

- ✅ Basic understanding of JavaScript/TypeScript
- ✅ Familiarity with async/await and Promises
- ✅ Understanding of REST APIs and HTTP methods
- ✅ Basic knowledge of JSON data format
- ✅ Understanding of environment variables
- ✅ Object-oriented programming concepts

#### AI/ML and LLM Concepts:

- ✅ **Large Language Models (LLMs)** - Understanding what they are and how they work
- ✅ **Prompt Engineering** - How to craft effective prompts for AI models
- ✅ **Token limits and context windows** - Understanding input/output constraints
- ✅ **Temperature and sampling parameters** - How they affect AI responses
- ✅ **Retrieval-Augmented Generation (RAG)** - Core concept and architecture
- ✅ **Vector embeddings** - How text is converted to numerical representations
- ✅ **Vector databases** - Storage and retrieval of embeddings
- ✅ **Semantic search** - Finding relevant information based on meaning
- ✅ **Chunking strategies** - Breaking down documents for processing
- ✅ **AI agents and tools** - How agents use external tools and APIs

#### Mastra-Specific Concepts:

- ✅ **Agents** - Autonomous AI entities that can perform tasks
- ✅ **Workflows** - Structured sequences of AI operations
- ✅ **Tools integration** - How agents interact with external services
- ✅ **Memory systems** - How agents maintain context across interactions
- ✅ **Evaluation frameworks** - Testing and measuring AI performance

#### Data and Search Concepts:

- ✅ **Information retrieval** - Finding relevant information from large datasets
- ✅ **Document processing** - Parsing and extracting content from various formats
- ✅ **Indexing strategies** - Organizing data for efficient search
- ✅ **Similarity scoring** - Measuring relevance between queries and documents
- ✅ **Metadata handling** - Managing additional information about documents

#### PostgreSQL and PgVector Concepts:

- ✅ **PostgreSQL basics** - Understanding relational databases and SQL
- ✅ **Vector data types** - How PgVector stores and handles vector data
- ✅ **Vector operations** - Similarity search, distance calculations (L2, cosine, inner product)
- ✅ **Indexing vectors** - HNSW and IVFFlat indexes for efficient vector search
- ✅ **Query optimization** - Writing efficient vector similarity queries
- ✅ **Database schema design** - Structuring tables for RAG applications
- ✅ **Connection pooling** - Managing database connections efficiently
- ✅ **Hybrid search** - Combining vector similarity with traditional SQL filtering

### Recommended Pre-Assignment Learning

- ✅ Learn about RAG pipeline components (ingestion, indexing, retrieval, generation)
- ✅ Familiarize yourself with vector similarity concepts (cosine similarity, etc.)
- ✅ Understand the trade-offs between different embedding models
- ✅ Practice SQL and PostgreSQL:
  - Basic SQL queries (SELECT, INSERT, UPDATE, DELETE)
- ✅ Learn PgVector specifics:
  - Vector similarity search queries
  - Creating and managing vector indexes
  - Understanding distance metrics (L2, cosine, inner product)
  - Hybrid search patterns (vector + metadata filtering)

### System Requirements Check

- ✅ Ensure you have at least **8GB RAM**
- ✅ Check available disk space (minimum **5GB free**)
- ✅ Stable internet connection for API calls
- ✅ Administrative privileges to install software

### Create Project Directory

- ✅ Create a dedicated folder for your Mastra projects
- ✅ Example: `~/Projects/Mastra` or `C:\Projects\Mastra`

---

## ✅ Final Verification Checklist

Before your session, verify that:

- ✅ Node.js and TypeScript are installed and working
- ✅ PostgreSQL and PgVector are set up and tested
- ✅ OpenAI account is created and verified
- ✅ Either: OpenAI API key created and secured **OR** ready to use provided keys
- ✅ GitHub account is ready with Git configured
- ✅ Postman is installed and functional
- ✅ VS Code is set up with recommended extensions
- ✅ You've read the "Principles of Building AI Agents" book
- ✅ You understand basic AI/ML concepts (LLMs, RAG, vector embeddings)
- ✅ You're familiar with SQL and PostgreSQL basics
- ✅ All tools have been tested and verified working

---

## 🎯 What to Bring to Your Session

- ✅ Laptop with all software installed (as per this checklist)
- ✅ OpenAI account credentials (we'll provide API keys if needed)
- ✅ GitHub credentials ready for use
- ✅ Database client (pgAdmin/DBeaver) configured and tested
- ✅ Questions or issues you encountered during setup

---

## 📚 Additional Resources

### Documentation Links

- **Mastra Examples**: [GitHub Repository with Examples](https://github.com/mastra/mastra)
- **TypeScript Handbook**: [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)
- **Node.js Documentation**: [https://nodejs.org/en/docs/](https://nodejs.org/en/docs/)
- **OpenAI API Documentation**: [https://platform.openai.com/docs](https://platform.openai.com/docs)
- **Prompt Engineering Guide**: [https://www.promptingguide.ai/](https://www.promptingguide.ai/)
- **PostgreSQL Documentation**: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
- **PgVector GitHub Repository**: [https://github.com/pgvector/pgvector](https://github.com/pgvector/pgvector)
- **PgVector Documentation**: [https://github.com/pgvector/pgvector#getting-started](https://github.com/pgvector/pgvector#getting-started)

### Learning Resources

- **RAG Papers and Tutorials**: Academic papers on Retrieval-Augmented Generation
- **Vector Database Concepts**: [Pinecone Learning Center](https://www.pinecone.io/learn/)
- **SQL Tutorial**: [https://www.w3schools.com/sql/](https://www.w3schools.com/sql/)
- **PostgreSQL Tutorial**: [https://www.postgresqltutorial.com/](https://www.postgresqltutorial.com/)

---

## ❓ Need Help?

If you encounter any issues during setup:

1. ✅ Check the official documentation for each tool
2. ✅ Search for solutions on Stack Overflow
3. ✅ Ask questions in the Mastra community
4. ✅ Contact us before your session if you have setup issues

---

## 📞 Support Contact

If you're unable to complete any part of this setup, please reach out **at least 24 hours before your scheduled session** so we can assist you.

---

## ⚠️ Important Reminder

**Come prepared with everything installed and tested.** This will ensure we can focus entirely on learning Mastra and building amazing AI applications during your session! 🎯

---

**Setup Checklist - Version 1.0**

*Last Updated: December 2024*

