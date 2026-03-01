'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const syncUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace('/auth/login');
        return;
      }

      // backend sync (company, role, etc.)
      await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: data.user }),
      });

      router.replace('/dashboard');
    };

    syncUser();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Signing you in…</p>
    </div>
  );
}
