import type { MetadataRoute } from "next";

// Makes Loquitur installable: "Add to Home Screen" on iPhone, "Install app" on Android and desktop Chrome.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Loquitur",
    short_name: "Loquitur",
    description: "Your medical paperwork, in plain English.",
    start_url: "/",
    scope: "/",
    display: "standalone", // opens full-screen, without the browser bar
    orientation: "portrait",
    background_color: "#040c20",
    theme_color: "#040c20",
    categories: ["education", "medical", "health"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Extra margin so Android can crop it to a circle or rounded square without cutting the emblem.
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Decode a label", url: "/", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Study decks", url: "/study", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Dictionary", url: "/dictionary", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
