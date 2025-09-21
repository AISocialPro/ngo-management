// src/app/(auth)/layout.tsx
import "../globals.css";

export const metadata = {
  title: "Login • NGO Connect",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#f5f7fb", margin: 0 }}>{children}</body>
    </html>
  );
}
