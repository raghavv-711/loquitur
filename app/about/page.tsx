import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-6 sm:px-6">
      <Image src="/brand/emblem.png" alt="" width={72} height={72} priority />
      <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight">About Loquitur</h1>

      <div className="mt-8 space-y-6 leading-relaxed text-fg/85 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-fg">
        <section>
          <h2>Why I built it</h2>
          <p className="mt-2">
            Hi, I&apos;m <strong className="text-fg">Raghav Vijayapal</strong>. I&apos;ve been studying Latin for seven
            years now, including AP Latin in high school, and I kept noticing that the most confusing parts of medical
            paperwork are Latin and Greek in disguise. &ldquo;PO BID&rdquo; on a prescription label is{" "}
            <em>per os, bis in die</em>: by mouth, twice a day. &ldquo;Nephrolithiasis&rdquo; on a doctor&apos;s note is
            just <em>nephr-</em> (kidney) + <em>lith-</em> (stone): kidney stones.
          </p>
          <p className="mt-3">
            Many people leave an appointment unsure what their paperwork is telling them to do. I wanted to create
            something that was both helpful and educational: a tool that explains your paperwork in plain English right
            now, and along the way teaches more people about the Latin language itself.
          </p>
        </section>

        <section>
          <h2>How it works</h2>
          <p className="mt-2">
            Paste text or upload a photo of a prescription label or after-visit summary. An AI model (Claude, by
            Anthropic) finds the jargon, and every explanation is then checked against a hand-built dictionary of more
            than 400 prescription abbreviations and Latin and Greek word roots. Drug names are confirmed in the
            FDA&apos;s public drug label database. Anything that can&apos;t be verified is clearly marked, so you know
            when to double-check with your pharmacist.
          </p>
        </section>

        <section>
          <h2>Learn it, don&apos;t just look it up</h2>
          <p className="mt-2">
            Sign in to save any root or abbreviation to your <strong className="text-fg">Codex</strong>. Loquitur then
            quizzes you on your saved words: what a root means, what Latin phrase an abbreviation stands for, and
            &ldquo;decode it yourself&rdquo; questions that combine roots you know into new words (you know{" "}
            <em>nephr-</em>, so what is a <em>nephrectomy</em>?). Words you get right come back less often; words you
            miss come back soon, so each one sticks.
          </p>
          <p className="mt-3">
            A few dozen roots unlock thousands of medical words. Knowing them makes you a more confident patient and a
            better advocate for the people you care for. And if you&apos;re a student thinking about medical school,
            much of the vocabulary you&apos;ll need to learn is built from these same Latin and Greek parts, so learning
            them now is a real head start.
          </p>
        </section>

        <section>
          <h2>The name</h2>
          <p className="mt-2">
            <em>Loquitur</em> is Latin for &ldquo;it speaks,&rdquo; as in the legal phrase <em>res ipsa loquitur</em>,
            &ldquo;the thing speaks for itself.&rdquo; The goal is for your paperwork to speak for itself, in plain
            English.
          </p>
        </section>

        <p className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">
          Loquitur explains words. It is not medical advice. Always ask your pharmacist or doctor about your care.
        </p>

        <p className="flex gap-4 text-sm">
          <Link href="/" className="text-accent underline underline-offset-2">
            ← Decode a document
          </Link>
          <Link href="/privacy" className="text-accent underline underline-offset-2">
            Privacy
          </Link>
        </p>
      </div>
    </main>
  );
}
