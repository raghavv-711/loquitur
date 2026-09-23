import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeckQuiz } from "@/components/DeckQuiz";
import { DECKS, findDeck } from "@/lib/decks";

// Pre-build a page for every deck.
export function generateStaticParams() {
  return DECKS.map((d) => ({ deck: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ deck: string }> }): Promise<Metadata> {
  const deck = findDeck((await params).deck);
  return deck ? { title: `${deck.title} · Study`, description: deck.description } : {};
}

export default async function DeckPage({ params }: { params: Promise<{ deck: string }> }) {
  const deck = findDeck((await params).deck);
  if (!deck) notFound();
  return <DeckQuiz deckId={deck.id} />;
}
