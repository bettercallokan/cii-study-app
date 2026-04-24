"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Settings,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const modules = [
  { code: "W01", name: "Award in General Insurance", href: "/courses/w01" },
  { code: "WCE", name: "Insurance Claims Handling", href: "/courses/wce" },
  { code: "WUE", name: "Insurance Underwriting", href: "/courses/wue" },
];

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModulesOpen, setIsModulesOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo Area */}
      <div className={cn(
        "flex items-center border-b border-border h-16 shrink-0",
        isCollapsed ? "justify-center px-3" : "gap-3 px-5"
      )}>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
          <GraduationCap className="w-5 h-5 text-primary" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-foreground tracking-tight">
              CII Study
            </span>
            <span className="text-[11px] text-muted-foreground">
              Exam Preparation
            </span>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150",
                isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon
                className={cn(
                  "w-[18px] h-[18px] transition-colors shrink-0",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!isCollapsed && (
                <>
                  <span>{item.name}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </>
              )}
            </Link>
          );
        })}

        {/* Modules Section */}
        <div className="pt-2">
          <button
            onClick={() => setIsModulesOpen(!isModulesOpen)}
            className={cn(
              "w-full group flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
            )}
            title={isCollapsed ? "Modules" : undefined}
          >
            <BookOpen className="w-[18px] h-[18px] transition-colors shrink-0 text-muted-foreground group-hover:text-foreground" />
            {!isCollapsed && (
              <>
                <span>Modules</span>
                <ChevronDown 
                  className={cn(
                    "ml-auto w-4 h-4 transition-transform",
                    isModulesOpen && "rotate-180"
                  )} 
                />
              </>
            )}
          </button>
          
          {/* Module Sub-links */}
          {isModulesOpen && !isCollapsed && (
            <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-3">
              {modules.map((module) => {
                const active = isActive(module.href);
                return (
                  <Link
                    key={module.code}
                    href={module.href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded",
                      active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    )}>
                      {module.code}
                    </span>
                    <span className="text-xs truncate">{module.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Collapsed module icons */}
          {isModulesOpen && isCollapsed && (
            <div className="mt-1 space-y-1">
              {modules.map((module) => {
                const active = isActive(module.href);
                return (
                  <Link
                    key={module.code}
                    href={module.href}
                    title={`${module.code}: ${module.name}`}
                    className={cn(
                      "flex items-center justify-center px-2 py-2 rounded-lg text-xs font-bold transition-all duration-150",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    {module.code}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Practice Exams */}
        <Link
          href="/practice-exams"
          title={isCollapsed ? "Practice Exams" : undefined}
          className={cn(
            "group flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150",
            isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
            isActive("/practice-exams")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          )}
        >
          <ClipboardList
            className={cn(
              "w-[18px] h-[18px] transition-colors shrink-0",
              isActive("/practice-exams") ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )}
          />
          {!isCollapsed && (
            <>
              <span>Practice Exams</span>
              {isActive("/practice-exams") && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </>
          )}
        </Link>

      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-border space-y-1 shrink-0">
        {/* Settings */}
        <Link
          href="/settings"
          title={isCollapsed ? "Settings" : undefined}
          className={cn(
            "group flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150",
            isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
            isActive("/settings")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          )}
        >
          <Settings className="w-[18px] h-[18px] shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </Link>

        {/* User Profile */}
        <div className={cn(
          "flex items-center gap-3 rounded-lg bg-secondary/30 mt-2",
          isCollapsed ? "justify-center p-2" : "px-3 py-3"
        )}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
            M
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Mehmet</p>
                <p className="text-[11px] text-muted-foreground truncate">Premium Plan</p>
              </div>
              <button 
                className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </button>
            </>
          )}
        </div>

        {/* Collapse Button - Desktop only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "hidden lg:flex w-full items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 text-muted-foreground hover:text-foreground hover:bg-secondary/50 mt-2",
            isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-[18px] h-[18px]" />
          ) : (
            <>
              <ChevronLeft className="w-[18px] h-[18px]" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border text-foreground"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "lg:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-border bg-card transform transition-transform duration-300",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-secondary transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col border-r border-border bg-card transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {sidebarContent}
      </aside>

      {/* Spacer for main content */}
      <div className={cn(
        "hidden lg:block shrink-0 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )} />
    </>
  );
}
