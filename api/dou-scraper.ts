/**
 * Rota dedicada só para o scraper DOU. Invocada diretamente pela Vercel (rewrite de
 * /api/trpc/scraper.runScraper). Não carrega Express — evita 500 e resposta HTML.
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
    res.end(JSON.stringify([{ result: { data: { json: payload } } }]));
  } catch (err) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Erro na busca DOU",
      })
    );
  }
}
