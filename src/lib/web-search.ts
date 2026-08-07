import * as cheerio from "cheerio";

// Helper to fetch and scrape a specific URL's text content
async function scrapeUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!response.ok) return "";
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Remove scripts, styles, etc.
    $("script, style, noscript, iframe, img, svg").remove();
    
    // Extract text and clean up whitespace
    let text = $("body").text().replace(/\s+/g, " ").trim();
    return text.substring(0, 3000); // Limit length to avoid massive tokens
  } catch (err) {
    return "";
  }
}

// Helper to perform a single DDG search
async function searchDuckDuckGo(query: string): Promise<any[]> {
  try {
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const results: any[] = [];
    $(".result__body").each((_, element) => {
      const title = $(element).find(".result__title").text().trim();
      const snippet = $(element).find(".result__snippet").text().trim();
      let url = $(element).find(".result__url").attr("href") || $(element).find(".result__url").text().trim();
      
      // DuckDuckGo sometimes wraps URLs in a redirect, try to clean it
      if (url.startsWith("//duckduckgo.com/l/?uddg=")) {
        try {
          url = decodeURIComponent(url.split("uddg=")[1].split("&")[0]);
        } catch(e) {}
      } else if (!url.startsWith("http")) {
         url = "https://" + url;
      }

      if (title && snippet) {
        results.push({ title, snippet, url });
      }
    });

    return results.slice(0, 5); // Return top 5
  } catch (error) {
    return [];
  }
}

export async function performWebSearch(query: string): Promise<string> {
  try {
    const isDomainSpecific = /nabaraj|nabarajkc|portfolio|website/i.test(query);
    
    // Run general search
    const generalResults = await searchDuckDuckGo(query);
    
    let domainResults: any[] = [];
    if (isDomainSpecific) {
      // Run targeted search on the domain
      domainResults = await searchDuckDuckGo(`site:nabarajkc.com.np ${query}`);
    }

    // Combine and deduplicate by URL
    const allResults = [...domainResults, ...generalResults];
    const uniqueResultsMap = new Map();
    for (const r of allResults) {
      if (!uniqueResultsMap.has(r.url)) uniqueResultsMap.set(r.url, r);
    }
    const uniqueResults = Array.from(uniqueResultsMap.values()).slice(0, 7);

    if (uniqueResults.length === 0) return "";

    let finalOutput = "";
    
    // Perform deep scraping on results
    for (const res of uniqueResults) {
      finalOutput += `\n\nTitle: ${res.title}\nURL: ${res.url}\nSearch Snippet: ${res.snippet}`;
      
      // If it's the target domain, scrape deeply
      if (res.url.includes("nabarajkc.com.np")) {
        const pageContent = await scrapeUrlContent(res.url);
        if (pageContent) {
          finalOutput += `\n--- DEEP SCRAPED CONTENT FROM ${res.url} ---\n${pageContent}\n--- END SCRAPED CONTENT ---`;
        }
      }
    }

    return finalOutput.trim();
  } catch (error) {
    console.error("Web search error:", error);
    return "";
  }
}
