"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ClipboardList,
  Clock,
  Target,
  Trophy,
  Play,
  CheckCircle2,
  XCircle,
  ChevronRight,
  BarChart3,
  Calendar,
  ArrowLeft,
  ChevronDown,
  Loader2,
  AlertCircle,
  GraduationCap,
  BookOpen,
  Zap,
  Shield,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import type { Module, Lesson, Quiz } from "@/utils/supabase/types";

// ─── Supabase client (null-safe) ──────────────────────────────

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon);
}

// ─── Static sidebar data (kept from original design) ─────────

const recentResults = [
  { exam: "Module 1-3 Assessment", score: 82, date: "2 days ago", passed: true },
  { exam: "Contract Law Focus", score: 68, date: "5 days ago", passed: true },
  { exam: "Quick Quiz: Risk Types", score: 45, date: "1 week ago", passed: false },
];

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

// ─── Selection View ───────────────────────────────────────────

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
        setLessonCache((prev) => ({
          ...prev,
          [mod.id]: (data as Lesson[]) ?? [],
        }));
      }
    },
    [expandedId, lessonCache]
  );

  if (modules === null) return <LoadingSpinner label="Modüller yükleniyor…" />;
  if (error) return <ErrorCard message={error} />;
  if (modules.length === 0) {
    return (
      <div className="text-center py-16 rounded-xl border border-border bg-card">
        <ClipboardList className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
        <p className="font-medium text-foreground mb-1">Modül bulunamadı</p>
        <p className="text-sm text-muted-foreground">Henüz aktif modül eklenmemiş.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground mb-4">
        Sınav yapmak istediğiniz modül veya dersi seçin:
      </p>
      {modules.map((mod) => {
        const title = mod.title.en;
        const isExpanded = expandedId === mod.id;
        const lessons = lessonCache[mod.id] ?? [];
        const isLoadingLessons = loadingLessonId === mod.id;

        return (
          <div
            key={mod.id}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="flex items-center gap-4 p-5">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tüm dersler · v{mod.version}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onSelectModule(mod.id, title)}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  Modülü sına
                </button>
                <button
                  onClick={() => handleToggle(mod)}
                  className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground"
                  aria-label="Dersleri göster"
                >
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-border">
                {isLoadingLessons ? (
                  <LoadingSpinner label="Dersler yükleniyor…" />
                ) : lessons.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-muted-foreground">
                    Bu modülde ders bulunamadı.
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <button
                          onClick={() =>
                            onSelectLesson(lesson.id, lesson.title.en)
                          }
                          className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/30 transition-colors text-left group"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm text-foreground flex-1 truncate group-hover:text-primary transition-colors">
                            {lesson.title.en}
                          </span>
                          {lesson.estimated_duration_minutes && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              ~{lesson.estimated_duration_minutes} dk
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
      })}
    </div>
  );
}

// ─── Quiz Card ────────────────────────────────────────────────

const quizTypeConfig = {
  mini_test: {
    label: "Mini Test",
    icon: Zap,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  full_simulation: {
    label: "Simülasyon",
    icon: Shield,
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
} as const;

function QuizCard({ quiz }: { quiz: Quiz }) {
  const cfg = quizTypeConfig[quiz.quiz_type];
  const Icon = cfg.icon;

  return (
    <div className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
          <ClipboardList className="w-5 h-5 text-primary" />
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-medium",
            cfg.color
          )}
        >
          <Icon className="w-3 h-3" />
          {cfg.label}
        </span>
      </div>

      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
        {quiz.title.en}
      </h3>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 mb-4">
        <span className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" />
          {quiz.question_count} soru
        </span>
        {quiz.time_limit_minutes && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {quiz.time_limit_minutes} dk
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-yellow-500" />
          Geçer: {quiz.pass_threshold_percentage}%
        </span>
      </div>

      <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        <Play className="w-4 h-4" />
        Sınavı Başlat
      </button>
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
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuizzes(null);
    setError(null);
    const sb = getSupabase();
    if (!sb) { setQuizzes([]); return; }

    let query = sb.from("quizzes").select("*").eq("is_active", true);
    if (lessonId) query = query.eq("lesson_id", lessonId);
    else if (moduleId) query = query.eq("module_id", moduleId);

    query.order("created_at").then(({ data, error: err }) => {
      if (err) setError(err.message);
      else setQuizzes((data as Quiz[]) ?? []);
    });
  }, [moduleId, lessonId]);

  if (error) return <ErrorCard message={error} />;
  if (quizzes === null) return <LoadingSpinner label="Sınavlar yükleniyor…" />;

  return (
    <div>
      {/* Filter badge */}
      <div className="flex items-center justify-between p-4 mb-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2.5 min-w-0">
          <ClipboardList className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">
            {filterLabel || "Yükleniyor…"}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
            {quizzes.length} sınav
          </span>
        </div>
        <button
          onClick={onClearFilter}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Değiştir
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border bg-card">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="font-medium text-foreground mb-1">Sınav bulunamadı</p>
          <p className="text-sm text-muted-foreground">
            Bu filtre için henüz sınav eklenmemiş.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar components (static) ─────────────────────────────

function StatsSidebar() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Ort. Puan</span>
          </div>
          <p className="text-2xl font-bold text-foreground">65%</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Geçer Oran</span>
          </div>
          <p className="text-2xl font-bold text-foreground">60%</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">En İyi</span>
          </div>
          <p className="text-2xl font-bold text-foreground">82%</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Deneme</span>
          </div>
          <p className="text-2xl font-bold text-foreground">5</p>
        </div>
      </div>

      {/* Recent Results */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Son Sonuçlar</h3>
          <button className="text-xs text-primary hover:underline flex items-center gap-1">
            Tümü
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-3">
          {recentResults.map((result, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
            >
              {result.passed ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {result.exam}
                </p>
                <p className="text-xs text-muted-foreground">{result.date}</p>
              </div>
              <span
                className={cn(
                  "text-sm font-bold shrink-0",
                  result.passed ? "text-green-500" : "text-red-500"
                )}
              >
                {result.score}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold text-foreground mb-3">Sınav İpuçları</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            "Her soruyu dikkatle okuyun.",
            "Süreyi iyi yönetin.",
            "İşaretli soruları gözden geçirin.",
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Main content (wrapped in Suspense for useSearchParams) ───

function PracticeExamsContent() {
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
      setFilterLabel(lessonId ? "Ders" : "Modül");
      return;
    }
    if (lessonId) {
      sb.from("lessons")
        .select("title")
        .eq("id", lessonId)
        .single()
        .then(({ data }) => {
          setFilterLabel(
            data ? (data as { title: { en: string } }).title.en : "Ders"
          );
        });
    } else if (moduleId) {
      sb.from("modules")
        .select("title")
        .eq("id", moduleId)
        .single()
        .then(({ data }) => {
          setFilterLabel(
            data ? (data as { title: { en: string } }).title.en : "Modül"
          );
        });
    }
  }, [moduleId, lessonId, hasFilter]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
            <ClipboardList className="w-4 h-4" />
            Sınav Hazırlık
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Pratik Sınavlar
          </h1>
          <p className="text-muted-foreground mt-1">
            {hasFilter
              ? filterLabel || "Yükleniyor…"
              : "Sınav yapmak istediğiniz modül veya dersi seçin"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main area */}
          <div className="lg:col-span-2">
            {hasFilter ? (
              <StudyView
                moduleId={moduleId}
                lessonId={lessonId}
                filterLabel={filterLabel}
                onClearFilter={() => router.push("/practice-exams")}
              />
            ) : (
              <SelectionView
                onSelectModule={(id, label) => {
                  setFilterLabel(label);
                  router.push(`/practice-exams?moduleId=${id}`);
                }}
                onSelectLesson={(id, label) => {
                  setFilterLabel(label);
                  router.push(`/practice-exams?lessonId=${id}`);
                }}
              />
            )}
          </div>

          {/* Sidebar */}
          <div>
            <StatsSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────

export default function PracticeExamsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      }
    >
      <PracticeExamsContent />
    </Suspense>
  );
}
