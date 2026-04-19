-- ============================================================
-- CII Study App — Supabase PostgreSQL Schema
-- Çok Dilli (EN/TR) | Row Level Security | SM-2 Aralıklı Tekrar
-- Bu dosyanın tamamını Supabase SQL Editor'e yapıştırabilirsiniz.
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. EXTENSIONS
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- ilerleyen sürümde tam-metin arama için


-- ─────────────────────────────────────────────────────────────
-- 2. ENUM TİPLER
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN CREATE TYPE public.language_code    AS ENUM ('en', 'tr');           EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.knowledge_level  AS ENUM ('know', 'understand'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.quiz_type        AS ENUM ('mini_test', 'full_simulation'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ─────────────────────────────────────────────────────────────
-- 3. YARDIMCI FONKSİYON: updated_at otomatik güncelleme
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ─────────────────────────────────────────────────────────────
-- 4. TABLO: profiles
--    Supabase auth.users ile 1-1 ilişki.
--    subscription_tier → ödeme sistemi entegrasyonu için hazır.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                     UUID                 PRIMARY KEY
                         REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name              TEXT,
  preferred_language     public.language_code NOT NULL DEFAULT 'en',
  target_exam_date       DATE,
  -- Erişilebilirlik ayarları: yüksek kontrast, yazı boyutu, hareket azalt, ekran okuyucu
  accessibility_settings JSONB                NOT NULL DEFAULT '{
    "high_contrast": false,
    "font_size"    : "medium",
    "reduce_motion": false,
    "screen_reader": false
  }'::jsonb,
  -- Ödeme entegrasyonu için yer tutucu; Stripe vb. ile genişletilebilir
  subscription_tier      TEXT                 NOT NULL DEFAULT 'free'
                         CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
  is_admin               BOOLEAN              NOT NULL DEFAULT FALSE,
  created_at             TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 5. TABLO: modules
--    title / description → JSONB: {"en": "...", "tr": "..."}
--    is_active + version → müfredat güncelleme desteği
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.modules (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       JSONB       NOT NULL,
  description JSONB       NOT NULL DEFAULT '{}'::jsonb,
  order_index INTEGER     NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  version     INTEGER     NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- En az İngilizce başlık zorunlu; Türkçe de zorunlu
  CONSTRAINT chk_modules_title_en CHECK (title ? 'en'),
  CONSTRAINT chk_modules_title_tr CHECK (title ? 'tr')
);

CREATE OR REPLACE TRIGGER trg_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 6. TABLO: lessons
--    content, summary_content → EN/TR JSONB
--    knowledge_level → 'know' | 'understand' (CII müfredatı)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lessons (
  id                         UUID                    PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id                  UUID                    NOT NULL
                             REFERENCES public.modules(id) ON DELETE CASCADE,
  title                      JSONB                   NOT NULL,
  -- Örnek: {"en": "What is Insurance?", "tr": "Sigorta Nedir?"}
  content                    JSONB                   NOT NULL DEFAULT '{}'::jsonb,
  -- Örnek: {"en": "<tam ders metni>", "tr": "<tam ders metni>"}
  summary_content            JSONB                   NOT NULL DEFAULT '{}'::jsonb,
  -- Örnek: {"en": "Key points: ...", "tr": "Temel noktalar: ..."}
  knowledge_level            public.knowledge_level  NOT NULL DEFAULT 'know',
  order_index                INTEGER                 NOT NULL DEFAULT 0,
  estimated_duration_minutes INTEGER                          DEFAULT 15,
  is_active                  BOOLEAN                 NOT NULL DEFAULT TRUE,
  version                    INTEGER                 NOT NULL DEFAULT 1,
  created_at                 TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_lessons_title_en CHECK (title ? 'en'),
  CONSTRAINT chk_lessons_title_tr CHECK (title ? 'tr')
);

CREATE OR REPLACE TRIGGER trg_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 7. TABLO: bookmarks
--    Favori işaretleme + okuma ilerlemesi tek tabloda.
--    last_position: kaydırma yüzdesi ve bölüm kimliği saklanır.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id)     ON DELETE CASCADE,
  lesson_id     UUID        NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_favorite   BOOLEAN     NOT NULL DEFAULT FALSE,
  is_completed  BOOLEAN     NOT NULL DEFAULT FALSE,
  last_position JSONB       NOT NULL DEFAULT '{}'::jsonb,
  -- Örnek: {"scroll_pct": 42, "section_id": "sec-3", "read_at": "2024-01-15T10:30:00Z"}
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

CREATE OR REPLACE TRIGGER trg_bookmarks_updated_at
  BEFORE UPDATE ON public.bookmarks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 8. TABLO: flashcards
--    front / back → EN/TR JSONB; tags → dizi etiket
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.flashcards (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id  UUID        REFERENCES public.modules(id)  ON DELETE SET NULL,
  lesson_id  UUID        REFERENCES public.lessons(id)  ON DELETE SET NULL,
  front      JSONB       NOT NULL,
  -- Örnek: {"en": "Define indemnity", "tr": "Tazminat ilkesini tanımlayın"}
  back       JSONB       NOT NULL,
  -- Örnek: {"en": "Indemnity restores the insured...", "tr": "Tazminat ilkesi kişiyi..."}
  tags       TEXT[]      NOT NULL DEFAULT '{}',
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_flashcards_front_en CHECK (front ? 'en'),
  CONSTRAINT chk_flashcards_back_en  CHECK (back  ? 'en')
);

CREATE OR REPLACE TRIGGER trg_flashcards_updated_at
  BEFORE UPDATE ON public.flashcards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 9. TABLO: flashcard_reviews  (SM-2 durum makinesi)
--    ease_factor  : zorluk katsayısı (min 1.30, varsayılan 2.50)
--    interval_days: bir sonraki tekrara kadar gün sayısı
--    repetitions  : art arda başarılı tekrar sayısı
--    last_quality : 0=sıfırlama, 3=zor doğru, 5=mükemmel
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.flashcard_reviews (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID         NOT NULL REFERENCES auth.users(id)         ON DELETE CASCADE,
  flashcard_id     UUID         NOT NULL REFERENCES public.flashcards(id)  ON DELETE CASCADE,
  ease_factor      NUMERIC(4,2) NOT NULL DEFAULT 2.50 CHECK (ease_factor   >= 1.30),
  interval_days    INTEGER      NOT NULL DEFAULT 1    CHECK (interval_days >= 1),
  repetitions      INTEGER      NOT NULL DEFAULT 0    CHECK (repetitions   >= 0),
  last_quality     SMALLINT              CHECK (last_quality BETWEEN 0 AND 5),
  next_review_date DATE         NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, flashcard_id)
);

CREATE OR REPLACE TRIGGER trg_fc_reviews_updated_at
  BEFORE UPDATE ON public.flashcard_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 10. TABLO: questions
--     options  → JSONB dizi; her seçeneğe distractor_explanation dahil
--     Örnek options yapısı:
--     [
--       {
--         "en": "Indemnity",  "tr": "Tazminat",
--         "is_correct": true,
--         "distractor_explanation": {"en": null, "tr": null}
--       },
--       {
--         "en": "Profit",  "tr": "Kâr",
--         "is_correct": false,
--         "distractor_explanation": {
--           "en": "Insurance is not designed for profit",
--           "tr": "Sigorta kâr amacı gütmez"
--         }
--       }
--     ]
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questions (
  id                   UUID                    PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id            UUID                    REFERENCES public.modules(id)  ON DELETE SET NULL,
  lesson_id            UUID                    REFERENCES public.lessons(id)  ON DELETE SET NULL,
  question_text        JSONB                   NOT NULL,
  -- Örnek: {"en": "Which of the following is a principle...", "tr": "Aşağıdakilerden hangisi..."}
  options              JSONB                   NOT NULL,
  correct_option_index SMALLINT                NOT NULL CHECK (correct_option_index >= 0),
  explanation          JSONB                   NOT NULL DEFAULT '{}'::jsonb,
  -- Doğru cevap açıklaması: {"en": "The correct answer is...", "tr": "Doğru cevap şudur..."}
  difficulty           public.difficulty_level NOT NULL DEFAULT 'medium',
  knowledge_level      public.knowledge_level  NOT NULL DEFAULT 'know',
  is_active            BOOLEAN                 NOT NULL DEFAULT TRUE,
  version              INTEGER                 NOT NULL DEFAULT 1,
  created_at           TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_questions_text_en     CHECK (question_text ? 'en'),
  CONSTRAINT chk_questions_options_arr CHECK (jsonb_typeof(options) = 'array')
);

CREATE OR REPLACE TRIGGER trg_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 11. TABLO: quizzes
--     quiz_type: 'mini_test' veya 'full_simulation' (100 soru)
--     full_simulation için question_count = 100 kısıtı eklendi
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quizzes (
  id                        UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                     JSONB            NOT NULL,
  -- {"en": "Module 1 Mini Test", "tr": "Modül 1 Mini Testi"}
  quiz_type                 public.quiz_type NOT NULL DEFAULT 'mini_test',
  module_id                 UUID             REFERENCES public.modules(id)  ON DELETE SET NULL,
  lesson_id                 UUID             REFERENCES public.lessons(id)  ON DELETE SET NULL,
  question_count            INTEGER          NOT NULL DEFAULT 10,
  time_limit_minutes        INTEGER,         -- NULL = süre sınırı yok
  pass_threshold_percentage INTEGER          NOT NULL DEFAULT 70
                            CHECK (pass_threshold_percentage BETWEEN 1 AND 100),
  is_active                 BOOLEAN          NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_quizzes_title_en CHECK (title ? 'en'),
  -- Simülasyon sınavı tam 100 sorudan oluşmalı
  CONSTRAINT chk_quizzes_sim_100  CHECK (quiz_type != 'full_simulation' OR question_count = 100)
);

CREATE OR REPLACE TRIGGER trg_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 12. TABLO: quiz_questions  (bağlantı tablosu: quiz ↔ question)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id     UUID    NOT NULL REFERENCES public.quizzes(id)   ON DELETE CASCADE,
  question_id UUID    NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  UNIQUE (quiz_id, question_id)
);


-- ─────────────────────────────────────────────────────────────
-- 13. TABLO: quiz_attempts
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id)     ON DELETE CASCADE,
  quiz_id            UUID        NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score_percentage   NUMERIC(5,2),
  total_questions    INTEGER     NOT NULL DEFAULT 0,
  correct_count      INTEGER     NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER,
  is_completed       BOOLEAN     NOT NULL DEFAULT FALSE,
  completed_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────────────────────
-- 14. TABLO: quiz_answers  (soru bazlı ayrıntılı log)
--     selected_option_index NULL → soru atlandı
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id            UUID        NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id           UUID        NOT NULL REFERENCES public.questions(id)     ON DELETE CASCADE,
  selected_option_index SMALLINT,
  is_correct            BOOLEAN,
  time_taken_seconds    INTEGER,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (attempt_id, question_id)
);


-- ─────────────────────────────────────────────────────────────
-- 15. TABLO: user_metrics  (kullanıcı başına toplu istatistik)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_metrics (
  id                        UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID        NOT NULL UNIQUE
                            REFERENCES auth.users(id) ON DELETE CASCADE,
  total_questions_attempted INTEGER     NOT NULL DEFAULT 0,
  total_correct_answers     INTEGER     NOT NULL DEFAULT 0,
  total_study_time_minutes  INTEGER     NOT NULL DEFAULT 0,
  total_flashcards_reviewed INTEGER     NOT NULL DEFAULT 0,
  streak_days               INTEGER     NOT NULL DEFAULT 0,
  longest_streak_days       INTEGER     NOT NULL DEFAULT 0,
  last_activity_date        DATE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_user_metrics_updated_at
  BEFORE UPDATE ON public.user_metrics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 16. INDEX'LER
--     RLS politikaları her zaman user_id ile filtreler;
--     bu nedenle user_id içeren bileşik indeksler kritik önemdedir.
-- ─────────────────────────────────────────────────────────────

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_language     ON public.profiles (preferred_language);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles (subscription_tier);

-- modules
CREATE INDEX IF NOT EXISTS idx_modules_active_order  ON public.modules (is_active, order_index);

-- lessons
CREATE INDEX IF NOT EXISTS idx_lessons_module_order  ON public.lessons (module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_active        ON public.lessons (is_active);
CREATE INDEX IF NOT EXISTS idx_lessons_knowledge     ON public.lessons (knowledge_level);

-- bookmarks — RLS kritik: user_id her zaman ilk koşul
CREATE INDEX IF NOT EXISTS idx_bookmarks_user          ON public.bookmarks (user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_lesson   ON public.bookmarks (user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_fav      ON public.bookmarks (user_id, is_favorite)
  WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_complete ON public.bookmarks (user_id, is_completed);

-- flashcards
CREATE INDEX IF NOT EXISTS idx_flashcards_lesson ON public.flashcards (lesson_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_module ON public.flashcards (module_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_active ON public.flashcards (is_active);
CREATE INDEX IF NOT EXISTS idx_flashcards_tags   ON public.flashcards USING GIN (tags);

-- flashcard_reviews — RLS kritik
CREATE INDEX IF NOT EXISTS idx_fc_reviews_user_next ON public.flashcard_reviews (user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_fc_reviews_card      ON public.flashcard_reviews (flashcard_id);

-- questions
CREATE INDEX IF NOT EXISTS idx_questions_module    ON public.questions (module_id);
CREATE INDEX IF NOT EXISTS idx_questions_lesson    ON public.questions (lesson_id);
CREATE INDEX IF NOT EXISTS idx_questions_diff_know ON public.questions (difficulty, knowledge_level);
CREATE INDEX IF NOT EXISTS idx_questions_active    ON public.questions (is_active);

-- quizzes
CREATE INDEX IF NOT EXISTS idx_quizzes_module ON public.quizzes (module_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_type   ON public.quizzes (quiz_type);
CREATE INDEX IF NOT EXISTS idx_quizzes_active ON public.quizzes (is_active);

-- quiz_questions
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz  ON public.quiz_questions (quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quest ON public.quiz_questions (question_id);

-- quiz_attempts — RLS kritik
CREATE INDEX IF NOT EXISTS idx_attempts_user           ON public.quiz_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_quiz      ON public.quiz_attempts (user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_completed ON public.quiz_attempts (user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_attempts_created_desc   ON public.quiz_attempts (created_at DESC);

-- quiz_answers — RLS attempt_id üzerinden sağlanır
CREATE INDEX IF NOT EXISTS idx_answers_attempt  ON public.quiz_answers (attempt_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON public.quiz_answers (question_id);
CREATE INDEX IF NOT EXISTS idx_answers_correct  ON public.quiz_answers (is_correct);

-- user_metrics — RLS kritik
CREATE INDEX IF NOT EXISTS idx_user_metrics_user ON public.user_metrics (user_id);


-- ─────────────────────────────────────────────────────────────
-- 17. VIEW: weak_topics_analysis
--     security_invoker = on → quiz_attempts RLS otomatik uygulanır;
--     kullanıcı yalnızca kendi verilerini görür.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.weak_topics_analysis
WITH (security_invoker = on)
AS
SELECT
  qat.user_id,
  q.module_id,
  q.lesson_id,
  m.title                                                                         AS module_title,
  l.title                                                                         AS lesson_title,
  q.difficulty,
  q.knowledge_level,
  COUNT(*)                                                                        AS total_attempts,
  SUM(CASE WHEN qa.is_correct = TRUE  THEN 1 ELSE 0 END)                         AS correct_count,
  SUM(CASE WHEN COALESCE(qa.is_correct, FALSE) = FALSE THEN 1 ELSE 0 END)        AS incorrect_count,
  ROUND(
    100.0 * SUM(CASE WHEN qa.is_correct = TRUE THEN 1 ELSE 0 END)
           / NULLIF(COUNT(*), 0),
    2
  )                                                                               AS accuracy_pct
FROM  public.quiz_answers  qa
JOIN  public.quiz_attempts qat ON qat.id = qa.attempt_id
JOIN  public.questions      q  ON q.id   = qa.question_id
LEFT JOIN public.modules    m  ON m.id   = q.module_id
LEFT JOIN public.lessons    l  ON l.id   = q.lesson_id
WHERE qat.is_completed = TRUE
GROUP BY
  qat.user_id,
  q.module_id,
  q.lesson_id,
  m.title,
  l.title,
  q.difficulty,
  q.knowledge_level;


-- ─────────────────────────────────────────────────────────────
-- 18. FONKSİYON: apply_sm2
--     SuperMemo-2 algoritmasını uygular ve flashcard_reviews
--     satırını günceller. Yalnızca kendi kartlarını güncelleyebilir.
--
--     Kullanım:
--       SELECT * FROM public.apply_sm2(auth.uid(), '<flashcard_id>', 4::smallint);
--
--     quality değerleri:
--       0 = tamamen unutuldu (sıfırlama)
--       1 = yanlış, doğru hatırlandı
--       2 = yanlış, ciddi hata
--       3 = doğru ama zorlandı
--       4 = doğru, küçük duraklamayla
--       5 = mükemmel, anında hatırlama
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.apply_sm2(
  p_user_id      UUID,
  p_flashcard_id UUID,
  p_quality      SMALLINT
)
-- SETOF kullanılır: RETURNS <tablo_adı> Supabase'de relation hatası verir
RETURNS SETOF public.flashcard_reviews
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- Satır tipi değişken yerine scalar değişkenler kullanılır (42P01 hatasını önler)
  v_ef   NUMERIC(4,2);
  v_int  INTEGER;
  v_reps INTEGER;
BEGIN
  -- Güvenlik: kullanıcı yalnızca kendi kartlarını güncelleyebilir
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'permission denied: cannot update another user''s review';
  END IF;

  IF p_quality NOT BETWEEN 0 AND 5 THEN
    RAISE EXCEPTION 'quality 0-5 arasında olmalı, gelen değer: %', p_quality;
  END IF;

  -- İlk tekrar ise başlangıç satırını oluştur
  INSERT INTO public.flashcard_reviews (user_id, flashcard_id)
  VALUES (p_user_id, p_flashcard_id)
  ON CONFLICT (user_id, flashcard_id) DO NOTHING;

  -- Mevcut SM-2 durumunu scalar değişkenlere yükle
  SELECT ease_factor, interval_days, repetitions
  INTO   v_ef,        v_int,         v_reps
  FROM   public.flashcard_reviews
  WHERE  user_id = p_user_id AND flashcard_id = p_flashcard_id;

  -- SM-2 çekirdek mantığı
  IF p_quality >= 3 THEN
    -- Doğru yanıt: aralığı artır
    IF v_reps = 0 THEN
      v_int := 1;
    ELSIF v_reps = 1 THEN
      v_int := 6;
    ELSE
      v_int := CEIL(v_int * v_ef)::INTEGER;
    END IF;
    v_reps := v_reps + 1;
  ELSE
    -- Yanlış yanıt: aralık ve tekrar sayısını sıfırla
    v_reps := 0;
    v_int  := 1;
  END IF;

  -- Ease factor güncelleme: EF' = EF + (0.1 − (5−q) × (0.08 + (5−q) × 0.02))
  v_ef := v_ef + (0.1 - (5 - p_quality) * (0.08 + (5 - p_quality) * 0.02));
  IF v_ef < 1.30 THEN v_ef := 1.30; END IF;  -- SM-2 spesifikasyonu: minimum 1.30

  UPDATE public.flashcard_reviews
  SET
    ease_factor      = v_ef,
    interval_days    = v_int,
    repetitions      = v_reps,
    last_quality     = p_quality,
    next_review_date = CURRENT_DATE + v_int,
    last_reviewed_at = NOW()
  WHERE user_id = p_user_id AND flashcard_id = p_flashcard_id;

  -- RETURNING INTO yerine ayrı SELECT; RETURN QUERY ile satırı döndür
  RETURN QUERY
    SELECT * FROM public.flashcard_reviews
    WHERE  user_id = p_user_id AND flashcard_id = p_flashcard_id;
END;
$$;

REVOKE ALL     ON FUNCTION public.apply_sm2(UUID, UUID, SMALLINT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.apply_sm2(UUID, UUID, SMALLINT) TO authenticated;


-- ─────────────────────────────────────────────────────────────
-- 19. FONKSİYON + TRIGGER: yeni kullanıcı kaydında profil oluştur
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(
      (NEW.raw_user_meta_data->>'preferred_language')::public.language_code,
      'en'
    )
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_metrics (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────────────────────────
-- 20. ROW LEVEL SECURITY — tüm tablolarda etkinleştir
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_metrics      ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────
-- 21. RLS POLİTİKALARI — profiles
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles: own read"   ON public.profiles;
DROP POLICY IF EXISTS "profiles: own insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles: own update" ON public.profiles;

CREATE POLICY "profiles: own read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: own insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: own update"
  ON public.profiles FOR UPDATE
  USING     (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ─────────────────────────────────────────────────────────────
-- 22. RLS POLİTİKALARI — içerik tabloları (modules, lessons…)
--     Okuma: tüm oturum açmış kullanıcılar (yalnızca is_active kayıtlar)
--     Yazma: is_admin = TRUE olan kullanıcılar
--     NOT: Backend/admin işlemleri için service_role anahtarı RLS'i atlar.
-- ─────────────────────────────────────────────────────────────

-- modules
DROP POLICY IF EXISTS "modules: read active" ON public.modules;
DROP POLICY IF EXISTS "modules: admin write" ON public.modules;

CREATE POLICY "modules: read active"
  ON public.modules FOR SELECT
  USING (is_active = TRUE AND auth.uid() IS NOT NULL);

CREATE POLICY "modules: admin write"
  ON public.modules FOR ALL
  USING     (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

-- lessons
DROP POLICY IF EXISTS "lessons: read active" ON public.lessons;
DROP POLICY IF EXISTS "lessons: admin write" ON public.lessons;

CREATE POLICY "lessons: read active"
  ON public.lessons FOR SELECT
  USING (is_active = TRUE AND auth.uid() IS NOT NULL);

CREATE POLICY "lessons: admin write"
  ON public.lessons FOR ALL
  USING     (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

-- flashcards
DROP POLICY IF EXISTS "flashcards: read active" ON public.flashcards;
DROP POLICY IF EXISTS "flashcards: admin write" ON public.flashcards;

CREATE POLICY "flashcards: read active"
  ON public.flashcards FOR SELECT
  USING (is_active = TRUE AND auth.uid() IS NOT NULL);

CREATE POLICY "flashcards: admin write"
  ON public.flashcards FOR ALL
  USING     (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

-- questions
DROP POLICY IF EXISTS "questions: read active" ON public.questions;
DROP POLICY IF EXISTS "questions: admin write" ON public.questions;

CREATE POLICY "questions: read active"
  ON public.questions FOR SELECT
  USING (is_active = TRUE AND auth.uid() IS NOT NULL);

CREATE POLICY "questions: admin write"
  ON public.questions FOR ALL
  USING     (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

-- quizzes
DROP POLICY IF EXISTS "quizzes: read active" ON public.quizzes;
DROP POLICY IF EXISTS "quizzes: admin write" ON public.quizzes;

CREATE POLICY "quizzes: read active"
  ON public.quizzes FOR SELECT
  USING (is_active = TRUE AND auth.uid() IS NOT NULL);

CREATE POLICY "quizzes: admin write"
  ON public.quizzes FOR ALL
  USING     (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

-- quiz_questions
DROP POLICY IF EXISTS "quiz_questions: read"        ON public.quiz_questions;
DROP POLICY IF EXISTS "quiz_questions: admin write" ON public.quiz_questions;

CREATE POLICY "quiz_questions: read"
  ON public.quiz_questions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "quiz_questions: admin write"
  ON public.quiz_questions FOR ALL
  USING     (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));


-- ─────────────────────────────────────────────────────────────
-- 23. RLS POLİTİKALARI — bookmarks
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "bookmarks: own select" ON public.bookmarks;
DROP POLICY IF EXISTS "bookmarks: own insert" ON public.bookmarks;
DROP POLICY IF EXISTS "bookmarks: own update" ON public.bookmarks;
DROP POLICY IF EXISTS "bookmarks: own delete" ON public.bookmarks;

CREATE POLICY "bookmarks: own select"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "bookmarks: own insert"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookmarks: own update"
  ON public.bookmarks FOR UPDATE
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookmarks: own delete"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- 24. RLS POLİTİKALARI — flashcard_reviews
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "fc_reviews: own select" ON public.flashcard_reviews;
DROP POLICY IF EXISTS "fc_reviews: own insert" ON public.flashcard_reviews;
DROP POLICY IF EXISTS "fc_reviews: own update" ON public.flashcard_reviews;

CREATE POLICY "fc_reviews: own select"
  ON public.flashcard_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "fc_reviews: own insert"
  ON public.flashcard_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "fc_reviews: own update"
  ON public.flashcard_reviews FOR UPDATE
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- 25. RLS POLİTİKALARI — quiz_attempts
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "attempts: own select" ON public.quiz_attempts;
DROP POLICY IF EXISTS "attempts: own insert" ON public.quiz_attempts;
DROP POLICY IF EXISTS "attempts: own update" ON public.quiz_attempts;

CREATE POLICY "attempts: own select"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "attempts: own insert"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "attempts: own update"
  ON public.quiz_attempts FOR UPDATE
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- 26. RLS POLİTİKALARI — quiz_answers  (sahiplik attempt üzerinden)
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "answers: own select" ON public.quiz_answers;
DROP POLICY IF EXISTS "answers: own insert" ON public.quiz_answers;

CREATE POLICY "answers: own select"
  ON public.quiz_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts a
      WHERE a.id = attempt_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "answers: own insert"
  ON public.quiz_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts a
      WHERE a.id = attempt_id AND a.user_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────────────────────
-- 27. RLS POLİTİKALARI — user_metrics
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "metrics: own select" ON public.user_metrics;
DROP POLICY IF EXISTS "metrics: own insert" ON public.user_metrics;
DROP POLICY IF EXISTS "metrics: own update" ON public.user_metrics;

CREATE POLICY "metrics: own select"
  ON public.user_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "metrics: own insert"
  ON public.user_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "metrics: own update"
  ON public.user_metrics FOR UPDATE
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- 28. GRANT'LAR
--     GRANT tablo ayrıcalığını verir; RLS hangi satırlara
--     erişileceğini kısıtlar. Yönetici işlemler için
--     service_role anahtarı kullanılır (RLS'i atlar).
-- ─────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- İçerik tabloları: tüm DML yetkisi; RLS yönetici olmayanları SELECT'le sınırlar
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modules         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcards      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quizzes         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_questions  TO authenticated;

-- Kullanıcı verisi: DML; RLS kendi satırlarla sınırlar
GRANT SELECT, INSERT, UPDATE         ON public.profiles          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookmarks         TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON public.flashcard_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON public.quiz_attempts     TO authenticated;
GRANT SELECT, INSERT                 ON public.quiz_answers      TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON public.user_metrics      TO authenticated;

-- View
GRANT SELECT ON public.weak_topics_analysis TO authenticated;


-- ============================================================
-- ŞEMA TAMAMLANDI
-- ─────────────────────────────────────────────────────────────
-- Tablolar   : profiles, modules, lessons, bookmarks,
--              flashcards, flashcard_reviews,
--              questions, quizzes, quiz_questions,
--              quiz_attempts, quiz_answers, user_metrics
-- View       : weak_topics_analysis  (security_invoker)
-- Fonksiyonlar: apply_sm2  (SM-2 algoritması)
--               handle_new_user  (kayıt tetikleyicisi)
-- ============================================================
