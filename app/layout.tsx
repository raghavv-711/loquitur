import type { Metadata } from "next";
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
        </CodexProvider>
      </body>
    </html>
  );
}
