/**
 * Vercel serverless: single entry for /api.
 * Na Vercel, scraper.runScraper é atendido aqui (fetch DOU direto) — sem Express, sem 500.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import superjson from "superjson";
import { fetchDouResults } from "./douFetch";

function sendJson(res: ServerResponse, code: number, body: any): void {
  if (res.headersSent) return;
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer) => { data += chunk.toString(); });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function extractKeywords(body: string): string[] | undefined {
  try {
    const parsed = JSON.parse(body);
    const first = Array.isArray(parsed) ? parsed[0] : parsed;
    const input = first?.["0"]?.json ?? first?.json;
    if (input?.keywords && Array.isArray(input.keywords) && input.keywords.length > 0) {
      return input.keywords as string[];
    }
  } catch {
    // ignore parse errors
  }
  return undefined;
}

async function runExpress(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const { createApp } = await import("../server/_core/app");
    const app = createApp();
    (app as any)(req, res);
  } catch (err) {
    console.error("Error loading Express app:", err);
    sendJson(res, 500, { 
      error: "Failed to load server", 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
}

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  const url = req.url || "/";
  
  if (process.env.VERCEL === "1" && url.startsWith("/api")) {
    const u = new URL(url, "http://localhost");
    let path = u.searchParams.get("path");
    
    // Rewrite envia ?path=:path*; se vier URL original, extrair path do pathname
    if (!path && u.pathname.startsWith("/api/trpc/")) {
      const match = u.pathname.match(/^\/api\/trpc\/([^/]+)/);
      path = match ? match[1] : null;
    }

    if (path === "scraper.runScraper") {
      readBody(req)
        .then((body) => {
          const keywords = extractKeywords(body);
          return fetchDouResults(keywords);
        })
        .then((payload) => {
          const serialized = superjson.serialize(payload);
          sendJson(res, 200, [{ result: { data: serialized } }]);
        })
        .catch((err) => {
          sendJson(res, 500, { error: err instanceof Error ? err.message : "Erro na busca DOU" });
        });
      return;
    }

    // Normalizar URL para o middleware do Express
    if (path != null) {
      u.searchParams.delete("path");
      const q = u.searchParams.toString();
      req.url = `/api/trpc/${path}${q ? `?${q}` : ""}`;
    } else if (u.pathname === "/api" && !path) {
      req.url = `/api/trpc${u.search ? u.search : ""}`;
    }
  }

  runExpress(req, res).catch((err) => {
    sendJson(res, 500, { error: err instanceof Error ? err.message : "Server error" });
  });
}
