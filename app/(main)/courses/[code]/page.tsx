"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { supabase } from "@/utils/supabase/client";
import type { SummaryLangContent } from "@/utils/supabase/types";
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

// ─── Static Course Data ────────────────────────────────────────

const courseData = {
  w01: {
    title: "Award in General Insurance",
    code: "W01",
    units: [
      {
        id: 1,
        title: "Risk and insurance",
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
        title: "The insurance market",
        sections: [
          { id: "A", title: "Market structure" },
          { id: "B", title: "Types of insurer" },
          { id: "C", title: "Reinsurance" },
          { id: "D", title: "Lloyd's" },
          { id: "E", title: "Intermediaries" },
          { id: "F", title: "Distribution channels" },
          { id: "G", title: "Influence of the internet and technology" },
          { id: "H", title: "Key professional roles" },
          { id: "I", title: "Classes of insurance" },
        ],
      },
      {
        id: 3,
        title: "Contract and agency",
        sections: [
          { id: "A", title: "Essentials of a valid contract" },
          { id: "B", title: "Offer and acceptance" },
          { id: "C", title: "Consideration" },
          { id: "D", title: "Intention to create legal relations" },
          { id: "E", title: "Capacity to contract" },
          { id: "F", title: "Cancellation of insurance contracts" },
          { id: "G", title: "Agency" },
          { id: "H", title: "Terms of business agreements (TOBAs)" },
        ],
      },
      {
        id: 4,
        title: "Insurable interest",
        sections: [
          { id: "A", title: "What is insurable interest?" },
          { id: "B", title: "When does insurable interest exist?" },
          { id: "C", title: "How is insurable interest applied?" },
        ],
      },
      {
        id: 5,
        title: "Disclosure and representation",
        sections: [
          { id: "A", title: "Principle of good faith" },
          { id: "B", title: "Duty of disclosure" },
          { id: "C", title: "Material information" },
          { id: "D", title: "Consequences of non-disclosure and misrepresentation" },
          { id: "E", title: "Compulsory insurances" },
        ],
      },
      {
        id: 6,
        title: "Proximate cause",
        sections: [
          { id: "A", title: "Definition of proximate cause" },
          { id: "B", title: "Modification by policy wordings" },
        ],
      },
      {
        id: 7,
        title: "Indemnity",
        sections: [
          { id: "A", title: "What is indemnity?" },
          { id: "B", title: "How is indemnity applied?" },
          { id: "C", title: "Measuring indemnity" },
          { id: "D", title: "Modifying indemnity" },
          { id: "E", title: "Limiting factors" },
        ],
      },
      {
        id: 8,
        title: "Contribution and subrogation",
        sections: [
          { id: "A", title: "Contribution" },
          { id: "B", title: "How does contribution arise?" },
          { id: "C", title: "How is contribution applied?" },
          { id: "D", title: "Subrogation" },
          { id: "E", title: "Insurers' subrogation rights" },
          { id: "F", title: "Where subrogation rights don't apply" },
        ],
      },
      {
        id: 9,
        title: "Insurance regulation",
        sections: [
          { id: "A", title: "Role of the insurance regulator" },
          { id: "B", title: "International Association of Insurance Supervisors (IAIS)" },
          { id: "C", title: "Capital adequacy of insurers" },
          { id: "D", title: "Combatting financial crime" },
          { id: "E", title: "Impact of fraud on the insurance industry" },
        ],
      },
      {
        id: 10,
        title: "Ethics, corporate governance and internal controls",
        sections: [
          { id: "A", title: "Ethical standards" },
          { id: "B", title: "Corporate governance" },
          { id: "C", title: "Internal control system" },
          { id: "D", title: "Data protection" },
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
type Course = (typeof courseData)[CourseCode];
type Unit = Course["units"][number];
type Section = Unit["sections"][number];
type ActiveTab = "content" | "summary" | "insights";

// ─── Flat index for sequential navigation ─────────────────────

type FlatEntry = {
  unitId: number;
  sectionId: string;
  sectionTitle: string;
  unitTitle: string;
};

function buildFlatIndex(units: readonly Unit[]): FlatEntry[] {
  return units.flatMap((u) =>
    u.sections.map((s) => ({
      unitId: u.id,
      sectionId: s.id,
      sectionTitle: s.title,
      unitTitle: u.title,
    }))
  );
}

// ─── Sidebar ──────────────────────────────────────────────────

function CourseSidebar({
  course,
  activeUnitId,
  activeSectionId,
  expandedUnitIds,
  completedSections,
  onSelectSection,
  onToggleUnit,
}: {
  course: Course;
  activeUnitId: number;
  activeSectionId: string;
  expandedUnitIds: number[];
  completedSections: Set<string>;
  onSelectSection: (unitId: number, sectionId: string) => void;
  onToggleUnit: (unitId: number) => void;
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

        {/* Unit accordion */}
        <nav className="p-2 max-h-[calc(100vh-14rem)] overflow-y-auto">
          {course.units.map((unit) => {
            const isExpanded = expandedUnitIds.includes(unit.id);
            const isActiveUnit = unit.id === activeUnitId;
            const completedInUnit = unit.sections.filter((s) =>
              completedSections.has(`${unit.id}-${s.id}`)
            ).length;

            return (
              <div key={unit.id} className="mb-0.5">
                <button
                  onClick={() => onToggleUnit(unit.id)}
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
                  <span className="text-xs font-medium flex-1 leading-snug">
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
                      const isActive =
                        isActiveUnit && section.id === activeSectionId;
                      const key = `${unit.id}-${section.id}`;
                      const isDone = completedSections.has(key);

                      return (
                        <li key={section.id}>
                          <button
                            onClick={() =>
                              onSelectSection(unit.id, section.id)
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
                                {section.id}
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

// ─── Tab Bar ───────���──────────────────────────────────────────

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
    <div className="flex items-center gap-1 p-1 rounded-xl border border-border bg-secondary/30 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === tab.id
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
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
  unit,
  section,
  flatIndex,
  currentFlatIdx,
  onNavigate,
  onMarkComplete,
}: {
  course: Course;
  unit: Unit;
  section: Section;
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
        <span>Unit {unit.id}</span>
        <ChevronRight className="w-3 h-3" />
        <span>Section {section.id}</span>
      </nav>

      {/* Section header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          Unit {unit.id} · Section {section.id}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">
          {section.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">{unit.title}</p>
      </div>

      {/* Placeholder study content */}
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-secondary/20 p-6">
          <h2 className="font-semibold text-foreground mb-3">Overview</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This section covers <strong className="text-foreground">{section.title.toLowerCase()}</strong> as
            part of <em>{unit.title}</em>. Understanding this topic is essential for the{" "}
            {course.code} examination and for professional practice in general insurance.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Insurance professionals must be able to identify, analyse and apply the core
            concepts in this area. The CII examination tests both knowledge and understanding,
            so ensure you can explain each concept in your own words and apply it to
            practical scenarios.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-secondary/20 p-6">
          <h2 className="font-semibold text-foreground mb-3">Key Points</h2>
          <ul className="space-y-2">
            {[
              `Define and explain the core concept of ${section.title.toLowerCase()}.`,
              "Understand how this topic relates to the broader insurance framework.",
              "Be able to apply this knowledge to real-world scenarios and case studies.",
              "Recognise how this area is regulated and what obligations arise.",
            ].map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-bold shrink-0">
                  {i + 1}
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Study Note
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Full study material for this section is being prepared by our content team and
            will be available shortly. In the meantime, use the Summary and Key Insights
            tabs for a condensed overview of this unit&apos;s most important concepts.
          </p>
        </div>
      </div>

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
  unit,
  section,
  summary,
  loading,
}: {
  unit: Unit;
  section: Section;
  summary: SummaryLangContent | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading summary…</span>
      </div>
    );
  }

  if (summary) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          {section.id}: {section.title}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">Unit {unit.id} — {unit.title}</p>

        {/* Overview */}
        {summary.content.overview && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {summary.content.overview}
          </p>
        )}

        {/* Key Points */}
        {summary.content.key_points?.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <h3 className="font-semibold text-foreground mb-3">Key Points</h3>
            <ul className="space-y-2">
              {summary.content.key_points.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Summary Cards */}
        <div className="space-y-4">
          {summary.summary_cards.map((card, i) => {
            const Icon = summaryIcons[i % summaryIcons.length];
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

        {/* Study Note */}
        {summary.content.study_note && (
          <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
            <p className="text-xs font-semibold text-yellow-500 mb-1">STUDY NOTE</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {summary.content.study_note}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Fallback: no data in DB yet
  const cards = [
    {
      title: "Core Concepts",
      body: `${unit.title} introduces the fundamental principles that underpin this area of insurance practice.`,
    },
    {
      title: "Legal and Regulatory Framework",
      body: `This unit sits within the broader legal framework governing insurance in the UK.`,
    },
    {
      title: "Practical Application",
      body: `Examination questions in this area often require candidates to apply concepts to given scenarios.`,
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-1">
        Unit {unit.id} Summary
      </h2>
      <p className="text-sm text-muted-foreground mb-6">{unit.title}</p>
      <div className="space-y-4">
        {cards.map((card, i) => {
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

// ─── Key Insights Tab ─────────────────────────────────────────

type InsightTag = "Core Principle" | "Legal Rule" | "Exam Tip";

type Insight = {
  tag: InsightTag;
  title: string;
  body: string;
  examCritical: boolean;
};

const tagStyles: Record<InsightTag, string> = {
  "Core Principle": "bg-blue-500/10 text-blue-400",
  "Legal Rule": "bg-purple-500/10 text-purple-400",
  "Exam Tip": "bg-yellow-500/10 text-yellow-500",
};

function buildInsights(unit: Unit): Insight[] {
  return [
    {
      tag: "Core Principle",
      title: `The Foundation of ${unit.title}`,
      body: `The core principle of this unit is that insurance operates as a mechanism for risk transfer and indemnification. Every concept in ${unit.title} flows from this foundation — when in doubt, ask how the rule serves the purpose of indemnity and fair risk allocation.`,
      examCritical: true,
    },
    {
      tag: "Legal Rule",
      title: "Statutory and Common Law Requirements",
      body: `Several topics in this unit are governed by statute (notably the Insurance Act 2015) as well as common law rules developed through case law. Examination questions may test whether you can distinguish the source of a rule and explain its effect accurately.`,
      examCritical: true,
    },
    {
      tag: "Exam Tip",
      title: "Structuring Your Answers",
      body: `For written questions, always: (1) state the relevant rule or principle, (2) apply it to the facts given, (3) reach a clear conclusion. Avoid vague statements — examiners reward precise use of terminology. Revise key definitions until you can reproduce them without prompts.`,
      examCritical: false,
    },
  ];
}

function InsightsTab({
  unit,
  summary,
  loading,
}: {
  unit: Unit;
  summary: SummaryLangContent | null;
  loading: boolean;
}) {
  const fallbackInsights = useMemo(() => buildInsights(unit), [unit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading insights…</span>
      </div>
    );
  }

  const insightsToRender: Array<{ tag: string; title: string; body: string; exam_critical: boolean }> =
    summary?.insights?.length
      ? summary.insights
      : fallbackInsights.map((i) => ({
          tag: i.tag,
          title: i.title,
          body: i.body,
          exam_critical: i.examCritical,
        }));

  const resolveTagStyle = (tag: string): string =>
    tagStyles[tag as InsightTag] ?? "bg-secondary text-muted-foreground";

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-1">
        Key Insights — Unit {unit.id}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">{unit.title}</p>

      <div className="space-y-4">
        {insightsToRender.map((insight, i) => (
          <div
            key={i}
            className={cn(
              "rounded-xl border bg-card p-5",
              insight.exam_critical
                ? "border-yellow-500/30 bg-yellow-500/5"
                : "border-border"
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
                    resolveTagStyle(insight.tag)
                  )}
                >
                  {insight.tag}
                </span>
              </div>
              {insight.exam_critical && (
                <span className="text-xs font-medium text-yellow-500 shrink-0">
                  ★ Exam Critical
                </span>
              )}
            </div>
            <h3 className="font-semibold text-foreground mb-2">{insight.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{insight.body}</p>
          </div>
        ))}
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

  const [activeUnitId, setActiveUnitId] = useState<number>(course.units[0].id);
  const [activeSectionId, setActiveSectionId] = useState<string>(
    course.units[0].sections[0].id
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>("content");
  const [expandedUnitIds, setExpandedUnitIds] = useState<number[]>([
    course.units[0].id,
  ]);
  const [completedSections, setCompletedSections] = useState<Set<string>>(
    new Set()
  );
  const [lessonSummary, setLessonSummary] = useState<SummaryLangContent | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const activeUnit = course.units.find((u) => u.id === activeUnitId)!;
  const activeSection = activeUnit.sections.find(
    (s) => s.id === activeSectionId
  )!;

  // Fetch summary_content from Supabase when section changes
  useEffect(() => {
    if (!activeSection) return;
    setSummaryLoading(true);
    setLessonSummary(null);
    supabase
      .from("lessons")
      .select("summary_content")
      .ilike("title->>en", `%${activeSection.title}%`)
      .limit(1)
      .single()
      .then(({ data }) => {
        const sc = (data as { summary_content?: { en?: SummaryLangContent } } | null)
          ?.summary_content?.en;
        setLessonSummary(sc ?? null);
        setSummaryLoading(false);
      });
  }, [activeSection?.title]);

  const currentFlatIdx = flatIndex.findIndex(
    (f) => f.unitId === activeUnitId && f.sectionId === activeSectionId
  );

  const handleSelectSection = (unitId: number, sectionId: string) => {
    setActiveUnitId(unitId);
    setActiveSectionId(sectionId);
    setActiveTab("content");
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

  const handleNavigate = (entry: FlatEntry) => {
    handleSelectSection(entry.unitId, entry.sectionId);
  };

  const handleMarkComplete = () => {
    const key = `${activeUnitId}-${activeSectionId}`;
    setCompletedSections((prev) => new Set(prev).add(key));
  };

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
            activeUnitId={activeUnitId}
            activeSectionId={activeSectionId}
            expandedUnitIds={expandedUnitIds}
            completedSections={completedSections}
            onSelectSection={handleSelectSection}
            onToggleUnit={handleToggleUnit}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0 rounded-xl border border-border bg-card p-6 sm:p-8">
            <TabBar activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === "content" && (
              <ContentTab
                course={course}
                unit={activeUnit}
                section={activeSection}
                flatIndex={flatIndex}
                currentFlatIdx={currentFlatIdx}
                onNavigate={handleNavigate}
                onMarkComplete={handleMarkComplete}
              />
            )}
            {activeTab === "summary" && (
              <SummaryTab
                unit={activeUnit}
                section={activeSection}
                summary={lessonSummary}
                loading={summaryLoading}
              />
            )}
            {activeTab === "insights" && (
              <InsightsTab
                unit={activeUnit}
                summary={lessonSummary}
                loading={summaryLoading}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
