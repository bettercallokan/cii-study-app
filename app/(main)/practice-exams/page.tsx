"use client";

import { useState, useEffect, Suspense } from "react";
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
  BookOpen,
  ArrowLeft,
  Loader2,
  AlertCircle,
  GraduationCap,
  Zap,
  Shield,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { courseUnitTitles } from "@/lib/course-data";
import type { Module, Lesson, Quiz } from "@/utils/supabase/types";

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

const colorMap: Record<CourseColor, { badge: string; icon: string; card: string }> = {
  blue: {
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    card: "hover:border-blue-500/30 hover:bg-blue-500/5",
  },
  purple: {
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    icon: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    card: "hover:border-purple-500/30 hover:bg-purple-500/5",
  },
  emerald: {
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    card: "hover:border-emerald-500/30 hover:bg-emerald-500/5",
  },
};

// ─── Static sidebar data (from original design) ───────────────

const recentResults = [
  { exam: "Module 1-3 Assessment", score: 82, date: "2 days ago", passed: true },
  { exam: "Contract Law Focus", score: 68, date: "5 days ago", passed: true },
  { exam: "Quick Quiz: Risk Types", score: 45, date: "1 week ago", passed: false },
];

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

// ─── Score Progress Bar (from original design) ────────────────

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          value >= 70 ? "bg-green-500" : value >= 50 ? "bg-yellow-500" : "bg-red-500"
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

// ─── Sidebar (from original design) ──────────────────────────

function StatsSidebar() {
  return (
    <div className="space-y-5">
      {/* Recent Results */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Recent Results</h3>
          <button className="text-xs text-primary hover:underline flex items-center gap-1">
            View all
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
                <p className="text-xs font-medium text-foreground truncate">{result.exam}</p>
                <ProgressBar value={result.score} />
                <p className="text-[10px] text-muted-foreground mt-1">{result.date}</p>
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

      {/* Exam Tips */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold text-foreground mb-3">Exam Tips</h3>
        <ul className="space-y-2.5 text-sm text-muted-foreground">
          {[
            "Read each question carefully before answering.",
            "Manage your time — don't spend too long on one question.",
            "Review flagged questions if time permits.",
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

// ─── Courses View ─────────────────────────────────────────────

function CoursesView({
  onSelectModule,
}: {
  onSelectModule: (id: string, title: string, urlCode: string) => void;
}) {
  const [modules, setModules] = useState<Module[] | null>(null);
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

  return (
    <div className="divide-y divide-border/50 md:space-y-4 md:divide-y-0">
      {modules.map((mod, idx) => {
        const style = courseStyles[idx] ?? courseStyles[0];
        const colors = colorMap[style.color];
        return (
          <button
            key={mod.id}
            onClick={() => onSelectModule(mod.id, mod.title.en, style.urlCode)}
            className={cn(
              "group w-full flex items-center gap-4 min-h-[64px] py-3 transition-all duration-200 text-left md:gap-5 md:p-5 md:rounded-xl md:border md:border-border md:bg-card",
              colors.card
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center w-11 h-11 rounded-xl border shrink-0",
                colors.icon
              )}
            >
              <ClipboardList className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full border text-xs font-bold tracking-wider shrink-0",
                    colors.badge
                  )}
                >
                  {style.code}
                </span>
                <h2 className="font-semibold text-foreground truncate">{mod.title.en}</h2>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1 hidden sm:block">
                {style.description}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </button>
        );
      })}
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

      <div className="md:rounded-xl md:border md:border-border md:bg-card md:overflow-hidden">
        <div className="py-3 md:px-5 md:py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{moduleTitle || "Loading…"}</h2>
          {lessons !== null && (
            <p className="text-xs text-muted-foreground mt-0.5">{lessons.length} units</p>
          )}
        </div>

        {lessons === null ? (
          <LoadingSpinner label="Loading units…" />
        ) : lessons.length === 0 ? (
          <p className="py-4 md:px-5 text-sm text-muted-foreground">No units found for this course.</p>
        ) : (
          <ul className="divide-y divide-border/50 md:divide-border">
            {lessons.map((lesson, idx) => {
              const displayTitle = getTitle(lesson, idx);
              return (
                <li key={lesson.id}>
                  <button
                    onClick={() => onSelectLesson(lesson.id, displayTitle)}
                    className="w-full flex items-center gap-4 px-0 py-4 min-h-[56px] md:px-5 hover:bg-secondary/30 transition-colors text-left group"
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary text-xs font-medium text-muted-foreground shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-foreground flex-1 truncate group-hover:text-primary transition-colors">
                      {displayTitle}
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

// ─── Quiz Card (merged from both designs) ─────────────────────

function QuizCard({ quiz }: { quiz: Quiz }) {
  const isMini = quiz.quiz_type === "mini_test";

  return (
    <div
      className={cn(
        "flex items-center gap-4 min-h-[64px] py-4 border-b border-border/50 transition-all cursor-pointer group md:p-5 md:rounded-xl md:border md:bg-card md:flex-col md:items-start md:min-h-0",
        isMini
          ? "md:border-border md:hover:border-blue-500/30 md:hover:bg-blue-500/5"
          : "md:border-border md:hover:border-purple-500/30 md:hover:bg-purple-500/5"
      )}
    >
      {/* Mobile: icon left, info center, chevron right */}
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl shrink-0",
          isMini ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
        )}
      >
        {isMini ? <Zap className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0 md:w-full">
        <div className="flex items-center gap-2 mb-0.5 md:mb-3 md:justify-between">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {quiz.title.en}
          </h3>
          <span
            className={cn(
              "hidden md:inline px-2.5 py-1 rounded-full text-xs font-medium shrink-0",
              isMini ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
            )}
          >
            {isMini ? "Mini Test" : "Full Simulation"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {quiz.question_count}q
          </span>
          {quiz.time_limit_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {quiz.time_limit_minutes}m
            </span>
          )}
          <span className="flex items-center gap-1">
            <Trophy className="w-3 h-3 text-yellow-500" />
            {quiz.pass_threshold_percentage}%
          </span>
        </div>
        <button className="hidden md:flex w-full items-center justify-center gap-2 mt-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Play className="w-4 h-4" />
          Start Exam
        </button>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 md:hidden" />
    </div>
  );
}

// ─── Quizzes View ─────────────────────────────────────────────

type QuizTab = "mini_test" | "full_simulation";

function QuizzesView({
  moduleId,
  lessonId,
  unitTitle,
  onBack,
}: {
  moduleId: string;
  lessonId: string;
  unitTitle: string;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<QuizTab>("mini_test");
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuizzes(null);
    setError(null);
    const sb = getSupabase();
    if (!sb) { setQuizzes([]); return; }

    let query = sb.from("quizzes").select("*").eq("is_active", true).eq("quiz_type", activeTab);
    if (activeTab === "mini_test") {
      query = query.eq("lesson_id", lessonId);
    } else {
      query = query.eq("module_id", moduleId);
    }

    query.order("created_at").then(({ data, error: err }) => {
      if (err) setError(err.message);
      else setQuizzes((data as Quiz[]) ?? []);
    });
  }, [moduleId, lessonId, activeTab]);

  if (error) return <ErrorCard message={error} />;

  const tabs: { key: QuizTab; label: string; icon: React.ReactNode }[] = [
    { key: "mini_test", label: "Mini Tests", icon: <Zap className="w-3.5 h-3.5" /> },
    { key: "full_simulation", label: "Full Simulations", icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Units
      </button>

      <div className="flex items-center gap-2.5 p-4 mb-6 rounded-xl border border-border bg-card">
        <BookOpen className="w-4 h-4 text-primary shrink-0" />
        <span className="text-sm font-medium text-foreground truncate">{unitTitle}</span>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x touch-pan-x pb-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "snap-start whitespace-nowrap flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all shrink-0",
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {quizzes === null ? (
        <LoadingSpinner label="Loading exams…" />
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border bg-card">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="font-medium text-foreground mb-1">No exams found</p>
          <p className="text-sm text-muted-foreground">
            No {activeTab === "mini_test" ? "mini tests" : "full simulations"} available for this{" "}
            {activeTab === "mini_test" ? "unit" : "course"}.
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

// ─── Main content ─────────────────────────────────────────────

function PracticeExamsContent() {
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

  const view = lessonId && moduleId ? "quizzes" : moduleId ? "lessons" : "courses";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6 pt-8">
          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
            <ClipboardList className="w-4 h-4" />
            Exam Preparation
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Practice Exams
          </h1>
          <p className="text-muted-foreground mt-1">
            Test your knowledge with timed assessments
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 mb-8 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-4">
          <div className="shrink-0 min-w-[120px] py-3 md:p-4 md:rounded-xl md:border md:border-border md:bg-card">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Avg Score</span>
            </div>
            <p className="text-2xl font-bold text-foreground">65%</p>
          </div>
          <div className="shrink-0 min-w-[120px] py-3 md:p-4 md:rounded-xl md:border md:border-border md:bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Pass Rate</span>
            </div>
            <p className="text-2xl font-bold text-foreground">60%</p>
          </div>
          <div className="shrink-0 min-w-[120px] py-3 md:p-4 md:rounded-xl md:border md:border-border md:bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Best Score</span>
            </div>
            <p className="text-2xl font-bold text-foreground">82%</p>
          </div>
          <div className="shrink-0 min-w-[120px] py-3 md:p-4 md:rounded-xl md:border md:border-border md:bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Attempts</span>
            </div>
            <p className="text-2xl font-bold text-foreground">5</p>
          </div>
        </div>

        {/* Main grid: content + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main area (2/3) */}
          <div className="lg:col-span-2">
            {view === "courses" && (
              <CoursesView
                onSelectModule={(id, title, urlCode) => {
                  setModuleTitle(title);
                  router.push(`/practice-exams?moduleId=${id}&code=${urlCode}`);
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
                    `/practice-exams?moduleId=${moduleId}&code=${courseCode}&lessonId=${id}&t=${encodeURIComponent(displayTitle)}`
                  );
                }}
                onBack={() => router.push("/practice-exams")}
              />
            )}

            {view === "quizzes" && moduleId && lessonId && (
              <QuizzesView
                moduleId={moduleId}
                lessonId={lessonId}
                unitTitle={unitTitle}
                onBack={() => router.push(`/practice-exams?moduleId=${moduleId}&code=${courseCode}`)}
              />
            )}
          </div>

          {/* Sidebar (1/3) */}
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
