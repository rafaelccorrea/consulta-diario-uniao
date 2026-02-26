
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
import { exportToExcel, exportToJSON } from "@/lib/exportToExcel";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useState, useEffect, useMemo } from "react";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [section, setSection] = useState("Todas");
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const scraperMutation = trpc.scraper.runScraper.useMutation();

  // Carregar favoritos do localStorage ao montar
  useEffect(() => {
    const stored = localStorage.getItem("legalix_favorites");
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)));
    }
  }, []);

  // Salvar favoritos no localStorage
  const toggleFavorite = (classPK: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(classPK)) {
      newFavorites.delete(classPK);
    } else {
      newFavorites.add(classPK);
    }
    setFavorites(newFavorites);
    localStorage.setItem("legalix_favorites", JSON.stringify(Array.from(newFavorites)));
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
    () => filterArticles(searchQuery, section !== "Todas" ? section : undefined),
    [searchQuery, section, filterArticles]
  );

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      toast.info("Iniciando busca no DOU com douScraper.js...");

      // Chamar a API real do scraper usando tRPC
      const result = await scraperMutation.mutateAsync({});
      console.log("Resultado do scraper:", result);

      // Processar resultados do scraper
      if (result?.results) {
        const results = result.results;
        const articlesToAdd: any[] = [];

        // Iterar sobre as palavras-chave e seus artigos
        for (const keyword in results) {
          const items = results[keyword] || [];
          for (const item of items) {
            // Construir URL completa do DOU - priorizar URL completa se disponível
            let fullUrl = "https://www.in.gov.br";
            if (item.url && item.url.startsWith("http")) {
              // Se a URL já é completa, usar como está
              fullUrl = item.url;
            } else if (item.classPK) {
              // Fallback para classPK
              fullUrl = `https://www.in.gov.br/consulta/-/detalhe/${item.classPK}`;
            }
            
            articlesToAdd.push({
              id: item.classPK || `article-${Date.now()}-${Math.random()}`,
              classPK: item.classPK || "",
              title: item.title || "Sem título",
              url: fullUrl,
              section: item.secao || item.pubName || "Geral",
              date: item.date || item.pubDate || new Date().toISOString().split("T")[0],
              summary: item.abstract || item.content || "",
              fullText: item.abstract || item.content || "",
              fetchedAt: new Date().toISOString(),
            });
          }
        }

        if (articlesToAdd.length > 0) {
          upsertArticles(articlesToAdd);
          toast.success(`${articlesToAdd.length} artigos encontrados e salvos!`);
        } else {
          toast.info("Nenhum artigo encontrado na busca.");
        }
      } else {
        toast.warning("Busca concluída, mas nenhum resultado foi processado.");
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao buscar artigos");
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Monitoramento DOU</h1>
            <p className="text-gray-600 mt-1">
              Acompanhe publicações em tempo real
            </p>
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Buscar Agora
              </>
            )}
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar artigos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Todas">Todas as Seções</option>
            {sections.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statCards.map((stat) => (
            <Card
              key={stat.label}
              className="p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Articles */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Artigos Recentes</h2>
            <div className="flex gap-2">
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
            <Card className="p-12 text-center border-2 border-dashed border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum artigo encontrado
              </h3>
              <p className="text-gray-500">
                Clique em "Buscar Agora" para carregar artigos do DOU
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredArticles.slice(0, 20).map((article) => (
                <Card
                  key={article.id}
                  className="p-4 border-l-4 border-l-blue-600 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {article.summary}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleFavorite(article.classPK)}
                        className="text-yellow-500 hover:text-yellow-600 transition-colors"
                      >
                        <Star
                          className="w-5 h-5"
                          fill={favorites.has(article.classPK) ? "currentColor" : "none"}
                        />
                      </button>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
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
