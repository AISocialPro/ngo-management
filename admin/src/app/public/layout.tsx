// src/app/(auth)/layout.tsx
import "../globals.css";

export const metadata = {
  title: "Login • NGO Connect",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    // REMOVE <html> and <body> tags - just render children directly
    // Use a div wrapper with your desired background
    <div className="min-h-screen bg-[#f5f7fb]">
      {children}
    </div>
  );
}