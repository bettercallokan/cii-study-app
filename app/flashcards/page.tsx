"use client";

import { useState } from "react";
import {
  Layers,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Shuffle,
  Clock,
  Flame,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const flashcardDecks = [
  { id: "1", name: "Insurance Principles", cards: 45, mastered: 32, color: "primary" },
  { id: "2", name: "Contract Law", cards: 38, mastered: 15, color: "green" },
  { id: "3", name: "Risk Assessment", cards: 52, mastered: 8, color: "yellow" },
  { id: "4", name: "Claims Management", cards: 41, mastered: 0, color: "red" },
];

const sampleCards = [
  {
    id: 1,
    question: "What is the principle of Utmost Good Faith (Uberrimae Fidei)?",
    answer:
      "A legal principle requiring both parties to an insurance contract to act honestly and disclose all material facts. The insured must reveal anything that might influence the insurer&apos;s decision to accept the risk or set the premium.",
    module: "Insurance Principles",
  },
  {
    id: 2,
    question: "Define Insurable Interest",
    answer:
      "The legal right to insure arising from a financial relationship between the insured and the subject matter of insurance. Without insurable interest, an insurance contract would be a mere wager and void under law.",
    module: "Contract Law",
  },
  {
    id: 3,
    question: "What is the difference between indemnity and benefit policies?",
    answer:
      "Indemnity policies aim to restore the insured to their pre-loss financial position (e.g., property insurance). Benefit policies pay a fixed sum regardless of the actual loss (e.g., life insurance).",
    module: "Insurance Principles",
  },
];

function ProgressRing({ progress, size = 48 }: { progress: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-secondary"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-primary transition-all duration-500"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
        {progress}%
      </span>
    </div>
  );
}

function DeckCard({ deck }: { deck: (typeof flashcardDecks)[0] }) {
  const progress = Math.round((deck.mastered / deck.cards) * 100);
  
  return (
    <div className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl",
            deck.color === "primary" && "bg-primary/10 text-primary",
            deck.color === "green" && "bg-green-500/10 text-green-500",
            deck.color === "yellow" && "bg-yellow-500/10 text-yellow-500",
            deck.color === "red" && "bg-red-500/10 text-red-500"
          )}
        >
          <Layers className="w-5 h-5" />
        </div>
        <ProgressRing progress={progress} />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{deck.name}</h3>
      <p className="text-sm text-muted-foreground">
        {deck.mastered} / {deck.cards} cards mastered
      </p>
    </div>
  );
}

function FlashcardViewer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<number[]>([]);

  const currentCard = sampleCards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % sampleCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + sampleCards.length) % sampleCards.length);
  };

  const handleMastered = () => {
    if (!masteredCards.includes(currentCard.id)) {
      setMasteredCards([...masteredCards, currentCard.id]);
    }
    handleNext();
  };

  const handleAgain = () => {
    handleNext();
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">Practice Session</h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            {currentIndex + 1} / {sampleCards.length}
          </span>
          <span className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            {masteredCards.length} mastered
          </span>
        </div>
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative min-h-[320px] rounded-2xl border border-border bg-card cursor-pointer perspective-1000"
      >
        <div
          className={cn(
            "absolute inset-0 p-8 flex flex-col transition-all duration-500 backface-hidden rounded-2xl",
            isFlipped && "rotate-y-180 opacity-0"
          )}
        >
          <span className="text-xs font-medium text-primary mb-4">{currentCard.module}</span>
          <p className="text-xl font-medium text-foreground leading-relaxed flex-1 flex items-center">
            {currentCard.question}
          </p>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Click to reveal answer
          </p>
        </div>
        <div
          className={cn(
            "absolute inset-0 p-8 flex flex-col transition-all duration-500 backface-hidden rounded-2xl bg-primary/5",
            !isFlipped && "-rotate-y-180 opacity-0"
          )}
        >
          <span className="text-xs font-medium text-green-500 mb-4">Answer</span>
          <p className="text-lg text-foreground leading-relaxed flex-1">
            {currentCard.answer}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handlePrev}
          className="p-3 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAgain}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors text-sm font-medium text-foreground"
          >
            <XCircle className="w-4 h-4 text-red-500" />
            Again
          </button>
          <button
            onClick={handleMastered}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 transition-colors text-sm font-medium text-primary-foreground"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mastered
          </button>
        </div>

        <button
          onClick={handleNext}
          className="p-3 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Shuffle className="w-4 h-4" />
          Shuffle
        </button>
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <RotateCcw className="w-4 h-4" />
          Reset Progress
        </button>
      </div>
    </div>
  );
}

export default function FlashcardsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
            <Layers className="w-4 h-4" />
            Spaced Repetition
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Flashcard Decks
          </h1>
          <p className="text-muted-foreground mt-1">
            Master key concepts with active recall
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-border bg-card text-center">
            <p className="text-2xl font-bold text-foreground">176</p>
            <p className="text-xs text-muted-foreground mt-1">Total Cards</p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card text-center">
            <p className="text-2xl font-bold text-green-500">55</p>
            <p className="text-xs text-muted-foreground mt-1">Mastered</p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              <p className="text-2xl font-bold text-foreground">24</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Due Today</p>
          </div>
        </div>

        {/* Decks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {flashcardDecks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>

        {/* Flashcard Viewer */}
        <FlashcardViewer />
      </div>
    </div>
  );
}
