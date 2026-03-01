"use client";

import AppShell from "@/components/AppShell";
import Chatbot from "@/components/Chatbot";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        {children}
        <Chatbot />
      </AppShell>
    </QueryClientProvider>
  );
}
