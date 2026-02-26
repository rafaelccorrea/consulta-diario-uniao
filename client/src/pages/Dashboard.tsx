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
} from "lucide-react";

/**
 * Dashboard Page - DOU Monitoring System
 * Design: Clean, functional workspace for real-time DOU monitoring
 * - Real data integration ready
 * - Advanced filtering and search
 * - Export capabilities
 */
export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Placeholder for API integration
  const loadArticles = async () => {
    setLoading(true);
    // TODO: Replace with actual API call to douScraper
    // const response = await fetch('/api/articles', { query: searchQuery });
    // const data = await response.json();
    // setArticles(data);
    setLoading(false);
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Search Button */}
              <Button
                onClick={loadArticles}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Carregando..." : "Buscar"}
              </Button>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4 border-t">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Seção
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>Todas</option>
                  <option>Seção 1</option>
                  <option>Seção 2</option>
                  <option>Seção 3</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Data De
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Data Até
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* ===== RESULTS ===== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Resultados ({articles.length})
            </h2>
            <Button variant="outline" className="border-gray-300 text-gray-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Empty State */}
          {articles.length === 0 ? (
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
                💡 Dica: Conecte a API do seu script douScraper para começar a
                visualizar dados em tempo real.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {articles.map((article, index) => (
                <Card
                  key={index}
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
                        <span>📅 {article.date}</span>
                        <span>📑 {article.section}</span>
                      </div>
                    </div>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 hover:bg-gray-100 rounded transition-colors"
                    >
                      <ExternalLink className="w-5 h-5 text-blue-600" />
                    </a>
                  </div>
                </Card>
              ))}
            </div>
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
              CSV
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
