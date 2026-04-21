"use client";

import {
  Download,
  FileText,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = pdfName + ".pdf";
    a.target = "_blank";
    a.click();
  };

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

        {pdfUrl && (
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors shrink-0"
            title="Download PDF"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden relative bg-secondary/30">
        {/* Loading */}
        {pdfLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">PDF yükleniyor…</p>
          </div>
        )}

        {/* Error */}
        {!pdfLoading && pdfError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <p className="text-sm text-destructive">{pdfError}</p>
          </div>
        )}

        {/* Empty — no file selected */}
        {!pdfLoading && !pdfError && !pdfUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                PDF seçilmedi
              </p>
              <p className="text-xs text-muted-foreground">
                Sol panelden bir PDF dosyası seçin.
              </p>
            </div>
          </div>
        )}

        {/* PDF iframe */}
        {!pdfLoading && !pdfError && pdfUrl && (
          <iframe
            key={pdfUrl}
            src={pdfUrl}
            className="w-full h-full border-none"
            title={pdfName}
          />
        )}
      </div>
    </div>
  );
}
