"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
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
  ChevronDown,
  Loader2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import type { Module, Lesson, Flashcard } from "@/utils/supabase/types";

// ─── Supabase client (null-safe for missing env vars) ─────────

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon);
}

// ─── Shared UI primitives ─────────────────────────────────────

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

// ─── Selection View (grid + lessons panel) ────────────────────

function SelectionView({
  onSelectModule,
  onSelectLesson,
}: {
  onSelectModule: (id: string, label: string) => void;
  onSelectLesson: (id: string, label: string) => void;
}) {
  const [modules, setModules] = useState<Module[] | null>(null);
  const [lessonCache, setLessonCache] = useState<Record<string, Lesson[]>>({});
  const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setModules([]); return; }
    sb.from("modules")
      .select("*")
      .eq("is_active", true)
      .order("order_index")
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setModules((data as Module[]) ?? []);
      });
  }, []);

  const handleToggle = useCallback(
    async (mod: Module) => {
      if (expandedId === mod.id) { setExpandedId(null); return; }
      setExpandedId(mod.id);
      if (lessonCache[mod.id]) return;
      setLoadingLessonId(mod.id);
      const sb = getSupabase();
      if (!sb) { setLoadingLessonId(null); return; }
      const { data, error: err } = await sb
        .from("lessons")
        .select("id, module_id, title, order_index, estimated_duration_minutes, knowledge_level, is_active, version, created_at, updated_at, content, summary_content")
        .eq("module_id", mod.id)
        .eq("is_active", true)
        .order("order_index");
      setLoadingLessonId(null);
      if (!err) {
        setLessonCache((prev) => ({ ...prev, [mod.id]: (data as Lesson[]) ?? [] }));
      }
    },
    [expandedId, lessonCache]
  );

  if (modules === null) return <LoadingSpinner label="Loading modules…" />;
  if (error) return <ErrorCard message={error} />;
  if (modules.length === 0) {
    return (
      <div className="text-center py-16 rounded-xl border border-border bg-card">
        <Layers className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
        <p className="font-medium text-foreground mb-1">No modules found</p>
        <p className="text-sm text-muted-foreground">No active modules have been added yet.</p>
      </div>
    );
  }

  const expandedModule = modules.find((m) => m.id === expandedId);
  const expandedLessons = expandedId ? (lessonCache[expandedId] ?? []) : [];
  const isLoadingLessons = loadingLessonId === expandedId;

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground">
        Select a module or lesson to start studying:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modules.map((mod) => {
          const title = mod.title.en;
          const isExpanded = expandedId === mod.id;

          return (
            <div
              key={mod.id}
              className={cn(
                "rounded-xl border bg-card p-5 transition-all",
                isExpanded ? "border-primary/40" : "border-border"
              )}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground leading-snug">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">v{mod.version}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectModule(mod.id, title)}
                  className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  Study All
                </button>
                <button
                  onClick={() => handleToggle(mod)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors",
                    isExpanded
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  Units
                  <ChevronDown
                    className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-180")}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lessons panel below grid */}
      {expandedId && expandedModule && (
        <div className="rounded-xl border border-primary/20 bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground text-sm">
              {expandedModule.title.en} — Lessons
            </h3>
          </div>
          {isLoadingLessons ? (
            <LoadingSpinner label="Loading lessons…" />
          ) : expandedLessons.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">
              No lessons found for this module.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {expandedLessons.map((lesson) => (
                <li key={lesson.id}>
                  <button
                    onClick={() => onSelectLesson(lesson.id, lesson.title.en)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/30 transition-colors text-left group"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground flex-1 truncate group-hover:text-primary transition-colors">
                      {lesson.title.en}
                    </span>
                    {lesson.estimated_duration_minutes && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        ~{lesson.estimated_duration_minutes} min
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Flashcard Viewer ─────────────────────────────────────────

function FlashcardViewer({ cards }: { cards: Flashcard[] }) {
  const [indices, setIndices] = useState(() => cards.map((_, i) => i));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  const card = cards[indices[currentIdx]];

  const go = (delta: 1 | -1) => {
    setIsFlipped(false);
    setCurrentIdx((prev) =>
      Math.max(0, Math.min(indices.length - 1, prev + delta))
    );
  };

  const markMastered = () => {
    if (card) setMasteredIds((prev) => new Set(prev).add(card.id));
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
    setMasteredIds(new Set());
    setIndices(cards.map((_, i) => i));
  };

  if (!card) return null;

  return (
    <div>
      {/* Session info */}
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

      {/* Card face */}
      <div
        onClick={() => setIsFlipped((f) => !f)}
        className="relative min-h-[280px] rounded-2xl border border-border bg-card cursor-pointer select-none"
      >
        {/* Front */}
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

        {/* Back */}
        <div
          className={cn(
            "absolute inset-0 p-8 flex flex-col rounded-2xl bg-primary/5 transition-opacity duration-200",
            !isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <span className="text-xs font-medium text-green-500 mb-4">Answer</span>
          <p className="text-lg text-foreground leading-relaxed flex-1">
            {card.back.en}
          </p>
        </div>
      </div>

      {/* Controls */}
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
            onClick={markMastered}
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

      {/* Quick actions */}
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
          Reset
        </button>
      </div>
    </div>
  );
}

// ─── Study View (active filter) ───────────────────────────────

function StudyView({
  moduleId,
  lessonId,
  filterLabel,
  onClearFilter,
}: {
  moduleId: string | null;
  lessonId: string | null;
  filterLabel: string;
  onClearFilter: () => void;
}) {
  const [cards, setCards] = useState<Flashcard[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCards(null);
    setError(null);
    const sb = getSupabase();
    if (!sb) { setCards([]); return; }

    let query = sb.from("flashcards").select("*").eq("is_active", true);
    if (lessonId) query = query.eq("lesson_id", lessonId);
    else if (moduleId) query = query.eq("module_id", moduleId);

    query.then(({ data, error: err }) => {
      if (err) setError(err.message);
      else setCards((data as Flashcard[]) ?? []);
    });
  }, [moduleId, lessonId]);

  if (error) return <ErrorCard message={error} />;
  if (cards === null) return <LoadingSpinner label="Loading cards…" />;

  return (
    <div>
      {/* Filter badge */}
      <div className="flex items-center justify-between p-4 mb-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2.5 min-w-0">
          <Layers className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">
            {filterLabel || "Loading…"}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
            {cards.length} cards
          </span>
        </div>
        <button
          onClick={onClearFilter}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Change
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border bg-card">
          <Layers className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="font-medium text-foreground mb-1">No cards found</p>
          <p className="text-sm text-muted-foreground">
            No flashcards have been added for this filter yet.
          </p>
        </div>
      ) : (
        <FlashcardViewer cards={cards} />
      )}
    </div>
  );
}

// ─── Main content (wrapped in Suspense for useSearchParams) ───

function FlashcardsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const moduleId = searchParams.get("moduleId");
  const lessonId = searchParams.get("lessonId");
  const hasFilter = Boolean(moduleId || lessonId);

  const [filterLabel, setFilterLabel] = useState<string>("");

  useEffect(() => {
    if (!hasFilter) { setFilterLabel(""); return; }
    const sb = getSupabase();
    if (!sb) {
      setFilterLabel(lessonId ? "Lesson" : "Module");
      return;
    }
    if (lessonId) {
      sb.from("lessons")
        .select("title")
        .eq("id", lessonId)
        .single()
        .then(({ data }) => {
          setFilterLabel(
            data ? (data as { title: { en: string } }).title.en : "Lesson"
          );
        });
    } else if (moduleId) {
      sb.from("modules")
        .select("title")
        .eq("id", moduleId)
        .single()
        .then(({ data }) => {
          setFilterLabel(
            data ? (data as { title: { en: string } }).title.en : "Module"
          );
        });
    }
  }, [moduleId, lessonId, hasFilter]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
            <Layers className="w-4 h-4" />
            Spaced Repetition
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Flashcard Deck
          </h1>
          <p className="text-muted-foreground mt-1">
            {hasFilter
              ? filterLabel || "Loading…"
              : "Select a module or lesson to start studying"}
          </p>
        </div>

        {hasFilter ? (
          <StudyView
            moduleId={moduleId}
            lessonId={lessonId}
            filterLabel={filterLabel}
            onClearFilter={() => router.push("/flashcards")}
          />
        ) : (
          <SelectionView
            onSelectModule={(id, label) => {
              setFilterLabel(label);
              router.push(`/flashcards?moduleId=${id}`);
            }}
            onSelectLesson={(id, label) => {
              setFilterLabel(label);
              router.push(`/flashcards?lessonId=${id}`);
            }}
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
