import { useState, useEffect, useCallback } from "react";
import { Article } from "./useArticlesStorage";

const HISTORY_KEY = "legalix_history";
const MAX_HISTORY = 1000;

export interface HistoryItem extends Article {
  viewedAt: string; // ISO timestamp
}

export function useHistoryStorage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar histórico do localStorage ao montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico do localStorage:", error);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar histórico no localStorage
  const saveHistory = useCallback((newHistory: HistoryItem[]) => {
    try {
      // Limitar a 1000 itens (manter os mais recentes)
      const historyToSave = newHistory.slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(historyToSave));
      setHistory(historyToSave);
      return true;
    } catch (error) {
      console.error("Erro ao salvar histórico no localStorage:", error);
      return false;
    }
  }, []);

  // Adicionar artigo ao histórico
  const addToHistory = useCallback(
    (article: Article) => {
      const historyItem: HistoryItem = {
        ...article,
        viewedAt: new Date().toISOString(),
      };

      // Remover duplicata se existir (mesmo artigo visualizado novamente)
      const filtered = history.filter((h) => h.id !== article.id);

      // Adicionar no início (mais recente primeiro)
      const updated = [historyItem, ...filtered];

      saveHistory(updated);
    },
    [history, saveHistory]
  );

  // Remover item do histórico
  const removeFromHistory = useCallback(
    (articleId: string) => {
      const updated = history.filter((h) => h.id !== articleId);
      saveHistory(updated);
    },
    [history, saveHistory]
  );

  // Limpar todo o histórico
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(HISTORY_KEY);
      setHistory([]);
      return true;
    } catch (error) {
      console.error("Erro ao limpar histórico:", error);
      return false;
    }
  }, []);

  return {
    history,
    isLoading,
    addToHistory,
    removeFromHistory,
    clearHistory,
    totalHistory: history.length,
    maxHistory: MAX_HISTORY,
  };
}
