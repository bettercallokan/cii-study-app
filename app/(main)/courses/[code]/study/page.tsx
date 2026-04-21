"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  PanelRightClose,
  PanelRightOpen,
  CheckCircle2,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PdfViewer } from "@/components/pdf-viewer";
import { AiChat } from "@/components/ai-chat";
import { supabase } from "@/utils/supabase/client";

// Course data (shared with main course page)
const courseData = {
  w01: {
    title: "Award in General Insurance",
    code: "W01",
    units: [
      {
        id: 1,
        title: "Risk and Insurance",
        sections: [
          { id: "A", title: "The role of risk in insurance" },
          { id: "B", title: "Categories of risk" },
          { id: "C", title: "Features of insurable risks" },
          { id: "D", title: "Components of risk" },
          { id: "E", title: "Insurance as a risk transfer mechanism" },
        ],
      },
      {
        id: 2,
        title: "The Insurance Market",
        sections: [
          { id: "A", title: "The market structure" },
          { id: "B", title: "Types of insurer" },
          { id: "C", title: "Lloyd's of London" },
          { id: "D", title: "Distribution channels" },
        ],
      },
      {
        id: 3,
        title: "Insurance Contracts",
        sections: [
          { id: "A", title: "Elements of a valid contract" },
          { id: "B", title: "Termination of contracts" },
          { id: "C", title: "The role of agents" },
          { id: "D", title: "Insurable interest" },
        ],
      },
    ],
  },
  wce: {
    title: "Insurance Claims Handling",
    code: "WCE",
    units: [
      {
        id: 1,
        title: "General Principles of Claims",
        sections: [
          { id: "A", title: "Legal requirements for a valid claim" },
          { id: "B", title: "Policy conditions relating to claims" },
          { id: "C", title: "Documentary evidence" },
        ],
      },
      {
        id: 2,
        title: "Insurance Products",
        sections: [
          { id: "A", title: "Motor policies" },
          { id: "B", title: "Household, gadget and travel policies" },
        ],
      },
    ],
  },
  wue: {
    title: "Insurance Underwriting",
    code: "WUE",
    units: [
      {
        id: 1,
        title: "Material Facts and Disclosure",
        sections: [
          { id: "A", title: "The duty of good faith" },
          { id: "B", title: "Material facts" },
          { id: "C", title: "Perils and hazards" },
        ],
      },
      {
        id: 2,
        title: "Underwriting Procedures",
        sections: [
          { id: "A", title: "Proposal forms and questions" },
          { id: "B", title: "Quotations" },
        ],
      },
    ],
  },
} as const;

type CourseCode = keyof typeof courseData;

export default function StudyModePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const course = courseData[code as CourseCode];
  if (!course) notFound();

  const searchParams = useSearchParams();
  const effectivePath = searchParams.get("file") ?? `${code}-study-text.pdf`;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Scroll to top on mount so the header is always visible
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

    return () => { cancelled = true; };
  }, [effectivePath]);

  const [isChatOpen, setIsChatOpen] = useState(true);
  const [activeUnit, setActiveUnit] = useState(1);
  const [activeSection, setActiveSection] = useState("A");
  const [expandedUnits, setExpandedUnits] = useState<number[]>([1]);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const currentUnit = course.units.find((u) => u.id === activeUnit);
  const currentSection = currentUnit?.sections.find((s) => s.id === activeSection);

  const toggleUnit = (unitId: number) => {
    setExpandedUnits((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId]
    );
  };

  const selectSection = (unitId: number, sectionId: string) => {
    setActiveUnit(unitId);
    setActiveSection(sectionId);
    if (!expandedUnits.includes(unitId)) {
      setExpandedUnits((prev) => [...prev, unitId]);
    }
  };

  const toggleComplete = () => {
    const key = `${activeUnit}-${activeSection}`;
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

  const pdfName = effectivePath
    .split("/").pop()?.replace(/\.pdf$/i, "") ?? effectivePath;
  const isComplete = completedSections.has(`${activeUnit}-${activeSection}`);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
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
              <h1 className="text-sm font-semibold text-foreground">{course.code} Study Mode</h1>
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
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            title={isChatOpen ? "Hide AI Assistant" : "Show AI Assistant"}
          >
            {isChatOpen ? (
              <PanelRightClose className="w-5 h-5 text-muted-foreground" />
            ) : (
              <PanelRightOpen className="w-5 h-5 text-muted-foreground" />
            )}
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
            "fixed lg:relative inset-y-14 left-0 z-10 lg:z-0"
          )}
        >
          <div className="p-3">
            {/* Course Header */}
            <div className="px-3 py-3 mb-2 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                  {course.code}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{course.title}</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {course.units.map((unit) => {
                const isExpanded = expandedUnits.includes(unit.id);
                const isActiveUnit = unit.id === activeUnit;
                const completedInUnit = unit.sections.filter((s) =>
                  completedSections.has(`${unit.id}-${s.id}`)
                ).length;

                return (
                  <div key={unit.id}>
                    <button
                      onClick={() => toggleUnit(unit.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors",
                        isActiveUnit
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      )}
                    >
                      <span className="text-xs font-bold w-5 shrink-0 tabular-nums">
                        {unit.id}
                      </span>
                      <span className="text-xs font-medium flex-1 leading-snug truncate">
                        {unit.title}
                      </span>
                      {completedInUnit > 0 && (
                        <span className="text-[10px] text-green-500 font-medium shrink-0">
                          {completedInUnit}/{unit.sections.length}
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
                        {unit.sections.map((section) => {
                          const isActive = isActiveUnit && section.id === activeSection;
                          const key = `${unit.id}-${section.id}`;
                          const isDone = completedSections.has(key);

                          return (
                            <li key={section.id}>
                              <button
                                onClick={() => {
                                  selectSection(unit.id, section.id);
                                  // Close sidebar on mobile after selection
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
                                      isActive ? "text-primary" : "text-muted-foreground"
                                    )}
                                  >
                                    {section.id}
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
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[5] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Split Screen Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* PDF Viewer - 70% */}
          <div
            className={cn(
              "flex-1 p-4 overflow-hidden transition-all",
              isChatOpen ? "lg:w-[70%]" : "w-full"
            )}
          >
            <PdfViewer
              pdfName={pdfName}
              pdfUrl={pdfUrl}
              pdfLoading={pdfLoading}
              pdfError={pdfError ?? undefined}
              className="h-full"
            />
          </div>

          {/* AI Chat Panel - 30% */}
          {isChatOpen && (
            <div className="hidden lg:block w-[30%] min-w-[320px] max-w-[420px] border-l border-border p-4 overflow-hidden">
              <AiChat className="h-full" />
            </div>
          )}
        </div>
      </div>

      {/* Mobile AI Chat Bottom Sheet */}
      {isChatOpen && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 h-[50vh] border-t border-border bg-card p-4 z-30">
          <AiChat className="h-full" />
        </div>
      )}
    </div>
  );
}
