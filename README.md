Dynamic Knowledge Retrieval Chatbot
This project implements Problem Statement 6 as a RAG chatbot for customer support.

Stack:

FastAPI backend
LangChain for document loading, chunking, embeddings, and prompting
LangGraph for workflow orchestration
Gemini for answer generation
free local Hugging Face embeddings for retrieval
in-memory embedding index for retrieval
React + Vite frontend
Folder Structure
backend/
  main.py
  requirements.txt
  .env.example
  data/
    faq_accounts.md
    faq_orders.md
    faq_returns.md
frontend/
  package.json
  vite.config.js
  index.html
  src/
    App.jsx
    main.jsx
    styles.css
Setup
1. Backend
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
Add your Gemini API key to backend/.env:

GEMINI_API_KEY=your_real_key
GEMINI_CHAT_MODEL=gemini-2.5-flash
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
Start the API:

uvicorn main:app --reload
2. Frontend
cd frontend
npm install
npm run dev
Frontend runs on http://127.0.0.1:5173 and backend on http://127.0.0.1:8000.

RAG Architecture
User Question
    |
    v
React Frontend
    |
    v
FastAPI /chat
    |
    v
LangGraph Workflow
    |
    +--> Route Question
    |       |
    |       +--> smalltalk -> direct Gemini reply
    |       |
    |       +--> retrieve -> in-memory similarity search
    |
    v
LangChain Prompt
    |
    v
Gemini Answer Generation
    |
    v
Answer + Sources + Retrieved Chunks
Data Indexing Method
Documents are stored in backend/data/
.txt, .md, and .pdf files are loaded as LangChain Document objects
RecursiveCharacterTextSplitter splits the content into chunks
HuggingFaceEmbeddings converts chunks into vectors
Chunk embeddings are stored in an in-memory index
At query time, cosine similarity returns top matching chunks
Gemini answers using only the retrieved context
Retrieval Pipeline
Accept user question and session ID
Load previous chat history from session memory
LangGraph routes the input
Retrieval path runs similarity search over the in-memory embedding index
Retrieved chunks are inserted into the answer prompt
Gemini generates a grounded answer
If context is insufficient, the answer says so explicitly
Context-Based Answer Generation
The backend stores recent conversation turns in memory per session
The graph includes that history in the generation prompt
This allows follow-up questions like "what about refund timing?" to stay grounded in prior turns
Handling Unknown Queries
If the retrieved context does not support the question, the model is instructed to say the knowledge base does not contain enough information and to suggest human support.

Example Questions
What is the return window for a damaged product?
When can I cancel an order?
My account is locked after password reset. What should I do?
Money was deducted but the order was not confirmed. What now?
Supported Upload Types
.txt
.md
.pdf
Example Output
{
  "session_id": "a2d1d570-7c8d-4b8d-a87e-efdadb25d1ef",
  "answer": "Customers can request a return within 7 days of delivery for damaged, defective, or incorrect items.",
  "route": "retrieve",
  "retrieved_chunks": [
    {
      "source": "faq_returns.md",
      "preview": "# Returns And Refunds\n\nCustomers can request a return within 7 days of delivery for damaged, defective, or incorrect items."
    }
  ],
  "sources": ["faq_returns.md"],
  "used_context": true
}
Deliverables Coverage
RAG architecture: included in this README and implemented in LangGraph
Data indexing method: chunking + free local embeddings + in-memory similarity index
Example outputs: included above and visible in the UI metadata panel
