/**
 * Busca DOU só com fetch + regex. Sem imports de server/ — evita 500 na Vercel.
 */
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

export async function fetchDouResults(keywords: string[] = ["previdencia social"]): Promise<{
  success: boolean;
  message: string;
  results: Record<string, Array<Record<string, unknown>>>;
  timestamp: string;
}> {
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
