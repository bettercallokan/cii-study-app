"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  Layers,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Syllabus data structure
const syllabusData = [
  {
    id: "module-1",
    number: "01",
    title: "Introduction to Insurance",
    description: "Fundamental concepts and principles of insurance",
    duration: "4 hours",
    progress: 100,
    units: [
      { id: "1-1", title: "The Concept of Risk", completed: true, duration: "45 min" },
      { id: "1-2", title: "Insurance as Risk Transfer", completed: true, duration: "60 min" },
      { id: "1-3", title: "Types of Insurance", completed: true, duration: "75 min" },
      { id: "1-4", title: "The Insurance Market", completed: true, duration: "60 min" },
    ],
  },
  {
    id: "module-2",
    number: "02",
    title: "Legal Principles of Insurance",
    description: "Core legal foundations governing insurance contracts",
    duration: "5 hours",
    progress: 80,
    units: [
      { id: "2-1", title: "Insurable Interest", completed: true, duration: "60 min" },
      { id: "2-2", title: "Utmost Good Faith", completed: true, duration: "75 min" },
      { id: "2-3", title: "Indemnity", completed: true, duration: "60 min" },
      { id: "2-4", title: "Subrogation and Contribution", completed: false, duration: "60 min" },
    ],
  },
  {
    id: "module-3",
    number: "03",
    title: "Insurance Contract Law",
    description: "Formation, interpretation and enforcement of insurance contracts",
    duration: "6 hours",
    progress: 45,
    units: [
      { id: "3-1", title: "Formation of Contracts", completed: true, duration: "75 min" },
      { id: "3-2", title: "Policy Terms and Conditions", completed: false, duration: "90 min" },
      { id: "3-3", title: "Policy Interpretation", completed: false, duration: "60 min" },
      { id: "3-4", title: "Claims and Disputes", completed: false, duration: "75 min" },
    ],
  },
  {
    id: "module-4",
    number: "04",
    title: "Risk Assessment and Underwriting",
    description: "Principles and practices of risk evaluation",
    duration: "5 hours",
    progress: 0,
    units: [
      { id: "4-1", title: "Risk Identification", completed: false, duration: "60 min" },
      { id: "4-2", title: "Risk Measurement", completed: false, duration: "75 min" },
      { id: "4-3", title: "Underwriting Process", completed: false, duration: "90 min" },
      { id: "4-4", title: "Premium Calculation", completed: false, duration: "75 min" },
    ],
  },
  {
    id: "module-5",
    number: "05",
    title: "Claims Management",
    description: "Handling and processing insurance claims",
    duration: "4 hours",
    progress: 0,
    units: [
      { id: "5-1", title: "Claims Notification", completed: false, duration: "45 min" },
      { id: "5-2", title: "Claims Investigation", completed: false, duration: "75 min" },
      { id: "5-3", title: "Settlement Procedures", completed: false, duration: "60 min" },
      { id: "5-4", title: "Fraud Detection", completed: false, duration: "60 min" },
    ],
  },
];

function ProgressBar({ value, size = "default" }: { value: number; size?: "default" | "small" }) {
  return (
    <div className={cn("bg-secondary rounded-full overflow-hidden", size === "small" ? "h-1" : "h-2")}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          value === 100 ? "bg-green-500" : value > 0 ? "bg-primary" : "bg-secondary"
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function ModuleAccordion({
  module,
  isOpen,
  onToggle,
}: {
  module: (typeof syllabusData)[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Module Header */}
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center gap-4 hover:bg-secondary/30 transition-colors"
      >
        {/* Module Number */}
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl shrink-0",
            module.progress === 100
              ? "bg-green-500/10 border border-green-500/20"
              : module.progress > 0
              ? "bg-primary/10 border border-primary/20"
              : "bg-secondary border border-border"
          )}
        >
          <span
            className={cn(
              "text-lg font-bold",
              module.progress === 100
                ? "text-green-500"
                : module.progress > 0
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {module.number}
          </span>
        </div>

        {/* Module Info */}
        <div className="flex-1 text-left min-w-0">
          <h3 className="font-semibold text-foreground">{module.title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
            {module.description}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {module.duration}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="w-3.5 h-3.5" />
              {module.units.length} units
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-24 hidden sm:block">
            <ProgressBar value={module.progress} size="small" />
            <span className="text-xs text-muted-foreground mt-1 block text-right">
              {module.progress}%
            </span>
          </div>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Units List */}
      {isOpen && (
        <div className="border-t border-border">
          {module.units.map((unit, index) => (
            <Link
              key={unit.id}
              href={`/modules/${module.id}?unit=${unit.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors border-b border-border last:border-b-0"
            >
              {/* Status Icon */}
              {unit.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
              )}

              {/* Unit Info */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    unit.completed ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {index + 1}. {unit.title}
                </p>
                <span className="text-xs text-muted-foreground">{unit.duration}</span>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ModulesPage() {
  const [openModules, setOpenModules] = useState<string[]>(["module-3"]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const filteredModules = syllabusData.filter(
    (module) =>
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalProgress = Math.round(
    syllabusData.reduce((acc, m) => acc + m.progress, 0) / syllabusData.length
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
            <Layers className="w-4 h-4" />
            CII W01 Syllabus
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Study Modules
          </h1>
          <p className="text-muted-foreground mt-1">
            Master each module to complete your CII W01 certification
          </p>

          {/* Overall Progress */}
          <div className="mt-6 p-4 rounded-xl border border-border bg-card flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Overall Progress</span>
                <span className="text-sm font-bold text-primary">{totalProgress}%</span>
              </div>
              <ProgressBar value={totalProgress} />
            </div>
            <div className="text-right pl-4 border-l border-border">
              <p className="text-2xl font-bold text-foreground">
                {syllabusData.filter((m) => m.progress === 100).length}/{syllabusData.length}
              </p>
              <p className="text-xs text-muted-foreground">Modules Complete</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        {/* Modules List */}
        <div className="space-y-3">
          {filteredModules.map((module) => (
            <ModuleAccordion
              key={module.id}
              module={module}
              isOpen={openModules.includes(module.id)}
              onToggle={() => toggleModule(module.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
