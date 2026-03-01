// src/providers/ClientProviders.tsx
"use client";

import { DialogProvider } from "@/components/ui/Dialog";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DialogProvider>{children}</DialogProvider>;
}
