/**
 * Remove tags HTML e entidades de texto vindo do DOU/scraper para exibir só texto nos cards.
 */
export function stripHtml(html: string | null | undefined): string {
  if (html == null || typeof html !== "string") return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent ?? div.innerText ?? "").trim();
}
