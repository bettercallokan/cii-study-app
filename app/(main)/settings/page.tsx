"use client";

import React, { useState } from "react";
import {
  Settings,
  User,
  Bell,
  Moon,
  Globe,
  Shield,
  CreditCard,
  ChevronRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SettingItem = {
  label: string;
  description: string;
  toggle?: boolean;
  enabled?: boolean;
  select?: boolean;
};

const settingsSections: {
  title: string;
  icon: React.ElementType;
  items: SettingItem[];
}[] = [
  {
    title: "Account",
    icon: User,
    items: [
      { label: "Profile Information", description: "Update your name and email" },
      { label: "Password", description: "Change your password" },
      { label: "Two-Factor Authentication", description: "Add extra security to your account" },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    items: [
      { label: "Email Notifications", description: "Manage email preferences", toggle: true, enabled: true },
      { label: "Study Reminders", description: "Daily study reminders", toggle: true, enabled: true },
      { label: "Progress Updates", description: "Weekly progress reports", toggle: true, enabled: false },
    ],
  },
  {
    title: "Appearance",
    icon: Moon,
    items: [
      { label: "Dark Mode", description: "Always use dark theme", toggle: true, enabled: true },
      { label: "Compact View", description: "Reduce spacing in the UI", toggle: true, enabled: false },
    ],
  },
  {
    title: "Language & Region",
    icon: Globe,
    items: [
      { label: "Language", description: "English (UK)", select: true },
      { label: "Timezone", description: "GMT (London)", select: true },
    ],
  },
];

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors",
        enabled ? "bg-primary" : "bg-secondary"
      )}
    >
      <div
        className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
          enabled ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

function SettingsSection({
  section,
}: {
  section: { title: string; icon: React.ElementType; items: SettingItem[] };
}) {
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(
    section.items.reduce((acc, item) => {
      if (item.toggle) {
        acc[item.label] = item.enabled ?? false;
      }
      return acc;
    }, {} as Record<string, boolean>)
  );

  const handleToggle = (label: string) => {
    setToggleStates((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <div className="md:rounded-xl md:border md:border-border md:bg-card md:overflow-hidden">
      <div className="flex items-center gap-3 py-3 mb-1 md:px-5 md:py-4 md:mb-0 md:border-b md:border-border md:bg-secondary/30">
        <section.icon className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">{section.title}</h3>
      </div>
      <div className="divide-y divide-border/50 md:divide-border">
        {section.items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between px-0 min-h-[48px] py-3 md:px-5 md:py-4 hover:bg-secondary/20 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
            </div>
            {item.toggle && (
              <ToggleSwitch
                enabled={toggleStates[item.label]}
                onChange={() => handleToggle(item.label)}
              />
            )}
            {item.select && (
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Change
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {!item.toggle && !item.select && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 pt-8">
          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
            <Settings className="w-4 h-4" />
            Preferences
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and application preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section) => (
            <SettingsSection key={section.title} section={section} />
          ))}

          {/* Subscription Section */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Subscription</h3>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium text-foreground">Premium Plan</p>
                  <p className="text-sm text-muted-foreground">Full access to all features</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Check className="w-4 h-4 text-green-500" />
                <span>Renews on March 15, 2024</span>
              </div>
              <button className="text-sm text-primary hover:underline">
                Manage Subscription
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-red-500/30">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-red-500">Danger Zone</h3>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="px-4 py-2 rounded-lg border border-red-500/50 text-red-500 text-sm font-medium hover:bg-red-500/10 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
