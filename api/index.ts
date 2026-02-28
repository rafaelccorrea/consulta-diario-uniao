/**
 * Vercel serverless: single entry for /api.
 * Na Vercel, scraper.runScraper é atendido aqui (fetch DOU direto) — sem Express, sem 500.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { fetchDouResults } from "./douFetch";

function sendJson(res: ServerResponse, code: number, body: object): void {
  if (res.headersSent) return;
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function runExpress(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const { createApp } = await import("../server/_core/app");
  const app = createApp();
  (app as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
}

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  if (process.env.VERCEL === "1" && req.url?.startsWith("/api")) {
    const u = new URL(req.url, "http://localhost");
    let path = u.searchParams.get("path");
    // Rewrite envia ?path=:path*; se vier URL original, extrair path do pathname
    if (!path && u.pathname.startsWith("/api/trpc/")) {
      const match = u.pathname.match(/^\/api\/trpc\/([^/]+)/);
      path = match ? match[1] : null;
    }
    if (path === "scraper.runScraper") {
      fetchDouResults()
        .then((payload) => {
          sendJson(res, 200, [{ result: { data: { json: payload } } }]);
        })
        .catch((err) => {
          sendJson(res, 500, { error: err instanceof Error ? err.message : "Erro" });
        });
      return;
    }
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
