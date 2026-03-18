import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Ultimate Streak",
  description: "Predict. Streak. Win.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-1">
        <AuthProvider>
          <Navbar />
          <div className="min-h-[calc(100vh-4rem)]">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
