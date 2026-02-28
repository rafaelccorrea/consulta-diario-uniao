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
    if (res.headersSent) return;
    const message = err instanceof Error ? err.message : "Server error";
    res.status(500).setHeader("Content-Type", "application/json").end(JSON.stringify({ error: message }));
  });

  if (process.env.VERCEL === "1") {
    // Vercel: only API routes here. Frontend (/) is served from public/ via vercel.json outputDirectory.
  } else if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  }
  // development: static/vite is set up in startServer() via setupVite

  return app;
}
