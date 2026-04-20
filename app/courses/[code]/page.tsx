"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
  FileText,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Static Course Data ────────────────────────────────────────

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
          { id: "F", title: "Pooling of risks" },
          { id: "G", title: "Self-insurance" },
          { id: "H", title: "Co-insurance and dual insurance" },
          { id: "I", title: "Benefits of insurance" },
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
          { id: "E", title: "Key roles in the market" },
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
          { id: "E", title: "Disclosure and fair presentation" },
        ],
      },
      {
        id: 4,
        title: "Legal Principles",
        sections: [
          { id: "A", title: "Proximate cause" },
          { id: "B", title: "Indemnity" },
          { id: "C", title: "Subrogation" },
          { id: "D", title: "Contribution" },
          { id: "E", title: "Underinsurance and average" },
        ],
      },
      {
        id: 5,
        title: "Regulation",
        sections: [
          { id: "A", title: "Purpose of regulation" },
          { id: "B", title: "Capital adequacy" },
          { id: "C", title: "Financial crime" },
          { id: "D", title: "Fraud" },
        ],
      },
      {
        id: 6,
        title: "Ethics and Governance",
        sections: [
          { id: "A", title: "The role of the CII" },
          { id: "B", title: "Fair treatment of customers" },
          { id: "C", title: "Fit and proper requirements" },
          { id: "D", title: "Internal controls" },
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
          { id: "D", title: "Moral and physical hazard" },
          { id: "E", title: "Obtaining material facts" },
        ],
      },
      {
        id: 2,
        title: "Underwriting Procedures",
        sections: [
          { id: "A", title: "Proposal forms and questions" },
          { id: "B", title: "Quotations" },
          { id: "C", title: "Premium calculation" },
          { id: "D", title: "Cover notes and certificates" },
          { id: "E", title: "Premium payment methods" },
        ],
      },
      {
        id: 3,
        title: "Insurance Policies",
        sections: [
          { id: "A", title: "Policy structure and contents" },
          { id: "B", title: "Policy exclusions" },
          { id: "C", title: "Policy conditions" },
          { id: "D", title: "Excesses, deductibles and franchises" },
          { id: "E", title: "Warranties and representations" },
        ],
      },
      {
        id: 4,
        title: "Renewals and Cancellation",
        sections: [
          { id: "A", title: "The renewal process" },
          { id: "B", title: "Cancellation clauses" },
        ],
      },
      {
        id: 5,
        title: "Personal Insurances",
        sections: [
          { id: "A", title: "Motor insurance" },
          { id: "B", title: "Health and personal accident" },
          { id: "C", title: "Household insurance" },
          { id: "D", title: "Travel insurance" },
          { id: "E", title: "Extended warranties" },
        ],
      },
      {
        id: 6,
        title: "Commercial Insurances",
        sections: [
          { id: "A", title: "Property insurance" },
          { id: "B", title: "Pecuniary insurance" },
          { id: "C", title: "Liability insurance" },
        ],
      },
      {
        id: 7,
        title: "Support Services",
        sections: [
          { id: "A", title: "Helplines and authorised repairers" },
          { id: "B", title: "Risk control and surveys" },
          { id: "C", title: "Uninsured loss recovery" },
        ],
      },
      {
        id: 8,
        title: "Underwriting Considerations",
        sections: [
          { id: "A", title: "Motor and personal lines criteria" },
          { id: "B", title: "Commercial property criteria" },
          { id: "C", title: "Liability criteria" },
          { id: "D", title: "Extended warranty criteria" },
          { id: "E", title: "Fraud deterrence and detection" },
          { id: "F", title: "Fair treatment of customers" },
        ],
      },
      {
        id: 9,
        title: "Pricing Principles",
        sections: [
          { id: "A", title: "Data sources and management information" },
          { id: "B", title: "Claims data and loss ratios" },
          { id: "C", title: "Frequency and severity" },
          { id: "D", title: "Monitoring periods" },
        ],
      },
      {
        id: 10,
        title: "Pricing Factors",
        sections: [
          { id: "A", title: "Risk premium" },
          { id: "B", title: "Expenses and return on capital" },
          { id: "C", title: "Investment income and tax" },
        ],
      },
      {
        id: 11,
        title: "Managing Exposure",
        sections: [
          { id: "A", title: "The underwriting cycle" },
          { id: "B", title: "Risk accumulation" },
          { id: "C", title: "Reinsurance" },
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
          { id: "D", title: "Proximate cause" },
        ],
      },
      {
        id: 2,
        title: "Insurance Products",
        sections: [
          { id: "A", title: "Motor policies" },
          { id: "B", title: "Household, gadget and travel policies" },
          { id: "C", title: "Commercial property and pecuniary" },
          { id: "D", title: "Commercial liability policies" },
          { id: "E", title: "Health policies" },
        ],
      },
      {
        id: 3,
        title: "Claims Considerations",
        sections: [
          { id: "A", title: "Role of the claims department" },
          { id: "B", title: "Service standards" },
          { id: "C", title: "Parties to a claim" },
          { id: "D", title: "Claims estimating and reserving" },
          { id: "E", title: "Fraud" },
          { id: "F", title: "Fair treatment of customers" },
          { id: "G", title: "Disputes and complaints" },
        ],
      },
      {
        id: 4,
        title: "Claims Handling Procedures",
        sections: [
          { id: "A", title: "Motor claims procedures" },
          { id: "B", title: "Household and travel procedures" },
          { id: "C", title: "Commercial property procedures" },
          { id: "D", title: "Liability claims procedures" },
          { id: "E", title: "Health claims procedures" },
          { id: "F", title: "External support services" },
        ],
      },
      {
        id: 5,
        title: "Claims Function and Structure",
        sections: [
          { id: "A", title: "Claims systems" },
          { id: "B", title: "Organisational structures" },
        ],
      },
      {
        id: 6,
        title: "Claims Settlement",
        sections: [
          { id: "A", title: "Methods of settlement" },
          { id: "B", title: "Why full indemnity may not be paid" },
          { id: "C", title: "Recovering claim costs" },
          { id: "D", title: "Uninsured and untraced drivers" },
        ],
      },
      {
        id: 7,
        title: "Expense Management",
        sections: [
          { id: "A", title: "Role of the claims manager" },
          { id: "B", title: "Claims leakage" },
          { id: "C", title: "Financial monitoring" },
          { id: "D", title: "Reserving practice" },
        ],
      },
    ],
  },
} as const;

type CourseCode = keyof typeof courseData;

type Unit = (typeof courseData)[CourseCode]["units"][number];
type Section = Unit["sections"][number];

// ─── Flat index of all sections for sequential navigation ─────

function buildFlatIndex(units: readonly Unit[]) {
  const flat: { unitId: number; sectionId: string }[] = [];
  for (const unit of units) {
    for (const section of unit.sections) {
      flat.push({ unitId: unit.id, sectionId: section.id });
    }
  }
  return flat;
}

// ─── Sidebar ──────────────────────────────────────────────────

function CourseSidebar({
  course,
  selectedUnitId,
  selectedSectionId,
  expandedUnitIds,
  onSelectSection,
  onToggleUnit,
}: {
  course: (typeof courseData)[CourseCode];
  selectedUnitId: number;
  selectedSectionId: string;
  expandedUnitIds: number[];
  onSelectSection: (unitId: number, sectionId: string) => void;
  onToggleUnit: (unitId: number) => void;
}) {
  return (
    <aside className="lg:w-64 lg:shrink-0">
      <div className="lg:sticky lg:top-8 rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
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

        {/* Unit List */}
        <nav className="p-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {course.units.map((unit) => {
            const isExpanded = expandedUnitIds.includes(unit.id);
            const isActiveUnit = unit.id === selectedUnitId;
            return (
              <div key={unit.id} className="mb-1">
                {/* Unit row */}
                <button
                  onClick={() => onToggleUnit(unit.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors",
                    isActiveUnit
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <span className="text-xs font-bold w-5 shrink-0 tabular-nums">
                    {unit.id}
                  </span>
                  <span className="text-xs font-medium flex-1 leading-snug">
                    {unit.title}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 shrink-0 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>

                {/* Sections */}
                {isExpanded && (
                  <ul className="mt-0.5 ml-3 pl-3 border-l border-border space-y-0.5 mb-1">
                    {unit.sections.map((section) => {
                      const isActiveSection =
                        isActiveUnit && section.id === selectedSectionId;
                      return (
                        <li key={section.id}>
                          <button
                            onClick={() =>
                              onSelectSection(unit.id, section.id)
                            }
                            className={cn(
                              "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors",
                              isActiveSection
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            )}
                          >
                            <span
                              className={cn(
                                "text-[10px] font-bold w-4 shrink-0 tabular-nums",
                                isActiveSection
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              )}
                            >
                              {section.id}
                            </span>
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

// ─── Content Area ─────────────────────────────────────────────

function SectionContent({
  course,
  unit,
  section,
}: {
  course: (typeof courseData)[CourseCode];
  unit: Unit;
  section: Section;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
        <Link href="/courses" className="hover:text-foreground transition-colors">
          Courses
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{course.code}</span>
        <ChevronRight className="w-3 h-3" />
        <span>Unit {unit.id}</span>
        <ChevronRight className="w-3 h-3" />
        <span>Section {section.id}</span>
      </nav>

      {/* Section header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          Unit {unit.id} · Section {section.id}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">
          {section.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">{unit.title}</p>
      </div>

      {/* Placeholder content */}
      <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[320px]">
        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-secondary border border-border">
          <FileText className="w-7 h-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground mb-1">Content coming soon</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Study material for <span className="text-foreground font-medium">&ldquo;{section.title}&rdquo;</span> is being prepared and will be available shortly.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);

  const course = courseData[code as CourseCode];
  if (!course) notFound();

  const flatIndex = useMemo(() => buildFlatIndex(course.units), [course]);

  const [selectedUnitId, setSelectedUnitId] = useState<number>(course.units[0].id);
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    course.units[0].sections[0].id
  );
  const [expandedUnitIds, setExpandedUnitIds] = useState<number[]>([
    course.units[0].id,
  ]);

  const handleSelectSection = (unitId: number, sectionId: string) => {
    setSelectedUnitId(unitId);
    setSelectedSectionId(sectionId);
    if (!expandedUnitIds.includes(unitId)) {
      setExpandedUnitIds((prev) => [...prev, unitId]);
    }
  };

  const handleToggleUnit = (unitId: number) => {
    setExpandedUnitIds((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId]
    );
  };

  const currentFlatIdx = flatIndex.findIndex(
    (f) => f.unitId === selectedUnitId && f.sectionId === selectedSectionId
  );
  const prevEntry = currentFlatIdx > 0 ? flatIndex[currentFlatIdx - 1] : null;
  const nextEntry =
    currentFlatIdx < flatIndex.length - 1
      ? flatIndex[currentFlatIdx + 1]
      : null;

  const handleNav = (entry: { unitId: number; sectionId: string } | null) => {
    if (!entry) return;
    handleSelectSection(entry.unitId, entry.sectionId);
  };

  const selectedUnit = course.units.find((u) => u.id === selectedUnitId)!;
  const selectedSection = selectedUnit.sections.find(
    (s) => s.id === selectedSectionId
  )!;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center gap-3">
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
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <CourseSidebar
            course={course}
            selectedUnitId={selectedUnitId}
            selectedSectionId={selectedSectionId}
            expandedUnitIds={expandedUnitIds}
            onSelectSection={handleSelectSection}
            onToggleUnit={handleToggleUnit}
          />

          {/* Content + navigation */}
          <article className="flex-1 min-w-0 rounded-xl border border-border bg-card p-6 sm:p-8">
            <SectionContent
              course={course}
              unit={selectedUnit}
              section={selectedSection}
            />

            {/* Prev / Next */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
              <button
                onClick={() => handleNav(prevEntry)}
                disabled={!prevEntry}
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors",
                  prevEntry
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-muted-foreground/30 cursor-not-allowed"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Section
              </button>
              <button
                onClick={() => handleNav(nextEntry)}
                disabled={!nextEntry}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  nextEntry
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                )}
              >
                Next Section
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
