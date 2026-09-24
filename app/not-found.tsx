import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

// Shown for any address that doesn't exist.
export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-16 sm:px-8 sm:pt-24">
      <p className="text-xs uppercase tracking-[0.14em] text-faint">Page not found</p>
      <h1 className="mt-3 font-serif text-6xl font-medium italic text-accent sm:text-8xl">Erravimus.</h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
        Latin for &ldquo;we have wandered off.&rdquo; It&apos;s the same <em>errare</em> that gave English the word{" "}
        <em>error</em>, which is what this is: there&apos;s no page at this address.
      </p>
      <p className="mt-6 -rotate-1 font-hand text-[26px] text-accent">even the Romans took a wrong turn now and then</p>

      <nav aria-label="Where to go" className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-lg">
        <Link href="/" className="flex h-12 items-center rounded-sm bg-accent px-7 font-semibold text-bg transition hover:bg-accent-soft">
          Decode a label
        </Link>
        <Link href="/dictionary" className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent">
          Browse the dictionary
        </Link>
        <Link href="/study" className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent">
          Study a deck
        </Link>
      </nav>
    </main>
  );
}
