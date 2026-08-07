/**
 * Title Utility — Ensures concise, punchy, and understandable titles (5–9 words max).
 */

export function shortenTitle(title: string): string {
  if (!title) return "";
  let clean = title.trim();

  // Strip Markdown bolding/formatting & quotes
  clean = clean.replace(/[*_#"`]/g, "").trim();

  // Remove leading prefixes like "Research Paper: ", "Article: ", etc.
  clean = clean.replace(/^(?:Research Paper|Technical Paper|Article|Blog Post):\s*/i, "");

  const words = clean.split(/\s+/);

  // If title has separators like ":", " – ", " - ", " — "
  if (words.length > 7 || clean.includes(":") || clean.includes(" – ") || clean.includes(" - ") || clean.includes(" — ")) {
    if (clean.includes(":")) {
      const parts = clean.split(":");
      const mainPart = parts[0].trim();
      const subPart = parts.slice(1).join(":").trim();

      const mainWords = mainPart.split(/\s+/);
      if (mainWords.length >= 3 && mainWords.length <= 8) {
        const yearMatch = subPart.match(/\b(202\d|Review|Overview|Architecture|Analysis|Guide|Framework)\b/i);
        if (yearMatch && !mainPart.toLowerCase().includes(yearMatch[0].toLowerCase())) {
          clean = `${mainPart}: ${yearMatch[0]}`;
        } else {
          clean = mainPart;
        }
      } else {
        clean = mainPart;
      }
    } else if (clean.includes(" – ") || clean.includes(" - ") || clean.includes(" — ")) {
      const parts = clean.split(/\s+[–—\-]\s+/);
      clean = parts[0].trim();
    }
  }

  // Cap at 9 words maximum
  const finalWords = clean.split(/\s+/);
  if (finalWords.length > 9) {
    clean = finalWords.slice(0, 9).join(" ");
  }

  return clean;
}
