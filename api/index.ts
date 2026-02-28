/**
 * Vercel serverless: single entry for /api. Handles /api/trpc and /api/trpc/* via
 * vercel.json rewrites. Restores req.url and passes to Express.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "../server/_core/app";

let app: ReturnType<typeof createApp> | null = null;

function getApp(): ReturnType<typeof createApp> {
  if (!app) app = createApp();
  return app;
}

function sendJson(res: ServerResponse, code: number, body: object): void {
  if (res.headersSent) return;
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  try {
    if (process.env.VERCEL === "1" && req.url?.startsWith("/api")) {
      const u = new URL(req.url, "http://localhost");
      const path = u.searchParams.get("path");
      if (path != null) {
        u.searchParams.delete("path");
        const q = u.searchParams.toString();
        req.url = `/api/trpc/${path}${q ? `?${q}` : ""}`;
      } else if (u.pathname === "/api" && !path) {
        req.url = `/api/trpc${u.search ? u.search : ""}`;
      }
    }
    getApp()(req, res);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    sendJson(res, 500, { error: message });
  }
}
