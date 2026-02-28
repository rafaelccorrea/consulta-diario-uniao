import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ExternalLink,
  FileText,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
} from "lucide-react";
import { useHistoryStorage } from "@/hooks/useHistoryStorage";
import { normalizeDouUrl } from "@/lib/douUrl";
import { stripHtml } from "@/lib/stripHtml";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export default function History() {
  const [currentPage, setCurrentPage] = useState(1);
  const [, setLocation] = useLocation();
  const { history, removeFromHistory, clearHistory } = useHistoryStorage();

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const paginatedHistory = history.slice(offset, offset + ITEMS_PER_PAGE);

  const handleRemoveHistory = (id: string) => {
    removeFromHistory(id);
    if (paginatedHistory.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleClearHistory = () => {
    if (history.length === 0) return;
    if (window.confirm("Limpar todo o histórico? Esta ação não pode ser desfeita.")) {
      clearHistory();
      setCurrentPage(1);
      toast.success("Histórico limpo.");
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    try {
      if (format === "csv") {
        const headers = ["Título", "Seção", "Data", "Visualizado em", "URL"];
        const rows = paginatedHistory.map((h) => [
          `"${(h.title || "").replace(/"/g, '""')}"`,
          `"${(h.section || "").replace(/"/g, '""')}"`,
          h.date || "",
          new Date(h.viewedAt).toLocaleString("pt-BR"),
          h.url || "",
        ]);

        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
          "\n"
        );
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `historico-dou-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Planilha baixada! Verifique a pasta de Downloads.");
      } else {
        const json = JSON.stringify(paginatedHistory, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `historico-dou-${new Date().toISOString().split("T")[0]}.json`;
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
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Histórico</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Total de {history.length} artigo(s) visualizado(s)
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => handleExport("csv")}
              variant="outline"
              className="border-gray-300 text-gray-700"
              disabled={history.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button
              onClick={() => handleExport("json")}
              variant="outline"
              className="border-gray-300 text-gray-700"
              disabled={history.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
            <Button
              onClick={handleClearHistory}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
              disabled={history.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>

        {/* ===== HISTORY LIST ===== */}
        {history.length > 0 ? (
          <div className="space-y-3">
            {paginatedHistory.map((item) => (
              <Card
                key={item.id}
                className="p-4 sm:p-4 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {stripHtml(item.title)}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {stripHtml(item.summary)}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      {item.date && <span>📅 {item.date}</span>}
                      {item.section && <span>📑 {item.section}</span>}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.viewedAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.url && (
                      <a
                        href={normalizeDouUrl(item.url)}
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
                      onClick={() => handleRemoveHistory(item.id)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-red-100 active:bg-red-200 transition-colors"
                      aria-label="Remover do histórico"
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
            <Clock className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" aria-hidden />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
              Nenhum item no histórico
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6 text-sm sm:text-base">
              Quando você tocar em <strong>Ver no DOU</strong> em uma publicação, ela aparecerá aqui.
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
