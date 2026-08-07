import fs from "fs";
import path from "path";

function fixResearchJson() {
  const filePath = path.join(process.cwd(), "data", "research.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  if (Array.isArray(data.papers)) {
    data.papers.forEach((paper) => {
      if (typeof paper.content === "string") {
        let cnt = paper.content.trim();
        if (cnt.startsWith("```json") || cnt.startsWith("{")) {
          try {
            const cleaned = cnt.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
            const parsed = JSON.parse(cleaned);
            if (parsed && parsed.content) {
              paper.content = parsed.content;
              if (parsed.abstract) paper.abstract = parsed.abstract;
              if (parsed.excerpt) paper.excerpt = parsed.excerpt;
              console.log(`[FIX] Extracted inner markdown content for paper: "${paper.title}"`);
            }
          } catch (err) {
            console.warn(`[WARN] Could not parse nested JSON for "${paper.title}":`, err.message);
          }
        }
      }
    });
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log("✅ Fixed data/research.json!");
}

fixResearchJson();
