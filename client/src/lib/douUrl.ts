/**
 * Normaliza URL do DOU: in.gov.br exige /web/dou/-/ para slugs, senão retorna "Não encontrado".
 * Corrige URLs antigas salvas como in.gov.br/slug.
 */
export function normalizeDouUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "";
  const u = url.trim();
  if (!u.startsWith("http")) return u;
  try {
    const parsed = new URL(u);
    if (
      parsed.origin === "https://www.in.gov.br" &&
      parsed.pathname !== "/" &&
      !parsed.pathname.startsWith("/web/") &&
      !parsed.pathname.startsWith("/consulta/") &&
      parsed.pathname.includes("-")
    ) {
      return `https://www.in.gov.br/web/dou/-${parsed.pathname}`;
    }
    return u;
  } catch {
    return u;
  }
}
