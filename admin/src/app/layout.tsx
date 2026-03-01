// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import ClientProviders from "@/providers/ClientProviders";
import { ConfirmDialogProvider } from "@/components/ConfirmDialog"; // <-- add this

export const metadata: Metadata = {
  title: "NGO Connect",
  description: "Admin portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body className="light min-h-screen antialiased">
        {/* Global client-side providers */}
        <ClientProviders>
          {/* Mount the confirm dialog provider once at the app root */}
          <ConfirmDialogProvider>
            {children}
          </ConfirmDialogProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
