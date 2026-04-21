"use client";

import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Flame,
  Calendar,
  BookOpen,
  Award,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const weeklyStudyData = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 1.8 },
  { day: "Wed", hours: 3.2 },
  { day: "Thu", hours: 2.1 },
  { day: "Fri", hours: 0.5 },
  { day: "Sat", hours: 4.0 },
  { day: "Sun", hours: 2.8 },
];

const topicPerformance = [
  { topic: "Insurance Law Principles", score: 85, trend: "up", change: 12 },
  { topic: "Risk Classification", score: 72, trend: "up", change: 8 },
  { topic: "Contract Formation", score: 68, trend: "up", change: 5 },
  { topic: "Policy Interpretation", score: 58, trend: "down", change: -3 },
  { topic: "Claims Procedures", score: 45, trend: "neutral", change: 0 },
  { topic: "Regulatory Framework", score: 38, trend: "up", change: 15 },
];

const milestones = [
  { title: "First Module Completed", achieved: true, date: "Jan 15" },
  { title: "50 Flashcards Mastered", achieved: true, date: "Jan 22" },
  { title: "First Exam Passed", achieved: true, date: "Feb 3" },
  { title: "7-Day Streak", achieved: false, date: null },
  { title: "All Modules Completed", achieved: false, date: null },
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

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
}) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend === "up" ? "text-green-500" : "text-red-500"
            )}
          >
            {trend === "up" ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}

function WeeklyChart() {
  const maxHours = Math.max(...weeklyStudyData.map((d) => d.hours));

  return (
    <div className="p-5 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">Weekly Study Time</h3>
          <p className="text-sm text-muted-foreground">Hours spent learning this week</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">
            {weeklyStudyData.reduce((acc, d) => acc + d.hours, 0).toFixed(1)}h
          </p>
          <p className="text-xs text-muted-foreground">Total this week</p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-32">
        {weeklyStudyData.map((data, index) => (
          <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
            <div
              className={cn(
                "w-full rounded-t-md transition-all duration-300",
                index === new Date().getDay() - 1
                  ? "bg-primary"
                  : "bg-secondary hover:bg-primary/50"
              )}
              style={{ height: `${(data.hours / maxHours) * 100}%`, minHeight: "4px" }}
            />
            <span className="text-xs text-muted-foreground">{data.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopicPerformanceCard() {
  return (
    <div className="p-5 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-foreground">Topic Performance</h3>
        <button className="text-xs text-primary hover:underline flex items-center gap-1">
          Details
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-4">
        {topicPerformance.map((item) => (
          <div key={item.topic}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-foreground">{item.topic}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{item.score}%</span>
                {item.trend === "up" && (
                  <span className="text-xs text-green-500">+{item.change}%</span>
                )}
                {item.trend === "down" && (
                  <span className="text-xs text-red-500">{item.change}%</span>
                )}
              </div>
            </div>
            <ProgressBar value={item.score} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MilestonesCard() {
  return (
    <div className="p-5 rounded-xl border border-border bg-card">
      <h3 className="font-semibold text-foreground mb-4">Milestones</h3>
      <div className="space-y-3">
        {milestones.map((milestone, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg",
              milestone.achieved ? "bg-green-500/10" : "bg-secondary/30"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full",
                milestone.achieved
                  ? "bg-green-500/20 text-green-500"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              <Award className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  milestone.achieved ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {milestone.title}
              </p>
              {milestone.date && (
                <p className="text-xs text-muted-foreground">{milestone.date}</p>
              )}
            </div>
            {milestone.achieved && (
              <span className="text-xs text-green-500 font-medium">Achieved</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
            <BarChart3 className="w-4 h-4" />
            Learning Analytics
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Your Progress
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your learning journey and identify areas for improvement
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Study Streak"
            value="12 days"
            icon={Flame}
            trend="up"
            trendValue="+5 days"
          />
          <StatCard
            title="Total Study Time"
            value="47.5h"
            subtitle="This month"
            icon={Clock}
          />
          <StatCard
            title="Average Score"
            value="72%"
            icon={Target}
            trend="up"
            trendValue="+8%"
          />
          <StatCard
            title="Modules Complete"
            value="2/5"
            subtitle="40% done"
            icon={BookOpen}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <WeeklyChart />
            <TopicPerformanceCard />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <MilestonesCard />

            {/* Quick Insights */}
            <div className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-4">Quick Insights</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    <span className="text-foreground font-medium">Great progress!</span> Your
                    Insurance Law score improved by 12% this week.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    <span className="text-foreground font-medium">Focus area:</span> Claims
                    Procedures needs more practice (45%).
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    <span className="text-foreground font-medium">Tip:</span> Study on weekends
                    when you&apos;re most productive.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
