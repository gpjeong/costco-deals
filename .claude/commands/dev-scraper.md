---
name: dev-scraper
description: 크롤러/파서 개발 작업을 scraper-developer 에이전트에게 위임
argument-hint: [작업 설명]
disable-model-invocation: true
context: fork
agent: scraper-developer
---

CLAUDE.md를 읽고 프로젝트 컨텍스트를 파악한 후, 다음 크롤러 작업을 수행하세요:

$ARGUMENTS

## 작업 절차
1. CLAUDE.md에서 크롤링 설정, 데이터 모델, 출력 경로 확인
2. 기존 scraper/ 코드 스캔
3. 구현 또는 수정
4. 로컬 테스트 실행 및 결과 확인
5. JSON 스키마 검증
6. 구현 완료 요약 보고
