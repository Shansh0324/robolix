"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || "Login failed");
        return;
      }

      router.push("/projects");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-brand-500/8 blur-[120px]" />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full bg-accent-500/6 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-2xl font-bold text-gradient">AI 3D Studio</h1>
          </Link>
          <h2 className="text-xl font-semibold text-text-primary">
            Welcome back
          </h2>
          <p className="text-text-secondary mt-1">
            Sign in to continue creating
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="glass-strong rounded-2xl p-8 space-y-5"
        >
          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm animate-fade-in">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="text-sm font-medium text-text-secondary"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="login-password"
              className="text-sm font-medium text-text-secondary"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          <p className="text-center text-sm text-text-tertiary">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
