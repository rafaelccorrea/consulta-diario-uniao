import type { Article } from "@/hooks/useArticlesStorage";

export function exportToExcel(articles: Article[], filename: string = "artigos_dou.xlsx") {
  try {
    // Criar CSV em formato que Excel reconhece
    const headers = ["ID", "Título", "Seção", "Data", "URL", "Resumo"];
    const rows = articles.map((article) => [
      article.classPK,
      article.title,
      article.section,
      article.date,
      article.url,
      article.summary,
    ]);

    // Converter para CSV
    const csv = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Criar blob e download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename.replace(".xlsx", ".csv"));
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Erro ao exportar para Excel:", error);
    return false;
  }
}

export function exportToJSON(articles: Article[], filename: string = "artigos_dou.json") {
  try {
    const json = JSON.stringify(articles, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Erro ao exportar para JSON:", error);
    return false;
  }
}
