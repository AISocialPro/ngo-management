// src/app/(auth)/layout.tsx
'use client';

import { useEffect } from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Hide any floating chatbot widget on login
  useEffect(() => {
    const chat = document.querySelector('#chatbot, .chatbot, [data-chatbot], .intercom-lightweight-app');
    if (chat instanceof HTMLElement) chat.style.display = 'none';
    return () => {
      if (chat instanceof HTMLElement) chat.style.display = '';
    };
  }, []);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
