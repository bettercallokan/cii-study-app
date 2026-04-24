# Claude Console — CII Study App Projesi Devam Rehberi

Bu belge, Console'daki Workbench veya API üzerinden projeye devam edebilmen için gereken tüm bağlamı içerir.

---

## PROJENİN GENEL DURUMU

**Proje:** CII Study App — Next.js 15 + Supabase ile CII sınav hazırlık platformu  
**Kurslar:** W01 (Award in General Insurance), WUE (Insurance Underwriting), WCE (Insurance Claims Handling)  
**Kullanıcı rolü:** Non-coder, Claude Pro + Gemini Pro + Antigravity aboneliği var, Istanbul'dan çalışıyor

---

## DATABASE DURUMU

Supabase PostgreSQL üzerinde 7 ana tablo kurulu:

- `courses` — 3 kurs (W01, WUE, WCE)
- `learning_outcomes` — syllabus LO'ları
- `assessment_criteria` — AC'ler
- `indicative_contents` — IC'ler
- `chapters` — study text chapter'ları
- `chapter_sections` — study text section'ları (`content_text` TEXT + `summary_content` JSONB)
- `ic_section_map` — IC ↔ section bridge (many-to-many)

**Şu anki sayılar:**

| Kurs | LOs | ACs | ICs | Chapters | Sections | Mappings |
|------|-----|-----|-----|----------|----------|----------|
| W01 | 5 | 33 | 124 | 10 | 56 | 246 |
| WUE | 11 | 41 | 104 | 11 | 49 | 212 |
| WCE | 7 | 32 | 95 | 7 | 41 | 148 |

---

## ŞU ANA KADAR NE YAPILDI

1. Tüm kurslar için LO/AC/IC + Chapter/Section hiyerarşisi seed edildi
2. `ic_section_map` bridge tablosu dolu (WUE'deki 12 eksik mapping PDF'ten düzeltildi)
3. Gemini 2.5 Pro ile her kursun study text PDF'ten section metinleri JSON olarak çıkarıldı
4. Claude API (Sonnet 4.6) üzerinden her section için `summary_content` üretildi
5. HTML tool ile browser'dan API çağrıları yapıldı, çıktılar:
   - `W01_complete.json` + `W01_update.sql`
   - `WUE_complete.json` + `WUE_update.sql`
   - `WCE_complete.json` + `WCE_update.sql`

**Pending:** SQL dosyaları Supabase'e uygulanmadı. Kullanıcı bunu yapacak.

---

## SUMMARY_CONTENT JSON ŞEMASI

Her `chapter_sections.summary_content` alanı şu yapıda:

```json
{
  "summary": {
    "headline": "1-2 cümle section özü",
    "key_concepts": [
      {"term": "Term", "definition": "Definition", "vs": "Confusion pair veya null"}
    ],
    "must_know": ["Sınav odaklı kural/ayırt edici"]
  },
  "insights": [
    {"tag": "exam_bullet|exam_tip|exam_trap", "title": "Kısa başlık", "body": "Açıklama"}
  ]
}
```

---

## SONRAKİ ADIMLAR (ÖNCELİK SIRASINA GÖRE)

### 1. SQL'leri Supabase'e uygula
- Her kurs için üretilmiş SQL dosyasını Supabase SQL Editor'da çalıştır
- Doğrulama sorgusu:
```sql
SELECT
  c.code,
  COUNT(*) AS total,
  COUNT(cs.content_text) AS with_content,
  COUNT(cs.summary_content) AS with_summary
FROM chapter_sections cs
JOIN chapters ch ON ch.id = cs.chapter_id
JOIN courses c ON c.id = ch.course_id
GROUP BY c.code;
```

### 2. Frontend refactor
- Şu an `app/(main)/courses/[code]/page.tsx` ve `.../study/page.tsx` hard-coded `courseData` kullanıyor
- Sidebar: `chapters` + `chapter_sections` tablolarından çekilecek
- 3 tab yapısı:
  - **Content** → `chapter_sections.content_text`
  - **Summary** → `chapter_sections.summary_content.summary`
  - **Key Insights** → `chapter_sections.summary_content.insights` (tag'e göre filtreli)
- Course metadata (title, description, color) → `courses` tablosundan

### 3. Questions seeding
- Sorular IC bazlı — `indicative_contents.id` ile eşleşecek
- Many-to-many ilişki (bir soru birden fazla IC'yi test edebilir)
- LO/AC/IC ağırlıkları ile quiz üretimi

### 4. Staging tabloları temizle
```sql
DROP TABLE IF EXISTS syllabus_staging;
DROP TABLE IF EXISTS study_text_staging;
```

---

## WORKBENCH'TE NE YAPMAN GEREKEBİLİR

Workbench (console.anthropic.com/workbench) esas olarak **tek tek section kalite kontrolü** veya **yeni içerik üretme** için uygun. Toplu işlem için değil.

### Kullanım senaryoları

**Senaryo A: Bir section'ın summary'sini regenerate etmek**
1. Sistem prompt alanına ilgili `*_system_prompt_api.md` içeriğini yapıştır
2. User message alanına o section'ın `content_text`'ini yapıştır
3. Model: `claude-sonnet-4-5-20251022` (Sonnet 4.6)
4. Max tokens: 3000
5. Run → yeni JSON çıktı
6. SQL UPDATE ile Supabase'e yaz:

```sql
UPDATE chapter_sections
SET summary_content = '...'::jsonb
WHERE chapter_id = (
  SELECT ch.id FROM chapters ch
  JOIN courses c ON c.id = ch.course_id
  WHERE c.code = 'W01' AND ch.chapter_number = '1'
)
AND section_code = 'A';
```

**Senaryo B: Yeni bir kurs eklemek**
Sistem prompt'u o kursa göre adapte etmek gerekir (confusion pair'leri, terminoloji). Mevcut 3 sistem prompt'u örnek olarak kullanılabilir.

**Senaryo C: Quiz soruları üretmek**
Bunun için yeni bir sistem prompt'u tasarlanması gerekiyor. Input: IC'nin summary_content'i + content_text. Output: MCQ JSON.

---

## ÖNEMLİ DOSYALAR VE KONUM

Kullanıcının bilgisayarında bu dosyalar olmalı:

**Data files (yedek olarak sakla):**
- `W01_complete.json`
- `WUE_complete.json`
- `WCE_complete.json`

**System prompts (tekrar kullanım için):**
- `w01_system_prompt_api.md`
- `wue_system_prompt_api.md`
- `wce_system_prompt_api.md`

**SQL files:**
- `W01_update.sql` / `WUE_update.sql` / `WCE_update.sql` — Supabase'e uygulanacak

---

## KRİTİK HATIRLATMALAR

1. **API key güvenliği:** Kullanıldığı proje bitince hemen Revoke et
2. **JSON yedekleri:** Kaybedersen API'yi baştan çağırman gerekir (maliyet + zaman)
3. **Schema tutarlılığı:** Kolon adları `assessment_criteria_id` (s'li), `assessment_criterion_id` değil
4. **i18n:** JSONB alanlar ileride `{en: {...}, tr: {...}}` yapısına genişletilecek, şimdilik sadece EN
5. **Frontend regression prevention:** Proje kökünde `CLAUDE.md` dosyası var, refactor sırasında dikkat edilmesi gerekenler orada

---

## BANA NASIL HIZLI BAĞLAM VERİRSİN

Yeni bir sohbette bu belgeyi yükleyip şunu yaz:

*"CII Study App projesinde çalışıyorum. Ekteki rehberi oku, şu konuda yardım istiyorum: [konu]"*

Spesifik konular için ekte hangi dosyaların olması gerekiyor:

- **Frontend refactor için:** `CLAUDE.md` + mevcut `app/(main)/courses/[code]/page.tsx` + Supabase types
- **Quiz system için:** Bu rehber yeterli
- **Content düzeltme için:** İlgili `*_complete.json` + sistem prompt'u
- **Schema değişikliği için:** Bu rehber yeterli
