"use client";

import { Category } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategorySelect: (category: Category | "전체") => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  favoritesCount: number;
}

export default function CategoryFilter({
  selectedCategory,
  onCategorySelect,
  showFavoritesOnly,
  onToggleFavorites,
  favoritesCount,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-1.5 sm:gap-2 overflow-x-auto py-2 sm:py-2.5 scrollbar-hide">
      {/* 찜 필터 */}
      <button
        onClick={onToggleFavorites}
        className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 text-xs sm:text-sm font-medium transition-all ${
          showFavoritesOnly
            ? "border-costco-red bg-[#FFF0F3] text-costco-red font-bold"
            : "border-[#DDD] dark:border-[#444] bg-white dark:bg-[#2A2A2A] text-[#555] dark:text-[#CCC]"
        }`}
      >
        💖 찜 {favoritesCount > 0 && `(${favoritesCount})`}
      </button>

      {/* 구분선 */}
      <div className="flex-shrink-0 w-px h-5 sm:h-6 bg-[#F0F0F0] dark:bg-[#333] self-center" />

      {/* 전체 */}
      <button
        onClick={() => onCategorySelect("전체")}
        className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 text-xs sm:text-sm transition-all ${
          selectedCategory === "전체"
            ? "border-costco-red bg-costco-red text-white font-bold"
            : "border-[#DDD] dark:border-[#444] bg-white dark:bg-[#2A2A2A] text-[#555] dark:text-[#CCC] font-medium"
        }`}
      >
        전체
      </button>

      {/* 카테고리 칩들 */}
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategorySelect(cat)}
          className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 text-xs sm:text-sm transition-all ${
            selectedCategory === cat
              ? "border-costco-red bg-costco-red text-white font-bold"
              : "border-[#DDD] dark:border-[#444] bg-white dark:bg-[#2A2A2A] text-[#555] dark:text-[#CCC] font-medium"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
