"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, ArrowRight, Loader2, Clock } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

type State = "idle" | "loading" | "sent" | "verifying" | "error" | "not_allowed" | "rate_limited";

const COOLDOWN_KEY = "otp_cooldown_until";
const COOLDOWN_SENT = 60;
const COOLDOWN_RATE_LIMIT = 300;

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
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const until = parseInt(localStorage.getItem(COOLDOWN_KEY) ?? "0", 10);
    const remaining = Math.ceil((until - Date.now()) / 1000);
    if (remaining > 0) setCooldown(remaining);
  }, []);

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

  useEffect(() => {
    if (state === "sent") {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [state]);

  function startCooldown(seconds = COOLDOWN_SENT) {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now() + seconds * 1000));
    setCooldown(seconds);
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (cooldown > 0) return;

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setState("loading");
    setErrorMsg("");

    const supabase = createClient();

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

    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: trimmed,
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

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;

    setState("verifying");
    setErrorMsg("");

    const supabase = createClient();

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: "email",
    });

    if (error) {
      setState("sent");
      setErrorMsg(error.message || "Invalid code. Please try again.");
      return;
    }

    router.push("/");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <GraduationCap className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">CII Study</h1>
          <p className="text-sm text-muted-foreground mt-1">Exam Preparation Platform</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          {state === "sent" || state === "verifying" ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-foreground mb-1">
                  Check your email
                </h2>
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                  Enter it below to sign in.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="token" className="text-xs font-medium text-muted-foreground">
                  6-digit code
                </label>
                <input
                  ref={otpInputRef}
                  id="token"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value.replace(/\D/g, ""));
                    setErrorMsg("");
                  }}
                  placeholder="000000"
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors tracking-widest text-center"
                />
              </div>

              {errorMsg && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={state === "verifying" || token.length < 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {state === "verifying" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    Verify code
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                Didn&apos;t receive it? Check your spam folder or{" "}
                {cooldown > 0 ? (
                  <span className="tabular-nums">retry in {formatCooldown(cooldown)}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setState("idle"); setToken(""); }}
                    className="text-primary underline underline-offset-2"
                  >
                    try again
                  </button>
                )}
                .
              </p>
            </form>
          ) : (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-foreground mb-1">
                  Sign in
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter your email to receive a one-time code.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
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
                    Send code
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
