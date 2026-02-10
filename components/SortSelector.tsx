"use client";

import { SORT_OPTIONS } from "@/lib/constants";

interface SortSelectorProps {
  count: number;
  favoritesCount: number;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export default function SortSelector({
  count,
  favoritesCount,
  sortBy,
  onSortChange,
}: SortSelectorProps) {
  return (
    <div className="flex justify-between items-center px-1 py-2.5">
      <span className="text-sm text-[#888] dark:text-[#AAA] font-semibold">
        {count}개 상품
        {favoritesCount > 0 && (
          <span className="ml-2">💖 {favoritesCount}개 찜</span>
        )}
      </span>

      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-2.5 py-1.5 rounded-lg border border-[#DDD] dark:border-[#444] text-sm text-[#555] dark:text-[#CCC] bg-white dark:bg-[#2A2A2A] cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
