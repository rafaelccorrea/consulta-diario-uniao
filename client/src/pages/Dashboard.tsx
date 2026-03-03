
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search as SearchIcon,
  Download,
  ExternalLink,
  FileText,
  Clock,
  Loader2,
  Zap,
  TrendingUp,
  Star,
} from "lucide-react";
import { useArticlesStorage } from "@/hooks/useArticlesStorage";
import { useFavoritesStorage } from "@/hooks/useFavoritesStorage";
import { useHistoryStorage } from "@/hooks/useHistoryStorage";
import { exportToExcel, exportToJSON } from "@/lib/exportToExcel";
import { normalizeDouUrl } from "@/lib/douUrl";
import { stripHtml } from "@/lib/stripHtml";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { fetchDouResultsClient } from "@/lib/douClient";
import { useState, useEffect, useMemo } from "react";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [section, setSection] = useState("Todas");
  const [isSearching, setIsSearching] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStorage();
  const { addToHistory } = useHistoryStorage();
  const scraperMutation = trpc.scraper.runScraper.useMutation();

  // Toggle favorito
  const toggleFavorite = (articleId: string) => {
    if (isFavorite(articleId)) {
      removeFavorite(articleId);
    } else {
      addFavorite(articleId);
    }
  };

  const {
    articles,
    isLoading,
    filterArticles,
    getSections,
    getStats,
    upsertArticles,
    totalArticles,
  } = useArticlesStorage();

  const sections = useMemo(() => getSections(), [getSections]);
  const stats = useMemo(() => getStats(), [getStats]);
  const filteredArticles = useMemo(
    () => filterArticles(
      searchQuery,
      section !== "Todas" ? section : undefined,
      startDate || undefined,
      endDate || undefined
    ),
    [searchQuery, section, startDate, endDate, filterArticles]
  );

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      toast.info("Buscando publicações no Diário Oficial da União...");

      let result: { success?: boolean; message?: string; results?: Record<string, unknown[]> } | null = null;

      // Em hospedagem estática (ex.: Hostinger sem Node) não existe /api — usar só o fetch do browser
      const isStaticHost =
        typeof window !== "undefined" &&
        (window.location.hostname.includes("hostingersite.com") ||
          window.location.hostname.includes("000webhost") ||
          window.location.hostname.endsWith(".github.io"));

      // 1ª opção: fetch direto do browser (funciona em produção estática e evita bloqueio)
      try {
        result = await fetchDouResultsClient();
      } catch {
        // ignore — tenta fallback só se houver backend
      }

      // 2ª e 3ª opções: só em ambiente com backend (dev local ou Vercel/Node)
      if (!isStaticHost && (!result?.results || Object.values(result.results).every((v) => v.length === 0))) {
        try {
          const r = await fetch("/api/dou-buscar", { credentials: "include" });
          if (r.ok) result = await r.json();
        } catch {
          // ignore
        }
        if (!result?.results || Object.values(result.results).every((v) => v.length === 0)) {
          try {
            result = await scraperMutation.mutateAsync({});
          } catch {
            // ignore
          }
        }
      }

      if (!result) {
        toast.error("Não foi possível conectar ao servidor. Tente novamente em instantes.");
        return;
      }

      console.log("Resultado do scraper:", result);

      if (result?.success === false && result?.message) {
        toast.info(result.message);
        return;
      }

      // Processar resultados do scraper
      if (result?.results) {
        const results = result.results;
        const articlesToAdd: any[] = [];

        // Iterar sobre as palavras-chave e seus artigos
        for (const keyword in results) {
          const items = results[keyword] || [];
          for (const item of items) {
            // URL do DOU: slugs devem usar /web/dou/-/ (senão in.gov.br retorna "Não encontrado")
            let fullUrl = "https://www.in.gov.br";
            const rawUrl = (item.url || "").trim();
            if (rawUrl.startsWith("http")) {
              fullUrl = rawUrl;
            } else if (rawUrl.startsWith("/")) {
              fullUrl = "https://www.in.gov.br" + rawUrl;
            } else if (rawUrl.startsWith("web/") || rawUrl.startsWith("consulta/")) {
              fullUrl = "https://www.in.gov.br/" + rawUrl;
            } else if (rawUrl.includes("-")) {
              fullUrl = `https://www.in.gov.br/web/dou/-/${rawUrl}`;
            } else if (item.classPK) {
              fullUrl = `https://www.in.gov.br/consulta/-/detalhe/${item.classPK}`;
            }
            const title = stripHtml(item.title) || "Sem título";
            const summary = stripHtml(item.abstract || item.content || "") || "";

            articlesToAdd.push({
              id: item.classPK || `article-${Date.now()}-${Math.random()}`,
              classPK: item.classPK || "",
              title,
              url: fullUrl,
              section: item.secao || item.pubName || "Geral",
              date: item.date || item.pubDate || new Date().toISOString().split("T")[0],
              summary,
              fullText: summary,
              fetchedAt: new Date().toISOString(),
            });
          }
        }

        if (articlesToAdd.length > 0) {
          upsertArticles(articlesToAdd);
          toast.success(`${articlesToAdd.length} publicação(s) encontrada(s)! Você pode filtrar e abrir os links abaixo.`);
        } else {
          toast.info("Nenhuma publicação encontrada para os termos configurados. Tente novamente mais tarde.");
        }
      } else {
        toast.warning("A busca terminou, mas não foi possível processar os resultados.");
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      toast.error(error instanceof Error ? error.message : "Não foi possível buscar. Verifique a conexão e tente de novo.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleExportExcel = () => {
    const success = exportToExcel(filteredArticles);
    if (success) {
      toast.success("Artigos exportados para Excel!");
    } else {
      toast.error("Erro ao exportar para Excel");
    }
  };

  const handleExportJSON = () => {
    const success = exportToJSON(filteredArticles);
    if (success) {
      toast.success("Artigos exportados para JSON!");
    } else {
      toast.error("Erro ao exportar para JSON");
    }
  };

  const statCards = [
    {
      label: "Total de Artigos",
      value: totalArticles,
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      label: "Últimas 24h",
      value: stats.last24h,
      icon: Clock,
      color: "bg-green-500",
    },
    {
      label: "Seções",
      value: stats.sections,
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Início</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Busque e acompanhe publicações do DOU
            </p>
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full sm:w-auto min-h-[48px] sm:min-h-0 px-6 py-3 text-base bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-shrink-0 rounded-xl shadow-md active:scale-[0.98] transition-transform"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Buscar publicações
              </>
            )}
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="sm:col-span-2 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <Input
                placeholder="Ex.: previdência, licitação, portaria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full min-h-[44px] sm:min-h-0"
              />
            </div>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-0"
            >
              <option value="Todas">Todas as Seções</option>
              {sections.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          
          {/* Date Range Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Data Início
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full min-w-0"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Data Final
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full min-w-0"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {statCards.map((stat) => (
            <Card
              key={stat.label}
              className="p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow min-w-0"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 truncate">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Articles */}
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Publicações</h2>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleExportExcel}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                CSV
              </Button>
              <Button
                onClick={handleExportJSON}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                JSON
              </Button>
            </div>
          </div>

          {filteredArticles.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center border-2 border-dashed border-gray-200 bg-gray-50/50">
              <FileText className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" aria-hidden />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                Nenhuma publicação aqui ainda
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto mb-6 text-sm sm:text-base">
                Toque no botão <strong>Buscar publicações</strong> acima para carregar as últimas do Diário Oficial. Depois use o campo de busca para filtrar.
              </p>
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="min-h-[48px] px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cta-empty-glow"
              >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5 mr-2" /> Buscar publicações</>}
              </Button>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredArticles.slice(0, 20).map((article) => (
                <Card
                  key={article.id}
                  className="p-4 sm:p-4 border-l-4 border-l-blue-600 hover:shadow-md active:shadow-sm transition-shadow rounded-xl"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 text-base sm:text-inherit">
                        {stripHtml(article.title)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {stripHtml(article.summary)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {article.url && (
                        <a
                          href={normalizeDouUrl(article.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => addToHistory(article)}
                          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-[0.98] transition-colors touch-target"
                        >
                          <ExternalLink className="w-4 h-4 shrink-0" />
                          Ver no DOU
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleFavorite(article.id)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-yellow-100 active:bg-yellow-200 transition-colors touch-target"
                        aria-label={isFavorite(article.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                      >
                        <Star
                          className={`w-6 h-6 sm:w-5 sm:h-5 ${
                            isFavorite(article.id)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredArticles.length > 20 && (
                <p className="text-center text-sm text-gray-500 pt-4">
                  Mostrando 20 de {filteredArticles.length} artigos
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
