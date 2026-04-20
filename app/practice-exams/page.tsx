"use client";

import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const practiceExams = [
  {
    id: "exam-1",
    title: "Module 1-3 Assessment",
    description: "Comprehensive test covering insurance fundamentals",
    questions: 50,
    duration: "60 min",
    difficulty: "Medium",
    bestScore: 82,
    attempts: 3,
    status: "completed",
  },
  {
    id: "exam-2",
    title: "Contract Law Focus",
    description: "Deep dive into insurance contract principles",
    questions: 30,
    duration: "35 min",
    difficulty: "Hard",
    bestScore: 68,
    attempts: 2,
    status: "completed",
  },
  {
    id: "exam-3",
    title: "Quick Quiz: Risk Types",
    description: "Test your understanding of risk classification",
    questions: 15,
    duration: "15 min",
    difficulty: "Easy",
    bestScore: null,
    attempts: 0,
    status: "new",
  },
  {
    id: "exam-4",
    title: "Full Mock Exam",
    description: "Simulates the actual CII W01 examination",
    questions: 100,
    duration: "120 min",
    difficulty: "Hard",
    bestScore: null,
    attempts: 0,
    status: "locked",
  },
];

const recentResults = [
  { exam: "Module 1-3 Assessment", score: 82, date: "2 days ago", passed: true },
  { exam: "Contract Law Focus", score: 68, date: "5 days ago", passed: true },
  { exam: "Quick Quiz: Risk Types", score: 45, date: "1 week ago", passed: false },
];

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 bg-secondary rounded-full overflow-hidden">
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

function ExamCard({ exam }: { exam: (typeof practiceExams)[0] }) {
  const isLocked = exam.status === "locked";
  const isNew = exam.status === "new";

  return (
    <div
      className={cn(
        "p-5 rounded-xl border bg-card transition-all",
        isLocked
          ? "border-border opacity-60 cursor-not-allowed"
          : "border-border hover:border-primary/30 cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl",
            exam.difficulty === "Easy" && "bg-green-500/10 text-green-500",
            exam.difficulty === "Medium" && "bg-yellow-500/10 text-yellow-500",
            exam.difficulty === "Hard" && "bg-red-500/10 text-red-500"
          )}
        >
          <ClipboardList className="w-5 h-5" />
        </div>
        {isNew && (
          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            New
          </span>
        )}
        {exam.bestScore !== null && (
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">{exam.bestScore}%</p>
            <p className="text-xs text-muted-foreground">Best Score</p>
          </div>
        )}
      </div>

      <h3 className="font-semibold text-foreground mb-1">{exam.title}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{exam.description}</p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" />
          {exam.questions} questions
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {exam.duration}
        </span>
      </div>

      {!isLocked && (
        <button
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors",
            isNew
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-foreground hover:bg-secondary/80"
          )}
        >
          <Play className="w-4 h-4" />
          {isNew ? "Start Exam" : `Retake (${exam.attempts} attempts)`}
        </button>
      )}
    </div>
  );
}

function RecentResultsCard() {
  return (
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
            className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30"
          >
            {result.passed ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{result.exam}</p>
              <p className="text-xs text-muted-foreground">{result.date}</p>
            </div>
            <span
              className={cn(
                "text-sm font-bold",
                result.passed ? "text-green-500" : "text-red-500"
              )}
            >
              {result.score}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PracticeExamsPage() {
  const averageScore = 65;
  const totalAttempts = 5;
  const passRate = 60;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
            <ClipboardList className="w-4 h-4" />
            Exam Preparation
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Practice Exams
          </h1>
          <p className="text-muted-foreground mt-1">
            Test your knowledge with timed assessments
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Avg Score</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{averageScore}%</p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Pass Rate</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{passRate}%</p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Best Score</span>
            </div>
            <p className="text-2xl font-bold text-foreground">82%</p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Attempts</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalAttempts}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exams Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">Available Exams</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {practiceExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RecentResultsCard />

            {/* Tips Card */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold text-foreground mb-3">Exam Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  Read each question carefully before answering
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  Manage your time - don&apos;t spend too long on one question
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  Review flagged questions if time permits
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
