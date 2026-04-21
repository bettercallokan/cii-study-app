import { NextRequest, NextResponse } from "next/server";

const GEMINI_MODEL = "gemini-1.5-pro";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface HistoryMessage {
  role: "user" | "model";
  text: string;
}

interface RequestBody {
  message: string;
  fileName: string;
  history: HistoryMessage[];
}

function buildSystemInstruction(fileName: string): string {
  return `You are a specialist study assistant for CII (Chartered Insurance Institute) insurance exams. \
The student is currently reading: "${fileName}".

Guidelines:
- Answer questions accurately using CII insurance syllabus knowledge (principles, coverage, exclusions, regulations, definitions).
- Whenever your answer corresponds to content likely found in the document, suggest a specific page or page range, e.g. "See page 12" or "Pages 34–36 cover this in detail." Only cite pages you are confident about; if unsure, say so.
- Use short paragraphs and bullet points for clarity.
- Keep answers focused and exam-oriented.
- Be encouraging and professional.`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key is not configured on the server." },
      { status: 500 }
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { message, fileName, history } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: "message is required." }, { status: 400 });
  }

  const contents = [
    ...(history ?? []).map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    })),
    { role: "user", parts: [{ text: message.trim() }] },
  ];

  const geminiBody = {
    systemInstruction: {
      parts: [{ text: buildSystemInstruction(fileName ?? "the document") }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  let geminiRes: Response;
  try {
    geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach Gemini API." },
      { status: 502 }
    );
  }

  if (!geminiRes.ok) {
    return NextResponse.json(
      { error: `Gemini API returned status ${geminiRes.status}.` },
      { status: 502 }
    );
  }

  const data = await geminiRes.json();
  const reply: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!reply) {
    return NextResponse.json(
      { error: "Gemini returned an empty response." },
      { status: 502 }
    );
  }

  return NextResponse.json({ reply });
}
