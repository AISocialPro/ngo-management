// src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('••••••••');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // demo: route based on email
    // replace with your real auth
    if (email) router.push('/admin'); // or wherever your dashboard is
  };

  return (
    <main className="flex min-h-screen items-start justify-center">
      <div className="w-full max-w-2xl px-6 pt-16 md:pt-24">
        {/* Brand */}
        <div className="mb-8 flex items-center justify-center">
          {/* Replace with your logo if you like */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 21s8-4.438 8-11a8 8 0 10-16 0c0 6.562 8 11 8 11z" stroke="currentColor" strokeWidth="1.6"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.6"/>
            </svg>
          </div>
        </div>

        {/* Title + subtitle */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Login</h1>
          <p className="mt-2 text-slate-600">
            Welcome, please sign in to your dashboard
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          {/* Email */}
          <label className="mb-5 block">
            <div className="mb-2 text-sm font-medium text-slate-800">Email Address</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-[15px] outline-none ring-sky-200 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2"
              placeholder="you@company.com"
            />
          </label>

          {/* Password + Forgot */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Password</span>
            <button
              type="button"
              onClick={() => alert('Link your forgot-password route')}
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative mb-6">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-20 text-[15px] outline-none ring-sky-200 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-1.5 top-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Fake reCAPTCHA box (demo only) */}
          <div className="mb-6 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-[15px] text-slate-600">
            I’m not a robot (demo)
          </div>

          {/* Remember me */}
          <label className="mb-6 flex select-none items-center gap-3">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-5 w-5 accent-sky-600"
            />
            <span className="text-[15px] text-slate-700">Remember me</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-[15px] font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            Login
          </button>

          {/* Terms */}
          <p className="mt-4 text-center text-sm text-slate-500">
            By logging in you agree to our <a className="underline hover:no-underline" href="#">Privacy Policy</a> and <a className="underline hover:no-underline" href="#">Terms</a>.
          </p>
        </form>
      </div>
    </main>
  );
}
