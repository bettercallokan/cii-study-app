"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { PdfViewer } from "@/components/pdf-viewer";
import { supabase } from "@/utils/supabase/client";

// ─── Types ────────────────────────────────────────────────────

type DbSection = {
  id: string;
  section_code: string;
  title: string;
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
};

// ─── Helpers ─────────────────────────────────────────────────

function extractEn(val: unknown): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object" && "en" in val)
    return String((val as { en: unknown }).en);
  return "";
}

// ─── Main Page ────────────────────────────────────────────────

export default function StudyModePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const searchParams = useSearchParams();
  const effectivePath = searchParams.get("file") ?? `${code}-study-text.pdf`;

  const [course, setCourse] = useState<DbCourse | null>(null);
  const [chapters, setChapters] = useState<DbChapter[]>([]);
  const [courseLoading, setCourseLoading] = useState(true);
  const [notFound404, setNotFound404] = useState(false);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [activeChapterId, setActiveChapterId] = useState<string>("");
  const [activeSectionCode, setActiveSectionCode] = useState<string>("");
  const [expandedChapterIds, setExpandedChapterIds] = useState<string[]>([]);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch course + chapters from Supabase
  useEffect(() => {
    async function load() {
      setCourseLoading(true);

      const { data: courseData, error: courseErr } = await supabase
        .from("courses")
        .select("id, code, title")
        .ilike("code", code)
        .single();

      if (courseErr || !courseData) {
        setNotFound404(true);
        setCourseLoading(false);
        return;
      }

      const { data: chaptersData, error: chaptersErr } = await supabase
        .from("chapters")
        .select(
          `id, chapter_number, title, order_index,
           chapter_sections (
             id, section_code, title, order_index
           )`
        )
        .eq("course_id", courseData.id)
        .order("order_index");

      if (chaptersErr || !chaptersData) {
        setNotFound404(true);
        setCourseLoading(false);
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

      setCourse({ ...courseData, title: extractEn(courseData.title) });
      setChapters(sorted);

      if (sorted.length > 0 && sorted[0].sections.length > 0) {
        setActiveChapterId(sorted[0].id);
        setActiveSectionCode(sorted[0].sections[0].section_code);
        setExpandedChapterIds([sorted[0].id]);
      }

      setCourseLoading(false);
    }

    load();
  }, [code]);

  // Fetch signed PDF URL
  useEffect(() => {
    let cancelled = false;
    setPdfLoading(true);
    setPdfError(null);
    setPdfUrl(null);

    supabase.storage
      .from("pdfs")
      .createSignedUrl(effectivePath, 3600)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.signedUrl) {
          setPdfError("This PDF could not be loaded. Please try again.");
        } else {
          setPdfUrl(data.signedUrl + "#page=1");
        }
        setPdfLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectivePath]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapterIds((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const selectSection = (chapterId: string, sectionCode: string) => {
    setActiveChapterId(chapterId);
    setActiveSectionCode(sectionCode);
    if (!expandedChapterIds.includes(chapterId)) {
      setExpandedChapterIds((prev) => [...prev, chapterId]);
    }
  };

  const toggleComplete = () => {
    const key = `${activeChapterId}-${activeSectionCode}`;
    setCompletedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const pdfName =
    effectivePath.split("/").pop()?.replace(/\.pdf$/i, "") ?? effectivePath;
  const isComplete = completedSections.has(`${activeChapterId}-${activeSectionCode}`);

  const currentChapter = chapters.find((ch) => ch.id === activeChapterId);
  const currentSection = currentChapter?.sections.find(
    (s) => s.section_code === activeSectionCode
  );

  if (notFound404) notFound();

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${code}`}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            title="Exit Study Mode"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 border border-primary/20">
              <GraduationCap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">
                {course?.code ?? code.toUpperCase()} Study Mode
              </h1>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                {currentSection?.title}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            title="Toggle Navigation"
          >
            <BookOpen className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={toggleComplete}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              isComplete
                ? "bg-green-500/10 text-green-500"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isComplete ? "Completed" : "Mark Complete"}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Course Navigation Sidebar */}
        <aside
          className={cn(
            "w-64 border-r border-border bg-card overflow-y-auto shrink-0 transition-all duration-300",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            "fixed lg:relative top-14 bottom-0 left-0 z-10 lg:z-0 lg:top-0"
          )}
        >
          <div className="p-3">
            {/* Course Header */}
            <div className="px-3 py-3 mb-2 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                  {course?.code ?? code.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {course?.title}
              </p>
            </div>

            {/* Navigation */}
            {courseLoading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Loading…</span>
              </div>
            ) : (
              <nav className="space-y-1">
                {chapters.map((chapter) => {
                  const isExpanded = expandedChapterIds.includes(chapter.id);
                  const isActiveChapter = chapter.id === activeChapterId;
                  const completedInChapter = chapter.sections.filter((s) =>
                    completedSections.has(`${chapter.id}-${s.section_code}`)
                  ).length;

                  return (
                    <div key={chapter.id}>
                      <button
                        onClick={() => toggleChapter(chapter.id)}
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
                        <span className="text-xs font-medium flex-1 leading-snug truncate">
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
                              isActiveChapter &&
                              section.section_code === activeSectionCode;
                            const key = `${chapter.id}-${section.section_code}`;
                            const isDone = completedSections.has(key);

                            return (
                              <li key={section.section_code}>
                                <button
                                  onClick={() => {
                                    selectSection(chapter.id, section.section_code);
                                    if (window.innerWidth < 1024) {
                                      setIsSidebarOpen(false);
                                    }
                                  }}
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
                                  <span className="text-xs leading-snug truncate">
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
            )}
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[5] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* PDF Viewer */}
        <div className="flex-1 p-3 sm:p-4 overflow-hidden">
          <PdfViewer
            pdfName={pdfName}
            pdfUrl={pdfUrl}
            pdfLoading={pdfLoading}
            pdfError={pdfError ?? undefined}
            className="h-full"
          />
        </div>
      </div>

    </div>
  );
}
