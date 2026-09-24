import { reportMistakeHref } from "@/lib/contact";

// "spot a mistake?" link that opens an email to Raghav about one word.
export function ReportMistake({ word, className = "" }: { word: string; className?: string }) {
  return (
    <a href={reportMistakeHref(word)} className={`underline underline-offset-4 hover:no-underline ${className}`}>
      spot a mistake?
    </a>
  );
}
