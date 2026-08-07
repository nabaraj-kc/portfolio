import { MetadataRoute } from "next";
import clientPromise from "@/lib/mongodb";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nabarajkc.com.np";

  // Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/research`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lab`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/krrishmay`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Lab Instruments & Tools
    {
      url: `${baseUrl}/lab/nepali-translator`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lab/resume-analyzer`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lab/nepali-qa`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lab/code-reviewer`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lab/attention-visualizer`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/lab/cost-comparator`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Subdomain Mirrors
    {
      url: "https://labs.nabarajkc.com.np",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://research.nabarajkc.com.np",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://articles.nabarajkc.com.np",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://krrishmay.nabarajkc.com.np",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Dynamic Content Routes from Database
  let articleRoutes: MetadataRoute.Sitemap = [];
  let researchRoutes: MetadataRoute.Sitemap = [];

  try {
    const client = await clientPromise;
    const db = client.db();

    // Fetch Articles
    const articles = await db.collection("articles").find({}).toArray();
    articleRoutes = articles
      .filter((a: any) => a && (a.slug || a._id))
      .map((a: any) => ({
        url: `${baseUrl}/articles/${a.slug || a._id}`,
        lastModified: a.publishedAt ? new Date(a.publishedAt) : new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }));

    // Fetch Research Papers
    const researchItems = await db.collection("research").find({}).toArray();
    for (const item of researchItems) {
      if (item.papers && Array.isArray(item.papers)) {
        for (const p of item.papers) {
          if (p.slug || p.id) {
            researchRoutes.push({
              url: `${baseUrl}/research/${p.slug || p.id}`,
              lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
              changeFrequency: "monthly" as const,
              priority: 0.8,
            });
          }
        }
      } else if (item.title || item.slug) {
        researchRoutes.push({
          url: `${baseUrl}/research/${item.slug || item._id}`,
          lastModified: item.publishedAt ? new Date(item.publishedAt) : new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.8,
        });
      }
    }
  } catch (e) {
    console.error("Error generating dynamic sitemap routes:", e);
  }

  return [...staticRoutes, ...articleRoutes, ...researchRoutes];
}
