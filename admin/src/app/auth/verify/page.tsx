'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { getAuth, sendEmailVerification } from "firebase/auth";

import { 
  Mail, 
  CheckCircle, 
  ArrowRight,
  RefreshCw,
  Verified,
  Shield,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState('');

  // Get email
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');

    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      const storedEmail = localStorage.getItem('verificationEmail');
      if (storedEmail) setEmail(storedEmail);
    }
  }, []);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer]);

  // AUTO CHECK EMAIL VERIFIED 🔥
  useEffect(() => {
    const interval = setInterval(async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        await user.reload();

        if (user.emailVerified) {
          setSuccess(true);
          clearInterval(interval);

          localStorage.removeItem('verificationEmail');

          setTimeout(() => {
            const ngoId = new URLSearchParams(window.location.search).get('ngo');
            if (ngoId) {
              router.push(`/admin/dashboard?ngo=${ngoId}&verified=true`);
            } else {
              router.push('/admin/dashboard?verified=true');
            }
          }, 1500);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // MANUAL VERIFY BUTTON
  const handleCheckVerification = async () => {
    setLoading(true);
    setError('');

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("User not found. Please login again.");
        return;
      }

      await user.reload();

      if (user.emailVerified) {
        setSuccess(true);

        localStorage.removeItem('verificationEmail');

        setTimeout(() => {
          const ngoId = new URLSearchParams(window.location.search).get('ngo');
          if (ngoId) {
            router.push(`/admin/dashboard?ngo=${ngoId}&verified=true`);
          } else {
            router.push('/admin/dashboard?verified=true');
          }
        }, 1500);
      } else {
        setError("Email not verified yet. Please check your inbox.");
      }

    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // RESEND EMAIL
  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    setError('');

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("Please login again.");
        return;
      }

      await sendEmailVerification(user);

      setTimer(60);
      setCanResend(false);

      setError("Verification email sent again ✅");

    } catch (err: any) {
      setError(err.message || "Failed to resend email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Shield size={16} />
            Email Verification
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nexa<span className="text-emerald-600">NGO</span>
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">

          {success ? (
            <div className="text-center py-8">
              <CheckCircle size={50} className="text-emerald-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Email Verified 🎉</h2>
              <p className="text-gray-600">Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <Mail size={40} className="mx-auto text-emerald-600 mb-3" />
                <h2 className="text-xl font-bold">Verify Your Email</h2>
                <p className="text-gray-600 mt-2">
                  We have sent a verification link to:
                </p>
                <p className="font-semibold text-emerald-600">{email}</p>
              </div>

              {/* Error */}
              {error && (
                <div className="text-center text-sm mb-4 text-red-600 flex items-center justify-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {/* Button */}
              <button
                onClick={handleCheckVerification}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Verified size={18} />
                    I have verified
                  </>
                )}
              </button>

              {/* Resend */}
              <div className="text-center mt-6">
                {canResend ? (
                  <button onClick={handleResend} className="text-emerald-600 font-semibold">
                    Resend Email
                  </button>
                ) : (
                  <p className="text-sm text-gray-500 flex justify-center items-center gap-1">
                    <Clock size={14} />
                    Resend in {timer}s
                  </p>
                )}
              </div>

              {/* Back */}
              <div className="text-center mt-6">
                <Link href="/auth/login" className="text-sm text-gray-600 hover:text-emerald-600">
                  ← Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}