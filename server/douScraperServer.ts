/**
 * Busca DOU in-process (fetch + cheerio). Usado na Vercel em vez de execSync(douScraper.cjs).
 */
import * as cheerio from "cheerio";

const DEFAULT_HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" };
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { ...options, headers: { ...DEFAULT_HEADERS, ...(options.headers as object) } });
      if (res.ok) return res;
      if (i < retries - 1) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    } catch (e) {
      if (i < retries - 1) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      else throw e;
    }
  }
  throw new Error("Max retries exceeded");
}

export type DouScraperItem = {
  secao?: string;
  title: string;
  url?: string;
  abstract?: string;
  date?: string;
  classPK: string | number;
  displayDateSortable?: string;
};

export type DouScraperResults = Record<string, DouScraperItem[]>;

const DEFAULT_KEYWORDS = ["previdencia social"];

/**
 * Busca no DOU (in.gov.br) e retorna resultados por palavra-chave.
 * Na Vercel limitamos à primeira página para caber no timeout.
 */
export async function getResultsFromDou(keywords: string[] = DEFAULT_KEYWORDS): Promise<DouScraperResults> {
  const results: DouScraperResults = {};
  const onlyFirstPage = process.env.VERCEL === "1";

  for (const keyword of keywords) {
    results[keyword] = [];

    const payload: Record<string, string> = {
      q: `"${keyword}"`,
      s: "todos",
      exactDate: "dia",
      sortType: "1",
    };

    try {
      const url = new URL("https://www.in.gov.br/consulta/-/buscar/dou");
      Object.entries(payload).forEach(([k, v]) => url.searchParams.append(k, v));

      const res = await fetchWithRetry(url.toString(), { method: "GET" });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const html = await res.text();
      const $ = cheerio.load(html);

      const scriptTag = $('script#_br_com_seatecnologia_in_buscadou_BuscaDouPortlet_params');
      if (!scriptTag.length || !scriptTag.html()) continue;

      const data = JSON.parse(scriptTag.html()) as { jsonArray?: Array<Record<string, unknown>> };
      const searchResults = data.jsonArray || [];

      for (const content of searchResults) {
        const classPK = String(content.classPK ?? "");
        const urlTitle = (content.urlTitle as string) || "";
        let fullUrl = "";
        if (urlTitle.startsWith("http")) fullUrl = urlTitle;
        else if (urlTitle.includes("-")) fullUrl = `https://www.in.gov.br/web/dou/-/${urlTitle}`;
        else if (classPK) fullUrl = `https://www.in.gov.br/consulta/-/detalhe/${classPK}`;
        else fullUrl = `https://www.in.gov.br`;
        results[keyword].push({
          secao: (content.pubName as string) || (content.secao as string),
          title: (content.title as string) || "",
          url: fullUrl,
          abstract: (content.content as string) || "",
          date: (content.pubDate as string) || "",
          classPK: String(classPK),
          displayDateSortable: content.displayDateSortable as string,
        });
      }

      if (onlyFirstPage) break;
    } catch (e) {
      console.error(`[douScraperServer] Erro para '${keyword}':`, e);
    }
  }

  return results;
}
