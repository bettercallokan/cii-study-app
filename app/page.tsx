"use client";

import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Zap,
  ChevronRight,
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

const knowledgeGaps = [
  { topic: "Insurance Law Principles", progress: 85, trend: "up" },
  { topic: "Risk Classification", progress: 72, trend: "up" },
  { topic: "Policy Interpretation", progress: 58, trend: "down" },
  { topic: "Claims Procedures", progress: 45, trend: "neutral" },
  { topic: "Regulatory Framework", progress: 38, trend: "up" },
];

const recentActivity = [
  { action: "Completed Unit 1", module: "Insurance Contract Law", time: "2h ago" },
  { action: "Reviewed 45 flashcards", module: "Risk Management", time: "5h ago" },
  { action: "Scored 78% on quiz", module: "Regulatory Framework", time: "1d ago" },
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
        Continue your CII W01 preparation journey
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

function KnowledgeGapCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-foreground">Knowledge Gaps</h3>
        <Link
          href="/analytics"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-4">
        {knowledgeGaps.map((item) => (
          <div key={item.topic}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-foreground">{item.topic}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{item.progress}%</span>
                {item.trend === "up" && (
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                )}
                {item.trend === "down" && (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                )}
              </div>
            </div>
            <ProgressBar
              value={item.progress}
              className={cn(
                "h-1.5",
                item.progress >= 70
                  ? "[&>div]:bg-green-500"
                  : item.progress >= 50
                  ? "[&>div]:bg-yellow-500"
                  : "[&>div]:bg-red-500"
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivityCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
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
      <div className="max-w-6xl mx-auto px-6 py-8">
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

          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <KnowledgeGapCard />
            <RecentActivityCard />
          </div>
        </div>

      </div>
    </div>
  );
}
