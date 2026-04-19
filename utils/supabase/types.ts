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
