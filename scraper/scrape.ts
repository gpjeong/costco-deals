#!/usr/bin/env node
// 코스트코 주간 할인 크롤러 (OCC REST API)
import { chromium, Browser, Page } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { WeeklyDeals, Product } from '../lib/types';
import { SCRAPER_CONFIG } from './config';
import { parseOccProduct, getWeekDateRange, OccProduct } from './parser';

// CLI 인자 파싱
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

/**
 * OCC 검색 API URL 생성
 */
function buildSearchUrl(page: number): string {
  const { api } = SCRAPER_CONFIG;
  return `${api.search}?query=&category=${api.category}&pageSize=${api.pageSize}&currentPage=${page}&fields=${api.fields}&lang=${api.lang}&curr=${api.curr}`;
}

/**
 * OCC API로 모든 상품 가져오기 (페이지네이션)
 */
async function fetchAllProducts(page: Page): Promise<OccProduct[]> {
  console.log('📦 OCC API로 상품 데이터 수집 중...');

  // 첫 페이지에서 총 개수 확인
  const firstResult = await page.evaluate(async (url) => {
    const res = await fetch(url);
    return await res.json();
  }, buildSearchUrl(0));

  const totalResults = firstResult.pagination?.totalResults ?? 0;
  const totalPages = firstResult.pagination?.totalPages ?? 0;
  const firstProducts: OccProduct[] = firstResult.products ?? [];

  console.log(`   총 상품 수: ${totalResults}개 (${totalPages} 페이지)`);

  let allProducts: OccProduct[] = [...firstProducts];

  // 나머지 페이지 순회
  for (let p = 1; p < totalPages; p++) {
    console.log(`   페이지 ${p + 1}/${totalPages} 로딩 중...`);

    const result = await page.evaluate(async (url) => {
      const res = await fetch(url);
      return await res.json();
    }, buildSearchUrl(p));

    const products: OccProduct[] = result.products ?? [];
    allProducts = allProducts.concat(products);

    // Rate limiting
    await page.waitForTimeout(500);
  }

  console.log(`✅ ${allProducts.length}개 원시 데이터 수집 완료`);
  return allProducts;
}

/**
 * 현재 날짜 기준 활성 할인 상품만 필터링
 */
function filterActiveDeals(occProducts: OccProduct[]): OccProduct[] {
  const now = new Date();

  return occProducts.filter(p => {
    // 할인 정보가 없는 상품 제외
    if (!p.discountPrice || p.discountPrice.value <= 0) return false;

    // 가격이 없는 상품 제외 (온라인 미판매, 문의 상품 등)
    if (!p.basePrice || p.basePrice.value <= 0) return false;

    // 할인 기간 확인
    if (p.discountStartDate && p.discountEndDate) {
      const start = new Date(p.discountStartDate);
      const end = new Date(p.discountEndDate);
      return start <= now && now <= end;
    }

    // 할인 기간이 없지만 할인가가 있으면 포함
    return true;
  });
}

/**
 * 크롤링 재시도 로직
 */
async function scrapeWithRetry(
  browser: Browser,
  attempt: number = 1
): Promise<Product[]> {
  const page = await browser.newPage();

  try {
    console.log(`🌐 페이지 로딩 중... (시도 ${attempt}/${SCRAPER_CONFIG.options.retryAttempts})`);

    // 세션 쿠키 획득을 위해 먼저 페이지 방문
    await page.goto(SCRAPER_CONFIG.url, {
      waitUntil: 'domcontentloaded',
      timeout: SCRAPER_CONFIG.options.timeout,
    });
    await page.waitForTimeout(SCRAPER_CONFIG.options.waitAfterLoad);
    console.log('✅ 페이지 로딩 완료');

    // OCC API로 모든 상품 가져오기
    const allOccProducts = await fetchAllProducts(page);

    // 현재 활성 할인 상품만 필터링
    const activeProducts = filterActiveDeals(allOccProducts);
    console.log(`✅ 현재 활성 할인 상품: ${activeProducts.length}개`);

    // Product 객체로 변환
    const products = activeProducts.map(parseOccProduct);
    console.log(`✅ ${products.length}개 상품 파싱 완료`);

    await page.close();
    return products;
  } catch (error) {
    await page.close();

    if (attempt < SCRAPER_CONFIG.options.retryAttempts) {
      console.warn(`⚠️  시도 ${attempt} 실패, ${SCRAPER_CONFIG.options.retryDelay}ms 후 재시도...`);
      console.warn(`   에러: ${error instanceof Error ? error.message : String(error)}`);

      await new Promise(resolve => setTimeout(resolve, SCRAPER_CONFIG.options.retryDelay));
      return scrapeWithRetry(browser, attempt + 1);
    } else {
      throw error;
    }
  }
}

/**
 * 데이터 검증
 */
function validateData(data: WeeklyDeals): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.weekId) errors.push('weekId가 없습니다');
  if (!data.startDate) errors.push('startDate가 없습니다');
  if (!data.endDate) errors.push('endDate가 없습니다');
  if (!data.scrapedAt) errors.push('scrapedAt가 없습니다');

  if (data.products.length === 0) {
    errors.push('상품이 하나도 없습니다');
  }

  data.products.forEach((product, index) => {
    if (!product.id) errors.push(`상품 ${index}: ID가 없습니다`);
    if (!product.name) errors.push(`상품 ${index}: 이름이 없습니다`);
    if (!product.category) errors.push(`상품 ${index}: 카테고리가 없습니다`);
    if (product.originalPrice < 0) {
      errors.push(`상품 ${index} (${product.name}): 원가가 음수입니다`);
    }
    if (product.salePrice < 0) {
      errors.push(`상품 ${index} (${product.name}): 할인가가 음수입니다`);
    }
    if (product.discountAmount < 0) {
      errors.push(`상품 ${index} (${product.name}): 할인액이 음수입니다`);
    }

    // 가격 정합성 (OCC API 특성상 반올림 차이 허용)
    const expectedSalePrice = product.originalPrice - product.discountAmount;
    if (Math.abs(product.salePrice - expectedSalePrice) > 1) {
      errors.push(
        `상품 ${index} (${product.name}): 가격 정합성 오류 ` +
        `(할인가: ${product.salePrice}, 예상: ${expectedSalePrice})`
      );
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * JSON 파일 저장
 */
function saveData(data: WeeklyDeals, dryRun: boolean = false): void {
  if (dryRun) {
    console.log('\n📄 [DRY RUN] 파일 저장 생략');
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  const dataDir = join(process.cwd(), 'data', 'weeks');
  mkdirSync(dataDir, { recursive: true });

  const publicDataDir = join(process.cwd(), 'public', 'data', 'weeks');
  mkdirSync(publicDataDir, { recursive: true });

  const filename = `${data.weekId}.json`;
  const dataPath = join(dataDir, filename);
  const publicPath = join(publicDataDir, filename);

  const jsonContent = JSON.stringify(data, null, 2);
  writeFileSync(dataPath, jsonContent, 'utf-8');
  writeFileSync(publicPath, jsonContent, 'utf-8');

  console.log(`\n💾 파일 저장 완료:`);
  console.log(`   - ${dataPath}`);
  console.log(`   - ${publicPath}`);
}

/**
 * 메인 크롤러 실행
 */
async function main() {
  console.log('🚀 코스트코 주간 할인 크롤러 시작 (OCC API 모드)\n');
  console.log(`🎯 대상: ${SCRAPER_CONFIG.url}`);
  console.log(`🔄 재시도 횟수: ${SCRAPER_CONFIG.options.retryAttempts}`);
  console.log(`⏱️  타임아웃: ${SCRAPER_CONFIG.options.timeout}ms`);

  if (isDryRun) {
    console.log('🧪 [DRY RUN 모드] 파일 저장 없이 결과만 출력합니다\n');
  } else {
    console.log('');
  }

  const startTime = Date.now();
  let browser: Browser | null = null;

  try {
    console.log('🌐 브라우저 시작 중...');
    browser = await chromium.launch({
      headless: SCRAPER_CONFIG.options.headless,
    });

    const context = await browser.newContext({
      userAgent: SCRAPER_CONFIG.userAgent,
    });

    // context에서 페이지 생성
    const page = await context.newPage();
    await page.goto(SCRAPER_CONFIG.url, {
      waitUntil: 'domcontentloaded',
      timeout: SCRAPER_CONFIG.options.timeout,
    });
    await page.waitForTimeout(SCRAPER_CONFIG.options.waitAfterLoad);
    console.log('✅ 브라우저 시작 완료\n');
    await page.close();

    // 크롤링 실행
    const products = await scrapeWithRetry(browser, 1);

    // WeeklyDeals 데이터 생성
    const { weekId, startDate, endDate } = getWeekDateRange();
    const weeklyDeals: WeeklyDeals = {
      weekId,
      startDate,
      endDate,
      scrapedAt: new Date().toISOString(),
      products,
    };

    // 데이터 검증
    console.log('\n🔍 데이터 검증 중...');
    const validation = validateData(weeklyDeals);

    if (!validation.valid) {
      console.error('\n❌ 데이터 검증 실패:');
      validation.errors.forEach(error => console.error(`   - ${error}`));
      process.exit(1);
    }

    console.log('✅ 데이터 검증 완료\n');

    // 결과 요약
    console.log('📊 크롤링 결과:');
    console.log(`   주차: ${weekId}`);
    console.log(`   기간: ${startDate} ~ ${endDate}`);
    console.log(`   상품 수: ${products.length}개`);
    console.log(`   할인 상품: ${products.filter(p => p.discountAmount > 0).length}개`);

    const avgDiscount = products.length > 0
      ? Math.round(products.reduce((sum, p) => sum + p.discountRate, 0) / products.length)
      : 0;
    console.log(`   평균 할인율: ${avgDiscount}%`);

    const maxDiscount = products.reduce((max, p) => Math.max(max, p.discountAmount), 0);
    console.log(`   최대 할인액: ${maxDiscount.toLocaleString()}원`);

    // 카테고리별 통계
    const categoryStats = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📋 카테고리별 통계:');
    Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count}개`);
      });

    // 파일 저장
    saveData(weeklyDeals, isDryRun);

    const duration = Date.now() - startTime;
    console.log(`\n✅ 크롤링 완료 (${(duration / 1000).toFixed(1)}초)`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 크롤링 실패:');
    console.error(error instanceof Error ? error.message : String(error));

    if (error instanceof Error && error.stack) {
      console.error('\n스택 트레이스:');
      console.error(error.stack);
    }

    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
