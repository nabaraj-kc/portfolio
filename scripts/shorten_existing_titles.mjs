import fs from "fs";
import path from "path";
import { shortenTitle } from "../src/lib/title-utils.ts";

function cleanJsonTitles(filename) {
  const filePath = path.join(process.cwd(), "data", filename);
  if (!fs.existsSync(filePath)) return;

  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  if (Array.isArray(data)) {
    data.forEach((item) => {
      if (item.title) {
        const oldTitle = item.title;
        item.title = shortenTitle(item.title);
        if (oldTitle !== item.title) {
          console.log(`[SHORTEN] ${filename}: "${oldTitle}" -> "${item.title}"`);
        }
      }
    });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } else if (data && typeof data === "object" && Array.isArray(data.papers)) {
    data.papers.forEach((item) => {
      if (item.title) {
        const oldTitle = item.title;
        item.title = shortenTitle(item.title);
        if (oldTitle !== item.title) {
          console.log(`[SHORTEN] ${filename} (papers): "${oldTitle}" -> "${item.title}"`);
        }
      }
    });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
}

cleanJsonTitles("research.json");
cleanJsonTitles("articles.json");
console.log("✅ Existing titles shortened!");
