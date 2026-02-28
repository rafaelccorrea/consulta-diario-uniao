import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search as SearchIcon,
  Filter,
  Download,
  ExternalLink,
  Calendar,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { normalizeDouUrl } from "@/lib/douUrl";
import { stripHtml } from "@/lib/stripHtml";
import { trpc } from "@/lib/trpc";

const ITEMS_PER_PAGE = 10;

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [section, setSection] = useState("Todas");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Fetch articles
  const articlesQuery = trpc.articles.list.useQuery({
    query: searchQuery || undefined,
    section: section !== "Todas" ? section : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    limit: ITEMS_PER_PAGE,
    offset,
  });

  // Fetch sections
  const sectionsQuery = trpc.articles.sections.useQuery();

  const totalPages = Math.ceil((articlesQuery.data?.total || 0) / ITEMS_PER_PAGE);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSection("Todas");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleExport = async (format: "csv" | "json") => {
    try {
      const articles = articlesQuery.data?.data || [];

      if (format === "csv") {
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
        {/* ===== SEARCH & FILTERS ===== */}
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Buscar Artigos
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="sm:col-span-2 relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Ex.: previdência, licitação, portaria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 w-full min-h-[44px] sm:min-h-0"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={articlesQuery.isLoading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Seção
                </label>
                <select
                  value={section}
                  onChange={(e) => {
                    setSection(e.target.value);
                    setCurrentPage(1);
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
                    setCurrentPage(1);
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
                    setCurrentPage(1);
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Resultados ({articlesQuery.data?.total ?? 0})
            </h2>
            <div className="flex gap-2 flex-wrap">
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

          {/* Error State */}
          {articlesQuery.isError && (
            <Card className="p-6 sm:p-8 text-center border-red-200 bg-red-50/50 rounded-xl">
              <p className="text-red-700 font-medium mb-2">Não foi possível carregar.</p>
              <p className="text-sm text-gray-600 mb-4">Verifique sua internet e tente de novo.</p>
              <Button
                onClick={() => articlesQuery.refetch()}
                variant="outline"
                className="min-h-[48px] px-6 border-red-300 text-red-700 rounded-xl"
              >
                Tentar novamente
              </Button>
            </Card>
          )}

          {/* Loading State */}
          {!articlesQuery.isError && articlesQuery.isLoading ? (
            <Card className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Carregando artigos...</p>
            </Card>
          ) : !articlesQuery.isError && articlesQuery.data?.data && articlesQuery.data.data.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {articlesQuery.data.data.map((article) => (
                <Card
                  key={article.id}
                  className="p-4 sm:p-4 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {stripHtml(article.title)}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {stripHtml(article.summary)}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        {article.date && <span>📅 {article.date}</span>}
                        {article.section && <span>📑 {article.section}</span>}
                      </div>
                    </div>
                    {article.url && (
                      <a
                        href={normalizeDouUrl(article.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-[0.98] w-fit"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ver no DOU
                      </a>
                    )}
                  </div>
                </Card>
              ))}

              {/* Pagination */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className={
                          currentPage === pageNum
                            ? "bg-blue-600 hover:bg-blue-700"
                            : ""
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="text-gray-500">...</span>
                      <Button
                        onClick={() => setCurrentPage(totalPages)}
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        className={
                          currentPage === totalPages
                            ? "bg-blue-600 hover:bg-blue-700"
                            : ""
                        }
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600 pt-2">
                Página {currentPage} de {totalPages}
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum artigo encontrado
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Use a busca acima para encontrar publicações do DOU. Você pode
                filtrar por palavras-chave, seção, data e muito mais.
              </p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
