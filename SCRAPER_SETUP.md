# 코스트코 크롤러 설치 완료

## 설치된 구성 요소

### 1. 의존성 (package.json)

- `playwright@^1.58.2` - 헤드리스 브라우저
- `@playwright/test@^1.58.2` - Playwright 테스트 도구
- `vitest@^4.0.18` - 유닛 테스트 프레임워크
- `ts-node@^10.9.2` - TypeScript 스크립트 실행

### 2. 크롤러 파일 (scraper/)

| 파일 | 설명 |
|------|------|
| `config.ts` | 크롤러 설정 (URL, 셀렉터, 옵션, 카테고리 매핑) |
| `parser.ts` | HTML 파싱 및 데이터 변환 함수 |
| `parser.test.ts` | 파서 유닛 테스트 (27개 테스트) |
| `scrape.ts` | 메인 크롤러 (Playwright 실행) |
| `check-robots.ts` | robots.txt 확인 유틸리티 |
| `README.md` | 크롤러 문서 |

### 3. 설정 파일

- `tsconfig.scraper.json` - TypeScript 설정 (scraper용)
- `vitest.config.ts` - Vitest 설정

### 4. GitHub Actions

- `.github/workflows/scrape.yml` - 매주 월요일 자동 실행

### 5. 데이터 디렉토리

- `data/weeks/` - 크롤링 결과 JSON 저장
- `public/data/weeks/` - 개발 서버용 복사본

## 사용법

### 기본 명령어

```bash
# 1. 파서 유닛 테스트 (27개 테스트)
npm run scrape:test

# 2. robots.txt 확인
npx ts-node --project tsconfig.scraper.json scraper/check-robots.ts

# 3. Dry-run (파일 저장 없이 결과만 출력)
npm run scrape:dry

# 4. 실제 크롤링 (JSON 파일 저장)
npm run scrape
```

### 출력 예시

```
🚀 코스트코 주간 할인 크롤러 시작

🎯 대상 URL: https://www.costco.co.kr/Special-Price-Offers/c/SpecialPriceOffers
🔄 재시도 횟수: 3
⏱️  타임아웃: 60000ms

🌐 브라우저 시작 중...
✅ 브라우저 시작 완료

🌐 페이지 로딩 중... (시도 1/3)
✅ 페이지 로딩 완료
📦 상품 데이터 추출 중...
✅ 48개 원시 데이터 추출 완료
✅ 48개 상품 파싱 완료

🔍 데이터 검증 중...
✅ 데이터 검증 완료

📊 크롤링 결과:
   주차: 2026-W07
   기간: 2026-02-09 ~ 2026-02-15
   상품 수: 48개
   할인 상품: 0개

📋 카테고리별 통계:
   식료품: 31개
   건강기능식품: 9개
   가구/침구류: 3개
   가전: 3개
   미용: 2개

💾 파일 저장 완료:
   - /data/weeks/2026-W07.json
   - /public/data/weeks/2026-W07.json

✅ 크롤링 완료 (35.8초)
```

## 크롤러 동작 방식

### 1. 사이트 분석 결과

- **대상 URL**: `https://www.costco.co.kr/Special-Price-Offers/c/SpecialPriceOffers`
- **상품 카드**: `.product-list-item` (48개 발견)
- **가격**: `.product-price-amount`
- **이미지**: `.product-image img`
- **링크**: `a.thumb` (상품 ID와 이름 포함)

### 2. 데이터 추출 흐름

```
페이지 로딩
    ↓
5초 대기 (동적 렌더링)
    ↓
.product-list-item 선택
    ↓
각 상품에서 데이터 추출:
  - ID: URL에서 (/p/511435)
  - 이름: 링크 title 속성
  - 가격: .product-price-amount
  - 이미지: img src
    ↓
parser.ts로 변환:
  - 가격 문자열 → 숫자
  - URL → 카테고리 매핑
  - 할인율 계산
    ↓
데이터 검증:
  - 필수 필드 확인
  - 가격 정합성 검증
    ↓
JSON 파일 저장
```

### 3. 카테고리 매핑

| URL 경로 | 카테고리 |
|----------|----------|
| `FurnitureBeddingHome` | 가구/침구류 |
| `HealthSupplement` | 건강기능식품 |
| `Appliances` | 가전 |
| `FoodGrocery` | 식료품 |
| `Snacks` | 간식류 |
| `Beverages` | 음료/세제/애견용품 |
| `Household` | 생활용품 |
| `Beauty` | 미용 |
| `Clothing` | 의류/패션 |
| `Outdoor` | 아웃도어 |
| `Alcohol` | 주류 |

### 4. 주차 계산

- **ISO 8601 주차 기준** (월요일 시작)
- 예: 2026년 2월 9일 (월) ~ 2월 15일 (일) → `2026-W07`

## 데이터 스키마

### WeeklyDeals (출력 JSON)

```typescript
{
  weekId: string;           // "2026-W07"
  startDate: string;        // "2026-02-09"
  endDate: string;          // "2026-02-15"
  scrapedAt: string;        // ISO 8601
  products: Product[];
}
```

### Product

```typescript
{
  id: string;               // "511435"
  name: string;             // "럭스나인 천연 라텍스 토퍼 (10.5cm) - 퀸"
  category: Category;       // "가구/침구류"
  originalPrice: number;    // 499000
  discountAmount: number;   // 0
  discountRate: number;     // 0
  salePrice: number;        // 499000
  startDate: string;        // "2026-02-09"
  endDate: string;          // "2026-02-15"
  imageUrl: string;         // "https://www.costco.co.kr/medias/..."
  tags: string[];           // ["인기상품"]
  isManuallyEdited: boolean;// false
  notes: string;            // ""
}
```

## GitHub Actions 자동화

### 트리거

- **스케줄**: 매주 월요일 00:00 UTC (KST 09:00)
- **수동 실행**: `workflow_dispatch`

### 워크플로우 단계

1. 리포지토리 체크아웃
2. Node.js 20 설치
3. npm 의존성 설치
4. Playwright Chromium 설치
5. 크롤러 실행 (`npm run scrape`)
6. 변경사항 확인 (`git diff`)
7. 변경 있으면 커밋 및 푸시
8. 실패 시 GitHub Issue 자동 생성

### 커밋 메시지 형식

```
data: update weekly deals 2026-W07
```

## 검증 및 테스트

### ✅ 완료된 테스트

1. **파서 유닛 테스트** (27개 모두 통과)
   - `parsePrice` (7개 테스트)
   - `mapCategory` (4개 테스트)
   - `calculateDiscountRate` (5개 테스트)
   - `validatePrices` (3개 테스트)
   - `extractProductId` (3개 테스트)
   - `normalizeImageUrl` (3개 테스트)
   - `parseProduct` (2개 테스트)

2. **크롤러 실행 테스트**
   - Dry-run 모드 성공
   - 실제 크롤링 성공
   - 48개 상품 추출
   - JSON 파일 생성 확인

3. **robots.txt 확인**
   - Special-Price-Offers 경로 허용됨

### 데이터 검증 로직

- 필수 필드 존재 확인
- 상품 개수 (최소 1개)
- 가격 유효성 (음수 불가)
- 가격 정합성 (`salePrice = originalPrice - discountAmount`)

## 주의사항

### 1. robots.txt 준수

✅ **확인 완료**: Special-Price-Offers 경로는 크롤링이 허용됨

### 2. Rate Limiting

- 요청 간 최소 2초 대기 (재시도 시)
- 페이지 로드 후 5초 대기 (동적 렌더링)

### 3. User-Agent

```
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36
(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
```

### 4. 재시도 로직

- 최대 3회 재시도
- 재시도 간 2초 대기
- 타임아웃: 60초

## 문제 해결

### 크롤링 실패 시

1. **사이트 구조 변경**
   - `scraper/config.ts`의 셀렉터 업데이트
   - 분석 스크립트로 재확인: `npx ts-node --project tsconfig.scraper.json scraper/analyze-full.ts`

2. **타임아웃**
   - `scraper/config.ts`의 `timeout` 값 증가
   - `waitAfterLoad` 값 증가

3. **데이터 검증 실패**
   - `scraper/parser.ts`의 파싱 로직 확인
   - 파서 테스트 실행: `npm run scrape:test`

### GitHub Actions 실패 시

1. Actions 탭에서 로그 확인
2. 로컬에서 재현: `npm run scrape`
3. Issue 자동 생성됨 (label: `bug`, `automated`, `scraper`)

## 다음 단계

### 추천 개선 사항

1. **할인 정보 개선**
   - 현재: 모든 상품이 할인 없음 (discountAmount: 0)
   - 조치: 실제 할인가 추출 로직 개선 필요

2. **카테고리 매핑 확장**
   - 현재: 일부 카테고리만 매핑
   - 조치: 실제 상품 URL 분석하여 매핑 테이블 확장

3. **이미지 최적화**
   - 조치: WebP 이미지 우선 선택 (이미 지원됨)

4. **에러 알림 개선**
   - 조치: Slack, Discord 웹훅 추가

## 파일 목록

### 필수 파일
- ✅ `scraper/config.ts`
- ✅ `scraper/parser.ts`
- ✅ `scraper/parser.test.ts`
- ✅ `scraper/scrape.ts`
- ✅ `scraper/check-robots.ts`
- ✅ `scraper/README.md`
- ✅ `tsconfig.scraper.json`
- ✅ `vitest.config.ts`
- ✅ `.github/workflows/scrape.yml`

### 분석 스크립트 (개발용, .gitignore에 추가됨)
- `scraper/analyze.ts`
- `scraper/analyze-detail.ts`
- `scraper/analyze-full.ts`
- `scraper/page.html`
- `scraper/screenshot.png`

### 생성된 데이터
- ✅ `data/weeks/2026-W07.json`
- ✅ `public/data/weeks/2026-W07.json`

## 완료 조건 체크리스트

- ✅ Playwright, Vitest, ts-node 설치
- ✅ scraper/config.ts 작성 (URL, 셀렉터, 카테고리 매핑)
- ✅ scraper/parser.ts 작성 (가격 파싱, 카테고리 매핑, 할인율 계산)
- ✅ scraper/parser.test.ts 작성 (27개 테스트, 모두 통과)
- ✅ scraper/scrape.ts 작성 (Playwright 크롤러, 재시도, 검증)
- ✅ package.json 스크립트 추가 (scrape, scrape:dry, scrape:test)
- ✅ .github/workflows/scrape.yml 작성
- ✅ robots.txt 확인 (허용됨)
- ✅ npm run scrape:dry 테스트 (성공)
- ✅ npm run scrape 테스트 (성공, 48개 상품 수집)
- ✅ JSON 출력이 WeeklyDeals 스키마와 일치
- ✅ GitHub Actions yml 문법 올바름

## 참고 문서

- 크롤러 상세 문서: `scraper/README.md`
- 프로젝트 기획서: `docs/plan.md`
- UI 목업: `docs/ui-mockup.jsx`
- 프로젝트 가이드: `CLAUDE.md`
