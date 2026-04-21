"use client";

import Link from "next/link";
import {
  TrendingUp,
  Clock,
  Target,
  Zap,
  ChevronRight,
  BookOpen,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Progress data
const overallProgress = 65;

const currentModule = {
  id: "w01",
  number: "W01",
  title: "Award in General Insurance",
  unit: "Unit 1 · A: The role of risk in insurance",
  progress: 45,
  lastAccessed: "2 hours ago",
};

const modules = [
  { code: "W01", name: "Award in General Insurance", progress: 45, href: "/courses/w01" },
  { code: "WCE", name: "Insurance Claims Handling", progress: 12, href: "/courses/wce" },
  { code: "WUE", name: "Insurance Underwriting", progress: 0, href: "/courses/wue" },
];

const recentActivity = [
  { action: "Completed Unit 1", module: "Insurance Contract Law", time: "2h ago" },
  { action: "Reviewed 45 flashcards", module: "Risk Management", time: "5h ago" },
  { action: "Scored 78% on quiz", module: "Regulatory Framework", time: "1d ago" },
];

const upcomingExams = [
  { name: "W01 Mock Exam 1", questions: 50, duration: "2 hours", status: "Not started" },
  { name: "W01 Mock Exam 2", questions: 50, duration: "2 hours", status: "Not started" },
];

function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 bg-secondary rounded-full overflow-hidden", className)}>
      <div
        className="h-full bg-primary rounded-full transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function WelcomeHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight">
        Welcome back, <span className="text-primary">Mehmet</span>
      </h1>
      <p className="text-muted-foreground mt-1">
        Continue your CII certification journey
      </p>

      {/* Global Progress */}
      <div className="mt-6 p-5 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{overallProgress}%</span>
        </div>
        <ProgressBar value={overallProgress} className="h-3" />
        <p className="text-xs text-muted-foreground mt-3">
          You&apos;re ahead of 73% of learners at this stage
        </p>
      </div>
    </div>
  );
}

function ContinueLearningCard() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
          <Clock className="w-3.5 h-3.5" />
          Last accessed {currentModule.lastAccessed}
        </div>
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
            <span className="text-lg font-bold text-primary">{currentModule.number}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">{currentModule.title}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{currentModule.unit}</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Unit Progress</span>
          <span className="font-medium text-foreground">{currentModule.progress}%</span>
        </div>
        <ProgressBar value={currentModule.progress} />
        <Link
          href={`/courses/${currentModule.id}`}
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <Zap className="w-4 h-4" />
          Resume Learning
        </Link>
      </div>
    </div>
  );
}

function ModulesOverviewCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Your Modules</h3>
        </div>
        <Link
          href="/courses"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-4">
        {modules.map((module) => (
          <Link 
            key={module.code} 
            href={module.href}
            className="block group"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                module.progress > 0 ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
              )}>
                {module.code}
              </span>
              <span className="text-sm text-foreground group-hover:text-primary transition-colors flex-1 truncate">
                {module.name}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {module.progress}%
              </span>
            </div>
            <ProgressBar
              value={module.progress}
              className={cn(
                "h-1.5",
                module.progress === 0 && "[&>div]:bg-muted-foreground/30"
              )}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

function PracticeExamsCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Practice Exams</h3>
        </div>
        <Link
          href="/practice-exams"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {upcomingExams.map((exam, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{exam.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {exam.questions} questions · {exam.duration}
              </p>
            </div>
            <Link
              href="/practice-exams"
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivityCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
      </div>
      <div className="space-y-3">
        {recentActivity.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 py-2 border-b border-border last:border-0"
          >
            <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{item.action}</p>
              <p className="text-xs text-muted-foreground">{item.module}</p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:pl-8">
        <WelcomeHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Continue Learning
              </h2>
              <ContinueLearningCard />
            </div>
            <ModulesOverviewCard />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <PracticeExamsCard />
            <RecentActivityCard />
          </div>
        </div>
      </div>
    </div>
  );
}
