/**
 * Vercel serverless: handles /api/trpc so tRPC returns JSON.
 * Frontend (/) is served from public/ via outputDirectory in vercel.json.
 */
import { createApp } from "../server/_core/app";

export default createApp();
