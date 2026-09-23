import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy · Loquitur" };

const CONTACT = "raghavvijayapal@gmail.com";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-4 sm:px-6">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">Privacy</h1>
      <p className="mt-1 text-sm text-muted">Last updated September 23, 2026</p>

      <div className="mt-8 space-y-6 leading-relaxed text-fg/85 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-fg">
        <p>
          Loquitur explains the words in medical paperwork. It is not a medical service and does not give medical
          advice. This page explains exactly what happens to your information.
        </p>

        <section>
          <h2>Documents and photos you decode</h2>
          <p className="mt-2">
            When you decode text or a photo, it is sent to Anthropic&apos;s Claude API to be read and explained, and drug
            names are looked up in the FDA&apos;s public openFDA database. Loquitur does not save your documents or photos.
            Anthropic handles the request under its API terms and privacy policy. Please use Loquitur only with
            documents you are comfortable sending to these services.
          </p>
        </section>

        <section>
          <h2>If you sign in</h2>
          <p className="mt-2">
            Signing in with Google creates an account with Supabase, which stores your email address and the name and
            profile picture Google shares. Loquitur stores the words you choose to save
            to your Codex and your review schedule. Nobody else can see your Codex. Loquitur does not use your Google
            account for anything except signing you in.
          </p>
        </section>

        <section>
          <h2>Daily limit</h2>
          <p className="mt-2">
            To keep costs down, each visitor can decode a limited number of documents per day. To count this, Loquitur
            stores a scrambled, one-way code made from your IP address (never the address itself), and deletes these
            counts after a week.
          </p>
        </section>

        <section>
          <h2>What Loquitur doesn&apos;t do</h2>
          <p className="mt-2">No ads, no selling or sharing your data, and no tracking across other websites.</p>
        </section>

        <section>
          <h2>Deleting your data</h2>
          <p className="mt-2">
            You can remove saved words from your Codex at any time. To delete your account entirely, email{" "}
            <a href={`mailto:${CONTACT}`} className="text-accent underline">
              {CONTACT}
            </a>
            .
          </p>
        </section>

        <p>
          <Link href="/" className="text-accent underline">
            ← Back to Loquitur
          </Link>
        </p>
      </div>
    </main>
  );
}
