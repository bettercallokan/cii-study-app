"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Lightbulb,
  ChevronRight,
  Clock,
  BookOpen,
  Star,
  ArrowLeft,
  Search,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const summaries = [
  {
    id: "s1",
    module: "01",
    title: "Introduction to Insurance",
    excerpt:
      "Insurance is a financial mechanism that transfers risk from individuals or organisations to a pool managed by an insurer. Key concepts include insurable interest, utmost good faith, indemnity, subrogation, and contribution.",
    readTime: "5 min",
    topics: ["Risk Transfer", "Key Principles", "Market Structure"],
    completed: true,
  },
  {
    id: "s2",
    module: "02",
    title: "Legal Principles of Insurance",
    excerpt:
      "Insurance contracts are governed by fundamental legal principles. Utmost good faith (uberrimae fidei) requires full disclosure of all material facts. Indemnity restores the insured to their pre-loss position without profit.",
    readTime: "7 min",
    topics: ["Contract Law", "Utmost Good Faith", "Indemnity"],
    completed: true,
  },
  {
    id: "s3",
    module: "03",
    title: "Insurance Contract Law",
    excerpt:
      "A valid insurance contract requires offer and acceptance, consideration, legal capacity, and legality of purpose. The Insurance Act 2015 modernised the duty of fair presentation and introduced a proportionate remedies regime.",
    readTime: "8 min",
    topics: ["Contract Formation", "Insurance Act 2015", "Warranties"],
    completed: false,
  },
  {
    id: "s4",
    module: "04",
    title: "Risk Assessment and Underwriting",
    excerpt:
      "Underwriters assess risk by analysing hazard (physical and moral), peril, and exposure. Premium is calculated using loss frequency and severity data, expenses, and profit loadings. Rating factors vary by class of business.",
    readTime: "9 min",
    topics: ["Risk Evaluation", "Premium Calculation", "Underwriting"],
    completed: false,
  },
  {
    id: "s5",
    module: "05",
    title: "Claims Management",
    excerpt:
      "Effective claims handling requires prompt notification, thorough investigation, and fair settlement. Claims fraud costs the UK insurance industry billions annually. Adjusters assess quantum and liability.",
    readTime: "6 min",
    topics: ["Claims Process", "Fraud Prevention", "Settlement"],
    completed: false,
  },
];

const insights = [
  {
    id: "i1",
    module: "Insurance Principles",
    title: "The Proximate Cause Rule",
    body: "The proximate cause is the dominant, effective, or operative cause of a loss — not merely the last in time. If the proximate cause is an insured peril, the claim is covered even if remote causes are uninsured.",
    examWeight: "high",
    tag: "Core Principle",
  },
  {
    id: "i2",
    module: "Contract Law",
    title: "Material Facts and Non-Disclosure",
    body: "Under the Insurance Act 2015, the duty of fair presentation replaces the old duty of utmost good faith. The insured must disclose every material circumstance known or that ought to be known, in a clear and accessible manner.",
    examWeight: "high",
    tag: "Insurance Act 2015",
  },
  {
    id: "i3",
    module: "Underwriting",
    title: "Warranties vs Conditions",
    body: "A warranty is a term that must be exactly complied with regardless of materiality. Post Insurance Act 2015, breach of warranty no longer automatically voids the policy — it only suspends cover during the period of breach.",
    examWeight: "high",
    tag: "Key Distinction",
  },
  {
    id: "i4",
    module: "Claims",
    title: "Subrogation Timing",
    body: "Subrogation rights arise after the insurer has indemnified the insured. The insurer 'stands in the shoes' of the insured to recover from negligent third parties. The insured must not prejudice the insurer's subrogation rights.",
    examWeight: "medium",
    tag: "Legal Principle",
  },
  {
    id: "i5",
    module: "Risk Assessment",
    title: "Moral vs Physical Hazard",
    body: "Physical hazard relates to the tangible characteristics of the risk (construction, location). Moral hazard relates to the attitude and behaviour of the insured — underwriters must assess both when evaluating a risk.",
    examWeight: "medium",
    tag: "Underwriting",
  },
  {
    id: "i6",
    module: "Insurance Principles",
    title: "Insurable Interest Requirements",
    body: "Insurable interest must exist at inception for life policies and at the time of loss for property policies. Without it, the contract is void as a wager. For indemnity contracts, the measure is the financial interest at risk.",
    examWeight: "high",
    tag: "Core Principle",
  },
];

type Tab = "summaries" | "insights";

function SummaryCard({ summary }: { summary: (typeof summaries)[0] }) {
  return (
    <div className="rounded-xl border border-border bg-card hover:border-primary/30 transition-all duration-200 overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl shrink-0 text-sm font-bold",
              summary.completed
                ? "bg-green-500/10 border border-green-500/20 text-green-500"
                : "bg-primary/10 border border-primary/20 text-primary"
            )}
          >
            {summary.module}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
              {summary.title}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {summary.readTime} read
              </span>
              {summary.completed && (
                <span className="text-xs text-green-500 font-medium">✓ Read</span>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {summary.excerpt}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          {summary.topics.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-xs text-muted-foreground"
            >
              <Tag className="w-2.5 h-2.5" />
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 py-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Module {summary.module}</span>
        <button className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
          {summary.completed ? "Review" : "Read Summary"}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: (typeof insights)[0] }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 hover:border-primary/30 transition-all duration-200",
        insight.examWeight === "high"
          ? "border-yellow-500/30 bg-yellow-500/5"
          : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground">{insight.module}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {insight.examWeight === "high" && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium">
              <Star className="w-2.5 h-2.5" />
              Exam Critical
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">
            {insight.tag}
          </span>
        </div>
      </div>

      <h3 className="font-semibold text-foreground mb-2">{insight.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{insight.body}</p>
    </div>
  );
}

export default function MaterialsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("summaries");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSummaries = summaries.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredInsights = insights.filter(
    (i) =>
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
            <BookOpen className="w-4 h-4" />
            Study Materials
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Study Materials Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Condensed summaries and exam-critical insights for CII W01
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-xl border border-border bg-card text-center">
              <p className="text-2xl font-bold text-foreground">{summaries.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Summaries</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card text-center">
              <p className="text-2xl font-bold text-foreground">{insights.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Key Insights</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card text-center">
              <p className="text-2xl font-bold text-yellow-500">
                {insights.filter((i) => i.examWeight === "high").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Exam Critical</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-border bg-card mb-6">
          <button
            onClick={() => setActiveTab("summaries")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === "summaries"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="w-4 h-4" />
            Module Summaries
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === "insights"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Lightbulb className="w-4 h-4" />
            Critical Insights
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={
              activeTab === "summaries"
                ? "Search summaries..."
                : "Search insights..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        {/* Content */}
        {activeTab === "summaries" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSummaries.map((summary) => (
              <SummaryCard key={summary.id} summary={summary} />
            ))}
            {filteredSummaries.length === 0 && (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                No summaries found for &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        )}

        {activeTab === "insights" && (
          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
            {filteredInsights.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No insights found for &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
