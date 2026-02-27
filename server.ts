/**
 * Entry point for Vercel. Exports the Express app so Vercel can run it as a serverless function.
 * Named server.ts (not index.ts) so Vercel does not serve it as the default document at /.
 * Local dev/prod server uses server/_core/index.ts instead.
 */
import { createApp } from "./server/_core/app";

export default createApp();
