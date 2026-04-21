"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PdfViewerProps {
  pdfName?: string;
  pdfUrl?: string | null;
  totalPages?: number;
  className?: string;
}

export function PdfViewer({ 
  pdfName = "W01 Study Guide - Unit 1",
  pdfUrl = null,
  totalPages = 42,
  className 
}: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [goToPage, setGoToPage] = useState("");
  const [zoom, setZoom] = useState(100);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(goToPage);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setGoToPage("");
    }
  };

  const handleZoomIn = () => {
    if (zoom < 200) setZoom(zoom + 25);
  };

  const handleZoomOut = () => {
    if (zoom > 50) setZoom(zoom - 25);
  };

  return (
    <div className={cn("flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">
              {pdfName}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        </div>
        
        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-xs text-muted-foreground w-12 text-center tabular-nums">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
            title="Download PDF"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* PDF View Area */}
      <div className="flex-1 overflow-auto bg-secondary/30 p-4">
        {pdfUrl ? (
          <iframe 
            src={pdfUrl}
            className="w-full h-full rounded-lg border border-border"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
            title={pdfName}
          />
        ) : (
          /* Mock PDF View */
          <div 
            className="mx-auto bg-card rounded-lg border border-border shadow-lg overflow-hidden"
            style={{ 
              width: `${Math.min(100, zoom)}%`, 
              maxWidth: '800px',
              minHeight: '600px'
            }}
          >
            <div className="p-8 sm:p-12">
              {/* Mock Document Header */}
              <div className="text-center mb-8 pb-6 border-b border-border">
                <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
                  CII Certificate in Insurance
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                  Award in General Insurance
                </h1>
                <p className="text-sm text-muted-foreground">
                  W01 Study Guide - Unit 1: Risk and Insurance
                </p>
              </div>

              {/* Mock Content */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-3">
                    Section A: The role of risk in insurance
                  </h2>
                  <div className="space-y-3">
                    <div className="h-3 bg-secondary/50 rounded w-full" />
                    <div className="h-3 bg-secondary/50 rounded w-11/12" />
                    <div className="h-3 bg-secondary/50 rounded w-10/12" />
                    <div className="h-3 bg-secondary/50 rounded w-full" />
                    <div className="h-3 bg-secondary/50 rounded w-9/12" />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium text-foreground mb-3">
                    Learning Objectives
                  </h3>
                  <ul className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div className="h-3 bg-secondary/50 rounded flex-1" style={{ width: `${85 - i * 8}%` }} />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <h4 className="text-sm font-medium text-primary mb-2">Key Definition</h4>
                  <div className="space-y-2">
                    <div className="h-3 bg-primary/10 rounded w-full" />
                    <div className="h-3 bg-primary/10 rounded w-10/12" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="h-3 bg-secondary/50 rounded w-full" />
                  <div className="h-3 bg-secondary/50 rounded w-11/12" />
                  <div className="h-3 bg-secondary/50 rounded w-full" />
                  <div className="h-3 bg-secondary/50 rounded w-8/12" />
                </div>
              </div>

              {/* Page Number */}
              <div className="text-center mt-8 pt-6 border-t border-border">
                <span className="text-sm text-muted-foreground tabular-nums">
                  Page {currentPage}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card shrink-0">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <form onSubmit={handleGoToPage} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Go to:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={goToPage}
            onChange={(e) => setGoToPage(e.target.value)}
            placeholder={String(currentPage)}
            className="w-14 px-2 py-1 text-xs text-center rounded-md border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-xs text-muted-foreground">/ {totalPages}</span>
        </form>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary text-muted-foreground hover:text-foreground"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
