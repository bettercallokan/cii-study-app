// components/ContentRenderer.tsx
"use client";

interface ContentRendererProps {
  content: string;
}

type Block =
  | { type: "heading"; code: string; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "callout"; variant: "example" | "consider" | "aware"; label: string; body: string }
  | { type: "paragraph"; text: string };

function classifyAndParse(raw: string): Block[] {
  // Split on double newline to get rough blocks
  const chunks = raw.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
  const blocks: Block[] = [];

  for (const chunk of chunks) {
    // 1. Callout boxes
    const calloutMatch = chunk.match(
      /^\[(EXAMPLE[\s\d.]*|CONSIDER THIS|BE AWARE)\]\s*([\s\S]*)$/i
    );
    if (calloutMatch) {
      const tag = calloutMatch[1].toUpperCase();
      let variant: "example" | "consider" | "aware" = "example";
      if (tag.includes("CONSIDER")) variant = "consider";
      else if (tag.includes("AWARE")) variant = "aware";
      blocks.push({
        type: "callout",
        variant,
        label: calloutMatch[1].trim(),
        body: calloutMatch[2].trim(),
      });
      continue;
    }

    // 2. Sub-headings like A1, B2, C3 etc.
    const headingMatch = chunk.match(/^([A-Z]\d+)\s+(.+)$/);
    if (headingMatch && chunk.indexOf("\n") === -1) {
      blocks.push({
        type: "heading",
        code: headingMatch[1],
        text: headingMatch[2],
      });
      continue;
    }

    // 3. Bullet list — every line starts with •
    const lines = chunk.split("\n").map((l) => l.trim());
    if (lines.length > 0 && lines.every((l) => l.startsWith("•"))) {
      blocks.push({
        type: "bullets",
        items: lines.map((l) => l.replace(/^•\s*/, "")),
      });
      continue;
    }

    // 4. Table — at least 2 lines, 80%+ have pipe, consistent pipe count
    if (lines.length >= 2) {
      const pipeLines = lines.filter((l) => l.includes("|"));
      const pipeRatio = pipeLines.length / lines.length;
      if (pipeRatio >= 0.8) {
        const pipeCounts = pipeLines.map(
          (l) => (l.match(/\|/g) || []).length
        );
        const avgPipes = pipeCounts.reduce((a, b) => a + b, 0) / pipeCounts.length;
        const consistent = pipeCounts.every((c) => Math.abs(c - avgPipes) <= 1);
        if (consistent) {
          const tableLines = lines.filter((l) => l.includes("|"));
          const split = (l: string) =>
            l.split("|").map((c) => c.trim()).filter(Boolean);
          const headers = split(tableLines[0]);
          const rows = tableLines.slice(1).map(split);
          blocks.push({ type: "table", headers, rows });
          continue;
        }
      }
    }

    // 5. Mixed block — may contain inline heading or partial bullets
    // Split by single newline and process each line
    const subLines = chunk.split("\n");
    let buffer: string[] = [];

    const flushBuffer = () => {
      if (buffer.length > 0) {
        const joined = buffer.join(" ").trim();
        if (joined) blocks.push({ type: "paragraph", text: joined });
        buffer = [];
      }
    };

    for (const line of subLines) {
      const trimmed = line.trim();
      // inline heading
      const inlineHead = trimmed.match(/^([A-Z]\d+)\s+(.+)$/);
      if (inlineHead && trimmed.indexOf("|") === -1) {
        flushBuffer();
        blocks.push({ type: "heading", code: inlineHead[1], text: inlineHead[2] });
        continue;
      }
      // bullet
      if (trimmed.startsWith("•")) {
        flushBuffer();
        // collect consecutive bullets
        const bulletItems = [trimmed.replace(/^•\s*/, "")];
        // we just push single bullet — next lines will also be checked
        blocks.push({ type: "bullets", items: bulletItems });
        continue;
      }
      buffer.push(trimmed);
    }
    flushBuffer();
  }

  // Merge consecutive bullet blocks
  const merged: Block[] = [];
  for (const b of blocks) {
    const prev = merged[merged.length - 1];
    if (b.type === "bullets" && prev?.type === "bullets") {
      prev.items.push(...b.items);
    } else {
      merged.push(b);
    }
  }

  return merged;
}

function highlightTerms(text: string) {
  // Highlight 'quoted terms'
  const parts = text.split(/('(?:[^']+)')/g);
  return parts.map((part, i) => {
    const m = part.match(/^'([^']+)'$/);
    if (m) {
      return (
        <span key={i} className="text-blue-300 font-medium bg-blue-900/20 px-1 rounded">
          {m[1]}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ContentRenderer({ content }: ContentRendererProps) {
  if (!content) {
    return (
      <div className="text-gray-400 italic p-8 text-center">
        No content available for this section.
      </div>
    );
  }

  const blocks = classifyAndParse(content);

  return (
    <div className="space-y-4 text-gray-200 leading-relaxed">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <div key={i} className="mt-8 first:mt-0">
                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="text-blue-400 text-sm font-mono bg-blue-900/30 px-2 py-0.5 rounded">
                      {block.code}
                    </span>
                    {block.text}
                  </h3>
                </div>
              </div>
            );

          case "bullets":
            return (
              <ul key={i} className="space-y-2 ml-4">
                {block.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1.5 text-xs">●</span>
                    <span>{highlightTerms(item)}</span>
                  </li>
                ))}
              </ul>
            );

          case "table":
            return (
              <div key={i} className="overflow-x-auto my-4">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      {block.headers.map((h, j) => (
                        <th
                          key={j}
                          className="text-left p-3 font-semibold text-white bg-gray-800/50 first:rounded-tl-lg last:rounded-tr-lg"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr
                        key={j}
                        className="border-b border-gray-700/50 hover:bg-gray-800/30"
                      >
                        {row.map((cell, k) => (
                          <td key={k} className="p-3 text-gray-300">
                            {highlightTerms(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "callout":
            const config = {
              example: {
                icon: "📘",
                bg: "bg-blue-900/20",
                border: "border-blue-700/50",
                title: "text-blue-300",
              },
              consider: {
                icon: "💭",
                bg: "bg-purple-900/20",
                border: "border-purple-700/50",
                title: "text-purple-300",
              },
              aware: {
                icon: "⚠️",
                bg: "bg-amber-900/20",
                border: "border-amber-700/50",
                title: "text-amber-300",
              },
            };
            const c = config[block.variant];
            return (
              <div
                key={i}
                className={`${c.bg} ${c.border} border rounded-lg p-4 my-4`}
              >
                <div className={`font-semibold ${c.title} mb-2 flex items-center gap-2`}>
                  <span>{c.icon}</span>
                  {block.label}
                </div>
                <div className="text-gray-300 leading-relaxed">
                  {highlightTerms(block.body)}
                </div>
              </div>
            );

          case "paragraph":
            return (
              <p key={i} className="text-gray-300 leading-relaxed">
                {highlightTerms(block.text)}
              </p>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
