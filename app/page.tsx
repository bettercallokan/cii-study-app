import { createClient } from "@supabase/supabase-js";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  LayoutGrid,
  Layers,
} from "lucide-react";
import Link from "next/link";
import type { Module } from "@/utils/supabase/types";

// Her istekte sunucu tarafında render et, Vercel edge cache'i devre dışı bırak
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Server-side Supabase client (env değişkenlerini doğrudan okur)
function getServerSupabase() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon);
}

async function getModules(): Promise<Module[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Modules fetch error:", error.message);
    return [];
  }
  return (data as Module[]) ?? [];
}

// ─── Alt Bileşenler ───────────────────────────────────────────

function Header() {
  return (
    <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-500/30">
            <GraduationCap className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-100 tracking-wide">
              CII W01
            </span>
            <span className="hidden sm:inline text-slate-500 text-sm ml-2">
              Çalışma Platformu
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Aktif
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Arka plan ışıma efekti */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto text-center">
        {/* Rozet */}
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-600/10 px-4 py-1.5 text-xs font-medium text-brand-300 mb-6">
          <Layers className="w-3.5 h-3.5" />
          Chartered Insurance Institute · W01 Müfredatı
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-50 tracking-tight text-balance leading-tight">
          CII W01
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400 mt-1">
            Çalışma Platformu
          </span>
        </h1>

        <p className="mt-5 max-w-2xl mx-auto text-slate-400 text-lg leading-relaxed text-balance">
          Sigorta hukuku ve uygulaması sınavına hazırlık için yapılandırılmış
          modüller, aralıklı tekrar ve performans analitiği.
        </p>

        {/* İstatistikler */}
        <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm sm:max-w-lg mx-auto">
          {[
            { label: "Modül",   value: "9",   icon: LayoutGrid },
            { label: "Ders",    value: "40+", icon: BookOpen   },
            { label: "Soru",    value: "500+",icon: Layers     },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/50 py-4 px-2"
            >
              <Icon className="w-4 h-4 text-brand-400 mb-0.5" />
              <span className="text-xl font-bold text-slate-100">{value}</span>
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 mb-6">
        <BookOpen className="w-7 h-7 text-slate-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-300 mb-2">
        Henüz çalışma modülü eklenmedi
      </h3>
      <p className="text-slate-500 max-w-md text-sm leading-relaxed">
        Supabase üzerinden{" "}
        <code className="text-brand-400 bg-brand-950/50 rounded px-1 py-0.5 text-xs font-mono">
          modules
        </code>{" "}
        tablosuna ilk modülünü ekleyerek başlayabilirsin.
      </p>
    </div>
  );
}

function ModuleCard({ module, index }: { module: Module; index: number }) {
  const title = module.title?.tr || module.title?.en || "—";
  const description =
    module.description?.tr || module.description?.en || null;

  // Modül numarasına göre renk tonu (brand, indigo, violet döngüsü)
  const accentClasses = [
    "from-brand-600/20 border-brand-500/25 text-brand-400",
    "from-indigo-600/20 border-indigo-500/25 text-indigo-400",
    "from-violet-600/20 border-violet-500/25 text-violet-400",
  ][index % 3];

  return (
    <Link href={`/modules/${module.id}`} className="block">
    <article className="group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all duration-200 overflow-hidden cursor-pointer h-full">
      {/* Üst renk şeridi */}
      <div className={`h-1 w-full bg-gradient-to-r ${accentClasses.split(" ")[0]} via-transparent to-transparent`} />

      <div className="flex flex-col flex-1 p-5 sm:p-6">
        {/* Numara rozeti */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${accentClasses.split(" ")[0]} border ${accentClasses.split(" ")[1]} shrink-0`}
          >
            <span className={`text-sm font-bold ${accentClasses.split(" ")[2]}`}>
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-800/60 rounded-full px-2.5 py-1">
            <span>v{module.version}</span>
          </div>
        </div>

        {/* Başlık */}
        <h2 className="text-base font-semibold text-slate-100 group-hover:text-white leading-snug mb-2 transition-colors">
          {title}
        </h2>

        {/* Açıklama */}
        {description && (
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 flex-1">
            {description}
          </p>
        )}

        {/* CTA */}
        <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-slate-500 group-hover:text-brand-400 transition-colors">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Modülü incele</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </article>
    </Link>
  );
}

function ModuleGrid({ modules }: { modules: Module[] }) {
  if (modules.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {modules.map((mod, i) => (
        <ModuleCard key={mod.id} module={mod} index={i} />
      ))}
    </div>
  );
}

function SectionTitle({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">
          Çalışma Modülleri
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {count > 0
            ? `${count} modül · W01 müfredatı`
            : "Henüz modül eklenmedi"}
        </p>
      </div>
      {count > 0 && (
        <span className="text-xs font-medium text-slate-500 bg-slate-900 border border-slate-800 rounded-full px-3 py-1">
          {count} modül
        </span>
      )}
    </div>
  );
}

// ─── Ana Sayfa (Server Component) ─────────────────────────────

export default async function HomePage() {
  const modules = await getModules();

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main>
        <Hero />
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <SectionTitle count={modules.length} />
          <ModuleGrid modules={modules} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8 text-center">
        <p className="text-xs text-slate-600">
          CII W01 Çalışma Platformu · Tüm hakları saklıdır
        </p>
      </footer>
    </div>
  );
}
