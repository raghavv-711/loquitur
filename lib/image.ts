// Runs in the browser. Shrinks a photo before upload: phone photos are often 4000+ px and several MB,
// but Claude reads text just as well at ~1600 px, and smaller uploads are faster and cheaper.
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.85;

export type PreparedImage = { data: string; mediaType: "image/jpeg"; previewUrl: string };

export async function prepareImage(source: Blob): Promise<PreparedImage> {
  const url = URL.createObjectURL(source);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser couldn't process that photo.");
    ctx.fillStyle = "#ffffff"; // transparent PNGs/SVGs would otherwise turn black as JPEG
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    return { data: dataUrl.slice(dataUrl.indexOf(",") + 1), mediaType: "image/jpeg", previewUrl: dataUrl };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Couldn't open that file. Try a JPG or PNG photo (iPhone HEIC photos may need converting)."));
    img.src = url;
  });
}
