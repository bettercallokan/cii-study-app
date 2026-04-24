"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Mail, ArrowRight, Loader2, CheckCircle2, Clock } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

type State = "idle" | "loading" | "sent" | "error" | "not_allowed" | "rate_limited";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (typeof window !== "undefined" ? window.location.origin : "https://certifocus.com");

const COOLDOWN_KEY = "otp_cooldown_until";
const COOLDOWN_SENT = 60;       // seconds after a successful send
const COOLDOWN_RATE_LIMIT = 300; // 5 min after a rate-limit error

function isRateLimit(msg: string, status?: number) {
  return (
    status === 429 ||
    msg.toLowerCase().includes("rate limit") ||
    msg.toLowerCase().includes("too many") ||
    msg.toLowerCase().includes("security purposes")
  );
}

function formatCooldown(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Restore cooldown from localStorage on mount
  useEffect(() => {
    const until = parseInt(localStorage.getItem(COOLDOWN_KEY) ?? "0", 10);
    const remaining = Math.ceil((until - Date.now()) / 1000);
    if (remaining > 0) setCooldown(remaining);
  }, []);

  // Tick down cooldown every second
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  function startCooldown(seconds = COOLDOWN_SECONDS) {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now() + seconds * 1000));
    setCooldown(seconds);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cooldown > 0) return;

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setState("loading");
    setErrorMsg("");

    const supabase = createClient();

    // Check allowlist first
    const { data: allowed, error: rpcErr } = await supabase.rpc(
      "is_email_allowed",
      { check_email: trimmed }
    );

    if (rpcErr) {
      setState("error");
      setErrorMsg("Something went wrong. Please try again.");
      return;
    }

    if (!allowed) {
      setState("not_allowed");
      return;
    }

    // Send magic link
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${SITE_URL}/auth/callback`,
        shouldCreateUser: true,
      },
    });

    if (otpErr) {
      if (isRateLimit(otpErr.message, otpErr.status)) {
        setState("rate_limited");
        startCooldown(COOLDOWN_RATE_LIMIT);
      } else {
        setState("error");
        setErrorMsg(otpErr.message);
      }
      return;
    }

    setState("sent");
    startCooldown(COOLDOWN_SENT);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <GraduationCap className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">CII Study</h1>
          <p className="text-sm text-muted-foreground mt-1">Exam Preparation Platform</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6">
          {state === "sent" ? (
            <SentState email={email} cooldown={cooldown} onBack={() => setState("idle")} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-foreground mb-1">
                  Sign in
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter your email to receive a secure login link.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (state !== "idle") setState("idle");
                    }}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              {/* Error states */}
              {state === "not_allowed" && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  This email is not authorised for access. Please contact your administrator.
                </div>
              )}
              {state === "error" && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {errorMsg || "Something went wrong. Please try again."}
                </div>
              )}
              {state === "rate_limited" && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400 flex items-start gap-2">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Email sending limit reached. Please wait{" "}
                    <span className="font-semibold tabular-nums">{formatCooldown(cooldown)}</span>{" "}
                    before trying again.
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={state === "loading" || cooldown > 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {state === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking…
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Retry in {formatCooldown(cooldown)}
                  </>
                ) : (
                  <>
                    Send magic link
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Invite-only access · CII Exam Preparation
        </p>
      </div>
    </div>
  );
}

function SentState({
  email,
  cooldown,
  onBack,
}: {
  email: string;
  cooldown: number;
  onBack: () => void;
}) {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 mx-auto">
        <CheckCircle2 className="w-6 h-6 text-green-500" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-foreground">Check your email</h2>
        <p className="text-sm text-muted-foreground mt-1">
          We sent a login link to{" "}
          <span className="font-medium text-foreground">{email}</span>.
          <br />
          Click the link to sign in.
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Didn&apos;t receive it? Check your spam folder or{" "}
        {cooldown > 0 ? (
          <span className="text-muted-foreground tabular-nums">
            retry in {formatCooldown(cooldown)}
          </span>
        ) : (
          <button
            onClick={onBack}
            className="text-primary underline underline-offset-2"
          >
            try again
          </button>
        )}
        .
      </p>
    </div>
  );
}
