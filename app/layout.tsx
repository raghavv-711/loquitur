import type { Metadata, Viewport } from "next";
import { Caveat, Cormorant_Garamond, Lora, Mrs_Saint_Delafield } from "next/font/google";
import Link from "next/link";
import { CodexProvider } from "@/components/CodexProvider";
import { TopBar } from "@/components/TopBar";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});
const lora = Lora({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-lora" });
const caveat = Caveat({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-caveat" });
// Only used for Raghav's signature in the footer.
const signature = Mrs_Saint_Delafield({ subsets: ["latin"], weight: "400", variable: "--font-sig-script" });

export const metadata: Metadata = {
  metadataBase: new URL("https://loquitur.vercel.app"),
  title: { default: "Loquitur", template: "%s · Loquitur" },
  description: "Your medical paperwork, in plain English. Loquitur decodes prescription labels and doctor's notes through their Latin and Greek roots.",
  openGraph: { title: "Loquitur", description: "Your medical paperwork, in plain English.", url: "/", siteName: "Loquitur" },
  // When added to an iPhone home screen: open full-screen, titled "Loquitur", with a dark status bar.
  appleWebApp: { capable: true, title: "Loquitur", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#071230", // colors the browser bar and the installed app's title bar
  viewportFit: "cover", // lets the navy background fill the iPhone notch area
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${lora.variable} ${caveat.variable} ${signature.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <CodexProvider>
          <div className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-8 sm:pt-8">
            <TopBar />
          </div>
          <div className="flex-1">{children}</div>
          <footer className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-8">
            <div className="flex flex-col gap-3 border-t border-line pt-5">
              <p className="text-sm text-faint">
                Loquitur explains words. It is not medical advice. Always ask your pharmacist or doctor about your care.
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="flex items-baseline gap-2 text-muted">
                  Crafted with care by
                  <span className="font-signature -rotate-3 text-[40px] leading-none text-accent" aria-label="Raghav">
                    RaghaV
                  </span>
                </span>
                <span className="flex gap-6">
                  <Link href="/about" className="text-muted hover:text-accent">
                    About
                  </Link>
                  <Link href="/privacy" className="text-muted hover:text-accent">
                    Privacy
                  </Link>
                </span>
              </div>
            </div>
          </footer>
        </CodexProvider>
      </body>
    </html>
  );
}
