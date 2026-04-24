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

// ─── Callout splitter ─────────────────────────────────────────
// Splits a chunk on inline [BE AWARE] / [CONSIDER THIS] / [EXAMPLE x] markers.
// Text before each marker → text part; marker + following text → callout part.

type RawPart =
  | { isCallout: false; text: string }
  | { isCallout: true; tag: string; body: string };

function splitOnCallouts(chunk: string): RawPart[] {
  const re = /\[(BE AWARE|CONSIDER THIS|EXAMPLE[\s\d.]*)\]/gi;
  const raw: Array<{ isCallout: false; text: string } | { isCallout: true; tag: string }> = [];
  let lastEnd = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(chunk)) !== null) {
    if (m.index > lastEnd) {
      raw.push({ isCallout: false, text: chunk.slice(lastEnd, m.index) });
    }
    raw.push({ isCallout: true, tag: m[1] });
    lastEnd = m.index + m[0].length;
  }
  if (lastEnd < chunk.length) {
    raw.push({ isCallout: false, text: chunk.slice(lastEnd) });
  }

  // Attach the following text part as the callout body
  const parts: RawPart[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (item.isCallout) {
      let body = "";
      if (i + 1 < raw.length && !raw[i + 1].isCallout) {
        body = (raw[i + 1] as { isCallout: false; text: string }).text.trim();
        i++;
      }
      parts.push({ isCallout: true, tag: item.tag, body });
    } else if (item.text.trim()) {
      parts.push({ isCallout: false, text: item.text });
    }
  }
  return parts;
}

// ─── Inline table extractor ────────────────────────────────────
// Finds pipe-containing segments inside a paragraph using the pattern:
//   non-pipe/non-period text  |  non-pipe/non-period text  (. or space)
// Returns pre-text, table rows, and post-text, or null if < 2 segments found.

function extractInlineTable(
  text: string
): { pre: string; headers: string[]; rows: string[][]; post: string } | null {
  // Each match: "left | right" terminated by ". " or whitespace
  const re = /([^.|]+\|[^.|]+(?:\.\s+|\s+))/g;
  const segs: Array<{ index: number; end: number; text: string }> = [];
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    segs.push({ index: m.index, end: m.index + m[0].length, text: m[0] });
  }
  if (segs.length < 2) return null;

  const tableStart = segs[0].index;
  const tableEnd = segs[segs.length - 1].end;

  // Text strictly before the first segment
  const beforeTable = text.slice(0, tableStart);
  const afterTable = text.slice(tableEnd).trim();

  // Find the last ". " boundary inside beforeTable to split pre-paragraph from
  // any text that belongs to the table header row
  const lastPeriodSpace = beforeTable.lastIndexOf(". ");
  let pre: string;
  let extraHead: string;
  if (lastPeriodSpace === -1) {
    pre = "";
    extraHead = beforeTable.trim();
  } else {
    pre = beforeTable.slice(0, lastPeriodSpace + 1).trim();
    extraHead = beforeTable.slice(lastPeriodSpace + 2).trim();
  }

  // Parse each segment into table cells
  const rawRows = segs.map((seg) =>
    seg.text
      .trim()
      .replace(/[.\s]+$/, "")
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean)
  );

  // Rows with 3+ cells are likely two rows merged — split into pairs
  const normalizedRows: string[][] = [];
  for (const row of rawRows) {
    if (row.length <= 2) {
      normalizedRows.push(row);
    } else {
      for (let i = 0; i + 1 < row.length; i += 2) {
        normalizedRows.push([row[i], row[i + 1]]);
      }
    }
  }

  // extraHead with "|" is a header row; without "|" it belongs to pre
  if (extraHead.includes("|")) {
    normalizedRows.unshift(
      extraHead.split("|").map((c) => c.trim()).filter(Boolean)
    );
  } else if (extraHead) {
    pre = pre ? `${pre} ${extraHead}` : extraHead;
  }

  if (normalizedRows.length < 2) return null;

  return {
    pre: pre.trim(),
    headers: normalizedRows[0],
    rows: normalizedRows.slice(1),
    post: afterTable,
  };
}

// ─── Per-text-part processor ──────────────────────────────────

function processTextPart(text: string, out: Block[]): void {
  const trimmed = text.trim();
  if (!trimmed) return;

  // Heading: single line matching A1, B2 …
  const hm = trimmed.match(/^([A-Z]\d+)\s+(.+)$/);
  if (hm && !trimmed.includes("\n")) {
    out.push({ type: "heading", code: hm[1], text: hm[2] });
    return;
  }

  // Bullet list — every line starts with •
  const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 0 && lines.every((l) => l.startsWith("•"))) {
    out.push({ type: "bullets", items: lines.map((l) => l.replace(/^•\s*/, "")) });
    return;
  }

  // Inline table detection
  if (trimmed.includes("|")) {
    const tbl = extractInlineTable(trimmed);
    if (tbl) {
      if (tbl.pre) out.push({ type: "paragraph", text: tbl.pre });
      out.push({ type: "table", headers: tbl.headers, rows: tbl.rows });
      if (tbl.post) out.push({ type: "paragraph", text: tbl.post });
      return;
    }
  }

  // Mixed block — process line by line to find inline headings / bullets
  const subLines = trimmed.split("\n");
  let buffer: string[] = [];

  const flushBuffer = () => {
    if (buffer.length > 0) {
      const joined = buffer.join(" ").trim();
      if (joined) out.push({ type: "paragraph", text: joined });
      buffer = [];
    }
  };

  for (const line of subLines) {
    const t = line.trim();
    const inlineHead = t.match(/^([A-Z]\d+)\s+(.+)$/);
    if (inlineHead && !t.includes("|")) {
      flushBuffer();
      out.push({ type: "heading", code: inlineHead[1], text: inlineHead[2] });
      continue;
    }
    if (t.startsWith("•")) {
      flushBuffer();
      out.push({ type: "bullets", items: [t.replace(/^•\s*/, "")] });
      continue;
    }
    buffer.push(t);
  }
  flushBuffer();
}

// ─── Main parser ─────────────────────────────────────────────

function classifyAndParse(raw: string): Block[] {
  // STEP 1: split on double newline
  const chunks = raw.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
  const blocks: Block[] = [];

  for (const chunk of chunks) {
    // STEP 2: split each chunk on inline callout markers
    const parts = splitOnCallouts(chunk);

    for (const part of parts) {
      if (part.isCallout) {
        const upper = part.tag.toUpperCase();
        let variant: "example" | "consider" | "aware" = "example";
        if (upper.includes("CONSIDER")) variant = "consider";
        else if (upper.includes("AWARE")) variant = "aware";
        blocks.push({ type: "callout", variant, label: part.tag, body: part.body });
      } else {
        // STEP 3-6: heading / bullets / inline table / paragraph
        processTextPart(part.text, blocks);
      }
    }
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

// ─── Highlight helper ────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────

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
