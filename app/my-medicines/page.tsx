import type { Metadata } from "next";
import { MedicinesCard } from "@/components/MedicinesCard";

export const metadata: Metadata = {
  title: "My medicines card",
  description: "Turn prescription labels into a big-print, plain-English card of your medicines to keep on the fridge.",
};

export default function MyMedicinesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-8 sm:pt-12 print:p-0">
      <header className="mb-10 print:hidden">
        <h1 className="font-serif text-5xl font-medium sm:text-6xl">My medicines card</h1>
        <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-muted">
          Type each medicine the way it&apos;s written on the label. Loquitur rewrites the directions in plain English
          using its checked dictionary, and you can print a big-print card for the fridge.
        </p>
        <p className="mt-2 text-sm text-faint">
          Nothing you type leaves this page or gets saved. Refreshing clears it.
        </p>
      </header>
      <MedicinesCard />
    </main>
  );
}
