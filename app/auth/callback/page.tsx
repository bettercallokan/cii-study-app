"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { GraduationCap, Loader2, AlertCircle } from "lucide-react";

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient();
      const code = searchParams.get("code");

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.replace("/");
        return;
      }

      // Fallback: listen for hash-based implicit flow
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_, session) => {
        if (session?.user) {
          subscription.unsubscribe();
          router.replace("/");
        }
      });

      setTimeout(() => {
        subscription.unsubscribe();
        setError("Sign-in timed out. Please try again.");
      }, 8000);
    }

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 mx-auto">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Sign-in failed
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
        <button
          onClick={() => router.replace("/login")}
          className="text-sm text-primary underline underline-offset-2"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-muted-foreground">
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20">
        <GraduationCap className="w-6 h-6 text-primary" />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Signing you in…
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </div>
        }
      >
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
