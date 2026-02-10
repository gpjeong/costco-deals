// 주차 계산, 주차 ID 생성

/**
 * ISO 8601 주차 번호 계산
 */
export function getISOWeek(date: Date): number {
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  // 목요일로 설정 (ISO 8601 기준)
  tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
  // 해당 연도의 1월 4일로 기준 설정
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  // 주차 계산
  return (
    1 +
    Math.round(
      ((tempDate.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

/**
 * 주차 ID 생성 (예: "2026-W07")
 */
export function getWeekId(date: Date): string {
  const year = date.getFullYear();
  const week = getISOWeek(date);
  return `${year}-W${week.toString().padStart(2, "0")}`;
}

/**
 * 현재 주차 ID
 */
export function getCurrentWeekId(): string {
  return getWeekId(new Date());
}

/**
 * 주차 ID에서 시작/종료 날짜 계산
 * ISO 8601: 주는 월요일 시작, 일요일 종료
 * 단, 우리는 일요일 시작, 토요일 종료로 조정
 */
export function getWeekDates(weekId: string): {
  startDate: string;
  endDate: string;
} {
  const [yearStr, weekStr] = weekId.split("-W");
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);

  // 해당 연도 1월 4일 (ISO 8601 기준)
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay();

  // 첫 주 월요일 찾기
  const firstMonday = new Date(jan4);
  firstMonday.setDate(jan4.getDate() - jan4Day + (jan4Day <= 4 ? 1 : 8));

  // 해당 주 월요일
  const monday = new Date(firstMonday);
  monday.setDate(firstMonday.getDate() + (week - 1) * 7);

  // 일요일 시작으로 조정 (월요일에서 1일 빼기)
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() - 1);

  // 토요일 종료 (일요일에서 6일 더하기)
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  return {
    startDate: sunday.toISOString().split("T")[0],
    endDate: saturday.toISOString().split("T")[0],
  };
}

/**
 * weekOffset에 따른 주차 ID 계산
 * @param offset 0: 이번 주, -1: 지난주, 1: 다음주
 */
export function getWeekIdWithOffset(offset: number): string {
  const now = new Date();
  now.setDate(now.getDate() + offset * 7);
  return getWeekId(now);
}
