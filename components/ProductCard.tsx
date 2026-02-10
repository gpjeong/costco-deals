"use client";

import { Product } from "@/lib/types";
import { formatPrice, getDaysLeft } from "@/lib/utils";
import { CATEGORY_EMOJI } from "@/lib/constants";

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  isInCart: boolean;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (name: string) => void;
}

export default function ProductCard({
  product,
  isFavorite,
  isInCart,
  onToggleFavorite,
  onAddToCart,
}: ProductCardProps) {
  const daysLeft = getDaysLeft(product.endDate);
  const isUrgent = daysLeft <= 2;

  // 이미지 없으면 카테고리별 이모지 플레이스홀더
  const displayEmoji = CATEGORY_EMOJI[product.category] || "🛒";

  return (
    <div
      className={`flex flex-col bg-white dark:bg-dark-card rounded-2xl overflow-hidden transition-all border border-[#F0F0F0] dark:border-[#333] shadow-sm dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)] hover:shadow-md hover:-translate-y-0.5`}
    >
      {/* 이미지 영역 */}
      <div className="relative h-[140px] bg-gradient-to-br from-[#F5F5F5] to-[#EEEEEE] dark:from-[#2A2A2A] dark:to-[#222] flex items-center justify-center text-[56px]">
        <a
          href={`https://www.costco.co.kr/p/${product.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center"
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{displayEmoji}</span>
          )}
        </a>

        {/* 할인율 뱃지 */}
        <div
          className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-sm font-extrabold text-white ${
            product.discountRate >= 20 ? "bg-costco-red" : "bg-warning"
          }`}
        >
          -{product.discountRate}%
        </div>

        {/* 태그 뱃지 (인기, 최저가) */}
        {product.tags.length > 0 && (
          <div className="absolute top-2.5 right-2.5 flex gap-1">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold text-white ${
                  tag === "최저가" ? "bg-success" : "bg-[#FF9800]"
                }`}
              >
                {tag === "인기" ? "🔥 인기" : `✨ ${tag}`}
              </span>
            ))}
          </div>
        )}

        {/* 찜 버튼 */}
        <button
          onClick={() => onToggleFavorite(product.id)}
          className="absolute bottom-2.5 right-2.5 bg-white/90 border-none rounded-full w-9 h-9 text-lg cursor-pointer flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          aria-label={isFavorite ? "찜 취소" : "찜하기"}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </div>

      {/* 상품 정보 */}
      <div className="flex-1 flex flex-col px-3.5 pt-3 pb-3.5">
        {/* 카테고리 라벨 */}
        <div className="text-[13px] text-[#999] dark:text-[#888] font-semibold mb-1">
          {product.category}
        </div>

        {/* 상품명 (2줄 clamp) */}
        <h3 className="text-base font-bold text-[#222] dark:text-[#E8E8E8] mb-2.5 leading-tight line-clamp-2">
          {product.name}
        </h3>

        {/* 가격 정보 */}
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-xl font-extrabold text-costco-red dark:text-[#FF6B6B]">
            {formatPrice(product.salePrice)}
          </span>
          <span className="text-sm text-[#888] dark:text-[#AAA] line-through">
            {formatPrice(product.originalPrice)}
          </span>
        </div>

        <div
          className={`text-sm font-semibold mb-2 ${
            product.discountRate >= 20 ? "text-costco-red dark:text-[#FF6B6B]" : "text-warning dark:text-[#FF8F55]"
          }`}
        >
          💰 {formatPrice(product.discountAmount)} 할인
        </div>

        {/* 마감일 + D-day */}
        <div className="flex justify-between items-center pt-2 border-t border-[#F0F0F0] dark:border-[#333]">
          <span
            className={`text-[13px] ${
              isUrgent
                ? "text-costco-red dark:text-[#FF6B6B] font-bold"
                : "text-[#888] dark:text-[#AAA] font-medium"
            }`}
          >
            {isUrgent ? "⏰ " : "📅 "}~
            {new Date(product.endDate).toLocaleDateString("ko-KR", {
              month: "numeric",
              day: "numeric",
            })}
            까지{isUrgent && " (마감임박!)"}
          </span>
          {daysLeft > 0 && (
            <span className="text-xs text-[#888] dark:text-[#AAA] bg-[#F5F5F5] dark:bg-[#333] px-2 py-0.5 rounded-[10px]">
              D-{daysLeft}
            </span>
          )}
        </div>

        {/* 장바구니 추가 버튼 */}
        <div className="mt-auto" />
        <button
          onClick={() => onAddToCart(product.name)}
          disabled={isInCart}
          className={`w-full mt-2.5 py-2.5 rounded-[10px] border-none text-sm font-bold transition-all ${
            isInCart
              ? "bg-[#F5F5F5] dark:bg-[#333] text-[#888] dark:text-[#AAA] cursor-default"
              : "bg-costco-blue text-white cursor-pointer hover:bg-[#004488]"
          }`}
        >
          {isInCart ? "✅ 장바구니에 담김" : "🛒 장바구니에 추가"}
        </button>
      </div>
    </div>
  );
}
