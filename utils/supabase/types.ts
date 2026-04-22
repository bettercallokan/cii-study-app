export type Module = {
  id: string;
  title: { en: string; tr: string };
  description: { en: string; tr: string };
  order_index: number;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
};

export type SummaryLangContent = {
  content: {
    overview: string;
    key_points: string[];
    study_note: string;
  };
  summary_cards: { title: string; body: string }[];
  insights: { tag: string; title: string; body: string; exam_critical: boolean }[];
};

export type Lesson = {
  id: string;
  module_id: string;
  title: { en: string; tr: string };
  content: { en?: string; tr?: string };
  summary_content: { en?: SummaryLangContent; tr?: SummaryLangContent };
  knowledge_level: "know" | "understand";
  order_index: number;
  estimated_duration_minutes: number | null;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
};

export type Quiz = {
  id: string;
  title: { en: string; tr?: string };
  quiz_type: "mini_test" | "full_simulation";
  module_id: string | null;
  lesson_id: string | null;
  question_count: number;
  time_limit_minutes: number | null;
  pass_threshold_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
