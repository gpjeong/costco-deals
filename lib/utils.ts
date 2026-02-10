// 유틸리티 함수 (가격 포맷, 날짜 계산 등)

/**
 * 가격 포맷팅 (예: 12990 → "12,990원")
 */
export function formatPrice(price: number): string {
  return price.toLocaleString() + "원";
}

/**
 * D-day 계산 (endDate까지 남은 일수)
 */
export function getDaysLeft(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  // 시간 부분 제거하여 날짜만 비교
  end.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffMs = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * 날짜 포맷팅 (예: "2026-02-09" → "2월 9일 (일)")
 */
export function formatDateKorean(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];

  return `${month}월 ${day}일 (${dayOfWeek})`;
}

/**
 * 주차 범위 포맷팅 (예: "2월 9일 (일) ~ 2월 15일 (토)")
 */
export function formatWeekRange(startDate: string, endDate: string): {
  start: string;
  end: string;
} {
  return {
    start: formatDateKorean(startDate),
    end: formatDateKorean(endDate),
  };
}

/**
 * 클래스명 조합 유틸리티
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
