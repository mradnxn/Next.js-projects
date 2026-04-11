"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signupAction } from "@/actions/authActions";

export default function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // 1. Bind action to State hook
  const [state, formAction, isPending] = useActionState(signupAction, {});

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard");
    }
  }, [state, router]);

  return (
    <div className="w-full max-w-md bg-blue-950/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/5">
      <h1 className="text-2xl font-bold mb-2 text-white">Create Account</h1>
      <p className="text-sm text-gray-300 mb-6 font-medium">Join RideAlong — let’s get started.</p>

      {/* Global Server Errors */}
      {state?.error && (
        <p className="text-sm text-red-400 font-semibold mb-3 bg-red-900/20 border border-red-800/50 p-2 rounded-lg">
          {state.error}
        </p>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-200">Full Name</label>
          <input name="name" className="w-full px-4 py-2 border rounded-xl bg-slate-900/80 border-slate-700/80 focus:ring-2 focus:ring-orange-500 text-white" placeholder="Your name" required />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-200">Email Address</label>
          <input name="email" type="email" className="w-full px-4 py-2 border rounded-xl bg-slate-900/80 border-slate-700/80 focus:ring-2 focus:ring-orange-500 text-white" placeholder="you@example.com" required />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-200">Password</label>
          <div className="relative">
            <input name="password" type={showPassword ? "text" : "password"} className="w-full px-4 py-2 border rounded-xl bg-slate-900/80 border-slate-700/80 focus:ring-2 focus:ring-orange-500 text-white pr-10" placeholder="******" required minLength={6} />
            <button type="button" className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-200">Gender</label>
          <select name="gender" className="w-full px-4 py-2 border rounded-xl bg-slate-900/80 border-slate-700/80 focus:ring-2 focus:ring-orange-500 text-gray-300" required>
            <option value="male" className="bg-slate-900">Male</option>
            <option value="female" className="bg-slate-900">Female</option>
          </select>
        </div>

        <button type="submit" disabled={isPending} className="w-full px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition disabled:opacity-60 disabled:cursor-wait mt-2">
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-gray-300 mt-4">
        Already have an account? <a href="/login" className="text-orange-400 hover:underline font-semibold">Log in</a>
      </p>
    </div>
  );
}
