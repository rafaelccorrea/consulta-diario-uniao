/**
 * Busca DOU diretamente do browser do usuário.
 * Isso evita o bloqueio de IP de datacenter que o in.gov.br aplica a servidores em nuvem.
 */

const DOU_URL = "https://www.in.gov.br/consulta/-/buscar/dou";
const SCRIPT_ID = "_br_com_seatecnologia_in_buscadou_BuscaDouPortlet_params";

export type DouItem = {
  secao: string;
  title: string;
  url: string;
  abstract: string;
  date: string;
  classPK: string;
  displayDateSortable?: unknown;
};

export type DouResults = {
  success: boolean;
  message: string;
  results: Record<string, DouItem[]>;
  timestamp: string;
};

async function fetchDouPage(keyword: string): Promise<DouItem[]> {
  const url = `${DOU_URL}?q=${encodeURIComponent('"' + keyword + '"')}&s=todos&exactDate=dia&sortType=1`;

  const res = await fetch(url, { method: "GET" });
  if (!res.ok) return [];

  const html = await res.text();
  const re = new RegExp(
    '<script[^>]*id="' + SCRIPT_ID.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"[^>]*>([\\s\\S]*?)</script>',
    "i"
  );
  const m = html.match(re);
  if (!m || !m[1]) return [];

  let data: { jsonArray?: Array<Record<string, unknown>> };
  try {
    data = JSON.parse(m[1].trim());
  } catch {
    return [];
  }

  return (data.jsonArray || []).map((c) => {
    const classPK = String(c.classPK ?? "");
    const urlTitle = (c.urlTitle as string) || "";
    let itemUrl = "";
    if (urlTitle.startsWith("http")) itemUrl = urlTitle;
    else if (urlTitle.includes("-")) itemUrl = `https://www.in.gov.br/web/dou/-/${urlTitle}`;
    else if (classPK) itemUrl = `https://www.in.gov.br/consulta/-/detalhe/${classPK}`;
    else itemUrl = "https://www.in.gov.br";

    return {
      secao: (c.pubName as string) || (c.secao as string) || "",
      title: (c.title as string) || "",
      url: itemUrl,
      abstract: (c.content as string) || "",
      date: (c.pubDate as string) || "",
      classPK,
      displayDateSortable: c.displayDateSortable,
    };
  });
}

export async function fetchDouResultsClient(
  keywords: string[] = ["previdencia social"]
): Promise<DouResults> {
  const results: Record<string, DouItem[]> = {};

  for (const keyword of keywords) {
    try {
      results[keyword] = await fetchDouPage(keyword);
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
