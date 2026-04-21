"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  Download,
  FileText,
  Loader2,
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  pdfName?: string;
  pdfUrl?: string | null;
  pdfLoading?: boolean;
  pdfError?: string;
  className?: string;
}

export function PdfViewer({
  pdfName = "Study Guide",
  pdfUrl = null,
  pdfLoading = false,
  pdfError,
  className,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Strip fragment — react-pdf doesn't need #page=N
  const fileUrl = pdfUrl?.replace(/#.*$/, "") ?? null;

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Reset when a different PDF is loaded
  useEffect(() => {
    setCurrentPage(1);
    setNumPages(0);
  }, [fileUrl]);

  const goTo = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), numPages || 1));
  };

  const handleDownload = () => {
    if (!fileUrl) return;
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = pdfName + ".pdf";
    a.target = "_blank";
    a.click();
  };

  const showNav = !pdfLoading && !pdfError && !!fileUrl && numPages > 0;

  return (
    <div
      className={cn(
        "flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground truncate">
            {pdfName}
          </h2>
        </div>

        {fileUrl && (
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors shrink-0"
            title="Download PDF"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* PDF area */}
      <div ref={containerRef} className="flex-1 overflow-auto relative bg-secondary/30">
        {pdfLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading PDF…</p>
          </div>
        )}

        {!pdfLoading && pdfError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <p className="text-sm text-destructive">{pdfError}</p>
          </div>
        )}

        {!pdfLoading && !pdfError && !fileUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No PDF selected</p>
              <p className="text-xs text-muted-foreground">
                Select a PDF file from the left panel.
              </p>
            </div>
          </div>
        )}

        {fileUrl && !pdfLoading && !pdfError && containerWidth > 0 && (
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Loading PDF…</p>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
                <p className="text-sm text-destructive">Failed to load PDF.</p>
              </div>
            }
            className="flex justify-center"
          >
            <Page
              pageNumber={currentPage}
              width={containerWidth}
              renderTextLayer={true}
              renderAnnotationLayer={false}
            />
          </Document>
        )}
      </div>

      {/* Page navigation */}
      {showNav && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-card shrink-0">
          <button
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center justify-center gap-1.5 flex-1 h-11 rounded-xl bg-secondary text-sm font-medium text-foreground hover:bg-secondary/70 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <span className="text-sm font-medium text-muted-foreground tabular-nums whitespace-nowrap">
            {currentPage} / {numPages}
          </span>

          <button
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage >= numPages}
            className="flex items-center justify-center gap-1.5 flex-1 h-11 rounded-xl bg-secondary text-sm font-medium text-foreground hover:bg-secondary/70 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
