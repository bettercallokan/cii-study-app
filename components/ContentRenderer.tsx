"use client";

import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────

type Variant = "example" | "consider" | "note";

type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; prefix: string; rest: string }
  | { type: "bullets"; items: string[] }
  | { type: "special"; tag: string; body: string; variant: Variant }
  | { type: "table"; rows: string[][] };

// ─── Parser ───────────────────────────────────────────────────

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  const paragraphs = text.split(/\n{2,}/);

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // [TAG] body  →  special box
    if (trimmed.startsWith("[")) {
      const m = trimmed.match(/^\[([^\]]+)\]([\s\S]*)$/);
      if (m) {
        const tag = m[1].trim();
        const body = m[2].trim();
        const upper = tag.toUpperCase();
        const variant: Variant = upper.startsWith("EXAMPLE")
          ? "example"
          : upper.startsWith("CONSIDER")
          ? "consider"
          : "note";
        blocks.push({ type: "special", tag, body, variant });
        continue;
      }
    }

    const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);

    // Table: majority of lines contain |
    const pipedLines = lines.filter((l) => l.includes("|"));
    if (lines.length >= 2 && pipedLines.length >= Math.ceil(lines.length * 0.6)) {
      const rows = pipedLines.map((l) =>
        l.split("|").map((c) => c.trim()).filter(Boolean)
      );
      if (rows.length >= 2) {
        blocks.push({ type: "table", rows });
        continue;
      }
    }

    // All-bullet block
    if (lines.length > 0 && lines.every((l) => l.startsWith("•"))) {
      blocks.push({
        type: "bullets",
        items: lines.map((l) => l.replace(/^•\s*/, "").trim()),
      });
      continue;
    }

    // Mixed block: bullets interspersed with text — split into sub-blocks
    const hasBullets = lines.some((l) => l.startsWith("•"));
    if (hasBullets && lines.length > 1) {
      let pendingText: string[] = [];
      let pendingBullets: string[] = [];

      const flushText = () => {
        if (!pendingText.length) return;
        const txt = pendingText.join(" ").trim();
        if (txt) pushText(txt);
        pendingText = [];
      };
      const flushBullets = () => {
        if (!pendingBullets.length) return;
        blocks.push({ type: "bullets", items: pendingBullets });
        pendingBullets = [];
      };
      const pushText = (txt: string) => {
        const hm = txt.match(/^([A-Z]\d+(?:\.\d+)?)\s+(.+)$/);
        if (hm) blocks.push({ type: "heading", prefix: hm[1], rest: hm[2] });
        else blocks.push({ type: "paragraph", text: txt });
      };

      for (const line of lines) {
        if (line.startsWith("•")) {
          flushText();
          pendingBullets.push(line.replace(/^•\s*/, "").trim());
        } else {
          flushBullets();
          pendingText.push(line);
        }
      }
      flushText();
      flushBullets();
      continue;
    }

    // Heading: single line matching "A1 ..." or "A1.2 ..."
    if (lines.length === 1) {
      const hm = trimmed.match(/^([A-Z]\d+(?:\.\d+)?)\s+(.+)$/);
      if (hm) {
        blocks.push({ type: "heading", prefix: hm[1], rest: hm[2] });
        continue;
      }
    }

    // Default: paragraph
    blocks.push({ type: "paragraph", text: lines.join(" ") });
  }

  return blocks;
}

// ─── Sub-components ───────────────────────────────────────────

function HeadingBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center bg-primary/10 text-primary text-[0.7rem] font-mono font-bold px-1.5 py-0.5 rounded border border-primary/20 leading-none shrink-0">
      {children}
    </span>
  );
}

const specialConfig: Record<
  Variant,
  { border: string; bg: string; tagClass: string }
> = {
  example: {
    border: "border-blue-500/40",
    bg: "bg-blue-500/5",
    tagClass: "text-blue-400",
  },
  consider: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/5",
    tagClass: "text-amber-400",
  },
  note: {
    border: "border-muted-foreground/30",
    bg: "bg-muted/20",
    tagClass: "text-muted-foreground",
  },
};

// ─── Main Export ──────────────────────────────────────────────

interface ContentRendererProps {
  text: string;
  className?: string;
}

export function ContentRenderer({ text, className }: ContentRendererProps) {
  if (!text) return null;
  const blocks = parseBlocks(text);

  return (
    <div className={cn("space-y-3 text-sm", className)}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h3
                key={i}
                className="flex items-baseline gap-2 font-semibold text-foreground pt-3 first:pt-0"
              >
                <HeadingBadge>{block.prefix}</HeadingBadge>
                <span>{block.rest}</span>
              </h3>
            );

          case "paragraph":
            return (
              <p key={i} className="text-foreground/80 leading-relaxed">
                {block.text}
              </p>
            );

          case "bullets":
            return (
              <ul key={i} className="space-y-1.5 ml-1">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-2.5 text-foreground/80 leading-relaxed">
                    <span className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );

          case "special": {
            const cfg = specialConfig[block.variant];
            return (
              <div
                key={i}
                className={cn(
                  "border-l-2 rounded-r-lg px-4 py-3 space-y-1.5",
                  cfg.border,
                  cfg.bg
                )}
              >
                <span
                  className={cn(
                    "block text-[0.7rem] font-mono font-bold uppercase tracking-widest",
                    cfg.tagClass
                  )}
                >
                  {block.tag}
                </span>
                {block.body && (
                  <p className="text-foreground/75 leading-relaxed">{block.body}</p>
                )}
              </div>
            );
          }

          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-muted/40">
                    <tr>
                      {block.rows[0]?.map((cell, j) => (
                        <th
                          key={j}
                          className="px-4 py-2.5 text-left text-xs font-semibold text-foreground/90 uppercase tracking-wide border-b border-border"
                        >
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.slice(1).map((row, j) => (
                      <tr
                        key={j}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        {row.map((cell, k) => (
                          <td
                            key={k}
                            className="px-4 py-2.5 text-foreground/75 align-top"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
