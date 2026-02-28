import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import {
  ExternalLink,
  FileText,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Star,
} from "lucide-react";
import { useArticlesStorage } from "@/hooks/useArticlesStorage";
import { useFavoritesStorage } from "@/hooks/useFavoritesStorage";
import { normalizeDouUrl } from "@/lib/douUrl";
import { stripHtml } from "@/lib/stripHtml";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export default function Favorites() {
  const [currentPage, setCurrentPage] = useState(1);
  const [, setLocation] = useLocation();
  const { articles } = useArticlesStorage();
  const { favorites, removeFavorite } = useFavoritesStorage();

  // Filtrar artigos que estão nos favoritos
  const favoriteArticles = useMemo(() => {
    return articles.filter((article) => favorites.includes(article.id));
  }, [articles, favorites]);

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const totalPages = Math.ceil(favoriteArticles.length / ITEMS_PER_PAGE);
  const paginatedFavorites = favoriteArticles.slice(
    offset,
    offset + ITEMS_PER_PAGE
  );

  const handleRemoveFavorite = (articleId: string) => {
    removeFavorite(articleId);
    if (paginatedFavorites.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    try {
      if (format === "csv") {
        const headers = ["Título", "Seção", "Data", "URL"];
        const rows = paginatedFavorites.map((a) => [
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
        a.download = `favoritos-dou-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Planilha baixada! Verifique a pasta de Downloads.");
      } else {
        const json = JSON.stringify(paginatedFavorites, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `favoritos-dou-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Arquivo JSON baixado! Verifique a pasta de Downloads.");
      }
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast.error("Não foi possível exportar. Tente novamente.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ===== HEADER ===== */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Favoritos</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Total de {favoriteArticles.length} artigo(s) favorito(s)
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => handleExport("csv")}
              variant="outline"
              className="border-gray-300 text-gray-700"
              disabled={favoriteArticles.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button
              onClick={() => handleExport("json")}
              variant="outline"
              className="border-gray-300 text-gray-700"
              disabled={favoriteArticles.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>

        {/* ===== FAVORITES LIST ===== */}
        {favoriteArticles.length > 0 ? (
          <div className="space-y-3">
            {paginatedFavorites.map((article) => (
              <Card
                key={article.id}
                className="p-4 sm:p-4 rounded-xl hover:shadow-md transition-shadow border-l-4 border-l-blue-600"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between gap-4">
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
                  <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                    {article.url && (
                      <a
                        href={normalizeDouUrl(article.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-[0.98]"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ver no DOU
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFavorite(article.id)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-red-100 active:bg-red-200 transition-colors"
                      aria-label="Remover dos favoritos"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
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
            )}

            <div className="text-center text-sm text-gray-600 pt-2">
              Página {currentPage} de {totalPages}
            </div>
          </div>
        ) : (
          <Card className="p-8 sm:p-12 text-center border-2 border-dashed border-gray-200 bg-gray-50/50">
            <Star className="w-14 h-14 sm:w-16 sm:h-16 text-amber-200 mx-auto mb-4" aria-hidden />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
              Nenhum favorito ainda
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6 text-sm sm:text-base">
              Toque na estrela em qualquer publicação na página <strong>Início</strong> para salvar aqui.
            </p>
            <Button
              onClick={() => setLocation("/dashboard")}
              className="min-h-[48px] px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              Ir para Início
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
