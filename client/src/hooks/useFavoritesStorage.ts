import { useState, useEffect, useCallback } from "react";
import { Article } from "./useArticlesStorage";

const FAVORITES_KEY = "legalix_favorites";

export function useFavoritesStorage() {
  const [favorites, setFavorites] = useState<string[]>([]); // Array de IDs de artigos favoritos
  const [isLoading, setIsLoading] = useState(true);

  // Carregar favoritos do localStorage ao montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Erro ao carregar favoritos do localStorage:", error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar favoritos no localStorage
  const saveFavorites = useCallback((newFavorites: string[]) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
      return true;
    } catch (error) {
      console.error("Erro ao salvar favoritos no localStorage:", error);
      return false;
    }
  }, []);

  // Adicionar artigo aos favoritos
  const addFavorite = useCallback(
    (articleId: string) => {
      if (!favorites.includes(articleId)) {
        const updated = [...favorites, articleId];
        saveFavorites(updated);
      }
    },
    [favorites, saveFavorites]
  );

  // Remover artigo dos favoritos
  const removeFavorite = useCallback(
    (articleId: string) => {
      const updated = favorites.filter((id) => id !== articleId);
      saveFavorites(updated);
    },
    [favorites, saveFavorites]
  );

  // Verificar se artigo é favorito
  const isFavorite = useCallback(
    (articleId: string) => {
      return favorites.includes(articleId);
    },
    [favorites]
  );

  // Limpar todos os favoritos
  const clearFavorites = useCallback(() => {
    try {
      localStorage.removeItem(FAVORITES_KEY);
      setFavorites([]);
      return true;
    } catch (error) {
      console.error("Erro ao limpar favoritos:", error);
      return false;
    }
  }, []);

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
    totalFavorites: favorites.length,
  };
}
