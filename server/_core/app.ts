import "dotenv/config";
import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./vite";

/**
 * Creates the Express app (sync). Used by Vercel (export default) and by local prod (listen).
 * On Vercel, express.static is ignored — static files are served from public/ by CDN.
 * We only add a SPA fallback (send index.html) for non-API routes.
 */
export function createApp(): Express {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerOAuthRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const resNode = res as unknown as { headersSent: boolean; statusCode: number; setHeader: (k: string, v: string) => void; end: (s: string) => void };
    if (resNode.headersSent) return;
    const message = err instanceof Error ? err.message : "Server error";
    resNode.statusCode = 500;
    resNode.setHeader("Content-Type", "application/json");
    resNode.end(JSON.stringify({ error: message }));
  });

  if (process.env.VERCEL === "1") {
    // Vercel: only API routes here. Frontend (/) is served from public/ via vercel.json outputDirectory.
  } else if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  }
  // development: static/vite is set up in startServer() via setupVite

  return app;
}
