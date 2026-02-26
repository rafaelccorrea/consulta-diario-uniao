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
  TrendingUp,
  FileText,
  Clock,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [section, setSection] = useState("Todas");

  // Fetch articles
  const articlesQuery = trpc.articles.list.useQuery({
    query: searchQuery || undefined,
    section: section !== "Todas" ? section : undefined,
    limit: 10,
    offset: 0,
  });

  // Fetch sections
  const sectionsQuery = trpc.articles.sections.useQuery();

  const stats = [
    {
      label: "Total de Artigos",
      value: articlesQuery.data?.total || 0,
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      label: "Últimas 24h",
      value: articlesQuery.data?.data?.filter((a) => {
        const date = new Date(a.date || "");
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return date > yesterday;
      }).length || 0,
      icon: Clock,
      color: "bg-green-500",
    },
    {
      label: "Seções",
      value: sectionsQuery.data?.length || 0,
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ];

  const handleSearch = () => {
    // Search is handled by the query above
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
        {/* ===== HEADER COM BUSCA ===== */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Bem-vindo ao seu monitor de publicações do DOU
            </p>
          </div>

          {/* Busca Rápida */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar artigos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 h-11"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                disabled={articlesQuery.isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {articlesQuery.isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Buscar"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ===== ESTATÍSTICAS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* ===== FILTROS ===== */}
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Seção:</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option>Todas</option>
              {sectionsQuery.data?.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* ===== ARTIGOS RECENTES ===== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Artigos Recentes
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={() => handleExport("csv")}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700"
                disabled={!articlesQuery.data?.data?.length}
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
              <Button
                onClick={() => handleExport("json")}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700"
                disabled={!articlesQuery.data?.data?.length}
              >
                <Download className="w-4 h-4 mr-1" />
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
                  className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-600"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        {article.date && (
                          <span className="flex items-center gap-1">
                            📅 {article.date}
                          </span>
                        )}
                        {article.section && (
                          <span className="flex items-center gap-1">
                            📑 {article.section}
                          </span>
                        )}
                      </div>
                    </div>
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-2 hover:bg-blue-100 rounded transition-colors"
                      >
                        <ExternalLink className="w-5 h-5 text-blue-600" />
                      </a>
                    )}
                  </div>
                </Card>
              ))}

              {/* Ver Mais */}
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Ver Mais Artigos
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
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
                filtrar por palavras-chave, seção e muito mais.
              </p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
