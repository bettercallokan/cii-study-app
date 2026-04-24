"use client";

import Link from "next/link";
import { BookOpen, ClipboardList, Clock, ChevronRight, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const courses = [
  {
    code: "w01",
    title: "Award in General Insurance",
    subtitle: "W01",
    description:
      "Fundamental principles of insurance, legal frameworks, and market structure.",
    units: 6,
    examQuestions: 100,
    examDuration: "2 hours",
    color: "blue",
  },
  {
    code: "wue",
    title: "Insurance Underwriting",
    subtitle: "WUE",
    description:
      "Risk assessment, underwriting procedures, pricing and exposure management.",
    units: 11,
    examQuestions: 75,
    examDuration: "2 hours",
    color: "purple",
  },
  {
    code: "wce",
    title: "Insurance Claims Handling",
    subtitle: "WCE",
    description:
      "Claims process, settlement procedures, fraud detection and expense management.",
    units: 7,
    examQuestions: 75,
    examDuration: "2 hours",
    color: "emerald",
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

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 pt-8">
          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
            <GraduationCap className="w-4 h-4" />
            CII Qualifications
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Courses
          </h1>
          <p className="text-muted-foreground mt-1">
            Select a course to begin studying
          </p>
        </div>

        {/* Course List */}
        <div className="divide-y divide-border/50 md:space-y-4 md:divide-y-0">
          {courses.map((course) => {
            const colors = colorMap[course.color as CourseColor];
            return (
              <Link
                key={course.code}
                href={`/courses/${course.code}`}
                className={cn(
                  "group flex items-center gap-4 min-h-[72px] py-4 transition-all duration-200 md:gap-5 md:p-6 md:rounded-xl md:border md:border-border md:bg-card",
                  colors.card
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-xl border shrink-0",
                    colors.icon
                  )}
                >
                  <BookOpen className="w-5 h-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full border text-xs font-bold tracking-wider shrink-0",
                        colors.badge
                      )}
                    >
                      {course.subtitle}
                    </span>
                    <h2 className="font-semibold text-foreground truncate">
                      {course.title}
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed hidden sm:block">
                    {course.description}
                  </p>

                  {/* Stat Pills - desktop only */}
                  <div className="hidden md:flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
                      <BookOpen className="w-3 h-3" />
                      {course.units} units
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
                      <ClipboardList className="w-3 h-3" />
                      {course.examQuestions} questions
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {course.examDuration}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
