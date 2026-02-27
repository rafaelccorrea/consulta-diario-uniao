/**
 * Vercel serverless function: handles only /api/* (trpc, oauth, etc.).
 * Frontend (/) is served from public/ via outputDirectory in vercel.json.
 */
import { createApp } from "../server/_core/app";

export default createApp();
