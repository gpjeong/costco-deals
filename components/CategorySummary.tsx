"use client";

import { Product, Category } from "@/lib/types";

interface CategorySummaryProps {
  products: Product[];
  selectedCategory: string;
  onCategorySelect: (category: Category | "전체") => void;
}

export default function CategorySummary({
  products,
  selectedCategory,
  onCategorySelect,
}: CategorySummaryProps) {
  // 카테고리별 개수 계산
  const categoryCounts: Record<string, number> = {};
  products.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  return (
    <div className="flex gap-2 overflow-x-auto pt-3.5 pb-1 scrollbar-hide">
      {/* 전체 할인 개수 */}
      <div
        onClick={() => onCategorySelect("전체")}
        className={`flex-shrink-0 rounded-xl px-4 py-2.5 text-center min-w-[100px] cursor-pointer transition-all ${
          selectedCategory === "전체"
            ? "bg-[#FFF5F7] dark:bg-[#2A1A1E] border-[1.5px] border-costco-red"
            : "bg-white dark:bg-[#1E1E1E] border border-[#F0F0F0] dark:border-[#333]"
        }`}
      >
        <div className="text-[22px] font-extrabold text-costco-red dark:text-[#FF6B6B]">
          {products.length}
        </div>
        <div className="text-[13px] text-[#999] dark:text-[#888] font-semibold">
          전체 할인
        </div>
      </div>

      {/* 카테고리별 개수 (상위 5개) */}
      {Object.entries(categoryCounts)
        .slice(0, 5)
        .map(([cat, count]) => {
          const isSelected = selectedCategory === cat;
          return (
            <div
              key={cat}
              onClick={() => onCategorySelect(cat as Category)}
              className={`flex-shrink-0 rounded-xl px-4 py-2.5 text-center cursor-pointer min-w-[80px] transition-all ${
                isSelected
                  ? "bg-[#FFF5F7] border-[1.5px] border-costco-red"
                  : "bg-white dark:bg-[#1E1E1E] border border-[#F0F0F0] dark:border-[#333]"
              }`}
            >
              <div className="text-[22px] font-extrabold text-[#222] dark:text-[#E8E8E8]">
                {count}
              </div>
              <div className="text-[13px] text-[#999] dark:text-[#888] font-semibold">
                {cat}
              </div>
            </div>
          );
        })}
    </div>
  );
}
