---
name: dev-ui
description: UI 컴포넌트 개발 작업을 ui-developer 에이전트에게 위임
argument-hint: [컴포넌트명 또는 작업 설명]
disable-model-invocation: true
context: fork
agent: ui-developer
---

CLAUDE.md를 읽고 프로젝트 컨텍스트를 파악한 후, 다음 UI 작업을 수행하세요:

$ARGUMENTS

## 작업 절차
1. CLAUDE.md에서 관련 타입, 색상, 폰트, 반응형 규칙 확인
2. 기존 컴포넌트 코드 스캔하여 스타일 일관성 파악
3. 컴포넌트 구현 (모바일-first 반응형 + 다크모드)
4. `npm run build`로 빌드 확인
5. 구현 완료 요약 보고
