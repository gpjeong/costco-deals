// HTML 파싱 및 데이터 변환
import { Product, Category } from '../lib/types';
import { SCRAPER_CONFIG } from './config';

// OCC API 상품 타입
export interface OccProduct {
  code: string;
  name: string;
  url: string;
  basePrice?: { value: number };
  price?: { value: number };
  discountPrice?: { value: number };
  couponDiscount?: {
    discountValue: number;
    discountStartDate: string;
    discountEndDate: string;
    localDiscountStartDate?: string;
    localDiscountEndDate?: string;
  };
  discountStartDate?: string;
  discountEndDate?: string;
  as400Discount?: boolean;
  images?: { format: string; imageType: string; url: string }[];
}

/**
 * 가격 문자열을 숫자로 변환
 * 예: "₩12,990", "12,990원", "12990" -> 12990
 */
export function parsePrice(priceText: string): number {
  if (!priceText) return 0;
  const cleaned = priceText.replace(/[^\d,]/g, '');
  const number = cleaned.replace(/,/g, '');
  return parseInt(number, 10) || 0;
}

/**
 * URL 경로에서 카테고리 매핑 (2-segment → 1-segment → 키워드 → 기본값)
 */
export function mapCategory(url: string, productName?: string): Category {
  // URL 정리: 도메인 제거, 앞뒤 슬래시 제거
  const cleanUrl = url.replace(/^https?:\/\/[^/]+/, '').replace(/^\//, '');
  const segments = cleanUrl.split('/').filter(Boolean);

  // 1. 2-segment 매핑 (가장 구체적)
  if (segments.length >= 2) {
    const twoSeg = `${segments[0]}/${segments[1]}`;
    if (twoSeg in SCRAPER_CONFIG.categoryMapping2) {
      return SCRAPER_CONFIG.categoryMapping2[twoSeg];
    }
  }

  // 2. 1-segment 매핑
  if (segments.length >= 1 && segments[0] in SCRAPER_CONFIG.categoryMapping1) {
    return SCRAPER_CONFIG.categoryMapping1[segments[0]];
  }

  // 3. 상품명 키워드 매핑
  if (productName) {
    for (const { keywords, category } of SCRAPER_CONFIG.keywordMapping) {
      if (keywords.some(kw => productName.includes(kw))) {
        return category;
      }
    }
  }

  return SCRAPER_CONFIG.defaultCategory;
}

/**
 * 할인율 계산: round((discountAmount / originalPrice) * 100)
 */
export function calculateDiscountRate(originalPrice: number, discountAmount: number): number {
  if (originalPrice === 0) return 0;
  return Math.round((discountAmount / originalPrice) * 100);
}

/**
 * 가격 정합성 검증: salePrice === originalPrice - discountAmount
 */
export function validatePrices(
  originalPrice: number,
  discountAmount: number,
  salePrice: number
): boolean {
  return salePrice === originalPrice - discountAmount;
}

/**
 * URL에서 상품 ID 추출 ("...p/511435" → "511435")
 */
export function extractProductId(url: string): string {
  const match = url.match(/\/p\/(\d+)/);
  return match ? match[1] : '';
}

/**
 * 이미지 URL을 절대 URL로 변환
 */
export function normalizeImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  if (imageUrl.startsWith('/')) {
    return `https://www.costco.co.kr${imageUrl}`;
  }
  return imageUrl;
}

/**
 * ISO 날짜 문자열에서 날짜만 추출 (UTC 기준)
 * localDiscountDate는 KST 시간이지만 Z 접미사로 저장됨 → UTC로 파싱하면 날짜 부분이 정확
 */
export function parseIsoDate(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 주차 날짜 범위 계산 (ISO 8601 주차 기준, 월요일 시작)
 */
export function getWeekDateRange(date: Date = new Date()): {
  weekId: string;
  startDate: string;
  endDate: string;
} {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const year = monday.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((monday.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);

  const weekId = `${year}-W${String(weekNumber).padStart(2, '0')}`;
  const startDate = monday.toISOString().split('T')[0];
  const endDate = sunday.toISOString().split('T')[0];

  return { weekId, startDate, endDate };
}

/**
 * OCC API 상품 데이터 → Product 객체 변환
 */
export function parseOccProduct(occ: OccProduct): Product {
  const { weekId, startDate: weekStart, endDate: weekEnd } = getWeekDateRange();

  // 가격 추출
  const originalPrice = occ.basePrice?.value ?? 0;
  const rawSalePrice = occ.price?.value ?? 0;
  const discountAmount = occ.discountPrice?.value ?? (originalPrice - rawSalePrice);
  // price가 0인 경우 basePrice - discountAmount로 계산
  const salePrice = rawSalePrice > 0 ? rawSalePrice : (originalPrice - discountAmount);

  // 할인율 계산
  const discountRate = calculateDiscountRate(originalPrice, discountAmount);

  // 할인 기간 (couponDiscount 또는 discountStartDate/discountEndDate)
  const rawStart = occ.couponDiscount?.localDiscountStartDate || occ.discountStartDate || '';
  const rawEnd = occ.couponDiscount?.localDiscountEndDate || occ.discountEndDate || '';
  const productStartDate = rawStart ? parseIsoDate(rawStart) : weekStart;
  const productEndDate = rawEnd ? parseIsoDate(rawEnd) : weekEnd;

  // 카테고리 매핑 (URL + 상품명)
  const category = mapCategory(occ.url || '', occ.name);

  // 이미지 URL (product 포맷 우선, 없으면 thumbnail)
  const productImage = occ.images?.find(img => img.format === 'product' && img.imageType === 'PRIMARY');
  const thumbnailImage = occ.images?.find(img => img.format === 'thumbnail' && img.imageType === 'PRIMARY');
  const imageUrl = normalizeImageUrl((productImage || thumbnailImage)?.url || '');

  // 태그 생성
  const tags: string[] = [];
  if (discountRate >= 30) tags.push('인기상품');
  if (discountAmount >= 50000) tags.push('최저가');

  return {
    id: occ.code,
    name: occ.name,
    category,
    originalPrice,
    discountAmount,
    discountRate,
    salePrice,
    startDate: productStartDate,
    endDate: productEndDate,
    imageUrl,
    tags,
    isManuallyEdited: false,
    notes: '',
  };
}

/**
 * 원시 상품 데이터를 Product 객체로 변환 (HTML 스크래핑용, 하위 호환)
 */
export function parseProduct(rawData: {
  id: string;
  title: string;
  href: string;
  imageUrl: string;
  priceText: string;
  originalPriceText?: string;
}): Product {
  const { weekId, startDate, endDate } = getWeekDateRange();

  const originalPrice = parsePrice(rawData.originalPriceText || rawData.priceText);
  const salePrice = parsePrice(rawData.priceText);
  const discountAmount = originalPrice > salePrice ? originalPrice - salePrice : 0;
  const discountRate = calculateDiscountRate(originalPrice, discountAmount);
  const category = mapCategory(rawData.href, rawData.title);
  const imageUrl = normalizeImageUrl(rawData.imageUrl);

  return {
    id: rawData.id,
    name: rawData.title,
    category,
    originalPrice,
    discountAmount,
    discountRate,
    salePrice: salePrice || originalPrice,
    startDate,
    endDate,
    imageUrl,
    tags: discountRate >= 30 ? ['인기상품'] : [],
    isManuallyEdited: false,
    notes: '',
  };
}
