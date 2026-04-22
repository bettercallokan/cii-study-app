"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Layers,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Shuffle,
  Flame,
  BookOpen,
  ArrowLeft,
  Clock,
  Loader2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { courseUnitTitles } from "@/lib/course-data";
import type { Module, Lesson, Flashcard } from "@/utils/supabase/types";

// ─── Course metadata ──────────────────────────────────────────

const courseStyles = [
  {
    code: "W01",
    urlCode: "w01",
    description: "Fundamental principles of insurance, legal frameworks, and market structure.",
    color: "blue" as const,
  },
  {
    code: "WUE",
    urlCode: "wue",
    description: "Risk assessment, underwriting procedures, pricing and exposure management.",
    color: "purple" as const,
  },
  {
    code: "WCE",
    urlCode: "wce",
    description: "Claims process, settlement procedures, fraud detection and expense management.",
    color: "emerald" as const,
  },
];

type CourseColor = "blue" | "purple" | "emerald";

const colorMap: Record<CourseColor, { badge: string; icon: string; card: string; ring: string }> = {
  blue: {
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    card: "hover:border-blue-500/30 hover:bg-blue-500/5",
    ring: "text-blue-400",
  },
  purple: {
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    icon: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    card: "hover:border-purple-500/30 hover:bg-purple-500/5",
    ring: "text-purple-400",
  },
  emerald: {
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    card: "hover:border-emerald-500/30 hover:bg-emerald-500/5",
    ring: "text-emerald-400",
  },
};

// ─── Supabase client ──────────────────────────────────────────

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon);
}

// ─── Shared primitives ────────────────────────────────────────

function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-sm text-red-400">
      <AlertCircle className="w-4 h-4 shrink-0" />
      {message}
    </div>
  );
}

// ─── Progress Ring (from original design) ────────────────────

function ProgressRing({
  progress,
  size = 52,
  color = "text-primary",
}: {
  progress: number;
  size?: number;
  color?: string;
}) {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-secondary"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn("transition-all duration-500", color)}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
        {progress}%
      </span>
    </div>
  );
}

// ─── Courses View ─────────────────────────────────────────────

function CoursesView({
  onSelectModule,
}: {
  onSelectModule: (id: string, title: string, urlCode: string) => void;
}) {
  const [modules, setModules] = useState<Module[] | null>(null);
  const [cardCounts, setCardCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setModules([]); return; }

    sb.from("modules")
      .select("*")
      .eq("is_active", true)
      .order("order_index")
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); return; }
        setModules((data as Module[]) ?? []);
      });

    // Fetch lightweight flashcard module_id list to compute counts
    sb.from("flashcards")
      .select("module_id")
      .eq("is_active", true)
      .then(({ data }) => {
        if (!data) return;
        const counts: Record<string, number> = {};
        for (const row of data as { module_id: string | null }[]) {
          if (row.module_id) counts[row.module_id] = (counts[row.module_id] ?? 0) + 1;
        }
        setCardCounts(counts);
      });
  }, []);

  if (modules === null) return <LoadingSpinner label="Loading courses…" />;
  if (error) return <ErrorCard message={error} />;
  if (modules.length === 0) {
    return (
      <div className="text-center py-16 rounded-xl border border-border bg-card">
        <GraduationCap className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
        <p className="font-medium text-foreground mb-1">No courses found</p>
        <p className="text-sm text-muted-foreground">No active courses have been added yet.</p>
      </div>
    );
  }

  const totalCards = Object.values(cardCounts).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Cards", value: totalCards || "—" },
          { label: "Mastered", value: "0" },
          { label: "Due Today", value: "0" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="p-4 rounded-xl border border-border bg-card text-center"
          >
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Course deck cards */}
      <div className="space-y-4">
        {modules.map((mod, idx) => {
          const style = courseStyles[idx] ?? courseStyles[0];
          const colors = colorMap[style.color];
          const count = cardCounts[mod.id] ?? 0;

          return (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id, mod.title.en, style.urlCode)}
              className={cn(
                "group w-full flex items-center gap-5 p-5 rounded-xl border border-border bg-card transition-all duration-200 text-left",
                colors.card
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-xl border shrink-0",
                  colors.icon
                )}
              >
                <BookOpen className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full border text-xs font-bold tracking-wider",
                      colors.badge
                    )}
                  >
                    {style.code}
                  </span>
                  <h2 className="font-semibold text-foreground truncate">{mod.title.en}</h2>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
                  {style.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {count > 0 ? `${count} cards` : "No cards yet"}
                </p>
              </div>

              <ProgressRing progress={0} color={colors.ring} size={52} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Lessons View ─────────────────────────────────────────────

function LessonsView({
  moduleId,
  moduleTitle,
  courseCode,
  onSelectLesson,
  onBack,
}: {
  moduleId: string;
  moduleTitle: string;
  courseCode: string;
  onSelectLesson: (id: string, displayTitle: string) => void;
  onBack: () => void;
}) {
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [cardCounts, setCardCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const staticTitles = courseUnitTitles[courseCode] ?? [];

  useEffect(() => {
    setLessons(null);
    const sb = getSupabase();
    if (!sb) { setLessons([]); return; }

    sb.from("lessons")
      .select("id, module_id, title, order_index, estimated_duration_minutes, knowledge_level, is_active, version, created_at, updated_at, content, summary_content")
      .eq("module_id", moduleId)
      .eq("is_active", true)
      .order("order_index")
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setLessons((data as Lesson[]) ?? []);
      });

    sb.from("flashcards")
      .select("lesson_id")
      .eq("module_id", moduleId)
      .eq("is_active", true)
      .then(({ data }) => {
        if (!data) return;
        const counts: Record<string, number> = {};
        for (const row of data as { lesson_id: string | null }[]) {
          if (row.lesson_id) counts[row.lesson_id] = (counts[row.lesson_id] ?? 0) + 1;
        }
        setCardCounts(counts);
      });
  }, [moduleId]);

  if (error) return <ErrorCard message={error} />;

  const getTitle = (lesson: Lesson, idx: number) => staticTitles[idx] ?? lesson.title.en;

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </button>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{moduleTitle || "Loading…"}</h2>
          {lessons !== null && (
            <p className="text-xs text-muted-foreground mt-0.5">{lessons.length} units</p>
          )}
        </div>

        {lessons === null ? (
          <LoadingSpinner label="Loading units…" />
        ) : lessons.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted-foreground">No units found for this course.</p>
        ) : (
          <ul className="divide-y divide-border">
            {lessons.map((lesson, idx) => {
              const displayTitle = getTitle(lesson, idx);
              const count = cardCounts[lesson.id] ?? 0;
              return (
                <li key={lesson.id}>
                  <button
                    onClick={() => onSelectLesson(lesson.id, displayTitle)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors text-left group"
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary text-xs font-medium text-muted-foreground shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-foreground flex-1 truncate group-hover:text-primary transition-colors">
                      {displayTitle}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {count > 0 ? `${count} cards` : "—"}
                    </span>
                    {lesson.estimated_duration_minutes && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Clock className="w-3 h-3" />
                        {lesson.estimated_duration_minutes} min
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Flashcard Viewer ─────────────────────────────────────────

function FlashcardViewer({
  cards,
  masteredIds,
  onMastered,
}: {
  cards: Flashcard[];
  masteredIds: Set<string>;
  onMastered: (id: string) => void;
}) {
  const [indices, setIndices] = useState(() => cards.map((_, i) => i));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = cards[indices[currentIdx]];

  const go = (delta: 1 | -1) => {
    setIsFlipped(false);
    setCurrentIdx((prev) => Math.max(0, Math.min(indices.length - 1, prev + delta)));
  };

  const handleMastered = () => {
    if (card) onMastered(card.id);
    go(1);
  };

  const shuffle = () => {
    setIsFlipped(false);
    setCurrentIdx(0);
    setIndices((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const reset = () => {
    setIsFlipped(false);
    setCurrentIdx(0);
    setIndices(cards.map((_, i) => i));
  };

  if (!card) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" />
          {currentIdx + 1} / {indices.length}
        </span>
        <span className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-500" />
          {masteredIds.size} mastered
        </span>
      </div>

      <div
        onClick={() => setIsFlipped((f) => !f)}
        className="relative min-h-[280px] rounded-2xl border border-border bg-card cursor-pointer select-none"
      >
        <div
          className={cn(
            "absolute inset-0 p-8 flex flex-col rounded-2xl transition-opacity duration-200",
            isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          {card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-xl font-medium text-foreground leading-relaxed flex-1 flex items-center">
            {card.front.en}
          </p>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Click to reveal answer
          </p>
        </div>

        <div
          className={cn(
            "absolute inset-0 p-8 flex flex-col rounded-2xl bg-primary/5 transition-opacity duration-200",
            !isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <span className="text-xs font-medium text-green-500 mb-4">Answer</span>
          <p className="text-lg text-foreground leading-relaxed flex-1">{card.back.en}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => go(-1)}
          disabled={currentIdx === 0}
          className="p-3 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => go(1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors text-sm font-medium text-foreground"
          >
            <XCircle className="w-4 h-4 text-red-500" />
            Again
          </button>
          <button
            onClick={handleMastered}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 transition-colors text-sm font-medium text-primary-foreground"
          >
            <CheckCircle2 className="w-4 h-4" />
            Got it
          </button>
        </div>

        <button
          onClick={() => go(1)}
          disabled={currentIdx >= indices.length - 1}
          className="p-3 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-6 mt-5">
        <button
          onClick={shuffle}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Shuffle className="w-4 h-4" />
          Shuffle
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Progress
        </button>
      </div>
    </div>
  );
}

// ─── Cards View ───────────────────────────────────────────────

function CardsView({
  lessonId,
  lessonTitle,
  moduleId,
  courseCode,
  onBack,
}: {
  lessonId: string;
  lessonTitle: string;
  moduleId: string;
  courseCode: string;
  onBack: () => void;
}) {
  const [cards, setCards] = useState<Flashcard[] | null>(null);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCards(null);
    setMasteredIds(new Set());
    const sb = getSupabase();
    if (!sb) { setCards([]); return; }
    sb.from("flashcards")
      .select("*")
      .eq("lesson_id", lessonId)
      .eq("is_active", true)
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setCards((data as Flashcard[]) ?? []);
      });
  }, [lessonId]);

  if (error) return <ErrorCard message={error} />;

  const total = cards?.length ?? 0;
  const mastered = masteredIds.size;
  const remaining = total - mastered;
  const progress = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Units
      </button>

      {/* Session stats */}
      {cards !== null && cards.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
            <ProgressRing progress={progress} size={48} />
            <div>
              <p className="text-xl font-bold text-foreground">{total}</p>
              <p className="text-xs text-muted-foreground">Total Cards</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card text-center">
            <p className="text-2xl font-bold text-green-500">{mastered}</p>
            <p className="text-xs text-muted-foreground mt-1">Mastered</p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card text-center">
            <p className="text-2xl font-bold text-foreground">{remaining}</p>
            <p className="text-xs text-muted-foreground mt-1">Remaining</p>
          </div>
        </div>
      )}

      {/* Unit label */}
      <div className="flex items-center gap-2.5 p-4 mb-6 rounded-xl border border-border bg-card">
        <Layers className="w-4 h-4 text-primary shrink-0" />
        <span className="text-sm font-medium text-foreground truncate flex-1">
          {lessonTitle}
        </span>
        {cards !== null && (
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
            {total} cards
          </span>
        )}
      </div>

      {cards === null ? (
        <LoadingSpinner label="Loading cards…" />
      ) : cards.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border bg-card">
          <Layers className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="font-medium text-foreground mb-1">No cards found</p>
          <p className="text-sm text-muted-foreground">
            No flashcards have been added for this unit yet.
          </p>
        </div>
      ) : (
        <FlashcardViewer
          cards={cards}
          masteredIds={masteredIds}
          onMastered={(id) => setMasteredIds((prev) => new Set(prev).add(id))}
        />
      )}
    </div>
  );
}

// ─── Main content ─────────────────────────────────────────────

function FlashcardsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const moduleId = searchParams.get("moduleId");
  const lessonId = searchParams.get("lessonId");
  const courseCode = searchParams.get("code") ?? "";
  const unitTitle = searchParams.get("t") ? decodeURIComponent(searchParams.get("t")!) : "";

  const [moduleTitle, setModuleTitle] = useState("");

  useEffect(() => {
    if (!moduleId) { setModuleTitle(""); return; }
    const sb = getSupabase();
    if (!sb) { setModuleTitle("Module"); return; }
    sb.from("modules").select("title").eq("id", moduleId).single().then(({ data }) => {
      setModuleTitle(data ? (data as { title: { en: string } }).title.en : "Module");
    });
  }, [moduleId]);

  const view = lessonId && moduleId ? "cards" : moduleId ? "lessons" : "courses";

  const subtitle =
    view === "courses"
      ? "Master key concepts with active recall"
      : view === "lessons"
      ? moduleTitle || "Select a unit"
      : unitTitle || "Study session";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
            <Layers className="w-4 h-4" />
            Spaced Repetition
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Flashcard Decks
          </h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>

        {view === "courses" && (
          <CoursesView
            onSelectModule={(id, title, urlCode) => {
              setModuleTitle(title);
              router.push(`/flashcards?moduleId=${id}&code=${urlCode}`);
            }}
          />
        )}

        {view === "lessons" && moduleId && (
          <LessonsView
            moduleId={moduleId}
            moduleTitle={moduleTitle}
            courseCode={courseCode}
            onSelectLesson={(id, displayTitle) => {
              router.push(
                `/flashcards?moduleId=${moduleId}&code=${courseCode}&lessonId=${id}&t=${encodeURIComponent(displayTitle)}`
              );
            }}
            onBack={() => router.push("/flashcards")}
          />
        )}

        {view === "cards" && lessonId && moduleId && (
          <CardsView
            lessonId={lessonId}
            lessonTitle={unitTitle}
            moduleId={moduleId}
            courseCode={courseCode}
            onBack={() => router.push(`/flashcards?moduleId=${moduleId}&code=${courseCode}`)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────

export default function FlashcardsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      }
    >
      <FlashcardsContent />
    </Suspense>
  );
}
