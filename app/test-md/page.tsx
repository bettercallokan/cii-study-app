"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { Loader2 } from "lucide-react";

export default function TestMarkdownPage() {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      // Fetch W01, Chapter 1, first section with content_markdown
      const { data: course } = await supabase
        .from("courses")
        .select("id")
        .ilike("code", "w01")
        .single();

      if (!course) {
        setError("W01 course not found");
        setLoading(false);
        return;
      }

      const { data: chapter } = await supabase
        .from("chapters")
        .select("id, chapter_number")
        .eq("course_id", course.id)
        .order("order_index")
        .limit(1)
        .single();

      if (!chapter) {
        setError("Chapter not found");
        setLoading(false);
        return;
      }

      const { data: section, error: secErr } = await supabase
        .from("chapter_sections")
        .select("title, content_markdown")
        .eq("chapter_id", chapter.id)
        .not("content_markdown", "is", null)
        .order("order_index")
        .limit(1)
        .single();

      if (secErr || !section) {
        setError("No section with content_markdown found");
        setLoading(false);
        return;
      }

      const title =
        typeof section.title === "object" && section.title !== null
          ? (section.title as { en?: string }).en ?? String(section.title)
          : String(section.title);

      setSectionTitle(title);
      setMarkdown(section.content_markdown as string);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            TEST PAGE
          </span>
          <span className="text-xs text-muted-foreground">
            Markdown render verification — W01 Ch1 first section
          </span>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading content…</span>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {markdown && (
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <h1 className="text-xl font-semibold text-foreground mb-6">
              {sectionTitle}
            </h1>
            <MarkdownRenderer content={markdown} />
          </div>
        )}
      </div>
    </div>
  );
}
