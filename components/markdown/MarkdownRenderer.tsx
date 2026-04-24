"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

// Minimal hast node shape — avoids importing from hast directly
interface HastNode {
  type: string;
  value?: string;
  tagName?: string;
  children?: HastNode[];
}

function extractHastText(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(extractHastText).join("");
}

// Returns text of the first <strong> inside the first <p> of a blockquote hast node
function getFirstStrongText(blockquoteNode: HastNode): string {
  const p = (blockquoteNode.children ?? []).find(
    (n) => n.type === "element" && n.tagName === "p"
  );
  if (!p) return "";
  const strong = (p.children ?? []).find(
    (n) => n.type === "element" && n.tagName === "strong"
  );
  if (!strong) return "";
  return extractHastText(strong);
}

// ─── Callout config ───────────────────────────────────────────

interface CalloutStyle {
  bg: string;
  border: string;
}

const CALLOUT_STYLES: Array<{ keys: string[]; style: CalloutStyle }> = [
  {
    keys: ["BE AWARE"],
    style: { bg: "bg-amber-500/10", border: "border-amber-500/30" },
  },
  {
    keys: ["CONSIDER THIS"],
    style: { bg: "bg-blue-500/10", border: "border-blue-500/30" },
  },
  {
    keys: ["EXAMPLE"],
    style: { bg: "bg-green-500/10", border: "border-green-500/30" },
  },
  {
    keys: ["QUESTION"],
    style: { bg: "bg-purple-500/10", border: "border-purple-500/30" },
  },
  {
    keys: ["REFER TO"],
    style: { bg: "bg-slate-500/10", border: "border-slate-500/30" },
  },
  {
    keys: ["FIGURE"],
    style: { bg: "bg-slate-500/10", border: "border-slate-500/30" },
  },
  {
    keys: ["ON THE WEB"],
    style: { bg: "bg-teal-500/10", border: "border-teal-500/30" },
  },
  {
    keys: ["CASE LAW"],
    style: { bg: "bg-orange-500/10", border: "border-orange-500/30" },
  },
  {
    keys: ["INSURTECH"],
    style: { bg: "bg-indigo-500/10", border: "border-indigo-500/30" },
  },
  {
    keys: ["REINFORCE"],
    style: { bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  },
  {
    keys: ["NOTE"],
    style: { bg: "bg-muted/30", border: "border-border" },
  },
];

function getCalloutStyle(strongText: string): CalloutStyle | null {
  const upper = strongText.toUpperCase();
  for (const { keys, style } of CALLOUT_STYLES) {
    if (keys.some((k) => upper.includes(k))) return style;
  }
  // Generic fallback: if text ends with ":" and looks like a label, style it
  if (/^[^a-z]+:/.test(strongText.trim())) {
    return { bg: "bg-muted/30", border: "border-border" };
  }
  return null;
}

// ─── Component ───────────────────────────────────────────────

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div className={cn("prose-study", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          blockquote: ({ node, children }) => {
            const strongText = node
              ? getFirstStrongText(node as unknown as HastNode)
              : "";
            const style = strongText ? getCalloutStyle(strongText) : null;

            if (style) {
              return (
                <div
                  className={cn(
                    "not-prose rounded-lg border p-4 my-4",
                    style.bg,
                    style.border
                  )}
                >
                  <div className="text-sm leading-relaxed text-muted-foreground [&>p]:mb-2 [&>p:last-child]:mb-0 [&_strong]:text-foreground [&_strong]:font-semibold">
                    {children}
                  </div>
                </div>
              );
            }

            return (
              <blockquote className="not-prose border-l-4 border-primary/50 bg-primary/5 rounded-r-xl pl-4 py-2 my-4 text-muted-foreground">
                {children}
              </blockquote>
            );
          },

          table: ({ children }) => (
            <div className="not-prose overflow-x-auto my-6">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b-2 border-border">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="text-left p-3 font-semibold text-foreground bg-secondary/30 first:rounded-tl-lg last:rounded-tr-lg">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-3 text-muted-foreground">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
