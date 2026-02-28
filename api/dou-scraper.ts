/**
 * Rota dedicada só para o scraper DOU. Invocada diretamente pela Vercel (rewrite de
 * /api/trpc/scraper.runScraper). Não carrega Express — evita 500 e resposta HTML.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import superjson from "superjson";
import { fetchDouResults } from "./douFetch";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer) => { data += chunk.toString(); });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function extractKeywords(body: string): string[] | undefined {
  try {
    // tRPC batch format: [{"0":{"json":{"keywords":[...]}}}]
    const parsed = JSON.parse(body);
    const first = Array.isArray(parsed) ? parsed[0] : parsed;
    const input = first?.["0"]?.json ?? first?.json;
    if (input?.keywords && Array.isArray(input.keywords) && input.keywords.length > 0) {
      return input.keywords as string[];
    }
  } catch {
    // ignore parse errors
  }
  return undefined;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  res.setHeader("Content-Type", "application/json");
  try {
    const body = await readBody(req);
    const keywords = extractKeywords(body);
    const payload = await fetchDouResults(keywords);
    const serialized = superjson.serialize(payload);
    res.statusCode = 200;
    res.end(JSON.stringify([{ result: { data: serialized } }]));
  } catch (err) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Erro na busca DOU",
      })
    );
  }
}
