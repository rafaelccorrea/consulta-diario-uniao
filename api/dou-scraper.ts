/**
 * Rota dedicada para o scraper DOU. Invocada pela Vercel via rewrite de
 * /api/trpc/scraper.runScraper. Lógica de fetch inlinada — sem imports entre arquivos api/.
 */
import type { IncomingMessage, ServerResponse } from "node:http";

const DOU_URL = "https://www.in.gov.br/consulta/-/buscar/dou";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
const SCRIPT_ID = "_br_com_seatecnologia_in_buscadou_BuscaDouPortlet_params";

async function fetchDouPage(keyword: string): Promise<Array<Record<string, unknown>>> {
  const url = `${DOU_URL}?q=${encodeURIComponent('"' + keyword + '"')}&s=todos&exactDate=dia&sortType=1`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  let res: Response;
  try {
    res = await fetch(url, { method: "GET", headers: { "User-Agent": UA }, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
  if (!res.ok) return [];
  const html = await res.text();
  const re = new RegExp(
    '<script[^>]*id="' + SCRIPT_ID.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"[^>]*>([\\s\\S]*?)</script>',
    "i"
  );
  const m = html.match(re);
  if (!m || !m[1]) return [];
  try {
    const data = JSON.parse(m[1].trim()) as { jsonArray?: Array<Record<string, unknown>> };
    return data.jsonArray || [];
  } catch {
    return [];
  }
}

function buildItem(c: Record<string, unknown>): Record<string, unknown> {
  const classPK = String(c.classPK ?? "");
  const urlTitle = (c.urlTitle as string) || "";
  let url = "";
  if (urlTitle.startsWith("http")) url = urlTitle;
  else if (urlTitle.includes("-")) url = `https://www.in.gov.br/web/dou/-/${urlTitle}`;
  else if (classPK) url = `https://www.in.gov.br/consulta/-/detalhe/${classPK}`;
  else url = "https://www.in.gov.br";
  return {
    secao: (c.pubName as string) || (c.secao as string),
    title: (c.title as string) || "",
    url,
    abstract: (c.content as string) || "",
    date: (c.pubDate as string) || "",
    classPK,
    displayDateSortable: c.displayDateSortable,
  };
}

async function fetchDouResults(keywords: string[] = ["previdencia social"]) {
  const results: Record<string, Array<Record<string, unknown>>> = {};
  for (const keyword of keywords) {
    try {
      const list = await fetchDouPage(keyword);
      results[keyword] = list.map(buildItem);
    } catch {
      results[keyword] = [];
    }
  }
  return {
    success: true,
    message: "Busca concluída",
    results,
    timestamp: new Date().toISOString(),
  };
}

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
    const parsed = JSON.parse(body);
    const first = Array.isArray(parsed) ? parsed[0] : parsed;
    const input = first?.["0"]?.json ?? first?.json;
    if (input?.keywords && Array.isArray(input.keywords) && input.keywords.length > 0) {
      return input.keywords as string[];
    }
  } catch {
    // ignore
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
    res.statusCode = 200;
    res.end(JSON.stringify([{ result: { data: payload } }]));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Erro na busca DOU" }));
  }
}
