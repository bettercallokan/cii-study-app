"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  ClipboardList,
  BarChart3,
  GraduationCap,
  Settings,
  LogOut,
  FileText,
  ChevronRight,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface PdfFile {
  name: string;
  id: string | null;
}

interface CourseFolder {
  name: string;
  files: PdfFile[];
  isOpen: boolean;
  isLoading: boolean;
  loaded: boolean;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Flashcards", href: "/flashcards", icon: Layers },
  { name: "Practice Exams", href: "/practice-exams", icon: ClipboardList },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const bottomNav = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [folders, setFolders] = useState<CourseFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  useEffect(() => {
    async function fetchFolders() {
      setLoadingFolders(true);
      const { data, error } = await supabase.storage.from("pdfs").list("", {
        limit: 100,
        sortBy: { column: "name", order: "asc" },
      });
      if (!error && data) {
        setFolders(
          data
            .filter((item) => item.id === null) // folders have null id
            .map((item) => ({
              name: item.name,
              files: [],
              isOpen: false,
              isLoading: false,
              loaded: false,
            }))
        );
      }
      setLoadingFolders(false);
    }
    fetchFolders();
  }, []);

  const toggleFolder = async (folderName: string) => {
    const folder = folders.find((f) => f.name === folderName);
    if (!folder) return;

    const willOpen = !folder.isOpen;

    setFolders((prev) =>
      prev.map((f) =>
        f.name === folderName
          ? { ...f, isOpen: willOpen, isLoading: willOpen && !f.loaded }
          : f
      )
    );

    if (willOpen && !folder.loaded) {
      const { data, error } = await supabase.storage
        .from("pdfs")
        .list(folderName, {
          limit: 100,
          sortBy: { column: "name", order: "asc" },
        });

      setFolders((prev) =>
        prev.map((f) =>
          f.name === folderName
            ? {
                ...f,
                files: error
                  ? []
                  : (data ?? [])
                      .filter((item) => item.name.toLowerCase().endsWith(".pdf"))
                      .map((item) => ({ name: item.name, id: item.id })),
                isLoading: false,
                loaded: true,
              }
            : f
        )
      );
    }
  };

  const handlePdfClick = (courseCode: string, fileName: string) => {
    const filePath = `${courseCode}/${fileName}`;
    router.push(
      `/courses/${courseCode}/study?file=${encodeURIComponent(filePath)}`
    );
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-border bg-card">
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 border border-primary/20">
          <GraduationCap className="w-5 h-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground tracking-tight">
            CII W01
          </span>
          <span className="text-[11px] text-muted-foreground">
            Study Platform
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon
                className={cn(
                  "w-[18px] h-[18px] transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{item.name}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}

        {/* Modules Section */}
        <div className="pt-3">
          <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Modules
          </p>

          {loadingFolders ? (
            <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Loading modules…</span>
            </div>
          ) : folders.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              No modules found
            </p>
          ) : (
            <div className="space-y-0.5">
              {folders.map((folder) => (
                <div key={folder.name}>
                  <button
                    onClick={() => toggleFolder(folder.name)}
                    className="w-full group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-150"
                  >
                    <FolderOpen className="w-[18px] h-[18px] shrink-0" />
                    <span className="flex-1 text-left truncate">{folder.name}</span>
                    {folder.isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                    ) : (
                      <ChevronRight
                        className={cn(
                          "w-3.5 h-3.5 shrink-0 transition-transform duration-150",
                          folder.isOpen && "rotate-90"
                        )}
                      />
                    )}
                  </button>

                  {folder.isOpen && !folder.isLoading && (
                    <div className="ml-4 pl-3 border-l border-border/50 mt-0.5 mb-1 space-y-0.5">
                      {folder.files.length === 0 ? (
                        <p className="py-1.5 text-xs text-muted-foreground/60">
                          No PDFs found
                        </p>
                      ) : (
                        folder.files.map((file) => {
                          const filePath = `${folder.name}/${file.name}`;
                          const isFilActive =
                            pathname.startsWith(
                              `/courses/${folder.name}/study`
                            ) &&
                            typeof window !== "undefined" &&
                            new URLSearchParams(window.location.search).get(
                              "file"
                            ) === filePath;

                          return (
                            <button
                              key={file.name}
                              onClick={() =>
                                handlePdfClick(folder.name, file.name)
                              }
                              className={cn(
                                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-150 text-left",
                                isFilActive
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                              )}
                            >
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">
                                {file.name.replace(/\.pdf$/i, "")}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        {bottomNav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-lg bg-secondary/30">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
            M
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Mehmet
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              Premium Plan
            </p>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </aside>
  );
}
