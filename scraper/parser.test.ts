// 파서 유닛 테스트
import { describe, it, expect } from 'vitest';
import {
  parsePrice,
  mapCategory,
  calculateDiscountRate,
  validatePrices,
  extractProductId,
  normalizeImageUrl,
  parseProduct,
  parseOccProduct,
  parseIsoDate,
  OccProduct,
} from './parser';

describe('parsePrice', () => {
  it('원화 기호와 쉼표가 있는 가격을 파싱', () => {
    expect(parsePrice('₩12,990')).toBe(12990);
  });

  it('원 단위 가격을 파싱', () => {
    expect(parsePrice('12,990원')).toBe(12990);
  });

  it('쉼표 없는 가격을 파싱', () => {
    expect(parsePrice('12990')).toBe(12990);
  });

  it('여러 자리 가격을 파싱', () => {
    expect(parsePrice('1,234,567원')).toBe(1234567);
  });

  it('공백이 있는 가격을 파싱', () => {
    expect(parsePrice('499,000원')).toBe(499000);
  });

  it('빈 문자열은 0 반환', () => {
    expect(parsePrice('')).toBe(0);
  });

  it('숫자가 없으면 0 반환', () => {
    expect(parsePrice('가격 없음')).toBe(0);
  });
});

describe('mapCategory', () => {
  // 1-segment 매핑
  it('FurnitureBeddingHome → 가구/침구류', () => {
    expect(mapCategory('/FurnitureBeddingHome/Bedroom-Furniture/Beds-Mattresses/Product/p/511435')).toBe('가구/침구류');
  });

  it('HealthSupplement → 건강기능식품', () => {
    expect(mapCategory('/HealthSupplement/DietBeauty-Supplement/Diet/Product/p/645568')).toBe('건강기능식품');
  });

  it('Appliances → 가전', () => {
    expect(mapCategory('/Appliances/Kitchen-Appliances/Product/p/683517')).toBe('가전');
  });

  it('Foods → 식료품', () => {
    expect(mapCategory('/Foods/Processed-Food/Instant-Food/Product/p/608719')).toBe('식료품');
  });

  it('HomeKitchen → 생활용품', () => {
    expect(mapCategory('/HomeKitchen/Cookware/Product/p/662885')).toBe('생활용품');
  });

  it('SportsFitnessCamping → 아웃도어', () => {
    expect(mapCategory('/SportsFitnessCamping/Golf/Golf-Balls/Product/p/1654550')).toBe('아웃도어');
  });

  // 2-segment 매핑
  it('BeautyHouseholdPersonal-Care/Beauty → 미용', () => {
    expect(mapCategory('/BeautyHouseholdPersonal-Care/Beauty/Skin-Care/Product/p/675037')).toBe('미용');
  });

  it('BeautyHouseholdPersonal-Care/BathFacial-Tissue → 생활용품', () => {
    expect(mapCategory('/BeautyHouseholdPersonal-Care/BathFacial-Tissue/Paper-Towels/Product/p/601018')).toBe('생활용품');
  });

  it('BabyKidsToysPets/Pet-Supplies → 음료/세제/애견용품', () => {
    expect(mapCategory('/BabyKidsToysPets/Pet-Supplies/Dog-Supplies/Product/p/570486')).toBe('음료/세제/애견용품');
  });

  it('Foods/Snacks → 간식류', () => {
    expect(mapCategory('/Foods/Snacks/Product/p/603724')).toBe('간식류');
  });

  it('Foods/Beverages → 음료/세제/애견용품', () => {
    expect(mapCategory('/Foods/Beverages/Product/p/123456')).toBe('음료/세제/애견용품');
  });

  // 키워드 매핑
  it('키워드: 세탁세제 → 음료/세제/애견용품', () => {
    expect(mapCategory('/FY26P6W1/-/Gift-Set/Product/p/714105', '퍼실어드밴스드젤세탁세제')).toBe('음료/세제/애견용품');
  });

  it('키워드: 비타민 → 건강기능식품', () => {
    expect(mapCategory('/FY26P6W1/-/Gift-Set/Product/p/502986', '얼라이브 원스데일리 멀티비타민')).toBe('건강기능식품');
  });

  it('키워드: 치약 → 미용', () => {
    expect(mapCategory('/FY26P6W1/-/Gift-Set/Product/p/523264', '센소다인 멀티케어 치약')).toBe('미용');
  });

  it('키워드: 골프 → 아웃도어', () => {
    expect(mapCategory('/unknown/path', '커클랜드 골프공 24개')).toBe('아웃도어');
  });

  it('매핑되지 않은 URL + 키워드 없음 → 기본 카테고리', () => {
    expect(mapCategory('/Unknown/Category/Product/p/123456')).toBe('식료품');
  });
});

describe('calculateDiscountRate', () => {
  it('할인율 계산 (21%)', () => {
    expect(calculateDiscountRate(16490, 3500)).toBe(21);
  });

  it('할인율 계산 (50%)', () => {
    expect(calculateDiscountRate(10000, 5000)).toBe(50);
  });

  it('할인율 계산 (33%)', () => {
    expect(calculateDiscountRate(15000, 5000)).toBe(33);
  });

  it('할인이 없으면 0%', () => {
    expect(calculateDiscountRate(10000, 0)).toBe(0);
  });

  it('원가가 0이면 0% 반환', () => {
    expect(calculateDiscountRate(0, 5000)).toBe(0);
  });
});

describe('validatePrices', () => {
  it('정합성 있는 가격', () => {
    expect(validatePrices(16490, 3500, 12990)).toBe(true);
  });

  it('정합성 없는 가격', () => {
    expect(validatePrices(16490, 3500, 13000)).toBe(false);
  });

  it('할인이 없는 경우', () => {
    expect(validatePrices(10000, 0, 10000)).toBe(true);
  });
});

describe('extractProductId', () => {
  it('URL에서 상품 ID 추출', () => {
    expect(extractProductId('/FurnitureBeddingHome/Bedroom-Furniture/Beds-Mattresses/Product/p/511435')).toBe('511435');
  });

  it('짧은 URL에서 ID 추출', () => {
    expect(extractProductId('/p/123456')).toBe('123456');
  });

  it('ID가 없으면 빈 문자열', () => {
    expect(extractProductId('/no-id-here')).toBe('');
  });
});

describe('normalizeImageUrl', () => {
  it('절대 URL은 그대로 반환', () => {
    expect(normalizeImageUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
  });

  it('상대 URL은 절대 URL로 변환', () => {
    expect(normalizeImageUrl('/medias/sys_master/images/h37/h26/9867728584734.jpg'))
      .toBe('https://www.costco.co.kr/medias/sys_master/images/h37/h26/9867728584734.jpg');
  });

  it('빈 URL은 빈 문자열 반환', () => {
    expect(normalizeImageUrl('')).toBe('');
  });
});

describe('parseIsoDate', () => {
  it('ISO 문자열에서 날짜 추출', () => {
    const result = parseIsoDate('2026-02-09T00:00:00.000Z');
    expect(result).toBe('2026-02-09');
  });

  it('빈 문자열은 빈 문자열 반환', () => {
    expect(parseIsoDate('')).toBe('');
  });
});

describe('parseOccProduct', () => {
  it('할인이 있는 OCC 상품 파싱', () => {
    const occ: OccProduct = {
      code: '511435',
      name: '럭스나인 천연 라텍스 토퍼 (10.5cm) - 퀸',
      url: '/FurnitureBeddingHome/Bedroom-Furniture/Beds-Mattresses/Product/p/511435',
      basePrice: { value: 499000 },
      price: { value: 419000 },
      discountPrice: { value: 80000 },
      couponDiscount: {
        discountValue: 80000,
        discountStartDate: '2026-02-01T15:00:00.000Z',
        discountEndDate: '2026-02-15T14:59:59.999Z',
        localDiscountStartDate: '2026-02-02T00:00:00.000Z',
        localDiscountEndDate: '2026-02-15T23:59:59.999Z',
      },
      discountStartDate: '2026-02-01T15:00:00.000Z',
      discountEndDate: '2026-02-15T14:59:59.999Z',
      as400Discount: true,
      images: [
        { format: 'thumbnail', imageType: 'PRIMARY', url: '/medias/sys_master/images/thumb.jpg' },
        { format: 'product', imageType: 'PRIMARY', url: '/medias/sys_master/images/product.jpg' },
      ],
    };

    const product = parseOccProduct(occ);

    expect(product.id).toBe('511435');
    expect(product.name).toBe('럭스나인 천연 라텍스 토퍼 (10.5cm) - 퀸');
    expect(product.category).toBe('가구/침구류');
    expect(product.originalPrice).toBe(499000);
    expect(product.salePrice).toBe(419000);
    expect(product.discountAmount).toBe(80000);
    expect(product.discountRate).toBe(16);
    expect(product.startDate).toBe('2026-02-02');
    expect(product.endDate).toBe('2026-02-15');
    expect(product.imageUrl).toBe('https://www.costco.co.kr/medias/sys_master/images/product.jpg');
    expect(product.isManuallyEdited).toBe(false);
  });

  it('할인이 없는 OCC 상품 파싱', () => {
    const occ: OccProduct = {
      code: '123456',
      name: '할인 없는 상품',
      url: '/Foods/Rice/Product/p/123456',
      basePrice: { value: 50000 },
      price: { value: 50000 },
      images: [],
    };

    const product = parseOccProduct(occ);

    expect(product.originalPrice).toBe(50000);
    expect(product.salePrice).toBe(50000);
    expect(product.discountAmount).toBe(0);
    expect(product.discountRate).toBe(0);
    expect(product.category).toBe('식료품');
  });

  it('큰 할인율은 인기상품 태그 생성', () => {
    const occ: OccProduct = {
      code: '999999',
      name: '대박 할인 상품',
      url: '/Foods/Product/p/999999',
      basePrice: { value: 100000 },
      price: { value: 60000 },
      discountPrice: { value: 40000 },
    };

    const product = parseOccProduct(occ);

    expect(product.discountRate).toBe(40);
    expect(product.tags).toContain('인기상품');
  });

  it('5만원 이상 할인은 최저가 태그 생성', () => {
    const occ: OccProduct = {
      code: '888888',
      name: '프리미엄 상품',
      url: '/Appliances/Product/p/888888',
      basePrice: { value: 500000 },
      price: { value: 400000 },
      discountPrice: { value: 100000 },
    };

    const product = parseOccProduct(occ);

    expect(product.tags).toContain('최저가');
  });

  it('키워드로 카테고리 매핑 (선물세트 URL)', () => {
    const occ: OccProduct = {
      code: '502986',
      name: '얼라이브 원스데일리 멀티비타민',
      url: '/FY26P6W1/-/Gift-Set/Gift-Set-Special/Food-Gift-Set/Product/p/502986',
      basePrice: { value: 27490 },
      price: { value: 22490 },
      discountPrice: { value: 5000 },
    };

    const product = parseOccProduct(occ);

    expect(product.category).toBe('건강기능식품');
  });
});

describe('parseProduct (HTML 호환)', () => {
  it('전체 상품 데이터 파싱', () => {
    const rawData = {
      id: '603724',
      title: 'CJ 유기농 맛밤 42G X 17PK',
      href: '/Foods/Snacks/Product/p/603724',
      imageUrl: '/medias/sys_master/images/test.jpg',
      priceText: '12,990원',
      originalPriceText: '16,490원',
    };

    const product = parseProduct(rawData);

    expect(product.id).toBe('603724');
    expect(product.name).toBe('CJ 유기농 맛밤 42G X 17PK');
    expect(product.category).toBe('간식류');
    expect(product.originalPrice).toBe(16490);
    expect(product.salePrice).toBe(12990);
    expect(product.discountAmount).toBe(3500);
    expect(product.discountRate).toBe(21);
  });

  it('할인이 없는 상품', () => {
    const rawData = {
      id: '123456',
      title: '할인 없는 상품',
      href: '/Appliances/Product/p/123456',
      imageUrl: '/image.jpg',
      priceText: '100,000원',
    };

    const product = parseProduct(rawData);

    expect(product.discountAmount).toBe(0);
    expect(product.discountRate).toBe(0);
    expect(product.originalPrice).toBe(100000);
    expect(product.salePrice).toBe(100000);
  });
});
