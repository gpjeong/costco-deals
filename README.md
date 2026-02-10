# 코스트코 주간 할인 뷰어

코스트코 코리아 주간 할인 상품을 한눈에 확인할 수 있는 웹 페이지입니다.
50~60대 사용자를 위해 큰 글씨와 직관적인 UI로 설계되었습니다.

**배포 URL**: https://costco-deals-ten.vercel.app

## 주요 기능

- **주간 할인 목록**: 카테고리별 필터, 검색, 정렬 (할인율/가격/마감순)
- **찜 기능**: 관심 상품을 하트로 찜하고 모아보기
- **장바구니 메모**: 상품 이미지/가격과 함께 장바구니에 담고, 총 결제 금액 확인
- **다크모드**: 라이트/다크 테마 전환
- **반응형 UI**: 모바일/태블릿/데스크톱 최적화
- **페이지네이션**: 한 페이지 12개 상품, 첫/이전/다음/마지막 페이지 이동
- **상품 링크**: 이미지 클릭 시 코스트코 코리아 상품 페이지로 이동
- **주차 네비게이션**: 이번 주/지난주 할인 데이터 전환

## 기술 스택

- **Next.js 14** (App Router, TypeScript, SSG)
- **Tailwind CSS**
- **Playwright** (크롤러)
- **GitHub Actions** (주간 자동 크롤링)
- **Vercel** (배포)

## 로컬 개발

```bash
# Node.js 20 사용
nvm use 20

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 크롤러 실행

```bash
# 크롤러 실행 (data/weeks/ 에 JSON 생성)
npm run scrape

# 드라이런 (실제 저장 없이 테스트)
npm run scrape:dry

# 파서 유닛 테스트
npm run scrape:test
```

## 빌드 및 배포

```bash
# 정적 사이트 빌드 (out/ 디렉토리 생성)
npm run build
```

Vercel에 연결되어 `main` 브랜치 push 시 자동 배포됩니다.

## 자동화 (GitHub Actions)

매주 월요일 09:00 KST에 GitHub Actions가 크롤러를 실행하고, 새 데이터가 있으면 자동 커밋/푸시합니다. 크롤링 실패 시 GitHub Issue가 자동 생성됩니다.

수동 실행: GitHub > Actions > Weekly Costco Scraper > Run workflow

## 프로젝트 구조

```
app/            # Next.js 페이지
components/     # React 컴포넌트 (Header, ProductCard, ShoppingCart 등)
hooks/          # 커스텀 훅 (찜, 장바구니, 다크모드)
lib/            # 타입, 유틸리티, 상수
data/weeks/     # 주차별 할인 데이터 (JSON)
scraper/        # Playwright 크롤러
docs/           # UI 목업, 기획서
```

## 데이터 출처

- [코스트코 코리아 스페셜 할인](https://www.costco.co.kr/Special-Price-Offers/c/SpecialPriceOffers)
