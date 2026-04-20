import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
  Lock,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Module } from "@/utils/supabase/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─── Supabase ─────────────────────────────────────────────────
function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon);
}

async function getModule(id: string): Promise<Module | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as Module;
}

// ─── Static lesson list (will come from DB later) ───
const STATIC_LESSONS = [
  {
    id: 1,
    title: "1. Fundamental Concepts",
    duration: "15 min",
    active: true,
    completed: false,
  },
  {
    id: 2,
    title: "2. Historical Development",
    duration: "20 min",
    active: false,
    completed: false,
  },
  {
    id: 3,
    title: "3. Application Principles",
    duration: "25 min",
    active: false,
    completed: false,
  },
];

// ─── Page Metadata ───────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mod = await getModule(id);
  const title = mod?.title?.tr || mod?.title?.en || "Module";
  return { title: `${title} · CII W01` };
}

// ─── Components ───────────────────────────────────────────────

function LessonSidebar({ mod }: { mod: Module }) {
  const title = mod.title?.tr || mod.title?.en || "—";

  return (
    <aside className="lg:w-72 lg:shrink-0">
      <div className="lg:sticky lg:top-8 rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Module
            </span>
          </div>
          <h2 className="text-sm font-semibold text-foreground leading-snug">
            {title}
          </h2>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{STATIC_LESSONS.length} lessons · ~60 min</span>
          </div>
        </div>

        {/* Lessons */}
        <nav className="p-3">
          <p className="px-1 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Lessons
          </p>
          <ul className="space-y-1">
            {STATIC_LESSONS.map((lesson) => (
              <li key={lesson.id}>
                <button
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group
                    ${
                      lesson.active
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-secondary/50 border border-transparent"
                    }`}
                >
                  <span
                    className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-colors
                      ${
                        lesson.completed
                          ? "bg-green-500/20 text-green-500"
                          : lesson.active
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-muted-foreground group-hover:text-foreground"
                      }`}
                  >
                    {lesson.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : lesson.active ? (
                      <BookOpen className="w-3.5 h-3.5" />
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                  </span>
                  <span
                    className={`text-sm leading-snug flex-1 transition-colors
                      ${
                        lesson.active
                          ? "text-foreground font-medium"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                  >
                    {lesson.title}
                  </span>
                  {lesson.active && (
                    <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

function ProseContent({ mod }: { mod: Module }) {
  const description = mod.description?.tr || mod.description?.en || "";

  return (
    <div className="prose-study">
      {description && (
        <p className="lead text-foreground/80 text-base">{description}</p>
      )}

      <hr />

      <h2>Learning Objectives</h2>
      <ul>
        <li>
          Understand the fundamental concepts and key terminology of this module.
        </li>
        <li>
          Apply theoretical knowledge through real-world examples and case studies.
        </li>
        <li>
          Test your understanding with CII W01 exam-style questions.
        </li>
      </ul>

      <h2>1. Fundamental Concepts</h2>
      <p>
        The insurance sector is a cornerstone of risk management. In this first
        section, we&apos;ll focus on foundational concepts: risk transfer, loss
        indemnification, and the principles of insurable interest.
      </p>
      <blockquote>
        <strong>Key Concept:</strong> Insurable interest refers to a situation
        where a person derives an economic benefit from the continued existence
        of the insured item or would suffer economic loss from its destruction.
      </blockquote>

      <h3>What is Risk?</h3>
      <p>
        Risk is the probability of an uncertain event occurring that could
        result in a loss. Insurance replaces this uncertainty with a predictable
        cost known as the <strong>premium</strong>.
      </p>

      <h2>2. Historical Development</h2>
      <p>
        Modern insurance began to take shape in 17th century London at Lloyd&apos;s
        coffee house, evolving through the 19th and 20th centuries with legal
        reforms to become the institutional framework we know today.
      </p>
      <p>
        The legal framework for insurance in the UK was fundamentally reformed
        by the <strong>Insurance Act 2015</strong>, which modernized the duty
        of fair presentation and the warranty regime.
      </p>

      <h2>3. Application Principles</h2>
      <p>
        Converting theoretical knowledge into exam success requires practical
        application. The mini-tests at the end of each section measure how well
        the learned concepts are grasped at either the <code>know</code> or{" "}
        <code>understand</code> level.
      </p>

      <h3>Exam Preparation Tips</h3>
      <ul>
        <li>Review key terms and definitions regularly using flashcards</li>
        <li>Practice with past exam questions to understand the format</li>
        <li>Focus on understanding principles, not just memorizing facts</li>
        <li>Use the spaced repetition system for optimal retention</li>
      </ul>
    </div>
  );
}

// ─── Main Page Component ───────────────────────────────────────
export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mod = await getModule(id);

  if (!mod) notFound();

  const title = mod.title?.tr || mod.title?.en || "—";

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center gap-4">
          <Link
            href="/modules"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Modules</span>
          </Link>
          <span className="text-border select-none">/</span>
          <span className="text-sm text-foreground font-medium truncate">
            {title}
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Module Title Area */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
            <Layers className="w-3.5 h-3.5" />
            CII W01 Syllabus
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight text-balance leading-tight">
            {title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-xs text-muted-foreground bg-secondary rounded-full px-3 py-1">
              v{mod.version}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {STATIC_LESSONS.length} lessons
            </span>
          </div>
        </div>

        {/* Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <LessonSidebar mod={mod} />

          {/* Prose Content */}
          <article className="flex-1 min-w-0 rounded-xl border border-border bg-card p-6 sm:p-8 lg:p-10">
            <ProseContent mod={mod} />

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Previous Lesson
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Next Lesson
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
