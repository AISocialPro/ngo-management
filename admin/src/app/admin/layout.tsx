// src/app/layout.tsx
import "../globals.css";
import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import Chatbot from "@/components/Chatbot"; // importing a client component is OK

export const metadata: Metadata = {
  title: "NGO Connect",
  description: "Admin portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Font Awesome (only once, pick one version) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      {/* 'light' class keeps your light dashboard canvas without touching Topbar/Sidebar */}
      <body className="light min-h-screen antialiased">
        <AppShell>{children}</AppShell>

        {/* Chatbot shows on all pages */}
        <Chatbot />
      </body>
    </html>
  );
}
