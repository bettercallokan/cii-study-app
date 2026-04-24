"use client";

import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────

type SpecialVariant = "example" | "consider" | "beaware";

type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; code: string; title: string }
  | { type: "bullets"; items: string[] }
  | { type: "special"; tag: string; body: string; variant: SpecialVariant }
  | { type: "table"; rows: string[][] };

// ─── Parser ───────────────────────────────────────────────────

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  const rawBlocks = text.split(/\n{2,}/);

  for (const raw of rawBlocks) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);

    // a/b/c: [EXAMPLE...] / [CONSIDER THIS] / [BE AWARE] → special box
    if (trimmed.startsWith("[")) {
      const m = trimmed.match(/^\[([^\]]+)\]([\s\S]*)$/);
      if (m) {
        const tag = m[1].trim();
        const body = m[2].trim();
        const upper = tag.toUpperCase();
        const variant: SpecialVariant = upper.startsWith("EXAMPLE")
          ? "example"
          : upper.startsWith("CONSIDER")
          ? "consider"
          : "beaware";
        blocks.push({ type: "special", tag, body, variant });
        continue;
      }
    }

    // d: Heading — single-line block matching A1, B2, C3 … pattern
    if (lines.length === 1) {
      const hm = trimmed.match(/^([A-Z]\d+)\s+(.+)$/);
      if (hm) {
        blocks.push({ type: "heading", code: hm[1], title: hm[2] });
        continue;
      }
    }

    // e: Bullet list — every line starts with •
    if (lines.length > 0 && lines.every((l) => l.startsWith("•"))) {
      blocks.push({
        type: "bullets",
        items: lines.map((l) => l.replace(/^•\s*/, "").trim()),
      });
      continue;
    }

    // f: Table — contains | and at least 2 matching lines
    const pipedLines = lines.filter((l) => l.includes("|"));
    if (pipedLines.length >= 2) {
      const rows = pipedLines.map((l) =>
        l.split("|").map((c) => c.trim()).filter(Boolean)
      );
      blocks.push({ type: "table", rows });
      continue;
    }

    // g: Normal paragraph
    blocks.push({ type: "paragraph", text: lines.join(" ") });
  }

  return blocks;
}

// ─── Special box config ───────────────────────────────────────

const specialConfig: Record<
  SpecialVariant,
  { border: string; bg: string; labelClass: string; emoji: string }
> = {
  example: {
    border: "border-blue-700",
    bg: "bg-blue-900/30",
    labelClass: "text-blue-400",
    emoji: "📘",
  },
  consider: {
    border: "border-purple-700",
    bg: "bg-purple-900/30",
    labelClass: "text-purple-400",
    emoji: "💭",
  },
  beaware: {
    border: "border-amber-700",
    bg: "bg-amber-900/30",
    labelClass: "text-amber-400",
    emoji: "⚠️",
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
              <div key={i}>
                {i > 0 && <hr className="border-border/40 mb-4" />}
                <h3 className="text-base font-semibold text-foreground mb-1">
                  <span className="text-primary font-mono mr-2">{block.code}</span>
                  {block.title}
                </h3>
              </div>
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
                  "rounded-lg border px-4 py-3 space-y-1.5",
                  cfg.border,
                  cfg.bg
                )}
              >
                <p className={cn("text-xs font-bold uppercase tracking-widest", cfg.labelClass)}>
                  {cfg.emoji} {block.tag}
                </p>
                {block.body && (
                  <p className="text-foreground/80 leading-relaxed">{block.body}</p>
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
