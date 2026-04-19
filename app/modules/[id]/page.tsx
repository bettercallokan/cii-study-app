import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Module } from "@/utils/supabase/types";

export const dynamic  = "force-dynamic";
export const revalidate = 0;

// ─── Supabase ─────────────────────────────────────────────────
function getServerSupabase() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon);
}

async function getModule(id: string): Promise<Module | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as Module;
}

// ─── Statik ders listesi (ilerleyen aşamada DB'den gelecek) ───
const STATIC_LESSONS = [
  {
    id: 1,
    title: "1. Temel Kavramlar",
    duration: "15 dk",
    active: true,
    completed: false,
  },
  {
    id: 2,
    title: "2. Tarihsel Gelişim",
    duration: "20 dk",
    active: false,
    completed: false,
  },
  {
    id: 3,
    title: "3. Uygulama Esasları",
    duration: "25 dk",
    active: false,
    completed: false,
  },
];

// ─── Sayfa Metadata ───────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mod = await getModule(id);
  const title = mod?.title?.tr || mod?.title?.en || "Modül";
  return { title: `${title} · CII W01` };
}

// ─── Bileşenler ───────────────────────────────────────────────

function SidebarHeader({ mod }: { mod: Module }) {
  const title = mod.title?.tr || mod.title?.en || "—";
  return (
    <div className="px-4 pb-4 border-b border-slate-800">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/25 shrink-0">
          <Layers className="w-4 h-4 text-brand-400" />
        </div>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">
          Modül
        </span>
      </div>
      <h2 className="text-sm font-semibold text-slate-100 leading-snug">
        {title}
      </h2>
      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
        <Clock className="w-3 h-3" />
        <span>{STATIC_LESSONS.length} ders · ~60 dk</span>
      </div>
    </div>
  );
}

function LessonItem({
  lesson,
  isFirst,
}: {
  lesson: (typeof STATIC_LESSONS)[number];
  isFirst: boolean;
}) {
  return (
    <li>
      <button
        className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 group
          ${
            lesson.active
              ? "bg-brand-600/15 border border-brand-500/25"
              : "hover:bg-slate-800/60 border border-transparent"
          }`}
      >
        {/* İkon */}
        <span
          className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-colors
            ${
              lesson.completed
                ? "bg-emerald-500/20 text-emerald-400"
                : lesson.active
                ? "bg-brand-600/20 text-brand-400"
                : "bg-slate-800 text-slate-600 group-hover:text-slate-400"
            }`}
        >
          {lesson.completed ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : lesson.active ? (
            <BookOpen className="w-3.5 h-3.5" />
          ) : (
            <Lock className="w-3 h-3" />
          )}
        </span>

        {/* Başlık */}
        <span
          className={`text-sm leading-snug flex-1 transition-colors
            ${
              lesson.active
                ? "text-slate-100 font-medium"
                : "text-slate-500 group-hover:text-slate-300"
            }`}
        >
          {lesson.title}
        </span>

        {lesson.active && (
          <ChevronRight className="w-3.5 h-3.5 text-brand-400 shrink-0" />
        )}
      </button>
    </li>
  );
}

function Sidebar({ mod }: { mod: Module }) {
  return (
    <aside className="lg:w-72 lg:shrink-0">
      <div className="lg:sticky lg:top-20 rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <SidebarHeader mod={mod} />
        <nav className="p-3">
          <p className="px-1 pb-2 text-xs font-medium text-slate-600 uppercase tracking-widest">
            Dersler
          </p>
          <ul className="space-y-1">
            {STATIC_LESSONS.map((lesson, i) => (
              <LessonItem key={lesson.id} lesson={lesson} isFirst={i === 0} />
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

function ProseContent({ mod }: { mod: Module }) {
  const description = mod.description?.tr || mod.description?.en || "";

  return (
    <div
      className="prose prose-invert prose-slate max-w-none
        prose-headings:font-semibold prose-headings:text-slate-100
        prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
        prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
        prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-[15px]
        prose-li:text-slate-400 prose-li:text-[15px]
        prose-strong:text-slate-200 prose-strong:font-semibold
        prose-code:text-brand-300 prose-code:bg-brand-950/50
        prose-code:rounded prose-code:px-1.5 prose-code:py-0.5
        prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
        prose-blockquote:border-brand-500/50 prose-blockquote:bg-brand-950/20
        prose-blockquote:rounded-r-xl prose-blockquote:py-1
        prose-blockquote:text-slate-400 prose-blockquote:not-italic
        prose-hr:border-slate-800"
    >
      {/* Modül açıklaması */}
      {description && <p className="lead text-slate-300 text-base">{description}</p>}

      <hr />

      <h2>Bu Derste Neler Öğreneceksiniz</h2>
      <ul>
        <li>
          Modülün temel kavramlarını ve anahtar terminolojisini öğrenin.
        </li>
        <li>
          Gerçek dünya uygulama örnekleriyle teorik bilgiyi pekiştirin.
        </li>
        <li>
          CII W01 sınav formatına uygun sorularla kendinizi test edin.
        </li>
      </ul>

      <h2>1. Temel Kavramlar</h2>
      <p>
        Sigorta sektörü, risk yönetiminin temel taşıdır. Bu dersin ilk
        bölümünde temel kavramlara odaklanacağız: risk transferi, hasar
        tazminatı ve sigortalanabilir menfaat ilkeleri.
      </p>
      <blockquote>
        <strong>Anahtar Kavram:</strong> Sigortalanabilir menfaat, bir kişinin
        sigortalanan şeyin var olmasından ekonomik bir çıkar elde ettiği veya
        kaybolmasından ekonomik zarara uğradığı durumu ifade eder.
      </blockquote>

      <h3>Risk Nedir?</h3>
      <p>
        Risk, gerçekleşmesi halinde kayba yol açabilecek belirsiz bir olayın
        gerçekleşme olasılığıdır. Sigorta bu belirsizliği, öngörülebilir
        maliyet olan{" "}
        <strong>prim</strong> ile değiştirir.
      </p>

      <h2>2. Tarihsel Gelişim</h2>
      <p>
        Modern sigortacılık; 17. yüzyıl Londra&apos;sında Lloyd&apos;s
        kahvehanesinde şekillenmeye başlamış, 19. ve 20. yüzyıllardaki
        yasal düzenlemelerle bugünkü kurumsal yapısına kavuşmuştur.
      </p>
      <p>
        Birleşik Krallık&apos;ta sigortacılığın yasal çerçevesi{" "}
        <strong>Insurance Act 2015</strong> ile köklü biçimde yenilenmiştir;
        bu kanun, adil sunum yükümlülüğünü ve garanti rejimini modernize
        etmiştir.
      </p>

      <h2>3. Uygulama Esasları</h2>
      <p>
        Teorik bilgiyi sınav başarısına dönüştürmek için pratik uygulama
        şarttır. Her bölüm sonunda yer alan mini testler, öğrenilen
        kavramların{" "}
        <code>know</code> veya <code>understand</code> düzeyinde ne ölçüde
        kavrandığını ölçer.
      </p>
    </div>
  );
}

// ─── Ana Sayfa Bileşeni ───────────────────────────────────────
export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mod = await getModule(id);

  if (!mod) notFound();

  const title = mod.title?.tr || mod.title?.en || "—";

  return (
    <div className="min-h-screen bg-slate-950">
      {/* ── Sticky Header ── */}
      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Geri dön</span>
          </Link>
          <span className="text-slate-700 select-none">/</span>
          <span className="text-sm text-slate-300 font-medium truncate">
            {title}
          </span>
        </div>
      </header>

      {/* ── İçerik ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modül başlığı alanı */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-brand-300 bg-brand-600/10 border border-brand-500/25 rounded-full px-3 py-1 mb-4">
            <Layers className="w-3.5 h-3.5" />
            CII W01 Müfredatı
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 tracking-tight text-balance leading-tight">
            {title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-600 bg-slate-900 border border-slate-800 rounded-full px-3 py-1">
              v{mod.version}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5" />
              {STATIC_LESSONS.length} ders
            </span>
          </div>
        </div>

        {/* ── Sidebar + İçerik ── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <Sidebar mod={mod} />

          {/* Prose içerik */}
          <article className="flex-1 min-w-0 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 lg:p-10">
            <ProseContent mod={mod} />
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8 text-center mt-12">
        <p className="text-xs text-slate-600">
          CII W01 Çalışma Platformu · Tüm hakları saklıdır
        </p>
      </footer>
    </div>
  );
}
