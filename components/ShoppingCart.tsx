"use client";

import { CartItem } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onAddCustomItem: (text: string) => void;
}

export default function ShoppingCart({
  isOpen,
  onClose,
  items,
  onToggleItem,
  onRemoveItem,
  onAddCustomItem,
}: ShoppingCartProps) {
  const [newItemText, setNewItemText] = useState("");

  const handleAddCustomItem = () => {
    if (newItemText.trim()) {
      onAddCustomItem(newItemText.trim());
      setNewItemText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddCustomItem();
    }
  };

  const uncheckedCount = items.filter((item) => !item.checked).length;
  const totalPrice = items
    .filter((item) => !item.checked && item.salePrice)
    .reduce((sum, item) => sum + (item.salePrice || 0), 0);
  const totalDiscount = items
    .filter((item) => !item.checked && item.discountAmount)
    .reduce((sum, item) => sum + (item.discountAmount || 0), 0);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 dark:bg-black/70 z-[100] flex items-end justify-center animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-dark-card rounded-t-[20px] w-full max-w-[500px] max-h-[80vh] flex flex-col animate-slide-up"
      >
        {/* 손잡이 */}
        <div className="w-10 h-1 bg-[#DDD] dark:bg-[#555] rounded-sm mx-auto mt-3 mb-3 flex-shrink-0" />

        {/* 헤더 */}
        <div className="flex justify-between items-center mb-3 px-4 sm:px-5 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-extrabold m-0 text-[#222] dark:text-[#E8E8E8]">
            🛒 장바구니
          </h2>
          <span className="text-xs sm:text-sm text-[#888] dark:text-[#AAA]">
            {uncheckedCount}개 남음 / {items.length}개 전체
          </span>
        </div>

        {/* 직접 추가 입력 */}
        <div className="flex gap-2 mb-3 px-4 sm:px-5 flex-shrink-0">
          <input
            type="text"
            placeholder="직접 추가 (예: 화장지, 물)"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 px-3 py-2 sm:py-2.5 rounded-[10px] border-[1.5px] border-[#E0E0E0] dark:border-[#444] text-sm sm:text-base outline-none bg-[#F5F5F5] dark:bg-[#2A2A2A] text-[#222] dark:text-[#E8E8E8]"
          />
          <button
            onClick={handleAddCustomItem}
            className="flex-shrink-0 bg-costco-blue text-white border-none rounded-[10px] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap hover:bg-[#004488] transition-colors"
          >
            + 추가
          </button>
        </div>

        {/* 아이템 리스트 (스크롤 영역) */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5">
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-[10px] border transition-all ${
                  item.checked
                    ? "bg-[#F0FFF0] dark:bg-[#1a2a1a] border-[#D4EDDA] dark:border-[#2a4a2a]"
                    : "bg-[#F9F9F9] dark:bg-[#2A2A2A] border-[#EEE] dark:border-[#444]"
                }`}
              >
                {/* 체크박스 */}
                <button
                  onClick={() => onToggleItem(item.id)}
                  className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-lg border-none flex items-center justify-center text-xs sm:text-sm cursor-pointer transition-colors ${
                    item.checked
                      ? "bg-success text-white"
                      : "bg-[#DDD] dark:bg-[#444] text-transparent"
                  }`}
                  aria-label={item.checked ? "체크 해제" : "체크"}
                >
                  {item.checked ? "✓" : ""}
                </button>

                {/* 상품 이미지 (있는 경우) */}
                {item.fromProduct && item.imageUrl && (
                  <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-[#F0F0F0] dark:bg-[#333]">
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 상품 정보 */}
                <div className="flex-1 min-w-0">
                  <span
                    className={`block text-sm sm:text-base font-medium leading-tight transition-all ${
                      item.checked
                        ? "text-[#888] dark:text-[#AAA] line-through"
                        : "text-[#222] dark:text-[#E8E8E8]"
                    }`}
                  >
                    {item.text}
                  </span>
                  {item.fromProduct && item.salePrice && (
                    <span className={`text-xs sm:text-sm font-semibold ${item.checked ? "text-[#AAA]" : "text-costco-red dark:text-[#FF6B6B]"}`}>
                      {formatPrice(item.salePrice)}
                      {item.discountAmount && (
                        <span className={`ml-1.5 ${item.checked ? "text-[#BBB]" : "text-[#888] dark:text-[#AAA]"} font-normal`}>
                          (-{formatPrice(item.discountAmount)})
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* 삭제 버튼 */}
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="flex-shrink-0 bg-transparent border-none text-[#888] dark:text-[#AAA] text-lg cursor-pointer px-1 hover:text-costco-red transition-colors"
                  aria-label="삭제"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* 빈 장바구니 안내 */}
          {items.length === 0 && (
            <div className="text-center py-8 text-[#888] dark:text-[#AAA]">
              <div className="text-4xl mb-2">📝</div>
              <div className="text-sm">
                상품 카드에서 &quot;장바구니에 추가&quot;를 누르거나
                <br />
                직접 입력해보세요
              </div>
            </div>
          )}
        </div>

        {/* 총 합계 (상품이 있을 때만) */}
        {items.length > 0 && totalPrice > 0 && (
          <div className="flex-shrink-0 border-t border-[#EEE] dark:border-[#444] px-4 sm:px-5 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#888] dark:text-[#AAA] font-medium">
                예상 결제 금액
              </span>
              <div className="text-right">
                <span className="text-lg sm:text-xl font-extrabold text-costco-red dark:text-[#FF6B6B]">
                  {formatPrice(totalPrice)}
                </span>
                {totalDiscount > 0 && (
                  <div className="text-xs text-success font-semibold">
                    총 {formatPrice(totalDiscount)} 절약
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
