"use client";

import { useEffect, useState } from "react";

// Reads text out loud with the browser's built-in voice (Web Speech API). Free, private
// (nothing is sent anywhere), and hidden on the rare browser that doesn't support it.
export function ReadAloud({ text, label = "Read aloud" }: { text: string; label?: string }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel(); // stop when leaving the page
    };
  }, []);

  // A new document means new text: stop reading the old one.
  useEffect(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [text]);

  if (!supported) return null;

  function toggle() {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95; // a touch slower than default, easier to follow
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utterance);
    setSpeaking(true);
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={speaking}
      className="flex shrink-0 items-center gap-1.5 rounded-sm border border-line px-3 py-1 text-xs font-medium text-accent hover:border-accent"
    >
      <span aria-hidden="true">{speaking ? "⏹" : "🔊"}</span>
      {speaking ? "Stop" : label}
    </button>
  );
}
