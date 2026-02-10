// robots.txt 확인 유틸리티
import { chromium } from 'playwright';

async function checkRobotsTxt() {
  console.log('🤖 robots.txt 확인 중...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const robotsUrl = 'https://www.costco.co.kr/robots.txt';
    const response = await page.goto(robotsUrl);

    if (response?.ok()) {
      const content = await page.content();
      const text = content.replace(/<[^>]*>/g, '').trim();

      console.log('📄 robots.txt 내용:\n');
      console.log('─'.repeat(60));
      console.log(text);
      console.log('─'.repeat(60));

      // Special-Price-Offers 경로 확인
      const lines = text.split('\n');
      let isAllowed = true;
      let currentUserAgent = '';

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('User-agent:')) {
          currentUserAgent = trimmed.split(':')[1].trim();
        }

        if (trimmed.startsWith('Disallow:') && currentUserAgent === '*') {
          const path = trimmed.split(':')[1].trim();
          if (path === '/Special-Price-Offers' ||
              path.startsWith('/Special-Price-Offers/')) {
            isAllowed = false;
            console.log('\n⚠️  경고: Special-Price-Offers 경로가 Disallow 되어 있습니다!');
            console.log(`   규칙: ${trimmed}`);
          }
        }
      }

      if (isAllowed) {
        console.log('\n✅ Special-Price-Offers 경로는 크롤링이 허용됩니다.');
      } else {
        console.log('\n❌ 주의: robots.txt를 준수하려면 크롤링을 중단해야 합니다.');
      }
    } else {
      console.log('⚠️  robots.txt를 찾을 수 없습니다.');
      console.log('   (robots.txt가 없으면 크롤링이 허용됩니다)');
    }
  } catch (error) {
    console.error('❌ 에러:', error instanceof Error ? error.message : String(error));
  } finally {
    await browser.close();
  }
}

checkRobotsTxt();
