import { useState, useMemo } from "react";

const CATEGORIES = ["전체", "식료품", "간식류", "음료/세제", "주류", "건강기능식품", "미용", "생활용품", "가전", "의류/패션"];

const SAMPLE_DATA = [
  { id: "1", name: "CJ 유기농 맛밤 42G X 17PK", category: "간식류", originalPrice: 16490, discountAmount: 3500, discountRate: 21, salePrice: 12990, endDate: "2/15", tags: ["인기"], emoji: "🌰" },
  { id: "2", name: "CORNE PORT 로얄 박스 초콜릿 315G", category: "간식류", originalPrice: 25990, discountAmount: 3600, discountRate: 14, salePrice: 22390, endDate: "2/15", tags: [], emoji: "🍫" },
  { id: "3", name: "신선 삼겹살 (100g당)", category: "식료품", originalPrice: 2490, discountAmount: 500, discountRate: 20, salePrice: 1990, endDate: "2/15", tags: ["인기"], emoji: "🥩" },
  { id: "4", name: "타이드 캡슐세제 104개입", category: "음료/세제", originalPrice: 38990, discountAmount: 8000, discountRate: 21, salePrice: 30990, endDate: "2/22", tags: [], emoji: "🧺" },
  { id: "5", name: "커클랜드 종합비타민 500정", category: "건강기능식품", originalPrice: 29990, discountAmount: 7000, discountRate: 23, salePrice: 22990, endDate: "2/15", tags: ["최저가"], emoji: "💊" },
  { id: "6", name: "견과 정과 2종 세트 720g", category: "간식류", originalPrice: 29990, discountAmount: 4500, discountRate: 15, salePrice: 25490, endDate: "2/18", tags: ["인기"], emoji: "🥜" },
  { id: "7", name: "테팔 프라이팬 세트 2P", category: "생활용품", originalPrice: 82900, discountAmount: 15000, discountRate: 18, salePrice: 67900, endDate: "2/15", tags: [], emoji: "🍳" },
  { id: "8", name: "나이키 에어맥스 운동화", category: "의류/패션", originalPrice: 129000, discountAmount: 30000, discountRate: 23, salePrice: 99000, endDate: "2/22", tags: ["최저가"], emoji: "👟" },
  { id: "9", name: "LG 공기청정기 AS300", category: "가전", originalPrice: 459000, discountAmount: 60000, discountRate: 13, salePrice: 399000, endDate: "2/15", tags: [], emoji: "🌬️" },
  { id: "10", name: "곰곰 유기농 두유 190ml x 24", category: "음료/세제", originalPrice: 15990, discountAmount: 3000, discountRate: 19, salePrice: 12990, endDate: "2/15", tags: ["인기"], emoji: "🥛" },
  { id: "11", name: "궁 쇠고기육포 선물세트 510g", category: "간식류", originalPrice: 41990, discountAmount: 3000, discountRate: 7, salePrice: 38990, endDate: "2/11", tags: [], emoji: "🥓" },
  { id: "12", name: "산펠레그리노 탄산수 500ml x 24", category: "음료/세제", originalPrice: 24990, discountAmount: 5000, discountRate: 20, salePrice: 19990, endDate: "2/22", tags: [], emoji: "💧" },
];

const SORT_OPTIONS = [
  { value: "discountRate", label: "할인율 높은순" },
  { value: "priceLow", label: "가격 낮은순" },
  { value: "priceHigh", label: "가격 높은순" },
  { value: "endingSoon", label: "마감 임박순" },
];

function formatPrice(price) {
  return price.toLocaleString() + "원";
}

function getDaysLeft(endDate) {
  const month = parseInt(endDate.split("/")[0]);
  const day = parseInt(endDate.split("/")[1]);
  const end = new Date(2026, month - 1, day);
  const now = new Date(2026, 1, 10);
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

const themes = {
  light: {
    bg: "#F8F8F8", cardBg: "white",
    headerBg: "linear-gradient(135deg, #005DAA 0%, #003F7D 100%)",
    text: "#222", textSecondary: "#888", textMuted: "#999",
    border: "#F0F0F0", chipBg: "white", chipBorder: "#DDD", chipText: "#555",
    inputBg: "rgba(255,255,255,0.95)", inputText: "#333",
    sortBg: "white", sortBorder: "#DDD",
    footerBg: "white", footerBorder: "#EEE",
    summaryBg: "white", summaryBorder: "#F0F0F0",
    imgBg: "linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%)",
    badgeBg: "#F5F5F5",
    sheetOverlay: "rgba(0,0,0,0.4)", sheetBg: "white", sheetHandle: "#DDD",
    checkBg: "#F9F9F9", checkBorder: "#EEE", checkDone: "#F0FFF0", checkDoneBorder: "#D4EDDA",
    emptyInputBg: "#F5F5F5", emptyInputBorder: "#E0E0E0", uncheckedBox: "#DDD",
  },
  dark: {
    bg: "#121212", cardBg: "#1E1E1E",
    headerBg: "linear-gradient(135deg, #0A1628 0%, #162544 100%)",
    text: "#E8E8E8", textSecondary: "#AAA", textMuted: "#777",
    border: "#333", chipBg: "#2A2A2A", chipBorder: "#444", chipText: "#CCC",
    inputBg: "rgba(255,255,255,0.1)", inputText: "#E8E8E8",
    sortBg: "#2A2A2A", sortBorder: "#444",
    footerBg: "#1A1A1A", footerBorder: "#333",
    summaryBg: "#1E1E1E", summaryBorder: "#333",
    imgBg: "linear-gradient(135deg, #2A2A2A 0%, #222 100%)",
    badgeBg: "#333",
    sheetOverlay: "rgba(0,0,0,0.7)", sheetBg: "#1E1E1E", sheetHandle: "#555",
    checkBg: "#2A2A2A", checkBorder: "#444", checkDone: "#1a2a1a", checkDoneBorder: "#2a4a2a",
    emptyInputBg: "#2A2A2A", emptyInputBorder: "#444", uncheckedBox: "#444",
  },
};

export default function CostcoDeals() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState("discountRate");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([
    { id: "c1", text: "맛밤", checked: false, fromProduct: true },
    { id: "c2", text: "우유 2팩", checked: true, fromProduct: false },
  ]);
  const [newCartItem, setNewCartItem] = useState("");

  const t = darkMode ? themes.dark : themes.light;

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addToCart = (productName) => {
    if (!cartItems.some((item) => item.text === productName)) {
      setCartItems((prev) => [...prev, { id: `c${Date.now()}`, text: productName, checked: false, fromProduct: true }]);
    }
  };

  const addCustomCartItem = () => {
    if (newCartItem.trim()) {
      setCartItems((prev) => [...prev, { id: `c${Date.now()}`, text: newCartItem.trim(), checked: false, fromProduct: false }]);
      setNewCartItem("");
    }
  };

  const toggleCartItem = (id) => {
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const removeCartItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const categorySummary = useMemo(() => {
    const counts = {};
    SAMPLE_DATA.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return counts;
  }, []);

  const totalDiscount = useMemo(() => SAMPLE_DATA.reduce((sum, p) => sum + p.discountAmount, 0), []);

  const filtered = useMemo(() => {
    let items = SAMPLE_DATA.filter((p) => {
      if (showFavoritesOnly && !favorites.has(p.id)) return false;
      if (selectedCategory !== "전체" && p.category !== selectedCategory) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
    items.sort((a, b) => {
      switch (sortBy) {
        case "discountRate": return b.discountRate - a.discountRate;
        case "priceLow": return a.salePrice - b.salePrice;
        case "priceHigh": return b.salePrice - a.salePrice;
        case "endingSoon": return getDaysLeft(a.endDate) - getDaysLeft(b.endDate);
        default: return 0;
      }
    });
    return items;
  }, [selectedCategory, sortBy, searchQuery, showFavoritesOnly, favorites]);

  const weekDates = weekOffset === 0
    ? { start: "2월 9일 (일)", end: "2월 15일 (토)" }
    : { start: "2월 2일 (일)", end: "2월 8일 (토)" };

  const uncheckedCount = cartItems.filter((i) => !i.checked).length;

  return (
    <div style={{ fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif", background: t.bg, minHeight: "100vh", transition: "background 0.3s" }}>
      {/* Header */}
      <div style={{
        background: t.headerBg, padding: "20px 16px 16px", color: "white",
        position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 12px rgba(0,0,0,0.15)"
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src="https://azure-na-images.contentstack.com/v3/assets/bltfc0c2adf9ebb4217/blt5812f2d119ab56ce/689c2f093f551be24584a568/costcologo.png"
                alt="Costco" style={{ height: 32, width: "auto", filter: "brightness(0) invert(1)" }}
              />
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>할인 모아보기</h1>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setDarkMode(!darkMode)} style={{
                background: "rgba(255,255,255,0.15)", border: "none", color: "white",
                borderRadius: 10, width: 38, height: 38, fontSize: 18, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>{darkMode ? "☀️" : "🌙"}</button>
              <button onClick={() => setShowCart(true)} style={{
                background: "rgba(255,255,255,0.15)", border: "none", color: "white",
                borderRadius: 10, width: 38, height: 38, fontSize: 18, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", position: "relative"
              }}>
                🛒
                {uncheckedCount > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -4, background: "#E31837", color: "white",
                    borderRadius: "50%", width: 20, height: 20, fontSize: 11, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>{uncheckedCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* Week Navigation */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 14px", marginBottom: 12
          }}>
            <button onClick={() => setWeekOffset(-1)} style={{
              background: "rgba(255,255,255,0.2)", border: "none", color: "white",
              borderRadius: 8, padding: "6px 12px", fontSize: 15, fontWeight: 700, cursor: "pointer"
            }}>◀ 지난주</button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{weekDates.start} ~ {weekDates.end}</div>
              {weekOffset === 0 && <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>📍 이번 주 할인</div>}
            </div>
            <button onClick={() => setWeekOffset(0)} disabled={weekOffset === 0} style={{
              background: weekOffset === 0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)",
              border: "none", color: weekOffset === 0 ? "rgba(255,255,255,0.4)" : "white",
              borderRadius: 8, padding: "6px 12px", fontSize: 15, fontWeight: 700,
              cursor: weekOffset === 0 ? "default" : "pointer"
            }}>다음주 ▶</button>
          </div>

          {/* Search */}
          <input
            type="text" placeholder="🔍 상품 검색..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "11px 16px", borderRadius: 10, border: "none",
              fontSize: 16, outline: "none", background: t.inputBg,
              boxSizing: "border-box", color: t.inputText
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 12px" }}>
        {/* Category Summary */}
        <div style={{
          display: "flex", gap: 8, overflowX: "auto", padding: "14px 0 4px",
          WebkitOverflowScrolling: "touch", scrollbarWidth: "none"
        }}>
          <div style={{
            flexShrink: 0, background: t.summaryBg, borderRadius: 12,
            padding: "10px 16px", border: `1px solid ${t.summaryBorder}`,
            textAlign: "center", minWidth: 100
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#E31837" }}>{SAMPLE_DATA.length}</div>
            <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600 }}>전체 할인</div>
          </div>
          <div style={{
            flexShrink: 0, background: t.summaryBg, borderRadius: 12,
            padding: "10px 16px", border: `1px solid ${t.summaryBorder}`,
            textAlign: "center", minWidth: 120
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#005DAA" }}>~{Math.round(totalDiscount / 10000)}만원</div>
            <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600 }}>최대 절약</div>
          </div>
          {Object.entries(categorySummary).slice(0, 5).map(([cat, count]) => (
            <div key={cat} onClick={() => setSelectedCategory(cat)} style={{
              flexShrink: 0, background: selectedCategory === cat ? "#FFF5F7" : t.summaryBg,
              borderRadius: 12, padding: "10px 16px",
              border: selectedCategory === cat ? "1.5px solid #E31837" : `1px solid ${t.summaryBorder}`,
              textAlign: "center", cursor: "pointer", minWidth: 80, transition: "all 0.2s"
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: t.text }}>{count}</div>
              <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600 }}>{cat}</div>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div style={{
          display: "flex", gap: 8, overflowX: "auto", padding: "10px 0 6px",
          WebkitOverflowScrolling: "touch", scrollbarWidth: "none"
        }}>
          <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} style={{
            flexShrink: 0, padding: "8px 16px", borderRadius: 20,
            border: showFavoritesOnly ? "2px solid #E31837" : `2px solid ${t.chipBorder}`,
            background: showFavoritesOnly ? "#FFF0F3" : t.chipBg,
            color: showFavoritesOnly ? "#E31837" : t.chipText,
            fontSize: 14, fontWeight: showFavoritesOnly ? 700 : 500, cursor: "pointer", transition: "all 0.2s"
          }}>💖 찜 {favorites.size > 0 && `(${favorites.size})`}</button>
          <div style={{ flexShrink: 0, width: 1, height: 24, background: t.border, alignSelf: "center" }} />
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
              flexShrink: 0, padding: "8px 16px", borderRadius: 20,
              border: selectedCategory === cat ? "2px solid #E31837" : `2px solid ${t.chipBorder}`,
              background: selectedCategory === cat ? "#E31837" : t.chipBg,
              color: selectedCategory === cat ? "white" : t.chipText,
              fontSize: 14, fontWeight: selectedCategory === cat ? 700 : 500,
              cursor: "pointer", transition: "all 0.2s"
            }}>{cat}</button>
          ))}
        </div>

        {/* Sort + Count */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 4px 8px" }}>
          <span style={{ fontSize: 14, color: t.textSecondary, fontWeight: 600 }}>
            {filtered.length}개 상품
            {favorites.size > 0 && <span style={{ marginLeft: 8 }}>💖 {favorites.size}개 찜</span>}
          </span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{
            padding: "6px 10px", borderRadius: 8, border: `1px solid ${t.sortBorder}`,
            fontSize: 13, color: t.chipText, background: t.sortBg, cursor: "pointer"
          }}>
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Product Grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 12, paddingBottom: 30
        }}>
          {filtered.map((product) => {
            const daysLeft = getDaysLeft(product.endDate);
            const isUrgent = daysLeft <= 2;
            const isFav = favorites.has(product.id);
            const isInCart = cartItems.some((item) => item.text === product.name);

            return (
              <div key={product.id} style={{
                background: t.cardBg, borderRadius: 16, overflow: "hidden",
                boxShadow: darkMode ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
                border: isUrgent ? "2px solid #FF6B35" : `1px solid ${t.border}`,
                transition: "transform 0.15s, box-shadow 0.15s", position: "relative"
              }}>
                <div style={{
                  background: t.imgBg, height: 140, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 56, position: "relative"
                }}>
                  {product.emoji}
                  <div style={{
                    position: "absolute", top: 10, left: 10,
                    background: product.discountRate >= 20 ? "#E31837" : "#FF6B35",
                    color: "white", padding: "4px 10px", borderRadius: 8, fontSize: 14, fontWeight: 800
                  }}>-{product.discountRate}%</div>
                  {product.tags.length > 0 && (
                    <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 4 }}>
                      {product.tags.map((tag) => (
                        <span key={tag} style={{
                          background: tag === "최저가" ? "#4CAF50" : "#FF9800",
                          color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700
                        }}>{tag === "인기" ? "🔥 인기" : `✨ ${tag}`}</span>
                      ))}
                    </div>
                  )}
                  <button onClick={() => toggleFavorite(product.id)} style={{
                    position: "absolute", bottom: 10, right: 10,
                    background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%",
                    width: 36, height: 36, fontSize: 18, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
                  }}>{isFav ? "❤️" : "🤍"}</button>
                </div>

                <div style={{ padding: "12px 14px 14px" }}>
                  <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600, marginBottom: 4 }}>
                    {product.category}
                  </div>
                  <h3 style={{
                    fontSize: 15, fontWeight: 700, color: t.text, margin: "0 0 10px", lineHeight: 1.3,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                  }}>{product.name}</h3>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#E31837" }}>{formatPrice(product.salePrice)}</span>
                    <span style={{ fontSize: 13, color: t.textMuted, textDecoration: "line-through" }}>{formatPrice(product.originalPrice)}</span>
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 600, marginBottom: 8,
                    color: product.discountRate >= 20 ? "#E31837" : "#FF6B35"
                  }}>💰 {formatPrice(product.discountAmount)} 할인</div>

                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    paddingTop: 8, borderTop: `1px solid ${t.border}`
                  }}>
                    <span style={{
                      fontSize: 12, color: isUrgent ? "#E31837" : t.textMuted,
                      fontWeight: isUrgent ? 700 : 500
                    }}>
                      {isUrgent ? "⏰ " : "📅 "}~{product.endDate}까지{isUrgent && " (마감임박!)"}
                    </span>
                    {daysLeft > 0 && (
                      <span style={{
                        fontSize: 11, color: t.textMuted, background: t.badgeBg,
                        padding: "2px 8px", borderRadius: 10
                      }}>D-{daysLeft}</span>
                    )}
                  </div>

                  <button onClick={() => addToCart(product.name)} disabled={isInCart} style={{
                    width: "100%", marginTop: 10, padding: "9px 0", borderRadius: 10, border: "none",
                    background: isInCart ? t.badgeBg : "#005DAA",
                    color: isInCart ? t.textMuted : "white",
                    fontSize: 13, fontWeight: 700, cursor: isInCart ? "default" : "pointer", transition: "all 0.2s"
                  }}>{isInCart ? "✅ 장바구니에 담김" : "🛒 장바구니에 추가"}</button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: t.textMuted }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{showFavoritesOnly ? "💖" : "🔍"}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: t.text }}>
              {showFavoritesOnly ? "찜한 상품이 없어요" : "검색 결과가 없어요"}
            </div>
            <div style={{ fontSize: 14, marginTop: 4 }}>
              {showFavoritesOnly ? "마음에 드는 상품의 🤍를 눌러 찜해보세요" : "다른 카테고리나 검색어를 시도해보세요"}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "20px", color: t.textMuted, fontSize: 12,
        borderTop: `1px solid ${t.footerBorder}`, marginTop: 20, background: t.footerBg
      }}>
        데이터 출처: 코스트코 코리아 | 마지막 업데이트: 2026.02.09<br />
        ※ 실제 매장 가격과 다를 수 있습니다
      </div>

      {/* Shopping Cart Bottom Sheet */}
      {showCart && (
        <div onClick={() => setShowCart(false)} style={{
          position: "fixed", inset: 0, background: t.sheetOverlay,
          zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center"
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: t.sheetBg, borderRadius: "20px 20px 0 0",
            width: "100%", maxWidth: 500, maxHeight: "75vh",
            padding: "12px 20px 24px", overflowY: "auto",
            animation: "slideUp 0.3s ease-out"
          }}>
            <div style={{ width: 40, height: 4, background: t.sheetHandle, borderRadius: 2, margin: "0 auto 16px" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: t.text }}>🛒 장바구니 메모</h2>
              <span style={{ fontSize: 13, color: t.textMuted }}>{uncheckedCount}개 남음 / {cartItems.length}개 전체</span>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                type="text" placeholder="직접 추가 (예: 화장지, 물)"
                value={newCartItem} onChange={(e) => setNewCartItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomCartItem()}
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 10,
                  border: `1.5px solid ${t.emptyInputBorder}`, fontSize: 15,
                  outline: "none", background: t.emptyInputBg, color: t.text
                }}
              />
              <button onClick={addCustomCartItem} style={{
                background: "#005DAA", color: "white", border: "none", borderRadius: 10,
                padding: "10px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap"
              }}>+ 추가</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10,
                  background: item.checked ? t.checkDone : t.checkBg,
                  border: `1px solid ${item.checked ? t.checkDoneBorder : t.checkBorder}`,
                  transition: "all 0.2s"
                }}>
                  <button onClick={() => toggleCartItem(item.id)} style={{
                    width: 28, height: 28, borderRadius: 8, border: "none",
                    background: item.checked ? "#4CAF50" : t.uncheckedBox,
                    color: "white", fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>{item.checked ? "✓" : ""}</button>
                  <span style={{
                    flex: 1, fontSize: 15, fontWeight: 500,
                    color: item.checked ? t.textMuted : t.text,
                    textDecoration: item.checked ? "line-through" : "none"
                  }}>
                    {item.text}
                    {item.fromProduct && <span style={{ fontSize: 11, color: "#005DAA", marginLeft: 6 }}>할인상품</span>}
                  </span>
                  <button onClick={() => removeCartItem(item.id)} style={{
                    background: "none", border: "none", color: t.textMuted,
                    fontSize: 18, cursor: "pointer", padding: "0 4px", flexShrink: 0
                  }}>×</button>
                </div>
              ))}
            </div>

            {cartItems.length === 0 && (
              <div style={{ textAlign: "center", padding: "30px 0", color: t.textMuted }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📝</div>
                <div style={{ fontSize: 14 }}>상품 카드에서 "장바구니에 추가"를 누르거나<br />직접 입력해보세요</div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
