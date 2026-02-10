// 코스트코 주간 할인 타입 정의

export interface WeeklyDeals {
  weekId: string;           // "2026-W07"
  startDate: string;        // "2026-02-09"
  endDate: string;          // "2026-02-15"
  scrapedAt: string;        // ISO 8601
  products: Product[];
}

export interface Product {
  id: string;               // "603724"
  name: string;             // "CJ 유기농 맛밤 42G X 17PK"
  category: Category;       // "간식류"
  originalPrice: number;    // 16490
  discountAmount: number;   // 3500
  discountRate: number;     // 21
  salePrice: number;        // 12990
  startDate: string;        // "2026-02-09"
  endDate: string;          // "2026-02-15"
  imageUrl: string;
  tags: string[];           // ["인기상품", "최저가"]
  isManuallyEdited: boolean;
  notes: string;
}

export type Category =
  | "식료품"
  | "간식류"
  | "음료/세제/애견용품"
  | "주류"
  | "건강기능식품"
  | "미용"
  | "생활용품"
  | "아웃도어"
  | "의류/패션"
  | "가전"
  | "가구/침구류";

export interface CartItem {
  id: string;
  text: string;
  checked: boolean;
  fromProduct: boolean;
}

export interface SortOption {
  value: string;
  label: string;
}
