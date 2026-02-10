"use client";

import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "@/lib/constants";
import { CartItem, Product } from "@/lib/types";

/**
 * 장바구니 관리 훅
 */
export function useCart() {
  const [items, setItems] = useLocalStorage<CartItem[]>(
    STORAGE_KEYS.CART,
    []
  );

  const addItem = (text: string, fromProduct: boolean = false, product?: Product) => {
    setItems((prev) => {
      if (prev.some((item) => item.text === text)) {
        return prev;
      }
      return [
        ...prev,
        {
          id: `c${Date.now()}`,
          text,
          checked: false,
          fromProduct,
          imageUrl: product?.imageUrl,
          salePrice: product?.salePrice,
          originalPrice: product?.originalPrice,
          discountAmount: product?.discountAmount,
        },
      ];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const isInCart = (text: string): boolean => {
    return items.some((item) => item.text === text);
  };

  const uncheckedCount = items.filter((item) => !item.checked).length;

  return {
    items,
    addItem,
    removeItem,
    toggleItem,
    isInCart,
    uncheckedCount,
  };
}
