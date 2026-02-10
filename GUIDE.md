# 🛒 코스트코 주간 할인 뷰어 — Claude Code 실행 가이드

## 📁 파일 구성 (프로젝트 루트에 배치)

```
costco-deals/
├── CLAUDE.md                          ← 프로젝트 컨텍스트 (Claude Code가 읽는 핵심 파일)
├── .claude/
│   ├── agents/                        ← 서브 에이전트 정의
│   │   ├── ui-developer.md            ← UI 전문 에이전트
│   │   ├── scraper-developer.md       ← 크롤러 전문 에이전트
│   │   └── qa-tester.md               ← QA 전문 에이전트
│   └── commands/                      ← 슬래시 커맨드
│       ├── dev-ui.md                  ← /dev-ui [작업]
│       ├── dev-scraper.md             ← /dev-scraper [작업]
│       └── test-all.md                ← /test-all
```

---

## 🤖 서브 에이전트 설명

### 왜 서브 에이전트를 쓰나요?

Claude Code의 메인 에이전트 하나로 모든 걸 시키면:
- 컨텍스트 윈도우가 금방 차서 품질이 떨어짐
- UI 코드와 크롤러 코드가 섞여 실수가 생김
- 긴 작업 중 방향을 잃기 쉬움

서브 에이전트는 **별도의 컨텍스트 윈도우**에서 **전문 역할**만 수행하고 결과만 돌려줍니다.

### 3개 에이전트 역할 분담

| 에이전트 | 역할 | 모델 | 도구 | 색상 |
|----------|------|------|------|------|
| **ui-developer** 🔵 | Next.js + Tailwind 컴포넌트 구현 | Sonnet | Read, Write, Edit, Glob, Grep, Bash | 파랑 |
| **scraper-developer** 🟢 | Playwright 크롤러 + GitHub Actions | Sonnet | Read, Write, Edit, Glob, Grep, Bash | 초록 |
| **qa-tester** 🟠 | 빌드/접근성/데이터 검증 | Haiku | Read, Glob, Grep, Bash | 주황 |

> **qa-tester는 Haiku 모델**을 사용합니다. 읽기 위주 작업이라 빠르고 저렴한 모델로 충분하고, 비용을 3배 절약할 수 있습니다.

### 호출 방법

**방법 1: 슬래시 커맨드** (권장)
```
/dev-ui ProductCard 컴포넌트 구현해줘
/dev-scraper 코스트코 크롤러 메인 로직 작성해줘
/test-all
```

**방법 2: 자연어로 직접 요청**
```
ui-developer 에이전트를 사용해서 Header 컴포넌트를 만들어줘
scraper-developer 에이전트로 파서 유닛 테스트를 작성해줘
```

**방법 3: 메인 에이전트가 자동 위임**
CLAUDE.md에 에이전트 가이드가 있으므로, Claude가 작업 성격에 따라 알아서 적절한 에이전트에 위임할 수도 있습니다.

### 에이전트 설정 핵심 포인트

```yaml
# .claude/agents/ui-developer.md 예시
---
name: ui-developer                    # 에이전트 이름 (호출 시 사용)
description: Next.js + Tailwind...    # Claude가 언제 쓸지 판단하는 설명
tools: Read, Write, Edit, Glob...    # 허용된 도구 (최소 권한 원칙)
model: sonnet                         # 사용할 모델 (sonnet/haiku/opus)
color: blue                           # 터미널에서 구분하는 색상
---
(여기부터 시스템 프롬프트 - 에이전트의 전문성, 규칙, 절차를 기술)
```

**설정 팁:**
- `tools`: 쓰기가 필요 없는 에이전트(qa-tester)에는 Write/Edit를 빼서 안전하게
- `model`: 비용 최적화 — 복잡한 구현은 sonnet, 검증/리뷰는 haiku
- `description`: 구체적으로 써야 Claude가 올바른 에이전트를 선택함
- 슬래시 커맨드에 `context: fork`를 넣으면 별도 컨텍스트에서 실행

---

## 🚀 실행 프롬프트 (순서대로 실행)

### Phase 1: 프로젝트 초기화 + 샘플 데이터

```
프로젝트를 초기화해줘.

1. Next.js 14+ App Router + TypeScript + Tailwind CSS 프로젝트 생성
   - 프로젝트 이름: costco-deals
   - Pretendard 폰트 설정 (Google Fonts CDN)
   - CLAUDE.md에 정의된 색상을 tailwind.config.ts에 등록

2. CLAUDE.md의 타입 정의를 lib/types.ts에 구현

3. lib/constants.ts에 카테고리 목록, 정렬 옵션 정의

4. lib/utils.ts에 유틸리티 함수 구현
   - formatPrice(n: number) → "12,990원"
   - calcDday(endDate: string) → "D-3" 또는 "오늘 마감"
   - getCurrentWeekId() → "2026-W07"

5. lib/weekUtils.ts에 주차 관련 함수
   - getWeekDateRange(weekId: string) → { start, end }
   - getAdjacentWeekId(weekId: string, offset: number) → string

6. data/weeks/ 에 샘플 JSON 2개 생성 (2026-W06, 2026-W07)
   - 각 15~20개 상품, 모든 카테고리 포함
   - 가격은 실제 코스트코 가격대 (5,000원 ~ 500,000원)
   - 할인율 10~50% 범위
   - 일부 상품은 마감임박 (D-1, D-2)으로 설정
   - tags 예시: ["인기상품"], ["최저가"], []

7. 완료 후 npm run build 로 빌드 확인
```

### Phase 2: UI 구현 (메인)

```
CLAUDE.md의 디자인 가이드라인을 참고해서 메인 페이지 UI를 구현해줘.
docs/ui-mockup.jsx 파일이 UI 레퍼런스이니 반드시 먼저 읽고, 디자인/색상/레이아웃을 최대한 따라서 구현해.
ui-developer 에이전트를 활용해도 좋아.

구현할 컴포넌트 목록:

1. app/layout.tsx
   - Pretendard 폰트, 메타데이터 (title: "코스트코 주간 할인")
   - 다크모드 class 토글 지원 (html 태그에 dark class)

2. components/Header.tsx
   - sticky 헤더, 코스트코 로고 (public/costco-logo.png)
   - 다크모드 토글 버튼 (🌙/☀️)
   - 장바구니 버튼 (🛒) + 미체크 아이템 수 뱃지
   - 다크모드에서 로고는 filter: brightness(0) invert(1)

3. components/WeekNavigation.tsx
   - ◀ 지난주 | "2/9(일) ~ 2/15(토)" | 다음주 ▶
   - 이번 주 이후는 ▶ 비활성
   - 주차 변경 시 해당 JSON 로드

4. components/CategorySummary.tsx
   - 가로 스크롤 카드들
   - 첫 번째: "전체 N개 할인" (파란색 배경)
   - 두 번째: "최대 ~N만원 절약" (빨간색 배경)
   - 나머지: 카테고리별 개수 (클릭 시 해당 카테고리 필터 적용)

5. components/CategoryFilter.tsx
   - 가로 스크롤 칩
   - 첫 번째: "💖 찜 (N)" 필터 버튼
   - | 구분선
   - "전체" + 각 카테고리 칩
   - 선택된 칩은 코스트코 네이비 배경

6. components/SearchBar.tsx
   - 🔍 돋보기 아이콘 + 입력창 + 결과 수 표시
   - 입력 즉시 필터링 (debounce 300ms)

7. components/SortSelector.tsx
   - 드롭다운: 할인율순, 가격 낮은순, 가격 높은순, 마감임박순

8. components/ProductCard.tsx
   - 카드 레이아웃:
     - 상단: 이미지 영역 (비율 4:3, 이미지 없으면 이모지 플레이스홀더)
     - 할인율 뱃지 (좌상단, 빨간색 원형 "-21%")
     - 태그 (우상단, "인기상품"=주황, "최저가"=초록)
     - 찜 버튼 (우하단 하트, 토글)
     - 카테고리 텍스트 (회색, 작게)
     - 상품명 (2줄 clamp)
     - 할인가 (큰 빨간 글씨) + 원가 (취소선)
     - 할인 금액 표시 ("3,500원 할인")
     - 마감일 + D-day ("~2/15 (D-3)")
     - 마감임박(D-2 이하): 주황색 테두리 + "⚡ 마감임박" 뱃지
     - 장바구니 추가 버튼 ("🛒 담기", 이미 담긴 경우 비활성)

9. components/ProductGrid.tsx
   - 반응형 그리드: 1-2열(모바일), 2-3열(태블릿), 3-4열(데스크톱)
   - 필터/정렬/검색 적용된 상품 목록 렌더링

10. components/ShoppingCart.tsx
    - 하단에서 슬라이드업하는 시트
    - 장바구니 아이템 목록 (체크박스 + 이름 + 삭제)
    - 직접 입력 필드 ("+ 직접 추가")
    - 체크/해제 토글
    - 빈 장바구니 상태 UI

11. components/EmptyState.tsx
    - 검색 결과 없음, 찜 없음 등 재사용 가능한 빈 상태 UI

12. hooks/ 구현
    - useLocalStorage.ts: 제네릭 localStorage 훅 (SSR-safe)
    - useFavorites.ts: 찜 추가/제거/확인
    - useCart.ts: 장바구니 추가/제거/체크/수동입력
    - useDarkMode.ts: 다크모드 토글 + html class 제어

13. app/page.tsx
    - 모든 컴포넌트를 조합한 메인 페이지
    - 상태 관리: 선택된 카테고리, 정렬, 검색어, 주차
    - JSON 데이터 로딩 (import 또는 fetch)

완료 후 npm run build 로 빌드 확인하고, 결과를 알려줘.
```

### Phase 3: 크롤러 개발

```
CLAUDE.md의 크롤러 설정을 참고해서 Playwright 기반 크롤러를 개발해줘.
scraper-developer 에이전트를 활용해도 좋아.

1. 의존성 설치
   - playwright, @playwright/test

2. scraper/config.ts
   - 크롤링 대상 URL
   - CSS 셀렉터 정의 (코스트코 사이트 분석 후)
   - 재시도 설정, 타임아웃 설정

3. scraper/parser.ts
   - HTML 요소 → Product 객체 변환
   - 가격 문자열 파싱 ("₩12,990" → 12990)
   - 카테고리 매핑
   - 날짜 파싱
   - 유닛 테스트 작성 (Vitest)

4. scraper/scrape.ts
   - Playwright 브라우저 실행
   - 페이지 네비게이션 + 대기
   - 무한 스크롤 또는 페이지네이션 처리
   - parser.ts로 데이터 추출
   - WeeklyDeals JSON 생성 및 저장
   - 스키마 검증 (필수 필드, 타입 체크)
   - 에러 시 상세 로그 + 종료 코드 1

5. 로컬 테스트
   - npx ts-node scraper/scrape.ts --dry-run (실제 저장 안 함)
   - 또는 테스트용 실행 스크립트

6. package.json에 스크립트 추가
   - "scrape": "ts-node scraper/scrape.ts"
   - "scrape:dry": "ts-node scraper/scrape.ts --dry-run"

먼저 코스트코 코리아 사이트의 구조를 분석하고,
실제 데이터를 수집할 수 있는 셀렉터를 찾아서 구현해줘.
```

### Phase 4: CI/CD + 배포

```
GitHub Actions 워크플로우와 Vercel 배포를 설정해줘.

1. .github/workflows/scrape.yml
   - 트리거: schedule (매주 월요일 00:00 UTC) + workflow_dispatch
   - 환경: ubuntu-latest, Node.js 20
   - 단계:
     a. 코드 체크아웃
     b. Node.js + 의존성 설치
     c. Playwright 브라우저 설치
     d. 크롤러 실행 (npm run scrape)
     e. 변경사항 있으면 git commit + push
     f. 실패 시 GitHub Issue 자동 생성
   - 커밋 메시지: "data: update weekly deals YYYY-WNN"
   - git 설정: github-actions bot 이름으로 커밋

2. next.config.ts
   - output: 'export' (정적 사이트 생성)
   - images: { unoptimized: true } (Vercel free tier 대응)

3. vercel.json (필요한 경우)
   - 빌드 설정, 리다이렉트 등

4. package.json 스크립트 정리
   - "dev": "next dev"
   - "build": "next build"
   - "start": "next start"
   - "scrape": "ts-node scraper/scrape.ts"

5. .gitignore 업데이트
   - node_modules, .next, out 등

6. README.md 작성
   - 프로젝트 설명
   - 로컬 개발 방법
   - 크롤러 실행 방법
   - 배포 방법

완료 후 npm run build 로 최종 빌드 확인.
```

### Phase 5: QA 최종 점검

```
/test-all
```

---

## 💡 작업 흐름 요약

```
[Phase 1] ──── 메인 에이전트가 직접 ──── 프로젝트 초기화
    ↓
[Phase 2] ──── /dev-ui 또는 메인 ──── UI 컴포넌트 전체 구현
    ↓
[Phase 3] ──── /dev-scraper ──── 크롤러 개발
    ↓
[Phase 4] ──── 메인 에이전트 ──── CI/CD + 배포 설정
    ↓
[Phase 5] ──── /test-all ──── 최종 QA
    ↓
[배포] ──── Vercel에 push하면 자동 배포 완료! 🎉
```

## ⚠️ 주의사항

1. **CLAUDE.md를 먼저 배치**: Claude Code가 프로젝트를 열면 자동으로 CLAUDE.md를 읽습니다
2. **Phase 순서 지키기**: 각 Phase는 이전 Phase의 결과물에 의존합니다
3. **Phase 2가 제일 큼**: 한 번에 안 되면 컴포넌트 단위로 나눠서 요청해도 OK
4. **크롤러는 사이트 변경에 민감**: Phase 3에서 코스트코 사이트 구조가 바뀌었으면 셀렉터 조정 필요
5. **빌드 확인 습관**: 각 Phase 끝에 `npm run build`로 빌드 깨진 거 없는지 확인

## 🔧 문제 해결

| 상황 | 해결 방법 |
|------|-----------|
| 에이전트가 CLAUDE.md를 안 읽음 | "CLAUDE.md를 먼저 읽어줘" 라고 명시적으로 요청 |
| 서브 에이전트 호출이 안 됨 | `.claude/agents/` 경로 확인, `claude --version` 최신인지 확인 |
| 컨텍스트가 너무 길어짐 | `/compact` 실행 후 계속 |
| 크롤러가 데이터를 못 가져옴 | 코스트코 사이트 구조 변경 가능성 → 셀렉터 재분석 요청 |
| 다크모드에서 깨짐 | `/test-all` 실행하여 하드코딩 색상 검출 |
