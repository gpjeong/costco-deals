"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

const ITEMS_PER_PAGE = 12;

interface ProductGridProps {
  products: Product[];
  favorites: string[];
  cartItemNames: string[];
  onToggleFavorite: (id: string) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({
  products,
  favorites,
  cartItemNames,
  onToggleFavorite,
  onAddToCart,
}: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // 필터/정렬 변경 시 1페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 페이지 번호 목록 생성 (현재 기준 ±2)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-4">
        {paginatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isFavorite={favorites.includes(product.id)}
            isInCart={cartItemNames.includes(product.name)}
            onToggleFavorite={onToggleFavorite}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 pb-8 pt-2">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-xl text-sm font-bold border border-[#E0E0E0] dark:border-[#444] bg-white dark:bg-[#1E1E1E] text-[#555] dark:text-[#AAA] disabled:opacity-30 disabled:cursor-default cursor-pointer hover:bg-[#F0F0F0] dark:hover:bg-[#333] transition-colors"
          >
            ◀◀
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-xl text-sm font-bold border border-[#E0E0E0] dark:border-[#444] bg-white dark:bg-[#1E1E1E] text-[#555] dark:text-[#AAA] disabled:opacity-30 disabled:cursor-default cursor-pointer hover:bg-[#F0F0F0] dark:hover:bg-[#333] transition-colors"
          >
            ◀
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`w-10 h-10 rounded-xl text-sm font-bold border transition-colors cursor-pointer ${
                page === currentPage
                  ? "bg-costco-blue text-white border-costco-blue"
                  : "bg-white dark:bg-[#1E1E1E] text-[#555] dark:text-[#AAA] border-[#E0E0E0] dark:border-[#444] hover:bg-[#F0F0F0] dark:hover:bg-[#333]"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-xl text-sm font-bold border border-[#E0E0E0] dark:border-[#444] bg-white dark:bg-[#1E1E1E] text-[#555] dark:text-[#AAA] disabled:opacity-30 disabled:cursor-default cursor-pointer hover:bg-[#F0F0F0] dark:hover:bg-[#333] transition-colors"
          >
            ▶
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-xl text-sm font-bold border border-[#E0E0E0] dark:border-[#444] bg-white dark:bg-[#1E1E1E] text-[#555] dark:text-[#AAA] disabled:opacity-30 disabled:cursor-default cursor-pointer hover:bg-[#F0F0F0] dark:hover:bg-[#333] transition-colors"
          >
            ▶▶
          </button>
        </div>
      )}
    </div>
  );
}
