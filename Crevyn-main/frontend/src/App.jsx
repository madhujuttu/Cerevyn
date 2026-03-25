import { useEffect, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

const starterMessages = [
  {
    id: "welcome",
    role: "bot",
    text: "Ask anything from your uploaded documents. I’ll retrieve the most relevant knowledge and answer from that context.",
    meta: null,
  },
];

export default function App() {
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState("Knowledge base ready");
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadState, setUploadState] = useState("Upload .txt, .md, or .pdf files to refresh the knowledge base.");
  const listEndRef = useRef(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(event) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-user`,
        role: "user",
        text: trimmed,
        meta: null,
      },
    ]);
    setInput("");
    setStatus("Searching and drafting answer...");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          session_id: sessionId || null,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.detail || "Backend request failed");
      }

      const data = await response.json();
      setSessionId(data.session_id);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-bot`,
          role: "bot",
          text: data.answer,
          meta: {
            route: data.route,
            usedContext: data.used_context,
            sources: data.sources,
            chunks: data.retrieved_chunks,
          },
        },
      ]);
      setStatus(data.used_context ? "Answered with retrieved context" : "Answered without retrieved context");
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: "bot",
          text: `Backend error: ${error.message}`,
          meta: null,
        },
      ]);
      setStatus("Backend error");
    } finally {
      setIsLoading(false);
    }
  }

  async function uploadDocuments(event) {
    event.preventDefault();
    if (!files.length) {
      setUploadState("Choose one or more .txt, .md, or .pdf files first.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    setUploadState("Uploading files and rebuilding the knowledge index...");

    try {
      const response = await fetch(`${API_BASE}/upload-documents`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.detail || "Upload failed");
      }

      const data = await response.json();
      setUploadState(
        `Uploaded ${data.uploaded_files.length} file(s) and indexed ${data.chunks_indexed} chunk(s).`,
      );
      setFiles([]);
    } catch (error) {
      setUploadState(`Upload failed: ${error.message}`);
    }
  }

  return (
    <main className="app-shell">
      <section className="chat-frame">
        <header className="topbar">
          <div>
            <p className="eyebrow">Problem Statement 6</p>
            <h1>Dynamic Knowledge Retrieval Chatbot</h1>
            <p className="subcopy">
              Chat-first RAG interface with document upload, contextual answers, and inline source evidence.
            </p>
          </div>

          <div className="status-pill">
            <span className="status-dot" />
            {status}
          </div>
        </header>

        <section className="upload-panel">
          <div className="upload-copy">
            <p className="upload-title">Knowledge Upload</p>
            <p className="upload-note">{uploadState}</p>
          </div>

          <form className="upload-form" onSubmit={uploadDocuments}>
            <label className="file-picker">
              <input
                type="file"
                accept=".txt,.md,.pdf"
                multiple
                onChange={(event) => setFiles(Array.from(event.target.files || []))}
              />
              <span>{files.length ? `${files.length} file(s) selected` : "Choose files"}</span>
            </label>
            <button type="submit" className="secondary-button">
              Upload Docs
            </button>
          </form>
        </section>

        <section className="messages-panel">
          <div className="messages-list">
            {messages.map((message) => (
              <article className={`message-row ${message.role}`} key={message.id}>
                <div className={`avatar ${message.role}`}>{message.role === "user" ? "U" : "AI"}</div>

                <div className={`bubble ${message.role}`}>
                  <div className="bubble-role">{message.role === "user" ? "You" : "Assistant"}</div>
                  <p>{message.text}</p>

                  {message.meta && message.meta.sources?.length > 0 ? (
                    <div className="evidence-box">
                      <div className="evidence-header">
                        <span>{message.meta.usedContext ? "Retrieved Context" : "No Retrieved Context"}</span>
                        <span className="route-chip">{message.meta.route}</span>
                      </div>

                      <div className="source-list">
                        {message.meta.sources.map((source) => (
                          <span className="source-chip" key={source}>
                            {source}
                          </span>
                        ))}
                      </div>

                      <div className="chunk-list">
                        {message.meta.chunks.slice(0, 2).map((chunk, index) => (
                          <div className="chunk-card" key={`${chunk.source}-${index}`}>
                            <strong>{chunk.source}</strong>
                            <p>{chunk.preview}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}

            {isLoading ? (
              <article className="message-row bot">
                <div className="avatar bot">AI</div>
                <div className="bubble bot typing-bubble">
                  <div className="bubble-role">Assistant</div>
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </article>
            ) : null}

            <div ref={listEndRef} />
          </div>

          <form className="composer" onSubmit={sendMessage}>
            <textarea
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isLoading}
              placeholder="Ask a question about your uploaded documents..."
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Thinking..." : "Send"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
