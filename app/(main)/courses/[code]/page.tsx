"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { supabase } from "@/utils/supabase/client";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
  FileText,
  Lightbulb,
  GraduationCap,
  CheckCircle2,
  BookMarked,
  Scale,
  ShieldCheck,
  PanelRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";

// ─── Types ────────────────────────────────────────────────────

type DbSection = {
  id: string;
  section_code: string;
  title: string;
  content_text: string | null;
  content_markdown: string | null;
  summary_content: SectionSummaryContent | null;
  order_index: number;
};

type DbChapter = {
  id: string;
  chapter_number: string;
  title: string;
  order_index: number;
  sections: DbSection[];
};

type DbCourse = {
  id: string;
  code: string;
  title: string;
  description: string | null;
};

type SectionSummaryContent = {
  summary: {
    headline: string;
    key_concepts: { term: string; definition: string; vs: string | null }[];
    must_know: string[];
  };
  insights: { tag: string; title: string; body: string }[];
};

type ActiveTab = "content" | "summary" | "insights";

// ─── Flat index for sequential navigation ─────────────────────

type FlatEntry = {
  chapterId: string;
  sectionCode: string;
  sectionTitle: string;
  chapterTitle: string;
  chapterNumber: string;
};

function buildFlatIndex(chapters: DbChapter[]): FlatEntry[] {
  return chapters.flatMap((ch) =>
    ch.sections.map((s) => ({
      chapterId: ch.id,
      sectionCode: s.section_code,
      sectionTitle: s.title,
      chapterTitle: ch.title,
      chapterNumber: ch.chapter_number,
    }))
  );
}

// ─── Sidebar ──────────────────────────────────────────────────

function CourseSidebar({
  course,
  chapters,
  activeChapterId,
  activeSectionCode,
  expandedChapterIds,
  completedSections,
  onSelectSection,
  onToggleChapter,
}: {
  course: DbCourse;
  chapters: DbChapter[];
  activeChapterId: string;
  activeSectionCode: string;
  expandedChapterIds: string[];
  completedSections: Set<string>;
  onSelectSection: (chapterId: string, sectionCode: string) => void;
  onToggleChapter: (chapterId: string) => void;
}) {
  return (
    <aside className="lg:w-72 lg:shrink-0">
      <div className="lg:sticky lg:top-[65px] rounded-xl border border-border bg-card overflow-hidden">
        {/* Course header */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
              <GraduationCap className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-bold tracking-widest text-primary uppercase">
              {course.code}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-foreground leading-snug">
            {course.title}
          </h2>
        </div>

        {/* Chapter accordion */}
        <nav className="p-2 max-h-[calc(100vh-14rem)] overflow-y-auto">
          {chapters.map((chapter) => {
            const isExpanded = expandedChapterIds.includes(chapter.id);
            const isActiveChapter = chapter.id === activeChapterId;
            const completedInChapter = chapter.sections.filter((s) =>
              completedSections.has(`${chapter.id}-${s.section_code}`)
            ).length;

            return (
              <div key={chapter.id} className="mb-0.5">
                <button
                  onClick={() => onToggleChapter(chapter.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors",
                    isActiveChapter
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <span className="text-xs font-bold w-5 shrink-0 tabular-nums">
                    {chapter.chapter_number}
                  </span>
                  <span className="text-xs font-medium flex-1 leading-snug">
                    {chapter.title}
                  </span>
                  {completedInChapter > 0 && (
                    <span className="text-[10px] text-green-500 font-medium shrink-0">
                      {completedInChapter}/{chapter.sections.length}
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 shrink-0 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>

                {isExpanded && (
                  <ul className="mt-0.5 ml-3 pl-3 border-l border-border space-y-0.5 mb-1">
                    {chapter.sections.map((section) => {
                      const isActive =
                        isActiveChapter && section.section_code === activeSectionCode;
                      const key = `${chapter.id}-${section.section_code}`;
                      const isDone = completedSections.has(key);

                      return (
                        <li key={section.section_code}>
                          <button
                            onClick={() =>
                              onSelectSection(chapter.id, section.section_code)
                            }
                            className={cn(
                              "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            )}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-500" />
                            ) : (
                              <span
                                className={cn(
                                  "text-[10px] font-bold w-3.5 shrink-0 tabular-nums",
                                  isActive
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                )}
                              >
                                {section.section_code}
                              </span>
                            )}
                            <span className="text-xs leading-snug">
                              {section.title}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────

function TabBar({
  activeTab,
  onChange,
}: {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
}) {
  const tabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: "content", label: "Content", icon: FileText },
    { id: "summary", label: "Summary", icon: BookMarked },
    { id: "insights", label: "Key Insights", icon: Lightbulb },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x touch-pan-x pb-2 mb-6 -mx-6 px-6 md:mx-0 md:px-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "snap-start whitespace-nowrap flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all shrink-0",
            activeTab === tab.id
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          <tab.icon className="w-3.5 h-3.5" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── Content Tab ──────────────────────────────────────────────

function ContentTab({
  course,
  chapter,
  section,
  flatIndex,
  currentFlatIdx,
  onNavigate,
  onMarkComplete,
}: {
  course: DbCourse;
  chapter: DbChapter;
  section: DbSection;
  flatIndex: FlatEntry[];
  currentFlatIdx: number;
  onNavigate: (entry: FlatEntry) => void;
  onMarkComplete: () => void;
}) {
  const prevEntry = currentFlatIdx > 0 ? flatIndex[currentFlatIdx - 1] : null;
  const nextEntry =
    currentFlatIdx < flatIndex.length - 1
      ? flatIndex[currentFlatIdx + 1]
      : null;

  const handleNext = () => {
    onMarkComplete();
    if (nextEntry) onNavigate(nextEntry);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap mb-5">
        <Link href="/courses" className="hover:text-foreground transition-colors">
          Courses
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{course.code}</span>
        <ChevronRight className="w-3 h-3" />
        <span>Chapter {chapter.chapter_number}</span>
        <ChevronRight className="w-3 h-3" />
        <span>Section {section.section_code}</span>
      </nav>

      {/* Section header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          Chapter {chapter.chapter_number} · Section {section.section_code}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">
          {section.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">{chapter.title}</p>
      </div>

      {/* Content */}
      {section.content_markdown ? (
        <div className="rounded-xl border border-border bg-secondary/20 p-6">
          <MarkdownRenderer content={section.content_markdown} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-secondary/20 p-6">
            <h2 className="font-semibold text-foreground mb-3">Overview</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This section covers{" "}
              <strong className="text-foreground">
                {section.title.toLowerCase()}
              </strong>{" "}
              as part of <em>{chapter.title}</em>. Understanding this topic is
              essential for the {course.code} examination and for professional
              practice in general insurance.
            </p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
            <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Study Note
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Full study material for this section will be available shortly. Use
              the Summary and Key Insights tabs for a condensed overview of this
              section&apos;s most important concepts.
            </p>
          </div>
        </div>
      )}

      {/* Prev / Next */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <button
          onClick={() => prevEntry && onNavigate(prevEntry)}
          disabled={!prevEntry}
          className={cn(
            "flex items-center gap-2 text-sm transition-colors",
            prevEntry
              ? "text-muted-foreground hover:text-foreground"
              : "text-muted-foreground/30 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!nextEntry}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors",
            nextEntry
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          )}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Summary Tab ──────────────────────────────────────────────

const summaryIcons = [BookMarked, Scale, ShieldCheck];

function SummaryTab({
  chapter,
  section,
}: {
  chapter: DbChapter;
  section: DbSection;
}) {
  const summary = section.summary_content?.summary;

  if (!summary) {
    const fallbackCards = [
      {
        title: "Core Concepts",
        body: `${chapter.title} introduces the fundamental principles that underpin this area of insurance practice.`,
      },
      {
        title: "Legal and Regulatory Framework",
        body: "This chapter sits within the broader legal framework governing insurance in the UK.",
      },
      {
        title: "Practical Application",
        body: "Examination questions in this area often require candidates to apply concepts to given scenarios.",
      },
    ];

    return (
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          {section.section_code}: {section.title}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Chapter {chapter.chapter_number} — {chapter.title}
        </p>
        <div className="space-y-4">
          {fallbackCards.map((card, i) => {
            const Icon = summaryIcons[i];
            return (
              <div key={card.title} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{card.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-1">
        {section.section_code}: {section.title}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Chapter {chapter.chapter_number} — {chapter.title}
      </p>

      {/* Headline */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        {summary.headline}
      </p>

      {/* Key Concepts */}
      {summary.key_concepts?.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <h3 className="font-semibold text-foreground mb-3">Key Concepts</h3>
          <div className="space-y-3">
            {summary.key_concepts.map((concept, i) => (
              <div
                key={i}
                className="border-b border-border last:border-0 pb-3 last:pb-0"
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-primary shrink-0 mt-0.5 min-w-[1.5rem]">
                    {i + 1}.
                  </span>
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {concept.term}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {" "}— {concept.definition}
                    </span>
                    {concept.vs && (
                      <p className="text-xs text-yellow-500 mt-1">
                        vs. {concept.vs}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Must Know */}
      {summary.must_know?.length > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-primary" />
            Must Know
          </h3>
          <ul className="space-y-2">
            {summary.must_know.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Key Insights Tab ─────────────────────────────────────────

const tagStyles: Record<string, string> = {
  exam_bullet: "bg-blue-500/10 text-blue-400",
  exam_tip: "bg-yellow-500/10 text-yellow-500",
  exam_trap: "bg-red-500/10 text-red-400",
};

const tagLabels: Record<string, string> = {
  exam_bullet: "Exam Bullet",
  exam_tip: "Exam Tip",
  exam_trap: "Exam Trap",
};

function InsightsTab({
  chapter,
  section,
}: {
  chapter: DbChapter;
  section: DbSection;
}) {
  const insights = section.summary_content?.insights;

  if (!insights?.length) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Key Insights — Chapter {chapter.chapter_number}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">{chapter.title}</p>
        <div className="space-y-4">
          {[
            {
              tag: "exam_bullet",
              title: `The Foundation of ${chapter.title}`,
              body: `The core principle of this chapter is that insurance operates as a mechanism for risk transfer and indemnification. Every concept in ${chapter.title} flows from this foundation.`,
            },
            {
              tag: "exam_tip",
              title: "Structuring Your Answers",
              body: "For written questions, always: (1) state the relevant rule or principle, (2) apply it to the facts given, (3) reach a clear conclusion. Examiners reward precise use of terminology.",
            },
          ].map((insight, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                  <Lightbulb className="w-4 h-4 text-primary" />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    tagStyles[insight.tag] ?? "bg-secondary text-muted-foreground"
                  )}
                >
                  {tagLabels[insight.tag] ?? insight.tag}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{insight.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{insight.body}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-1">
        Key Insights — Section {section.section_code}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">{section.title}</p>

      <div className="space-y-4">
        {insights.map((insight, i) => {
          const isTrap = insight.tag === "exam_trap";
          return (
            <div
              key={i}
              className={cn(
                "rounded-xl border bg-card p-5",
                isTrap ? "border-red-500/30 bg-red-500/5" : "border-border"
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                    <Lightbulb className="w-4 h-4 text-primary" />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      tagStyles[insight.tag] ?? "bg-secondary text-muted-foreground"
                    )}
                  >
                    {tagLabels[insight.tag] ?? insight.tag}
                  </span>
                </div>
                {isTrap && (
                  <span className="text-xs font-medium text-red-400 shrink-0">
                    ⚠ Common Trap
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{insight.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{insight.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────

function extractEn(val: unknown): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object" && "en" in val)
    return String((val as { en: unknown }).en);
  return "";
}

// ─── Main Page ────────────────────────────────────────────────

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);

  const [course, setCourse] = useState<DbCourse | null>(null);
  const [chapters, setChapters] = useState<DbChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound404, setNotFound404] = useState(false);

  const [activeChapterId, setActiveChapterId] = useState<string>("");
  const [activeSectionCode, setActiveSectionCode] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("content");
  const [expandedChapterIds, setExpandedChapterIds] = useState<string[]>([]);
  const [completedSections, setCompletedSections] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: courseData, error: courseErr } = await supabase
        .from("courses")
        .select("id, code, title, description")
        .ilike("code", code)
        .single();

      if (courseErr || !courseData) {
        setNotFound404(true);
        setLoading(false);
        return;
      }

      const { data: chaptersData, error: chaptersErr } = await supabase
        .from("chapters")
        .select(
          `id, chapter_number, title, order_index,
           chapter_sections (
             id, section_code, title, content_text, content_markdown, summary_content, order_index
           )`
        )
        .eq("course_id", courseData.id)
        .order("order_index");

      if (chaptersErr || !chaptersData) {
        setNotFound404(true);
        setLoading(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sorted: DbChapter[] = (chaptersData as any[]).map((ch) => ({
        id: ch.id,
        chapter_number: ch.chapter_number,
        title: extractEn(ch.title),
        order_index: ch.order_index,
        sections: [...(ch.chapter_sections ?? [])].sort(
          (a: DbSection, b: DbSection) => a.order_index - b.order_index
        ).map((s: DbSection) => ({ ...s, title: extractEn(s.title) })),
      }));

      setCourse({
        ...courseData,
        title: extractEn(courseData.title),
        description: courseData.description ? extractEn(courseData.description) : null,
      });
      setChapters(sorted);

      if (sorted.length > 0 && sorted[0].sections.length > 0) {
        setActiveChapterId(sorted[0].id);
        setActiveSectionCode(sorted[0].sections[0].section_code);
        setExpandedChapterIds([sorted[0].id]);
      }

      setLoading(false);
    }

    load();
  }, [code]);

  const flatIndex = useMemo(() => buildFlatIndex(chapters), [chapters]);

  const activeChapter = chapters.find((ch) => ch.id === activeChapterId);
  const activeSection = activeChapter?.sections.find(
    (s) => s.section_code === activeSectionCode
  );

  const currentFlatIdx = flatIndex.findIndex(
    (f) => f.chapterId === activeChapterId && f.sectionCode === activeSectionCode
  );

  const handleSelectSection = useCallback(
    (chapterId: string, sectionCode: string) => {
      setActiveChapterId(chapterId);
      setActiveSectionCode(sectionCode);
      setActiveTab("content");
      setExpandedChapterIds((prev) =>
        prev.includes(chapterId) ? prev : [...prev, chapterId]
      );
    },
    []
  );

  const handleToggleChapter = useCallback((chapterId: string) => {
    setExpandedChapterIds((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    );
  }, []);

  const handleNavigate = useCallback(
    (entry: FlatEntry) => {
      handleSelectSection(entry.chapterId, entry.sectionCode);
    },
    [handleSelectSection]
  );

  const handleMarkComplete = useCallback(() => {
    const key = `${activeChapterId}-${activeSectionCode}`;
    setCompletedSections((prev) => new Set(prev).add(key));
  }, [activeChapterId, activeSectionCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading course…</span>
        </div>
      </div>
    );
  }

  if (notFound404 || !course) notFound();

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/courses"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Courses
            </Link>
            <span className="text-border select-none">/</span>
            <span className="text-sm font-medium text-foreground truncate">
              {course.code} · {course.title}
            </span>
          </div>
          <Link
            href={`/courses/${code}/study`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <PanelRight className="w-4 h-4" />
            <span className="hidden sm:inline">Enter Study Mode</span>
            <span className="sm:hidden">Study</span>
          </Link>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <CourseSidebar
            course={course}
            chapters={chapters}
            activeChapterId={activeChapterId}
            activeSectionCode={activeSectionCode}
            expandedChapterIds={expandedChapterIds}
            completedSections={completedSections}
            onSelectSection={handleSelectSection}
            onToggleChapter={handleToggleChapter}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0 p-0 sm:p-0 md:rounded-xl md:border md:border-border md:bg-card md:p-6 md:sm:p-8">
            {activeChapter && activeSection ? (
              <>
                <TabBar activeTab={activeTab} onChange={setActiveTab} />

                {activeTab === "content" && (
                  <ContentTab
                    course={course}
                    chapter={activeChapter}
                    section={activeSection}
                    flatIndex={flatIndex}
                    currentFlatIdx={currentFlatIdx}
                    onNavigate={handleNavigate}
                    onMarkComplete={handleMarkComplete}
                  />
                )}
                {activeTab === "summary" && (
                  <SummaryTab
                    chapter={activeChapter}
                    section={activeSection}
                  />
                )}
                {activeTab === "insights" && (
                  <InsightsTab
                    chapter={activeChapter}
                    section={activeSection}
                  />
                )}
              </>
            ) : (
              <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
                Select a section from the sidebar to begin.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
