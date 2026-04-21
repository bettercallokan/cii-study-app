"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  BookOpen,
  FileText,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

// ---------------------------------------------------------------------------
// Chat panel
// ---------------------------------------------------------------------------
function ChatPanel({ fileName }: { fileName: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          fileName,
          history: messages,
        }),
      });

      const data = await res.json();
      const reply = res.ok
        ? (data.reply ?? "Sorry, I received an empty response.")
        : (data.error ?? "Something went wrong. Please try again.");

      setMessages([...nextMessages, { role: "model", text: reply }]);
    } catch {
      setMessages([
        ...nextMessages,
        { role: "model", text: "Network error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col w-[380px] shrink-0 border-l border-border bg-card">
      {/* Panel header */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border shrink-0">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-none">
            AI Study Assistant
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Powered by Gemini Pro
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-2">
            <Sparkles className="w-7 h-7 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Ask me anything about{" "}
              <span className="font-medium text-foreground">{fileName}</span>.
              I can suggest page numbers too.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.role === "user" ? "flex justify-end" : "flex justify-start"
            }
          >
            <div
              className={
                msg.role === "user"
                  ? "max-w-[85%] rounded-2xl rounded-tr-sm px-3.5 py-2.5 bg-primary text-primary-foreground text-sm"
                  : "max-w-[90%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 bg-secondary text-secondary-foreground text-sm"
              }
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm px-3.5 py-3 bg-secondary">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border p-3">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this document…"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none leading-relaxed max-h-32"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground/60 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function StudyPage() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const filePath = searchParams.get("file");

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!filePath) {
      setPdfUrl(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function generateSignedUrl() {
      setLoading(true);
      setError(null);
      setPdfUrl(null);

      const { data, error: urlError } = await supabase.storage
        .from("pdfs")
        .createSignedUrl(filePath as string, 3600);

      if (cancelled) return;

      if (urlError || !data?.signedUrl) {
        setError("Could not generate a link for this PDF. Please try again.");
      } else {
        setPdfUrl(data.signedUrl + "#page=1");
      }
      setLoading(false);
    }

    generateSignedUrl();
    return () => {
      cancelled = true;
    };
  }, [filePath]);

  const fileName = filePath
    ? (filePath.split("/").pop()?.replace(/\.pdf$/i, "") ?? filePath)
    : null;

  // Shared header
  const header = (
    <div className="flex items-center gap-3 px-6 h-14 border-b border-border bg-card shrink-0">
      <FileText className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-medium text-foreground">
        {fileName ?? "Study"}
      </span>
      {params.code && (
        <span className="ml-1 text-xs text-muted-foreground">
          — {params.code}
        </span>
      )}
    </div>
  );

  // Empty state — no file selected
  if (!filePath) {
    return (
      <div className="flex flex-col h-full min-h-screen bg-background">
        {header}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium text-foreground">
              Please select a module
            </p>
            <p className="text-sm text-muted-foreground">
              Choose a PDF from the sidebar to start studying.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {header}

      {/* Split: PDF viewer + chat panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF viewer */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {!loading && pdfUrl && (
            <iframe
              key={pdfUrl}
              src={pdfUrl}
              className="w-full h-full border-none"
              title={fileName ?? "PDF Viewer"}
            />
          )}
        </div>

        {/* AI chat panel */}
        <ChatPanel fileName={fileName ?? "the document"} />
      </div>
    </div>
  );
}
