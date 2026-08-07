/**
 * TOC Utility — Automatically extracts headings and injects a clean Table of Contents
 * if one does not already exist in the markdown content.
 */

export function ensureTableOfContents(markdown: string): string {
  if (!markdown) return "";

  let cleaned = markdown;

  // 1. Unwrap ```markdown ... ``` code block around Table of Contents or headers
  cleaned = cleaned.replace(/```markdown\s*([\s\S]*?)\s*```/gi, (m: string, inner: string) => {
    if (inner.includes("Table of Contents") || inner.includes("# ") || inner.includes("## ")) return inner;
    return m;
  });
  cleaned = cleaned.replace(/^```markdown\s*$/gm, "").replace(/^```\s*$/gm, "");

  // 2. Check if a Table of Contents already exists
  if (/##?\s*Table of Contents/i.test(cleaned)) {
    return cleaned;
  }

  // 3. Extract all ## and ### headings
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: Array<{ level: number; title: string; slug: string }> = [];

  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(cleaned)) !== null) {
    const rawTitle = match[2].trim().replace(/[*_#`]/g, "");
    
    // Skip if heading is itself Table of Contents or References
    if (/table of contents/i.test(rawTitle)) continue;

    const slug = rawTitle
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    headings.push({
      level: match[1].length, // 2 for ##, 3 for ###
      title: rawTitle,
      slug,
    });
  }

  // If fewer than 2 headings exist, no TOC needed
  if (headings.length < 2) {
    return cleaned;
  }

  // 4. Build TOC markdown
  const tocLines: string[] = ["## Table of Contents\n"];
  headings.forEach((h) => {
    const indent = h.level === 3 ? "  " : "";
    tocLines.push(`${indent}- [${h.title}](#${h.slug})`);
  });
  const tocMarkdown = tocLines.join("\n") + "\n\n---\n\n";

  // 5. Inject TOC after Abstract section or right before the first ## heading
  if (/##\s*Abstract/i.test(cleaned)) {
    cleaned = cleaned.replace(/(##\s*Abstract[\s\S]*?)(?=\n##\s+|\n#\s+|$)/i, `$1\n\n${tocMarkdown}`);
  } else {
    // Inject before the first ## heading
    const firstH2Index = cleaned.search(/^##\s+/m);
    if (firstH2Index !== -1) {
      cleaned = cleaned.slice(0, firstH2Index) + tocMarkdown + cleaned.slice(firstH2Index);
    } else {
      cleaned = tocMarkdown + cleaned;
    }
  }

  return cleaned;
}
