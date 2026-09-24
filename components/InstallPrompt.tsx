"use client";

import { useEffect, useState } from "react";

// Chrome/Edge/Android fire this when the site can be installed; Safari never does.
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISSED_KEY = "loquitur:install-dismissed";

// A small card inviting people to install Loquitur on their home screen.
// iPhone: step-by-step (Apple doesn't allow an install button). Android/Chrome: one-tap Install.
// Hidden when already installed, when dismissed, or on browsers that can't install.
export function InstallPrompt() {
  const [mode, setMode] = useState<"hidden" | "ios" | "button">("hidden");
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);

  useEffect(() => {
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      // storage blocked (private mode): just show the card
    }
    if (installed || dismissed) return;

    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Mac") && navigator.maxTouchPoints > 1);
    if (isIOS) setMode("ios");

    const onPrompt = (e: Event) => {
      e.preventDefault(); // show our own button instead of the browser's mini-bar
      setInstallEvent(e as InstallEvent);
      setMode("button");
    };
    const onInstalled = () => setMode("hidden");
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // ignore: it just may show again next visit
    }
    setMode("hidden");
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") setMode("hidden");
  }

  if (mode === "hidden") return null;

  return (
    <aside className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-sm">
      <span className="text-2xl" aria-hidden="true">
        📲
      </span>
      <div className="flex-1">
        <p className="font-medium text-fg">Get the Loquitur app</p>
        {mode === "ios" ? (
          <p className="mt-1 text-muted">
            In Safari, tap the <strong className="text-fg">Share</strong> button{" "}
            <span aria-hidden="true">(□↑)</span>, then <strong className="text-fg">Add to Home Screen</strong>.
          </p>
        ) : (
          <p className="mt-1 text-muted">Install it for one-tap access, full-screen, like any other app.</p>
        )}
        {mode === "button" && (
          <button
            onClick={install}
            className="mt-3 rounded-full bg-linear-to-r from-accent to-accent-2 px-4 py-1.5 text-sm font-medium text-bg hover:brightness-110"
          >
            Install app
          </button>
        )}
      </div>
      <button onClick={dismiss} aria-label="Dismiss" className="px-1 text-lg leading-none text-faint hover:text-fg">
        ×
      </button>
    </aside>
  );
}
