/**
 * Vercel serverless: entry para /api.
 * Lógica de fetch inlinada — sem imports entre arquivos api/ para evitar "Cannot find module".
 */
import type { IncomingMessage, ServerResponse } from "node:http";

// ── fetch DOU ────────────────────────────────────────────────────────────────

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

// ── helpers HTTP ─────────────────────────────────────────────────────────────

function sendJson(res: ServerResponse, code: number, body: unknown): void {
  if (res.headersSent) return;
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
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

// ── handler principal ─────────────────────────────────────────────────────────

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  const url = req.url || "/";

  if (process.env.VERCEL === "1" && url.startsWith("/api")) {
    const u = new URL(url, "http://localhost");
    let path = u.searchParams.get("path");

    if (!path && u.pathname.startsWith("/api/trpc/")) {
      const match = u.pathname.match(/^\/api\/trpc\/([^/]+)/);
      path = match ? match[1] : null;
    }

    if (path === "scraper.runScraper") {
      readBody(req)
        .then(async (body) => fetchDouResults(extractKeywords(body)))
        .then((payload) => sendJson(res, 200, [{ result: { data: payload } }]))
        .catch((err) => sendJson(res, 500, { error: err instanceof Error ? err.message : "Erro na busca DOU" }));
      return;
    }

    if (!path && u.pathname === "/api" && req.method === "POST" && u.searchParams.has("batch")) {
      readBody(req)
        .then(async (body) => fetchDouResults(extractKeywords(body)))
        .then((payload) => { if (!res.headersSent) sendJson(res, 200, [{ result: { data: payload } }]); })
        .catch((err) => { if (!res.headersSent) sendJson(res, 500, { error: err instanceof Error ? err.message : "Erro na busca DOU" }); });
      return;
    }

    if (path != null) {
      u.searchParams.delete("path");
      const q = u.searchParams.toString();
      req.url = `/api/trpc/${path}${q ? `?${q}` : ""}`;
    } else if (u.pathname === "/api" && !path) {
      req.url = `/api/trpc${u.search ? u.search : ""}`;
    }
  }

  // Fallback: Express app (rotas tRPC restantes)
  import("../server/_core/app")
    .then(({ createApp }) => {
      const app = createApp();
      (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
    })
    .catch((err) => sendJson(res, 500, { error: err instanceof Error ? err.message : "Server error" }));
}
