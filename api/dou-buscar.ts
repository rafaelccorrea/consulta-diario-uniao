/**
 * GET /api/dou-buscar — retorna JSON puro (sem tRPC).
 * Usado pelo Dashboard em produção para evitar 500 do pipeline tRPC/Express.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { fetchDouResults } from "./douFetch";

export default async function handler(
  _req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  res.setHeader("Content-Type", "application/json");
  try {
    const payload = await fetchDouResults();
    res.statusCode = 200;
    res.end(JSON.stringify(payload));
  } catch (err) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Erro na busca DOU",
        results: {},
        timestamp: new Date().toISOString(),
      })
    );
  }
}
