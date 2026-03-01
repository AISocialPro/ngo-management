'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// src/app/public/auth/login/page.tsx
import {
  FaGoogle,
  FaMicrosoft,
  FaEye,
  FaEyeSlash,
  FaRightToBracket,
  FaSpinner,
  FaCheck,
  FaHandHoldingHeart,   // <-- add this
} from "react-icons/fa6";


type Role = 'Administrator' | 'Manager' | 'Coordinator' | 'Viewer';
const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(' ');

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState<Role>('Administrator');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ngoc_login_saved');
    if (saved) {
      try {
        const { email, role } = JSON.parse(saved) as { email?: string; role?: Role };
        if (email) setEmail(email);
        if (role) setRole(role);
      } catch {}
    }
  }, []);

  const valid = email.trim().length > 3 && email.includes('@') && password.length >= 6;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Login form submitted');
    setError(null);
    if (!valid) {
      setError('Please enter a valid email and a password of at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 800)); // stub auth
      if (remember) {
        localStorage.setItem('ngoc_login_saved', JSON.stringify({ email, role }));
      } else {
        localStorage.removeItem('ngoc_login_saved');
      }
      localStorage.setItem('ngoc_role', role);
      console.log('Login successful, redirecting to /admin/dashboard');
      router.push('/admin/dashboard');
    } catch {
      setError('Invalid credentials or network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="force-light min-h-screen bg-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left brand panel */}
        {/* Left brand panel */}
<div className="relative hidden lg:flex items-center justify-center overflow-hidden px-10 text-white
                bg-sky-800">
  <div className="relative z-10 max-w-2xl">
    <div className="mb-8 flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
        <FaHandHoldingHeart className="h-7 w-7" />
      </div>
      <span className="text-3xl font-bold">NGO Connect</span>
    </div>

    <h1 className="mb-5 text-5xl font-extrabold leading-tight">Welcome back, admin 👋</h1>

    <p className="max-w-2xl text-xl text-white/95">
      Sign in to manage branches, donors, volunteers, campaigns, and compliance—all in one place.
    </p>

    <div className="mt-14 grid gap-4 text-xl">
      <Feature text="Role-based access control (RBAC)" />
      <Feature text="Audit logs & backups" />
      <Feature text="White-label branding" />
      <Feature text="SSO, SMTP & API keys" />
    </div>
  </div>
</div>


        {/* Right form panel */}
        <div className="flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3713/3713765.png"
                alt="NGO Connect"
                className="h-10 w-10"
              />
              <span className="text-2xl font-bold text-slate-900">NGO Connect</span>
            </div>

            <h2 className="mb-1 text-3xl font-semibold text-slate-900">Admin Sign In</h2>
            <p className="mb-7 text-sm text-slate-500">
              Use your work email and password to access the admin portal.
            </p>

            {/* SSO buttons */}
            <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => alert('Continue with Google (demo)')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FaGoogle /> Google
              </button>
              <button
                type="button"
                onClick={() => alert('Continue with Microsoft (demo)')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FaMicrosoft /> Microsoft
              </button>
            </div>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-400">or continue with email</span>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              {/* Email */}
              <label className="block text-sm">
                <div className="mb-1 font-medium text-slate-700">Email</div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="admin@yourorg.org"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-200"
                  required
                />
              </label>

              {/* Password */}
              <label className="block text-sm">
                <div className="mb-1 font-medium text-slate-700">Password</div>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-10 text-slate-800 placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </label>

              {/* Role */}
              <label className="block text-sm">
                <div className="mb-1 font-medium text-slate-700">Sign in as</div>
                <select
                  value={role}
                  onChange={(e) => setRole((e.target.value || 'Administrator') as Role)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option>Administrator</option>
                  <option>Manager</option>
                  <option>Coordinator</option>
                  <option>Viewer</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  The role is used for demo routing. In production, roles should come from your server/session.
                </p>
              </label>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 accent-sky-600"
                  />
                  Remember me
                </label>
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset flow (demo)');
                  }}
                  className="text-sm font-medium text-sky-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !valid}
                className={cx(
                  'inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white',
                  loading || !valid ? 'bg-sky-400/70' : 'bg-sky-600 hover:bg-sky-700'
                )}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Signing in…
                  </>
                ) : (
                  <>
                    <FaRightToBracket /> Sign in
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-500">
              By continuing, you agree to our{' '}
              <Link href="/legal/terms" className="text-sky-700 hover:underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy" className="text-sky-700 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <FaCheck className="text-white/95" />
      <span className="text-white/95">{text}</span>
    </div>
  );
}
