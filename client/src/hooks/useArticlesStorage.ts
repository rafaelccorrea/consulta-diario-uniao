import { useState, useEffect, useCallback } from "react";

export interface Article {
  id: string;
  classPK: string;
  title: string;
  url: string;
  section: string;
  date: string;
  summary: string;
  fullText?: string;
  fetchedAt: string;
}

const STORAGE_KEY = "legalix_articles";
const MAX_ARTICLES = 10000;

// Construir URL completa do DOU
function buildFullUrl(urlPart: string, classPK: string): string {
  if (!urlPart && classPK) return `https://www.in.gov.br/consulta/-/detalhe/${classPK}`;
  const up = urlPart?.trim() || "";
  if (up.startsWith("http")) return up;
  if (up.startsWith("/web/dou/-/")) return "https://www.in.gov.br" + up;
  if (up.startsWith("/")) return "https://www.in.gov.br" + up;
  if (up.startsWith("web/dou/-/")) return "https://www.in.gov.br/" + up;
  if (up.startsWith("web/") || up.startsWith("consulta/")) return "https://www.in.gov.br/" + up;
  if (up.includes("-") && !isNaN(parseInt(up.slice(-1)))) return `https://www.in.gov.br/web/dou/-/${up}`;
  return classPK ? `https://www.in.gov.br/consulta/-/detalhe/${classPK}` : "https://www.in.gov.br";
}

export function useArticlesStorage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar artigos do localStorage ao montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setArticles(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Erro ao carregar artigos do localStorage:", error);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar artigos no localStorage
  const saveArticles = useCallback((newArticles: Article[]) => {
    try {
      // Limitar a 10.000 artigos (manter os mais recentes)
      const articlesToSave = newArticles.slice(0, MAX_ARTICLES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(articlesToSave));
      setArticles(articlesToSave);
      return true;
    } catch (error) {
      console.error("Erro ao salvar artigos no localStorage:", error);
      return false;
    }
  }, []);

  // Adicionar ou atualizar artigos
  const upsertArticles = useCallback(
    (newArticles: Article[]) => {
      const existingMap = new Map(articles.map((a) => [a.classPK, a]));

      // Atualizar ou adicionar novos artigos
      newArticles.forEach((article) => {
        // Construir URL completa se necessário
        const fullUrl = buildFullUrl(article.url, article.classPK);
        existingMap.set(article.classPK, { ...article, url: fullUrl });
      });

      // Converter para array e ordenar por data (mais recentes primeiro)
      const updated = Array.from(existingMap.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      saveArticles(updated);
    },
    [articles, saveArticles]
  );

  // Limpar todos os artigos
  const clearArticles = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setArticles([]);
      return true;
    } catch (error) {
      console.error("Erro ao limpar artigos:", error);
      return false;
    }
  }, []);

  // Filtrar artigos
  const filterArticles = useCallback(
    (
      query?: string,
      section?: string,
      startDate?: string,
      endDate?: string
    ) => {
      let filtered = [...articles];

      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.summary.toLowerCase().includes(q) ||
            a.fullText?.toLowerCase().includes(q)
        );
      }

      if (section && section !== "Todas") {
        filtered = filtered.filter((a) => a.section === section);
      }

      if (startDate) {
        filtered = filtered.filter((a) => a.date >= startDate);
      }

      if (endDate) {
        filtered = filtered.filter((a) => a.date <= endDate);
      }

      return filtered;
    },
    [articles]
  );

  // Obter seções únicas
  const getSections = useCallback(() => {
    const sections = new Set(articles.map((a) => a.section));
    return Array.from(sections).sort();
  }, [articles]);

  // Obter estatísticas
  const getStats = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    const last24h = articles.filter((a) => a.date === today).length;

    return {
      total: articles.length,
      last24h,
      sections: getSections().length,
    };
  }, [articles, getSections]);

  return {
    articles,
    isLoading,
    saveArticles,
    upsertArticles,
    clearArticles,
    filterArticles,
    getSections,
    getStats,
    totalArticles: articles.length,
    maxArticles: MAX_ARTICLES,
  };
}
