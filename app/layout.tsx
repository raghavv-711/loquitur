import type { Metadata } from "next";
import Link from "next/link";
import { CodexProvider } from "@/components/CodexProvider";
import { TopBar } from "@/components/TopBar";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://loquitur.vercel.app"),
  title: { default: "Loquitur", template: "%s · Loquitur" },
  description: "Your medical paperwork, in plain English. Loquitur decodes prescription labels and doctor's notes through their Latin and Greek roots.",
  openGraph: { title: "Loquitur", description: "Your medical paperwork, in plain English.", url: "/", siteName: "Loquitur" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <CodexProvider>
          <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6">
            <TopBar />
          </div>
          {children}
          <footer className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-xs text-muted">
              <span>
                Crafted with care by <span className="text-fg">Raghav</span>
              </span>
              <span className="flex gap-3">
                <Link href="/about" className="hover:text-fg">
                  About
                </Link>
                <Link href="/privacy" className="hover:text-fg">
                  Privacy
                </Link>
              </span>
            </div>
          </footer>
        </CodexProvider>
      </body>
    </html>
  );
}
