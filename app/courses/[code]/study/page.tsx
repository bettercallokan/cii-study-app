"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { FileText, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function StudyPage() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const filePath = searchParams.get("file");

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!filePath) {
      setError("No file specified.");
      setLoading(false);
      return;
    }

    const { data } = supabase.storage.from("pdfs").getPublicUrl(filePath);
    if (data?.publicUrl) {
      setPdfUrl(data.publicUrl);
    } else {
      setError("Could not load the PDF.");
    }
    setLoading(false);
  }, [filePath]);

  const fileName = filePath
    ? filePath.split("/").pop()?.replace(/\.pdf$/i, "") ?? filePath
    : null;

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
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-destructive">
            <AlertCircle className="w-6 h-6" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && pdfUrl && (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-none"
            title={fileName ?? "PDF Viewer"}
          />
        )}
      </div>
    </div>
  );
}
