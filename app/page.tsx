"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import WeekNavigation from "@/components/WeekNavigation";
import SearchBar from "@/components/SearchBar";
import CategorySummary from "@/components/CategorySummary";
import CategoryFilter from "@/components/CategoryFilter";
import SortSelector from "@/components/SortSelector";
import ProductGrid from "@/components/ProductGrid";
import ShoppingCart from "@/components/ShoppingCart";
import EmptyState from "@/components/EmptyState";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Category, WeeklyDeals } from "@/lib/types";
import { formatWeekRange, getDaysLeft } from "@/lib/utils";
import { getWeekIdWithOffset, getWeekDates } from "@/lib/weekUtils";

export default function HomePage() {
  // 상태 관리
  const [selectedCategory, setSelectedCategory] = useState<Category | "전체">("전체");
  const [sortBy, setSortBy] = useState("discountRate");
  const [searchQuery, setSearchQuery] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [weekData, setWeekData] = useState<WeeklyDeals | null>(null);
  const [loading, setLoading] = useState(true);

  // 커스텀 훅
  const { favorites, toggleFavorite } = useFavorites();
  const { items: cartItems, addItem, removeItem, toggleItem, uncheckedCount } = useCart();
  const { darkMode, toggleDarkMode } = useDarkMode();

  // 주차 데이터 로딩
  useEffect(() => {
    const loadWeekData = async () => {
      setLoading(true);
      try {
        const weekId = getWeekIdWithOffset(weekOffset);
        // SSG 환경에서는 public 폴더가 아닌 data 폴더에서 직접 import
        const response = await fetch(`/data/weeks/${weekId}.json`);

        if (!response.ok) {
          // 현재 주차 데이터로 폴백
          const currentWeekId = getWeekIdWithOffset(0);
          const fallbackResponse = await fetch(`/data/weeks/${currentWeekId}.json`);
          const data = await fallbackResponse.json();
          setWeekData(data);
        } else {
          const data = await response.json();
          setWeekData(data);
        }
      } catch (error) {
        console.error("Failed to load week data:", error);
        // 에러 시 빈 데이터
        setWeekData({
          weekId: getWeekIdWithOffset(weekOffset),
          startDate: "",
          endDate: "",
          scrapedAt: new Date().toISOString(),
          products: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadWeekData();
  }, [weekOffset]);

  // 검색 디바운스
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 필터링 및 정렬
  const filteredProducts = useMemo(() => {
    if (!weekData) return [];

    const products = weekData.products.filter((product) => {
      // 찜 필터
      if (showFavoritesOnly && !favorites.includes(product.id)) {
        return false;
      }

      // 카테고리 필터
      if (selectedCategory !== "전체" && product.category !== selectedCategory) {
        return false;
      }

      // 검색 필터
      if (
        debouncedSearchQuery &&
        !product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });

    // 정렬
    products.sort((a, b) => {
      switch (sortBy) {
        case "discountRate":
          return b.discountRate - a.discountRate;
        case "priceLow":
          return a.salePrice - b.salePrice;
        case "priceHigh":
          return b.salePrice - a.salePrice;
        case "discountAmount":
          return b.discountAmount - a.discountAmount;
        case "endingSoon":
          return getDaysLeft(a.endDate) - getDaysLeft(b.endDate);
        default:
          return 0;
      }
    });

    return products;
  }, [weekData, selectedCategory, sortBy, debouncedSearchQuery, showFavoritesOnly, favorites]);

  // 주차 날짜 범위
  const weekDates = useMemo(() => {
    if (weekData) {
      return formatWeekRange(weekData.startDate, weekData.endDate);
    }
    const dates = getWeekDates(getWeekIdWithOffset(weekOffset));
    return formatWeekRange(dates.startDate, dates.endDate);
  }, [weekData, weekOffset]);

  // 장바구니 아이템 이름 목록
  const cartItemNames = useMemo(
    () => cartItems.map((item) => item.text),
    [cartItems]
  );

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors">
      {/* Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenCart={() => setShowCart(true)}
        uncheckedCartCount={uncheckedCount}
      />

      {/* Header 내부 컨텐츠 (주차 네비게이션 + 검색바) */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-[#005DAA] to-[#003F7D] dark:from-[#0A1628] dark:to-[#162544] px-4 pb-4">
        <div className="max-w-[960px] mx-auto">
          <WeekNavigation
            weekOffset={weekOffset}
            onWeekChange={setWeekOffset}
            startDate={weekDates.start}
            endDate={weekDates.end}
          />
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[960px] mx-auto px-3">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">⏳</div>
            <div className="text-base font-semibold text-[#888] dark:text-[#AAA]">
              할인 정보를 불러오는 중...
            </div>
          </div>
        ) : (
          <>
            {/* Category Summary */}
            {weekData && (
              <CategorySummary
                products={weekData.products}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
            )}

            {/* Category Filter */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              showFavoritesOnly={showFavoritesOnly}
              onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
              favoritesCount={favorites.length}
            />

            {/* Sort Selector */}
            <SortSelector
              count={filteredProducts.length}
              favoritesCount={favorites.length}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <ProductGrid
                products={filteredProducts}
                favorites={favorites}
                cartItemNames={cartItemNames}
                onToggleFavorite={toggleFavorite}
                onAddToCart={(name) => addItem(name, true)}
              />
            ) : (
              <EmptyState
                icon={showFavoritesOnly ? "💖" : "🔍"}
                title={
                  showFavoritesOnly ? "찜한 상품이 없어요" : "검색 결과가 없어요"
                }
                description={
                  showFavoritesOnly
                    ? "마음에 드는 상품의 🤍를 눌러 찜해보세요"
                    : "다른 카테고리나 검색어를 시도해보세요"
                }
              />
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-5 px-4 text-[#888] dark:text-[#AAA] text-xs border-t border-[#EEE] dark:border-[#333] mt-5 bg-white dark:bg-[#1A1A1A]">
        데이터 출처: 코스트코 코리아 | 마지막 업데이트:{" "}
        {weekData?.scrapedAt
          ? new Date(weekData.scrapedAt).toLocaleDateString("ko-KR")
          : ""}
        <br />※ 실제 매장 가격과 다를 수 있습니다
      </footer>

      {/* Shopping Cart */}
      <ShoppingCart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        items={cartItems}
        onToggleItem={toggleItem}
        onRemoveItem={removeItem}
        onAddCustomItem={(text) => addItem(text, false)}
      />
    </div>
  );
}
