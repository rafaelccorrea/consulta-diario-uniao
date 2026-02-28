/**
 * Vercel serverless catch-all: handles /api, /api/trpc, /api/trpc/*, etc.
 * Frontend (/) is served from public/ via outputDirectory in vercel.json.
 */
import { createApp } from "../server/_core/app";

export default createApp();
