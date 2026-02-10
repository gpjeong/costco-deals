# 복붙용 프롬프트 (Phase 2, 3, 5)

각 Phase 사이에 `/compact` 한 번씩 실행 권장.
Phase 1, 4는 GUIDE.md 참고.

---

## Phase 2: UI 구현 (ui-developer 에이전트)

아래를 그대로 복붙:

```
반드시 ui-developer 에이전트를 사용해서 메인 페이지 UI 전체를 구현해줘.

## 사전 작업
- CLAUDE.md 읽고 프로젝트 컨텍스트 파악
- docs/ui-mockup.jsx 파일을 반드시 먼저 읽고, 디자인/색상/레이아웃/인터랙션을 최대한 따라서 구현

## 구현할 컴포넌트

### 1. app/layout.tsx
- Pretendard 폰트 (Google Fonts CDN)
- 메타데이터: title "코스트코 주간 할인"
- html 태그에 dark class 토글 지원

### 2. components/Header.tsx
- sticky 헤더
- 코스트코 로고 (public/costco-logo.png, 다크모드에서 filter: brightness(0) invert(1))
- 다크모드 토글 (🌙/☀️)
- 장바구니 버튼 (🛒) + 미체크 아이템 수 뱃지

### 3. components/WeekNavigation.tsx
- ◀ 지난주 | "2/9(일) ~ 2/15(토)" | 다음주 ▶
- 이번 주 이후는 ▶ 비활성화
- 주차 변경 시 해당 주차 JSON 로드

### 4. components/CategorySummary.tsx
- 가로 스크롤 카드
- 첫 번째 카드: "전체 N개 할인" (파란 배경)
- 두 번째 카드: "최대 ~N만원 절약" (빨간 배경)
- 나머지: 카테고리별 개수 (클릭 → 해당 카테고리 필터 적용)

### 5. components/CategoryFilter.tsx
- 가로 스크롤 칩
- "💖 찜 (N)" 필터 버튼 + | 구분선 + "전체" + 카테고리 칩들
- 선택된 칩: 코스트코 네이비(#005DAA) 배경

### 6. components/SearchBar.tsx
- 🔍 + 입력창 + 결과 수 표시
- 입력 즉시 필터링 (debounce 300ms)

### 7. components/SortSelector.tsx
- 드롭다운: 할인율순, 가격 낮은순, 가격 높은순, 마감임박순

### 8. components/ProductCard.tsx
- 이미지 영역 (비율 4:3, 없으면 카테고리별 이모지 플레이스홀더)
- 할인율 뱃지 (좌상단, 빨간 원형 "-21%")
- 태그 뱃지 (우상단, "인기상품"=주황, "최저가"=초록)
- 찜 버튼 (하트 토글 ♡/❤️)
- 카테고리 (회색 작은 텍스트)
- 상품명 (2줄 clamp)
- 할인가 (큰 빨간 글씨) + 원가 (취소선 회색)
- 할인 금액 ("3,500원 할인")
- 마감일 + D-day ("~2/15 (D-3)")
- 마감임박(D-2 이하): 주황 테두리 + "⚡ 마감임박"
- 장바구니 추가 버튼 ("🛒 담기", 이미 담긴 경우 비활성)

### 9. components/ProductGrid.tsx
- 반응형 그리드: 1~2열(모바일) / 2~3열(태블릿) / 3~4열(데스크톱)
- 필터/정렬/검색 적용된 상품 목록

### 10. components/ShoppingCart.tsx
- 하단 슬라이드업 시트 (애니메이션)
- 체크박스 + 상품명 + 삭제 버튼
- "직접 추가" 입력 필드
- 빈 장바구니 상태 UI

### 11. components/EmptyState.tsx
- 검색 없음, 찜 없음 등 재사용 가능한 빈 상태

### 12. hooks/ (모두 SSR-safe하게)
- useLocalStorage.ts: 제네릭 localStorage 훅
- useFavorites.ts: 찜 추가/제거/토글/목록
- useCart.ts: 장바구니 추가/제거/체크/수동입력
- useDarkMode.ts: 다크모드 토글 + html dark class 제어

### 13. app/page.tsx
- 위 컴포넌트 전부 조합한 메인 페이지
- 상태: 선택 카테고리, 정렬, 검색어, 주차 오프셋, 찜 필터
- data/weeks/ JSON 로딩

## 완료 조건
- npm run build 성공
- 다크모드 전환 정상
- 모바일/데스크톱 반응형 레이아웃 정상
- 찜, 장바구니가 localStorage에 저장/복원 정상
```

---

## Phase 3: 크롤러 개발 (scraper-developer 에이전트)

아래를 그대로 복붙:

```
반드시 scraper-developer 에이전트를 사용해서 Playwright 기반 코스트코 코리아 크롤러를 개발해줘.

CLAUDE.md의 크롤러 설정과 데이터 모델을 참고해.

## 1. 의존성 설치
- playwright
- @playwright/test (브라우저 바이너리 포함)

## 2. scraper/config.ts
- 크롤링 대상 URL: https://www.costco.co.kr/Special-Price-Offers/c/SpecialPriceOffers
- CSS 셀렉터 정의 (실제 코스트코 사이트를 분석해서 결정)
- 재시도 횟수: 3회
- 요청 간 대기: 2초
- 타임아웃: 30초

## 3. scraper/parser.ts
- HTML 요소 → Product 객체 변환
- 가격 문자열 파싱 ("₩12,990" → 12990, "12,990원" → 12990)
- 카테고리 매핑 (사이트 카테고리 → CLAUDE.md의 Category 타입)
- 날짜 파싱
- discountRate 계산: round((discountAmount / originalPrice) * 100)
- salePrice 검증: originalPrice - discountAmount 일치 확인
- 유닛 테스트 작성 (Vitest)

## 4. scraper/scrape.ts (메인 크롤러)
- Playwright 헤드리스 브라우저 실행
- User-Agent 설정
- 페이지 로드 + 동적 콘텐츠 대기
- 무한 스크롤 또는 페이지네이션 처리 (모든 상품이 로드될 때까지)
- parser.ts로 각 상품 파싱
- WeeklyDeals JSON 생성 (weekId는 현재 주차)
- /data/weeks/YYYY-WNN.json으로 저장
- 저장 전 스키마 검증 (필수 필드, 타입, 가격 정합성)
- 전체 과정 로그 출력 (몇 개 상품 수집했는지 등)
- --dry-run 플래그: 파일 저장 없이 결과만 콘솔 출력
- 에러 시 상세 로그 + exit code 1

## 5. package.json 스크립트 추가
- "scrape": "npx ts-node scraper/scrape.ts"
- "scrape:dry": "npx ts-node scraper/scrape.ts --dry-run"
- "scrape:test": "vitest run scraper/"

## 6. .github/workflows/scrape.yml
- 트리거: schedule (cron: '0 0 * * 1', 매주 월요일 00:00 UTC = KST 09:00) + workflow_dispatch
- 환경: ubuntu-latest, Node.js 20
- 단계:
  a. actions/checkout@v4
  b. Node.js 설치 + npm ci
  c. npx playwright install --with-deps chromium
  d. npm run scrape
  e. git diff로 변경사항 확인
  f. 변경 있으면 git add + commit + push (커밋: "data: update weekly deals YYYY-WNN")
  g. git user: github-actions[bot]
  h. 실패 시 GitHub Issue 자동 생성 (peter-evans/create-issue-from-file 또는 직접 gh issue create)

## 완료 조건
- scraper/parser.ts 유닛 테스트 통과
- npm run scrape:dry 실행 시 상품 목록 콘솔 출력
- JSON 출력이 CLAUDE.md의 WeeklyDeals 스키마와 일치
- GitHub Actions yml 문법 올바름
```

---

## Phase 5: QA 최종 점검 (qa-tester 에이전트)

아래를 그대로 복붙:

```
/test-all
```

끝! 이게 안 먹히면 아래를 대신 복붙:

```
qa-tester 에이전트를 사용해서 프로젝트 전체 QA 점검을 해줘.

점검 항목:
1. npm run build 빌드 성공 여부
2. TypeScript 타입 에러
3. /data/weeks/*.json 데이터 무결성 (스키마, 가격 정합성, 카테고리 유효성)
4. 접근성 (alt 텍스트, 최소 폰트 16px, 터치 타겟 44x44px)
5. 반응형 (Tailwind breakpoint 사용 확인)
6. 다크모드 (하드코딩 색상 검출, 모든 텍스트 가독성)

QA 리포트를 PASS/WARNING/FAIL/SUGGESTIONS 형식으로 보고해줘.
```
