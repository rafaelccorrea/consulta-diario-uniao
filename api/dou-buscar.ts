/**
 * GET /api/dou-buscar — retorna JSON puro (sem tRPC).
 * Usado pelo Dashboard em produção para evitar 500 do pipeline tRPC/Express.
 */
import type { IncomingMessage, ServerResponse } from "node:http";

export default async function handler(
  _req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const send = (code: number, body: object) => {
    if (res.headersSent) return;
    res.statusCode = code;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(body));
  };
  try {
    const { fetchDouResults } = await import("./douFetch");
    const payload = await fetchDouResults();
    send(200, payload);
  } catch (err) {
    send(500, {
      success: false,
      error: err instanceof Error ? err.message : "Erro na busca DOU",
      results: {},
      timestamp: new Date().toISOString(),
    });
  }
}
