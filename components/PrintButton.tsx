"use client";

// Opens the browser's print dialog, where "Save as PDF" is also an option.
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="h-12 rounded-sm bg-accent px-7 text-lg font-semibold text-bg transition hover:bg-accent-soft"
    >
      Print or save as PDF
    </button>
  );
}
