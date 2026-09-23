import type { Metadata } from "next";
import { AuthBar } from "@/components/AuthBar";
import { CodexProvider } from "@/components/CodexProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loquitur",
  description: "Your medical paperwork, in plain English.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <CodexProvider>
          <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6">
            <AuthBar />
          </div>
          {children}
        </CodexProvider>
      </body>
    </html>
  );
}
