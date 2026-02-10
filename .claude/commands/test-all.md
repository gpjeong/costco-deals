---
name: test-all
description: 전체 프로젝트 품질 점검을 qa-tester 에이전트에게 위임
disable-model-invocation: true
context: fork
agent: qa-tester
---

CLAUDE.md를 읽고 프로젝트 전체에 대해 QA 점검을 수행하세요.

## 점검 항목
1. `npm run build` 빌드 성공 여부
2. TypeScript 타입 에러
3. `/data/weeks/*.json` 데이터 무결성 (스키마, 가격 정합성)
4. 접근성 (alt 텍스트, 폰트 사이즈, 색상 대비, 터치 타겟)
5. 반응형 코드 리뷰 (Tailwind breakpoint 사용)
6. 다크모드 누락 여부 (하드코딩된 색상 검출)

QA 리포트 형식(PASS/WARNING/FAIL/SUGGESTIONS)으로 결과를 보고하세요.
