"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  ClipboardList,
  BarChart3,
  GraduationCap,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
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
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{item.name}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
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
            <p className="text-sm font-medium text-foreground truncate">Mehmet</p>
            <p className="text-[11px] text-muted-foreground truncate">Premium Plan</p>
          </div>
          <button className="p-1.5 rounded-md hover:bg-secondary transition-colors">
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </aside>
  );
}
