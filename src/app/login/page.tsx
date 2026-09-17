"use client";

import { useState } from "react";
import Image from "next/image";
import { supabaseConfigured, createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) {
      setError(
        "Supabase isn't connected yet. Add your project keys to enable real login — see DEPLOY.md."
      );
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (authError) throw authError;
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Something went wrong sending the link. Try again.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo.svg" alt="Unions'Q" width={40} height={40} />
          <h1 className="mt-3 text-lg font-semibold">Unions&apos;Q</h1>
          <p className="text-sm text-muted">
            Sign in with your college email to book slots.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="you@mastersunion.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-lg bg-foreground py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
          >
            {status === "sending" ? "Sending link…" : "Send magic link"}
          </button>
        </form>

        {status === "sent" && (
          <p className="mt-3 text-sm text-success">
            Check your inbox for a sign-in link.
          </p>
        )}
        {status === "error" && error && (
          <p className="mt-3 text-sm text-danger">{error}</p>
        )}

        <p className="mt-4 text-center text-xs text-muted">
          Only verified Masters&apos; Union students can book slots.
        </p>
      </div>
    </div>
  );
}
