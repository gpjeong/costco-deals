# 코스트코 주간 할인 크롤러

Playwright 기반 코스트코 코리아 주간 할인 상품 크롤러

## 구조

```
scraper/
├── config.ts         # 크롤러 설정 (URL, 셀렉터, 옵션)
├── parser.ts         # HTML 파싱 및 데이터 변환
├── parser.test.ts    # 파서 유닛 테스트
├── scrape.ts         # 메인 크롤러 (Playwright)
└── README.md         # 이 파일
```

## 사용법

### 1. Dry-run (파일 저장 없이 결과만 출력)

```bash
npm run scrape:dry
```

### 2. 실제 크롤링 (JSON 파일 저장)

```bash
npm run scrape
```

### 3. 파서 유닛 테스트

```bash
npm run scrape:test
```

## 출력

크롤링 결과는 다음 위치에 저장됩니다:

- `/data/weeks/YYYY-WNN.json` - 메인 데이터
- `/public/data/weeks/YYYY-WNN.json` - 개발 서버용 복사본

### 출력 형식 (WeeklyDeals)

```json
{
  "weekId": "2026-W07",
  "startDate": "2026-02-09",
  "endDate": "2026-02-15",
  "scrapedAt": "2026-02-10T08:57:38.431Z",
  "products": [
    {
      "id": "511435",
      "name": "럭스나인 천연 라텍스 토퍼 (10.5cm) - 퀸",
      "category": "가구/침구류",
      "originalPrice": 499000,
      "discountAmount": 0,
      "discountRate": 0,
      "salePrice": 499000,
      "startDate": "2026-02-09",
      "endDate": "2026-02-15",
      "imageUrl": "https://www.costco.co.kr/medias/...",
      "tags": [],
      "isManuallyEdited": false,
      "notes": ""
    }
  ]
}
```

## 크롤러 설정 (config.ts)

### URL

- `url`: `https://www.costco.co.kr/Special-Price-Offers/c/SpecialPriceOffers`

### CSS 셀렉터

- `productList`: `.product-list-item`
- `productLink`: `a.thumb`
- `productImage`: `.product-image img`
- `priceAmount`: `.product-price-amount`
- `originalPrice`: `.original-price .product-price-amount`

### 옵션

- `headless`: `true` (헤드리스 모드)
- `timeout`: `60000` (60초)
- `waitAfterLoad`: `5000` (페이지 로드 후 5초 대기)
- `retryAttempts`: `3` (최대 3회 재시도)
- `retryDelay`: `2000` (재시도 간 2초 대기)

### 카테고리 매핑

URL 경로에서 카테고리를 추출하고 매핑:

```typescript
{
  'FurnitureBeddingHome': '가구/침구류',
  'HealthSupplement': '건강기능식품',
  'Appliances': '가전',
  'FoodGrocery': '식료품',
  'Snacks': '간식류',
  // ...
}
```

## 파서 함수 (parser.ts)

### `parsePrice(priceText: string): number`

가격 문자열을 숫자로 변환

- `"₩12,990"` → `12990`
- `"12,990원"` → `12990`
- `"499,000원"` → `499000`

### `mapCategory(url: string): Category`

URL에서 카테고리 추출 및 매핑

### `calculateDiscountRate(originalPrice, discountAmount): number`

할인율 계산: `round((discountAmount / originalPrice) * 100)`

### `validatePrices(originalPrice, discountAmount, salePrice): boolean`

가격 정합성 검증: `salePrice === originalPrice - discountAmount`

### `parseProduct(rawData): Product`

원시 상품 데이터를 `Product` 객체로 변환

## 데이터 검증

크롤링 후 자동으로 다음 항목을 검증:

1. 필수 필드 존재 여부 (weekId, startDate, endDate, scrapedAt)
2. 상품 개수 (최소 1개 이상)
3. 각 상품의 필수 필드 (id, name, category)
4. 가격 유효성 (음수 불가)
5. 가격 정합성 (salePrice = originalPrice - discountAmount)

검증 실패 시 에러와 함께 종료 (exit code 1)

## GitHub Actions

매주 월요일 00:00 UTC (KST 09:00)에 자동 실행:

1. 의존성 설치
2. Playwright 브라우저 설치
3. 크롤러 실행
4. 변경사항 커밋 및 푸시
5. 실패 시 GitHub Issue 자동 생성

수동 실행:

1. GitHub 리포지토리의 "Actions" 탭
2. "Weekly Costco Scraper" 워크플로우 선택
3. "Run workflow" 버튼 클릭

## 주의사항

1. **robots.txt 준수**: 코스트코 사이트의 robots.txt를 확인하고 준수
2. **Rate limiting**: 요청 간 최소 2초 대기 (재시도 시)
3. **User-Agent**: 명시적인 User-Agent 설정
4. **동적 렌더링**: 페이지 로드 후 5초 추가 대기 (Angular SPA)
5. **재시도**: 최대 3회 재시도 (네트워크 불안정 대응)

## 문제 해결

### 크롤링 실패

1. 사이트 구조 변경 여부 확인
2. CSS 셀렉터 업데이트 (`config.ts`)
3. 타임아웃 증가 (`config.ts`)

### 데이터 검증 실패

1. 파서 로직 확인 (`parser.ts`)
2. 가격 파싱 정규식 확인
3. 카테고리 매핑 테이블 확인

### GitHub Actions 실패

1. 워크플로우 로그 확인
2. 로컬에서 `npm run scrape` 테스트
3. Playwright 브라우저 설치 확인

## 개발

### 사이트 분석

```bash
# 사이트 구조 분석 (스크린샷 + HTML 저장)
npx ts-node --project tsconfig.scraper.json scraper/analyze.ts

# 상품 상세 정보 추출
npx ts-node --project tsconfig.scraper.json scraper/analyze-detail.ts

# 전체 상품 정보 추출
npx ts-node --project tsconfig.scraper.json scraper/analyze-full.ts
```

### 테스트

```bash
# 파서 유닛 테스트
npm run scrape:test

# 전체 테스트 (watch 모드)
npx vitest scraper/
```

## 라이선스

MIT
