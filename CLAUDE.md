# 코스트코 주간 할인 뷰어 (Costco Weekly Deals Viewer)

## 프로젝트 개요
어머니가 코스트코 방문 전 주간 할인 내역을 쉽게 확인할 수 있는 웹 페이지.
모바일/PC 모두 지원하며, 코스트코 코리아 공식 사이트에서 데이터를 크롤링하고 수동 보정 가능.

## 기술 스택
- **프레임워크**: Next.js 14+ (App Router, TypeScript)
- **스타일링**: Tailwind CSS
- **데이터 저장**: JSON 파일 (정적) — `/data/weeks/YYYY-WNN.json`
- **사용자 데이터**: localStorage (찜, 장바구니, 다크모드 설정)
- **크롤러**: Playwright (Node.js)
- **배포**: Vercel (SSG)
- **자동화**: GitHub Actions (매주 월요일 09:00 KST 크롤링)

## 프로젝트 구조
```
costco-deals/
├── CLAUDE.md
├── .claude/
│   ├── agents/              # 서브 에이전트 정의
│   │   ├── ui-developer.md
│   │   ├── scraper-developer.md
│   │   └── qa-tester.md
│   └── commands/            # 슬래시 커맨드 정의
│       ├── dev-ui.md
│       ├── dev-scraper.md
│       └── test-all.md
├── app/                     # Next.js App Router
│   ├── layout.tsx           # 공통 레이아웃 (Pretendard 폰트, 메타데이터)
│   ├── page.tsx             # 메인 페이지 (이번 주 할인)
│   └── week/[weekId]/
│       └── page.tsx         # 특정 주차 페이지
├── components/
│   ├── Header.tsx           # 로고 + 다크모드 + 장바구니 버튼
│   ├── WeekNavigation.tsx   # 주차 이동 ◀ ▶
│   ├── CategorySummary.tsx  # 카테고리별 할인 개수 요약 카드
│   ├── CategoryFilter.tsx   # 카테고리 필터 칩 (가로 스크롤)
│   ├── ProductCard.tsx      # 상품 카드 (이미지, 가격, 할인율, 찜, 장바구니)
│   ├── ProductGrid.tsx      # 반응형 상품 그리드
│   ├── SearchBar.tsx        # 검색바
│   ├── SortSelector.tsx     # 정렬 드롭다운
│   ├── FavoriteFilter.tsx   # 찜 필터 버튼
│   ├── ShoppingCart.tsx     # 장바구니 메모 (하단 시트)
│   ├── DarkModeToggle.tsx   # 다크모드 토글
│   └── EmptyState.tsx       # 빈 상태 UI
├── hooks/
│   ├── useLocalStorage.ts   # localStorage 커스텀 훅
│   ├── useFavorites.ts      # 찜 관리 훅
│   ├── useCart.ts           # 장바구니 관리 훅
│   └── useDarkMode.ts      # 다크모드 관리 훅
├── lib/
│   ├── types.ts             # TypeScript 타입 정의
│   ├── utils.ts             # 유틸리티 (가격 포맷, 날짜 계산 등)
│   ├── constants.ts         # 카테고리 목록, 정렬 옵션 등
│   └── weekUtils.ts         # 주차 계산, 주차 ID 생성
├── data/
│   └── weeks/
│       ├── 2026-W06.json    # 주차별 할인 데이터
│       └── 2026-W07.json
├── scraper/
│   ├── scrape.ts            # 크롤러 메인 (Playwright)
│   ├── parser.ts            # HTML → JSON 파서
│   └── config.ts            # 크롤러 설정 (URL, 셀렉터 등)
├── .github/
│   └── workflows/
│       └── scrape.yml       # 주간 크롤링 자동화
├── public/
│   └── costco-logo.png      # 코스트코 로고
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

## 핵심 데이터 모델

### 주간 할인 데이터 (`/data/weeks/YYYY-WNN.json`)
```typescript
interface WeeklyDeals {
  weekId: string;           // "2026-W07"
  startDate: string;        // "2026-02-09"
  endDate: string;          // "2026-02-15"
  scrapedAt: string;        // ISO 8601
  products: Product[];
}

interface Product {
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
  tags: string[];           // ["인기상품"]
  isManuallyEdited: boolean;
  notes: string;
}

type Category =
  | "식료품" | "간식류" | "음료/세제/애견용품" | "주류"
  | "건강기능식품" | "미용" | "생활용품" | "아웃도어"
  | "의류/패션" | "가전" | "가구/침구류";
```

### localStorage 키
| 키 | 타입 | 설명 |
|----|------|------|
| `costco-favorites` | `string[]` | 찜한 상품 ID 배열 |
| `costco-cart` | `CartItem[]` | 장바구니 아이템 |
| `costco-darkmode` | `boolean` | 다크모드 설정 |

## 디자인 가이드라인

### 타겟 사용자
- 50~60대 어머니 → **큰 글씨(최소 16px)**, 단순한 네비게이션, 직관적 구조

### 색상
- **Primary Red**: #E31837 (코스트코 레드, 할인가/할인율 강조)
- **Primary Blue**: #005DAA (코스트코 네이비, 헤더/CTA 버튼)
- **Warning Orange**: #FF6B35 (마감임박)
- **Success Green**: #4CAF50 (최저가 태그)
- **Light BG**: #F8F8F8
- **Dark BG**: #121212
- **Dark Card**: #1E1E1E

### 반응형 그리드
- 모바일 (< 640px): 1~2열 카드 그리드
- 태블릿 (640~1024px): 2~3열
- 데스크톱 (> 1024px): 3~4열

### 폰트
- Pretendard (한글 최적화) — Google Fonts CDN 사용
- 시스템 폴백: 'Apple SD Gothic Neo', sans-serif

### 핵심 UI 패턴
- 헤더: sticky, 로고 + 다크모드 토글 + 장바구니 버튼(뱃지)
- 주차 네비게이션: ◀ 지난주 | 날짜범위 | 다음주 ▶
- 카테고리 요약: 가로 스크롤 숫자 카드 (전체 할인 N개, 최대 절약 ~N만원, 카테고리별 수)
- 카테고리 필터: 가로 스크롤 칩 (찜 필터 | 구분선 | 카테고리들)
- 상품 카드: 이미지 + 할인율 배지 + 태그 + 찜 버튼 + 가격 + 장바구니 추가
- 장바구니: 하단 시트 (slide up 애니메이션)

## 크롤링 설정

### 소스
- URL: `https://www.costco.co.kr/Special-Price-Offers/c/SpecialPriceOffers`
- 참고: `https://costbest.co.kr/` (데이터 구조 참고용)

### 주의사항
- 코스트코 사이트는 동적 렌더링 → Playwright headless 브라우저 필수
- robots.txt 확인 후 준수
- 1회 크롤링으로 모든 데이터 수집 (rate limiting 준수)
- 크롤링 실패 시 GitHub Issue 자동 생성

### GitHub Actions 스케줄
- 매주 월요일 00:00 UTC (KST 09:00)
- workflow_dispatch로 수동 실행 가능

## 개발 규칙

### 코드 스타일
- TypeScript strict mode
- 함수형 컴포넌트 + React Hooks
- 컴포넌트당 하나의 파일, 하나의 책임
- 한글 주석 사용 가능

### 커밋 컨벤션
- `feat:` 새 기능
- `fix:` 버그 수정
- `style:` UI/스타일 변경
- `chore:` 설정/빌드
- `data:` 크롤링 데이터 업데이트

### 테스트
- 크롤러 파서 유닛 테스트 (Vitest)
- 컴포넌트 스냅샷 테스트는 선택사항
- 크롤러 실행 후 JSON 스키마 검증 필수

## 서브 에이전트 가이드
이 프로젝트는 3개의 커스텀 서브 에이전트를 사용합니다:
- **ui-developer**: Next.js/Tailwind UI 구현 전문
- **scraper-developer**: Playwright 크롤러/파서 전문
- **qa-tester**: 빌드/린트/접근성/반응형 테스트 전문

각 에이전트는 `.claude/agents/` 디렉토리에 정의되어 있으며,
메인 에이전트가 Task tool로 위임하거나 사용자가 직접 호출할 수 있습니다.

## 참고 문서 (docs/)
- `docs/ui-mockup.jsx` — **UI 목업 (React 컴포넌트)**: 모든 UI의 레퍼런스. 다크모드, 장바구니, 카테고리 요약, 찜 기능, 반응형 레이아웃이 모두 구현되어 있음. UI 구현 시 이 파일의 디자인/구조/색상/레이아웃을 최대한 따를 것.
- `docs/plan.md` — **기획서**: 전체 프로젝트 계획, 데이터 모델, 기능 목록, 개발 로드맵

## 참고 링크
- 코스트코 코리아 스페셜 할인: https://www.costco.co.kr/Special-Price-Offers/c/SpecialPriceOffers
- 코스트베스트 (데이터 구조 참고): https://costbest.co.kr/
- 코코달인 (기능 참고): https://www.cocodalin.com/
