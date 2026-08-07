// @ts-nocheck
import clientPromise from "./mongodb";

export async function getSettings() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const settings = await db.collection("settings").findOne({});
    return settings ? { ...settings, _id: settings._id ? settings._id.toString() : "" } : null;
  } catch (e) {
    console.error("getSettings failed:", e);
    return null;
  }
}

export async function getProjects(): Promise<any[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const projects = await db.collection("projects").find({}).toArray();
    return projects.map((p) => ({ ...p, _id: p._id.toString() }));
  } catch (e) {
    console.error("getProjects failed:", e);
    return [];
  }
}

export function extractTimestamp(item: any): number {
  if (!item) return 0;
  if (item.publishedAt) {
    const t = new Date(item.publishedAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (item.createdAt) {
    const t = new Date(item.createdAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (item.date) {
    const t = new Date(item.date).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (item._id) {
    const idStr = typeof item._id === "string" ? item._id : item._id.toString();
    if (idStr.length === 24) {
      const t = parseInt(idStr.substring(0, 8), 16) * 1000;
      if (!isNaN(t) && t > 0) return t;
    }
  }
  return 0;
}

export function formatExactPublishTime(item: any): string {
  const ts = extractTimestamp(item);
  if (!ts) return item?.date || "Recently published";
  const d = new Date(ts);
  const formattedDate = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Kathmandu",
  });
  const formattedTime = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kathmandu",
  });
  return `${formattedDate} at ${formattedTime} (NPT)`;
}

export async function getArticles(): Promise<any[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const articles = await db
      .collection("articles")
      .find({ status: { $ne: "draft" } })
      .toArray();

    const mapped = articles.map((a) => ({
      ...a,
      _id: a._id.toString(),
      published: a.published !== false,
      status: a.status || "published",
      formattedPublishTime: formatExactPublishTime(a),
      timestamp: extractTimestamp(a),
    }));

    mapped.sort((a, b) => b.timestamp - a.timestamp);
    return mapped;
  } catch (e) {
    console.error("getArticles failed:", e);
    return [];
  }
}

export async function getExperience(): Promise<any[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const experience = await db.collection("experience").find({}).toArray();
    return experience.map((e) => ({ ...e, _id: e._id.toString() }));
  } catch (e) {
    console.error("getExperience failed:", e);
    return [];
  }
}

export async function getResearch(): Promise<any[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const research = await db
      .collection("research")
      .find({ status: { $ne: "draft" } })
      .toArray();

    const mapped = research.map((r) => ({
      ...r,
      _id: r._id.toString(),
      published: r.published !== false,
      status: r.status || "published",
      formattedPublishTime: formatExactPublishTime(r),
      timestamp: extractTimestamp(r),
    }));

    mapped.sort((a, b) => b.timestamp - a.timestamp);
    return mapped;
  } catch (e) {
    console.error("getResearch failed:", e);
    return [];
  }
}

export async function getLab(): Promise<any[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const lab = await db.collection("lab").find({}).toArray();
    return lab.map((l) => ({ ...l, _id: l._id.toString() }));
  } catch (e) {
    console.error("getLab failed:", e);
    return [];
  }
}

export async function getMessages(): Promise<any[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const messages = await db.collection("messages").find({}).sort({ date: -1 }).toArray();
    return messages.map((m) => ({ ...m, _id: m._id.toString() }));
  } catch (e) {
    console.error("getMessages failed:", e);
    return [];
  }
}

export async function getAiConfig(): Promise<any> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const config = await db.collection("aiconfig").findOne({});
    return config ? { ...config, _id: config._id.toString() } : null;
  } catch (e) {
    console.error("getAiConfig failed:", e);
    return null;
  }
}

