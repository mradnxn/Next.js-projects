"use client";

import Link from "next/link";
import { loginAction } from "@/actions/authActions";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { useActionState } from "react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden">
      {/* Decorative gradient orbs — matches dashboard */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-3xl font-black tracking-tight text-white">
            Ride<span className="text-orange-400">Along</span>
          </Link>
          <p className="text-slate-500 text-xs mt-2 tracking-widest uppercase font-medium">
            Kinetic Mobility Platform
          </p>
        </div>

        {/* Card — matches dashboard glass cards */}
        <div className="w-full bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50">
          <h1 className="text-2xl font-bold mb-1 text-white">Welcome Back</h1>
          <p className="text-sm text-gray-400 mb-6">Log in to continue your journey.</p>

          {state?.error && (
            <div className="mb-6 p-4 bg-red-900/40 border border-red-500/50 rounded-xl">
              <p className="text-red-400 text-sm font-semibold">{state.error}</p>
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2 text-gray-400">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2 text-gray-400">
                Password
              </label>
              <input
                name="password"
                type="password"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg mt-2 ${isPending ? 'bg-orange-600/50 text-slate-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-[1.02] active:scale-95 shadow-orange-500/20'}`}
            >
              {isPending ? "Authenticating..." : "Log In"}
            </button>
          </form>

          <div className="flex items-center my-6">
             <div className="flex-1 border-t border-slate-700/50"></div>
             <span className="px-3 text-xs uppercase tracking-widest text-slate-500 font-bold">Or</span>
             <div className="flex-1 border-t border-slate-700/50"></div>
          </div>

          <GoogleAuthButton />

          <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-widest">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
