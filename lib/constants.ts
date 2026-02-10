// 카테고리 목록, 정렬 옵션, 카테고리별 이모지 매핑

import { Category, SortOption } from "./types";

export const CATEGORIES: Category[] = [
  "식료품",
  "간식류",
  "음료/세제/애견용품",
  "주류",
  "건강기능식품",
  "미용",
  "생활용품",
  "아웃도어",
  "의류/패션",
  "가전",
  "가구/침구류",
];

export const SORT_OPTIONS: SortOption[] = [
  { value: "discountRate", label: "할인율 높은순" },
  { value: "discountAmount", label: "절약금액 높은순" },
  { value: "priceLow", label: "가격 낮은순" },
  { value: "priceHigh", label: "가격 높은순" },
  { value: "endingSoon", label: "마감 임박순" },
];

// 카테고리별 이모지 매핑 (이미지 없을 때 플레이스홀더)
export const CATEGORY_EMOJI: Record<Category, string> = {
  "식료품": "🥩",
  "간식류": "🍪",
  "음료/세제/애견용품": "🧺",
  "주류": "🍷",
  "건강기능식품": "💊",
  "미용": "💄",
  "생활용품": "🏠",
  "아웃도어": "⛺",
  "의류/패션": "👔",
  "가전": "📺",
  "가구/침구류": "🛋️",
};

// localStorage 키
export const STORAGE_KEYS = {
  FAVORITES: "costco-favorites",
  CART: "costco-cart",
  DARK_MODE: "costco-darkmode",
} as const;
