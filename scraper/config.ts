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
  // 순서 중요: 구체적 키워드를 먼저 배치 (첫 번째 매치가 적용됨)
  keywordMapping: [
    // 가전 (TV, 모니터, 스피커, 태블릿, 프로젝터 등)
    { keywords: ['TV', 'OLED', 'QLED', 'UHD', '모니터', '사운드바', '사운드링크', '스피커', '태블릿', 'Tab ', '프로젝터', '빔프로젝터', '피아노', '공유기', '건조기', '청소기', '에어컨', '세탁기', '냉장고', '전기요', '전기방석', '식기세척기', '전자레인지', '오븐', '믹서기', '블렌더', '에어프라이어', '정수기', '제습기', '가습기', '로봇청소기'], category: '가전' as Category },
    // 의류/패션 (의류, 양말, 속옷, 슬리퍼 등)
    { keywords: ['재킷', '자켓', '바지', '팬츠', '조거', '양말', '속옷', '드로즈', '파자마', '실내화', '타이즈', '브리프', '내의', '덧신', '플리스', '패딩', '코트', '셔츠', '블라우스', '스커트', '원피스', '카디건', '니트', '맨투맨', '후디', '레깅스', '잠옷', '상하의 세트', '슬리퍼'], category: '의류/패션' as Category },
    // 아웃도어 (그늘막, 가제보, 화로, 조립식 창고, 야외용 등)
    { keywords: ['그늘막', '쉐이드', '가제보', '캐노피', '화로', '야외용', '조립식 창고', '보관함', '가스 히터', '카페히터', '캔틸레버', '골프', '캠핑', '자전거', '텐트', '등산', '실외용', '윈드밀'], category: '아웃도어' as Category },
    // 미용 (바디케어, 핸드크림, 향수 등)
    { keywords: ['스킨케어', '핸드크림', '샴푸', '컨디셔너', '바디로션', '선크림', '화장품', '바디워시', '퍼퓸', '바디케어', '캐스틸', '치약', '칫솔', '면도', '구강', '트리트먼트', '헤어오일', '핸드 & 립'], category: '미용' as Category },
    // 건강기능식품 (영양제, 유산균, 한방 등)
    { keywords: ['비타민', '유산균', '프로바이오틱스', '루테인', '글루타치온', '홍삼', '오메가', '영양제', '콜라겐', '침향환', '락토핏', '대마종자유', '초록입홍합', '인삼', '프로폴리스', '밀크씨슬', '마그네슘', '아연', '칼슘', '플로라', '올리브오일 1,000mg'], category: '건강기능식품' as Category },
    // 음료/세제/애견용품
    { keywords: ['세탁세제', '섬유유연제', '주방세제', '식기세척', '애견', '강아지', '고양이', '반려', '퍼실', '다우니', '피죤'], category: '음료/세제/애견용품' as Category },
    // 주류
    { keywords: ['맥주', '와인', '소주', '위스키', '샴페인', '보드카', '럼', '브랜디', '사케'], category: '주류' as Category },
    // 생활용품 (청소, 수납, 차량, 욕실, 배터리 등)
    { keywords: ['화장지', '키친타월', '물티슈', '티슈', '린트롤러', '클리너', '방향제', '핸드솝', '핸드워시', '장갑', '멀티탭', '배수관', '금고', '여행가방', '캐리어', '홈매트', '듀라셀', '건전지', '배터리', '다용도 타월', '연료 첨가제', '샤워세트', '전구', '형광등', 'LED등'], category: '생활용품' as Category },
    // 가구/침구류 (의자, 쿠션, 담요, 침구 등)
    { keywords: ['이불', '베개', '매트리스', '토퍼', '침구', '의자', '쿠션', '담요', '소파', '책상', '서랍장', '선반', '행거', '넉다운'], category: '가구/침구류' as Category },
    // 간식류 (과자, 초콜릿, 견과류 등)
    { keywords: ['과자', '초콜릿', '사탕', '젤리', '견과', '맛밤', '쿠키', '크래커', '칩', '팝콘', '프레첼'], category: '간식류' as Category },
  ],

  // 기본 카테고리 (모든 매핑 실패 시)
  defaultCategory: '식료품' as Category,
} as const;
