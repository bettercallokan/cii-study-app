"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { FileText, AlertCircle, Loader2, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function StudyPage() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const filePath = searchParams.get("file");

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!filePath) {
      setPdfUrl(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function generateSignedUrl() {
      setLoading(true);
      setError(null);
      setPdfUrl(null);

      const { data, error: urlError } = await supabase.storage
        .from("pdfs")
        .createSignedUrl(filePath as string, 3600);

      if (cancelled) return;

      if (urlError || !data?.signedUrl) {
        setError("Could not generate a link for this PDF. Please try again.");
      } else {
        setPdfUrl(data.signedUrl + "#page=1");
      }
      setLoading(false);
    }

    generateSignedUrl();

    return () => {
      cancelled = true;
    };
  }, [filePath]);

  const fileName = filePath
    ? filePath.split("/").pop()?.replace(/\.pdf$/i, "") ?? filePath
    : null;

  // Empty state — no file selected
  if (!filePath) {
    return (
      <div className="flex flex-col h-full min-h-screen bg-background">
        <div className="flex items-center gap-3 px-6 h-14 border-b border-border bg-card shrink-0">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Study</span>
          {params.code && (
            <span className="ml-1 text-xs text-muted-foreground">
              — {params.code}
            </span>
          )}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium text-foreground">
              Please select a module
            </p>
            <p className="text-sm text-muted-foreground">
              Choose a PDF from the sidebar to start studying.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 h-14 border-b border-border bg-card shrink-0">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          {fileName ?? "Study"}
        </span>
        {params.code && (
          <span className="ml-1 text-xs text-muted-foreground">
            — {params.code}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!loading && pdfUrl && (
          <iframe
            key={pdfUrl}
            src={pdfUrl}
            className="w-full h-full border-none"
            title={fileName ?? "PDF Viewer"}
          />
        )}
      </div>
    </div>
  );
}
