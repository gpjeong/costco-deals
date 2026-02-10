// 크롤러 설정
import { Category } from '../lib/types';

export const SCRAPER_CONFIG = {
  // 대상 URL (세션 쿠키 획득용)
  url: 'https://www.costco.co.kr/Special-Price-Offers/c/SpecialPriceOffers',

  // OCC REST API
  api: {
    search: '/rest/v2/korea/products/search',
    category: 'SpecialPriceOffers',
    pageSize: 100,
    fields: 'FULL',
    lang: 'ko',
    curr: 'KRW',
  },

  // 크롤링 옵션
  options: {
    headless: true,
    timeout: 60000,
    waitAfterLoad: 3000,
    retryAttempts: 3,
    retryDelay: 2000,
  },

  // User-Agent
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

  // 카테고리 매핑: URL 2-segment (더 구체적인 것 우선)
  categoryMapping2: {
    'Foods/Snacks': '간식류',
    'Foods/Beverages': '음료/세제/애견용품',
    'Foods/Alcohol': '주류',
    'BeautyHouseholdPersonal-Care/Beauty': '미용',
    'BeautyHouseholdPersonal-Care/Skin-Care': '미용',
    'BeautyHouseholdPersonal-Care/Personal-Care': '미용',
    'BeautyHouseholdPersonal-Care/BathFacial-Tissue': '생활용품',
    'BeautyHouseholdPersonal-Care/Household': '생활용품',
    'HomeKitchen/Cleaning-Products': '생활용품',
    'HomeKitchen/Cookware': '생활용품',
    'HomeKitchen/Kitchen-Storage': '생활용품',
    'HomeKitchen/Home-Decor': '생활용품',
    'BabyKidsToysPets/Pet-Supplies': '음료/세제/애견용품',
    'SportsFitnessCamping/Golf': '아웃도어',
    'SportsFitnessCamping/Camping': '아웃도어',
    'SportsFitnessCamping/Fitness': '아웃도어',
    'Appliances/Seasonal-Appliances': '가전',
    'Appliances/Kitchen-Appliances': '가전',
    'Appliances/Home-Appliances': '가전',
    'FurnitureBeddingHome/Bedding': '가구/침구류',
    'FurnitureBeddingHome/Bedroom-Furniture': '가구/침구류',
    'FurnitureBeddingHome/Living-Room-Furniture': '가구/침구류',
  } as Record<string, Category>,

  // 카테고리 매핑: URL 1-segment (폴백)
  categoryMapping1: {
    'FurnitureBeddingHome': '가구/침구류',
    'HealthSupplement': '건강기능식품',
    'Appliances': '가전',
    'Foods': '식료품',
    'HomeKitchen': '생활용품',
    'SportsFitnessCamping': '아웃도어',
    'Clothing': '의류/패션',
    'BabyKidsToysPets': '생활용품',
    'BeautyHouseholdPersonal-Care': '생활용품',
    'Alcohol': '주류',
  } as Record<string, Category>,

  // 상품명 키워드 기반 카테고리 매핑 (URL 매핑 실패 시 폴백)
  keywordMapping: [
    { keywords: ['세탁세제', '섬유유연제', '주방세제', '식기세척'], category: '음료/세제/애견용품' as Category },
    { keywords: ['애견', '강아지', '고양이', '반려'], category: '음료/세제/애견용품' as Category },
    { keywords: ['맥주', '와인', '소주', '위스키', '샴페인'], category: '주류' as Category },
    { keywords: ['비타민', '유산균', '프로바이오틱스', '루테인', '글루타치온', '홍삼', '오메가', '영양제', '콜라겐'], category: '건강기능식품' as Category },
    { keywords: ['스킨케어', '핸드크림', '샴푸', '컨디셔너', '바디로션', '선크림', '화장품'], category: '미용' as Category },
    { keywords: ['치약', '칫솔', '면도', '구강'], category: '미용' as Category },
    { keywords: ['화장지', '키친타월', '물티슈', '티슈'], category: '생활용품' as Category },
    { keywords: ['골프', '캠핑', '자전거', '텐트', '등산'], category: '아웃도어' as Category },
    { keywords: ['청소기', '에어컨', '세탁기', '냉장고', '전기요', '전기방석'], category: '가전' as Category },
    { keywords: ['이불', '베개', '매트리스', '토퍼', '침구'], category: '가구/침구류' as Category },
    { keywords: ['과자', '초콜릿', '사탕', '젤리', '견과', '맛밤', '쿠키'], category: '간식류' as Category },
  ],

  // 기본 카테고리 (모든 매핑 실패 시)
  defaultCategory: '식료품' as Category,
} as const;
