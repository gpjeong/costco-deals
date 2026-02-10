"use client";

import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * 찜 관리 훅
 */
export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<string[]>(
    STORAGE_KEYS.FAVORITES,
    []
  );

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const addFavorite = (productId: string) => {
    setFavorites((prev) => {
      if (!prev.includes(productId)) {
        return [...prev, productId];
      }
      return prev;
    });
  };

  const removeFavorite = (productId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== productId));
  };

  const isFavorite = (productId: string): boolean => {
    return favorites.includes(productId);
  };

  return {
    favorites,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
}
