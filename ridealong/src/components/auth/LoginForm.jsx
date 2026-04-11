"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction, resetPasswordAction } from "@/actions/authActions";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // 1. Bind actions to State hooks
  const [loginState, loginFormAction, isLoginPending] = useActionState(loginAction, {});
  const [resetState, resetFormAction, isResetPending] = useActionState(resetPasswordAction, {});

  useEffect(() => {
    if (loginState?.success) {
      router.push("/dashboard");
    }
  }, [loginState, router]);

  useEffect(() => {
    if (resetState?.success) {
      setIsResetting(false);
    }
  }, [resetState]);

  return (
    <div className="w-full max-w-md bg-blue-950/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/5">
      <h1 className="text-2xl font-bold mb-2 text-white">
        {isResetting ? "Reset Password" : "Welcome Back"}
      </h1>
      <p className="text-sm text-gray-300 mb-6 font-medium">
        {isResetting ? "Enter details to reset access." : "Log in to continue using RideAlong."}
      </p>

      {/* Global Server State Errors */}
      {(loginState?.error || resetState?.error) && (
        <p className="text-sm text-red-400 font-semibold mb-3 bg-red-900/20 border border-red-800/50 p-2 rounded-lg">
          {loginState?.error || resetState?.error}
        </p>
      )}
      {resetState?.success && (
        <p className="text-sm text-green-400 font-semibold mb-3 bg-green-900/20 border border-green-800/50 p-2 rounded-lg">
          Password reset successful! You can log in.
        </p>
      )}

      {!isResetting ? (
        <form action={loginFormAction} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-200">Email Address</label>
            <input
              name="email"
              type="email"
              className="w-full px-4 py-2 border rounded-xl bg-slate-900/80 border-slate-700/80 focus:ring-2 focus:ring-orange-500 text-white"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-semibold text-gray-200">Password</label>
              <button type="button" onClick={() => setIsResetting(true)} className="text-xs text-orange-400 hover:underline">
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2 border rounded-xl bg-slate-900/80 border-slate-700/80 focus:ring-2 focus:ring-orange-500 text-white pr-10"
                placeholder="******"
                required
              />
              <button type="button" className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoginPending}
            className="w-full px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition disabled:opacity-60 disabled:cursor-wait mt-2"
          >
            {isLoginPending ? "Authenticating..." : "Log in"}
          </button>
        </form>
      ) : (
        <form action={resetFormAction} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-200">Email Address</label>
            <input name="email" type="email" className="w-full px-4 py-2 border rounded-xl bg-slate-900 border-slate-700 focus:ring-orange-500 text-white" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-200">New Password</label>
            <input name="newPassword" type="password" className="w-full px-4 py-2 border rounded-xl bg-slate-900 border-slate-700 focus:ring-orange-500 text-white" placeholder="******" required />
          </div>
          
          <div className="flex gap-4">
            <button type="button" onClick={() => setIsResetting(false)} className="flex-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition">Cancel</button>
            <button type="submit" disabled={isResetPending} className="flex-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold disabled:opacity-60">
              {isResetPending ? "Resetting..." : "Reset"}
            </button>
          </div>
        </form>
      )}

      <p className="text-sm text-gray-300 mt-4">
        Don’t have an account? <a href="/signup" className="text-orange-400 hover:underline font-semibold">Create one</a>
      </p>
    </div>
  );
}
