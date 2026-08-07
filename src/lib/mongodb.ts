import { MongoClient } from "mongodb";
import dns from "dns";
import fs from "fs";
import path from "path";

// Fix for Windows ISP DNS blocking SRV queries
dns.setServers(["8.8.8.8", "1.1.1.1"]);

if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI is missing in environment variables. Please add it.");
}

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio";
const options = {};

// Helper query matcher for local development mock database
function matchesQuery(item: any, query?: any): boolean {
  if (!query || Object.keys(query).length === 0) return true;
  if (!item || typeof item !== "object") return false;

  // Handle $or
  if (Array.isArray(query.$or)) {
    return query.$or.some((subQuery: any) => matchesQuery(item, subQuery));
  }

  // Handle $and
  if (Array.isArray(query.$and)) {
    return query.$and.every((subQuery: any) => matchesQuery(item, subQuery));
  }

  for (const key in query) {
    if (key.startsWith("$")) continue;
    const queryVal = query[key];
    const itemVal = item[key];

    if (key === "_id" || key === "id") {
      const itemStr = item._id?.toString() || item.id?.toString();
      const queryStr = typeof queryVal === "object" ? queryVal?.toString() : String(queryVal);
      if (itemStr === queryStr) continue;
      if (item._id === queryVal || item.id === queryVal) continue;
      return false;
    }

    if (queryVal && typeof queryVal === "object") {
      if (queryVal.$ne !== undefined && itemVal === queryVal.$ne) return false;
      if (queryVal.$in && Array.isArray(queryVal.$in) && !queryVal.$in.includes(itemVal)) return false;
      if (queryVal.$exists !== undefined) {
        const exists = itemVal !== undefined;
        if (exists !== Boolean(queryVal.$exists)) return false;
        continue;
      }
    } else if (itemVal !== queryVal) {
      return false;
    }
  }

  return true;
}

class MockMongoClient {
  db() {
    return {
      collection: (name: string) => {
        const filePath = path.join(process.cwd(), "data", `${name}.json`);
        const read = () => {
          try {
            const data = fs.readFileSync(filePath, "utf8");
            return JSON.parse(data);
          } catch {
            return name === "messages" || name === "research" || name === "lab" || name === "articles" || name === "projects" || name === "experience" ? [] : {};
          }
        };
        const write = (data: any) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        return {
          findOne: async (query?: any) => {
            const raw = read();
            let items: any[] = [];
            if (Array.isArray(raw)) {
              items = raw;
            } else if (raw && typeof raw === "object") {
              items = Array.isArray(raw.papers) ? [...raw.papers, raw] : [raw];
            }
            if (!query || Object.keys(query).length === 0) return items[0] || null;
            return items.find((item: any) => matchesQuery(item, query)) || null;
          },
          find: (query?: any) => {
            const buildChain = (filterFn?: (data: any[]) => any[]) => {
              const getFiltered = () => {
                const raw = read();
                let data: any[] = [];
                if (Array.isArray(raw)) {
                  data = raw;
                } else if (raw && typeof raw === "object") {
                  data = Array.isArray(raw.papers) ? raw.papers : [raw];
                }
                data = data.map((d: any, idx: number) => ({ ...d, _id: d._id || `mock-id-${idx}` }));
                if (query && Object.keys(query).length > 0) {
                  data = data.filter((item: any) => matchesQuery(item, query));
                }
                return filterFn ? filterFn(data) : data;
              };
              return {
                toArray: async () => getFiltered(),
                sort: (_sortSpec?: any) => {
                  const sortChain = {
                    toArray: async () => getFiltered(),
                    limit: (n: number) => ({
                      toArray: async () => getFiltered().slice(0, n),
                    }),
                  };
                  return sortChain;
                },
                limit: (n: number) => ({
                  toArray: async () => getFiltered().slice(0, n),
                }),
              };
            };
            return buildChain();
          },
          updateOne: async (query: any, update: any, options?: any) => {
            let data = read();
            if (Array.isArray(data)) {
              const idx = data.findIndex((item: any) => matchesQuery(item, query));
              if (idx !== -1) {
                if (update.$set) data[idx] = { ...data[idx], ...update.$set };
                write(data);
                return { matchedCount: 1, modifiedCount: 1 };
              }
              if (options?.upsert && update.$set) {
                const newDoc = { ...query, ...update.$set, _id: Date.now().toString() };
                data.unshift(newDoc);
                write(data);
                return { matchedCount: 0, modifiedCount: 1, upsertedId: newDoc._id };
              }
            } else if (data && typeof data === "object") {
              if (update.$set) data = { ...data, ...update.$set };
              write(data);
              return { matchedCount: 1, modifiedCount: 1 };
            }
            return { matchedCount: 0, modifiedCount: 0 };
          },
          insertOne: async (doc: any) => {
            let data = read();
            const newDoc = { ...doc, _id: doc._id || Date.now().toString() };
            if (Array.isArray(data)) {
              data.unshift(newDoc);
            } else if (data && typeof data === "object") {
              if (!data.papers) data.papers = [];
              data.papers.unshift(newDoc);
            } else {
              data = [newDoc];
            }
            write(data);
            return { insertedId: newDoc._id };
          },
          deleteOne: async (query: any) => {
            let data = read();
            if (Array.isArray(data)) {
              const idx = data.findIndex((item: any) => matchesQuery(item, query));
              if (idx !== -1) {
                data.splice(idx, 1);
                write(data);
                return { deletedCount: 1 };
              }
              return { deletedCount: 0 };
            } else if (data && typeof data === "object" && Array.isArray(data.papers)) {
              const idx = data.papers.findIndex((item: any) => matchesQuery(item, query));
              if (idx !== -1) {
                data.papers.splice(idx, 1);
                write(data);
                return { deletedCount: 1 };
              }
              return { deletedCount: 0 };
            }
            return { deletedCount: 0 };
          },
          deleteMany: async (query?: any) => {
            let data = read();
            if (!query || Object.keys(query).length === 0) {
              write([]);
              return { deletedCount: Array.isArray(data) ? data.length : 1 };
            }
            if (Array.isArray(data)) {
              const initialLen = data.length;
              data = data.filter((item: any) => !matchesQuery(item, query));
              write(data);
              return { deletedCount: initialLen - data.length };
            }
            write([]);
            return { deletedCount: 1 };
          },
          updateMany: async (query: any, update: any) => {
            let data = read();
            if (Array.isArray(data)) {
              let modified = 0;
              data.forEach((item: any, idx: number) => {
                if (matchesQuery(item, query)) {
                  if (update.$set) data[idx] = { ...data[idx], ...update.$set };
                  modified++;
                }
              });
              if (modified > 0) write(data);
              return { modifiedCount: modified };
            }
            return { modifiedCount: 0 };
          }
        };
      }
    };
  }
}

let clientPromise: Promise<any>;

if (process.env.NODE_ENV === "development") {
  // Use mock client locally to completely bypass Windows DNS/ISP blocking issues!
  clientPromise = Promise.resolve(new MockMongoClient());
} else {
  // Production (Vercel) uses real MongoDB!
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
