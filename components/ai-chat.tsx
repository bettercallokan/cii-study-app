"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Bot,
  User,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I'm your AI Study Assistant for CII exam preparation. I can help you understand complex insurance concepts, explain key terms, quiz you on topics, or clarify anything from your study materials. What would you like to learn about today?",
    timestamp: new Date(),
  },
];

const suggestedQuestions = [
  "Explain proximate cause",
  "What is subrogation?",
  "Quiz me on Unit 1",
];

export function AiChat({ className }: { className?: string }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (replace with actual AI SDK integration)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getSimulatedResponse(userMessage.content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    textareaRef.current?.focus();
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages(initialMessages);
  };

  return (
    <div className={cn("flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              AI Study Assistant
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Powered by AI
            </p>
          </div>
        </div>
        <button
          onClick={handleClearChat}
          className="p-1.5 rounded-md hover:bg-secondary transition-colors"
          title="Clear chat"
        >
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "user" && "flex-row-reverse"
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                message.role === "assistant"
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-secondary"
              )}
            >
              {message.role === "assistant" ? (
                <Bot className="w-3.5 h-3.5 text-primary" />
              ) : (
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>

            {/* Message Content */}
            <div
              className={cn(
                "group flex-1 max-w-[85%]",
                message.role === "user" && "flex flex-col items-end"
              )}
            >
              <div
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm leading-relaxed",
                  message.role === "assistant"
                    ? "bg-secondary/50 text-foreground"
                    : "bg-primary text-primary-foreground"
                )}
              >
                {message.content}
              </div>
              
              {/* Message Actions */}
              {message.role === "assistant" && (
                <button
                  onClick={() => handleCopy(message.id, message.content)}
                  className="opacity-0 group-hover:opacity-100 mt-1 p-1 rounded hover:bg-secondary transition-all"
                  title="Copy message"
                >
                  {copiedId === message.id ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20 shrink-0">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="bg-secondary/50 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-[11px] text-muted-foreground mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <button
                key={question}
                onClick={() => handleSuggestion(question)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-border bg-card shrink-0">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-secondary transition-colors shrink-0"
            title="Attach context from PDF"
          >
            <Paperclip className="w-4 h-4 text-muted-foreground" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask about your study materials..."
              rows={1}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}

// Simulated response function (replace with actual AI SDK integration)
function getSimulatedResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes("proximate cause")) {
    return "Proximate cause is a key legal principle in insurance. It refers to the dominant or effective cause of a loss. When assessing a claim, insurers must determine the proximate cause to establish whether the loss is covered under the policy.\n\nFor example, if a storm damages a roof (insured peril) and rainwater subsequently enters causing interior damage, the proximate cause is the storm, making the entire loss potentially claimable.\n\nWould you like me to explain any specific scenarios involving proximate cause?";
  }
  
  if (lowerMessage.includes("subrogation")) {
    return "Subrogation is the right of an insurer, after paying a claim, to take over the insured's right to recover the loss from a third party who caused it.\n\nKey points:\n• Applies only to indemnity insurance\n• The insurer stands in the insured's shoes\n• Any recovery goes to the insurer up to the claim amount\n• Excess recovery goes to the insured\n\nExample: If your car is damaged by a negligent driver and your insurer pays your claim, they can then pursue the at-fault driver to recover costs.\n\nShall I quiz you on subrogation scenarios?";
  }
  
  if (lowerMessage.includes("quiz") || lowerMessage.includes("test")) {
    return "Great idea! Let's test your knowledge.\n\n**Question 1:**\nWhich of the following is NOT a component of an insurable risk?\n\nA) The risk must be fortuitous\nB) The risk must be calculable\nC) The premium must be guaranteed profitable\nD) There must be a large number of similar risks\n\nTake your time and reply with your answer (A, B, C, or D). I'll explain the correct answer once you respond!";
  }
  
  return "That's a great question about insurance concepts. In the CII W01 syllabus, this topic relates to the fundamental principles of insurance practice.\n\nTo give you a comprehensive answer, I'd recommend reviewing the specific section in your study materials. Would you like me to:\n\n1. Explain this concept in more detail?\n2. Provide some practice questions?\n3. Relate it to real-world scenarios?\n\nJust let me know how I can help!";
}
