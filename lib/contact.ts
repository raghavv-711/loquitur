// Where people can reach Raghav: privacy questions and mistake reports.
export const CONTACT = "raghavvijayapal@gmail.com";

// A mistake report as an email with the word filled in. Only the word is included, never the user's document.
export function reportMistakeHref(word: string): string {
  const subject = `Loquitur: a mistake in "${word}"`;
  const body = `Word: ${word}\n\nWhat looks wrong:\n\n\n(Please don't include any personal medical details.)`;
  return `mailto:${CONTACT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
