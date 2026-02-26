import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search,
  Filter,
  Download,
  ExternalLink,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

/**
 * Dashboard Page - DOU Monitoring System
 * Design: Clean, functional workspace for real-time DOU monitoring
 * - Real data integration with tRPC
 * - Advanced filtering and search
 * - Export capabilities
 */
export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [section, setSection] = useState("Todas");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  // Fetch articles
  const articlesQuery = trpc.articles.list.useQuery({
    query: searchQuery || undefined,
    section: section !== "Todas" ? section : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    limit,
    offset,
  });

  // Fetch sections
  const sectionsQuery = trpc.articles.sections.useQuery();

  // Set current date
  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = today.toLocaleDateString("pt-BR", options);
    setCurrentDate(formattedDate);
  }, []);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSection("Todas");
    setDateFrom("");
    setDateTo("");
    setOffset(0);
  };

  const handleExport = async (format: "csv" | "json") => {
    try {
      const articles = articlesQuery.data?.data || [];

      if (format === "csv") {
        // Create CSV
        const headers = ["Título", "Seção", "Data", "URL"];
        const rows = articles.map((a) => [
          `"${(a.title || "").replace(/"/g, '""')}"`,
          `"${(a.section || "").replace(/"/g, '""')}"`,
          a.date || "",
          a.url || "",
        ]);

        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
          "\n"
        );
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `artigos-dou-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // JSON export
        const json = JSON.stringify(articles, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `artigos-dou-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Erro ao exportar:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ===== HEADER INFO ===== */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Data atual:</span> {currentDate}
          </p>
        </div>

        {/* ===== SEARCH & FILTERS ===== */}
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Buscar Artigos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por palavras-chave, seção, número..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setOffset(0);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Search Button */}
              <Button
                onClick={() => setOffset(0)}
                disabled={articlesQuery.isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {articlesQuery.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  "Buscar"
                )}
              </Button>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4 border-t">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Seção
                </label>
                <select
                  value={section}
                  onChange={(e) => {
                    setSection(e.target.value);
                    setOffset(0);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option>Todas</option>
                  {sectionsQuery.data?.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Data De
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setOffset(0);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Data Até
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setOffset(0);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* ===== RESULTS ===== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Resultados ({articlesQuery.data?.total || 0})
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={() => handleExport("csv")}
                variant="outline"
                className="border-gray-300 text-gray-700"
                disabled={!articlesQuery.data?.data?.length}
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button
                onClick={() => handleExport("json")}
                variant="outline"
                className="border-gray-300 text-gray-700"
                disabled={!articlesQuery.data?.data?.length}
              >
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {articlesQuery.isLoading ? (
            <Card className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Carregando artigos...</p>
            </Card>
          ) : articlesQuery.data?.data && articlesQuery.data.data.length > 0 ? (
            <div className="space-y-3">
              {articlesQuery.data.data.map((article) => (
                <Card
                  key={article.id}
                  className="p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        {article.date && <span>📅 {article.date}</span>}
                        {article.section && <span>📑 {article.section}</span>}
                      </div>
                    </div>
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-2 hover:bg-gray-100 rounded transition-colors"
                      >
                        <ExternalLink className="w-5 h-5 text-blue-600" />
                      </a>
                    )}
                  </div>
                </Card>
              ))}

              {/* Pagination */}
              {articlesQuery.data.total > limit && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                    variant="outline"
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-4 text-sm text-gray-600">
                    Página {Math.floor(offset / limit) + 1} de{" "}
                    {Math.ceil(articlesQuery.data.total / limit)}
                  </span>
                  <Button
                    onClick={() =>
                      setOffset(offset + limit)
                    }
                    disabled={offset + limit >= articlesQuery.data.total}
                    variant="outline"
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum artigo encontrado
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Use a busca acima para encontrar publicações do DOU. Você pode
                filtrar por palavras-chave, seção, data e muito mais.
              </p>
              <p className="text-sm text-gray-400">
                💡 Dica: Comece adicionando dados de teste para visualizar os
                filtros em ação.
              </p>
            </Card>
          )}
        </div>

        {/* ===== INFO SECTION ===== */}
        <Card className="p-6 bg-gray-50 border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">
            Como usar o Dashboard
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              ✓ <strong>Busque por palavras-chave:</strong> Digite termos
              relacionados ao que você quer monitorar
            </li>
            <li>
              ✓ <strong>Filtre por seção:</strong> Escolha seções específicas
              do DOU
            </li>
            <li>
              ✓ <strong>Defina período:</strong> Busque publicações em um
              intervalo de datas
            </li>
            <li>
              ✓ <strong>Exporte resultados:</strong> Baixe os dados em formato
              CSV ou JSON
            </li>
            <li>
              ✓ <strong>Acesse direto:</strong> Clique no ícone externo para
              abrir no site oficial
            </li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}
