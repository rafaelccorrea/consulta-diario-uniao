/**
 * Vercel serverless: single entry for /api. Handles /api/trpc and /api/trpc/* via
 * vercel.json rewrites (path becomes query). Restores req.url before passing to Express.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "../server/_core/app";

const app = createApp();

export default function handler(req: IncomingMessage, res: ServerResponse): void {
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
  app(req, res);
}
