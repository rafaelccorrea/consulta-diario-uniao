/**
 * Rota dedicada só para o scraper DOU. Invocada diretamente pela Vercel (rewrite de
 * /api/trpc/scraper.runScraper). Não carrega Express nem superjson — evita crash no cold start.
 *
 * O tRPC client com superjson aceita { json: data } sem campo meta quando não há tipos especiais.
 */
import type { IncomingMessage, ServerResponse } from "node:http";

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
    const { fetchDouResults } = await import("./douFetch");
    const payload = await fetchDouResults(keywords);
    res.statusCode = 200;
    // superjson no cliente aceita { json: payload } quando não há tipos especiais (Date, Map, etc.)
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
