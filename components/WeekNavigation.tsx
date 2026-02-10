"use client";

interface WeekNavigationProps {
  weekOffset: number;
  onWeekChange: (offset: number) => void;
  startDate: string;
  endDate: string;
}

export default function WeekNavigation({
  weekOffset,
  onWeekChange,
  startDate,
  endDate,
}: WeekNavigationProps) {
  const isCurrentWeek = weekOffset === 0;
  const isOldestWeek = weekOffset <= -3;

  return (
    <div className="flex items-center justify-between bg-white/15 rounded-xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 mb-2 sm:mb-3">
      <button
        onClick={() => onWeekChange(weekOffset - 1)}
        disabled={isOldestWeek}
        className={`border-none text-white rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-base font-bold transition-colors whitespace-nowrap ${
          isOldestWeek
            ? "bg-white/10 text-white/40 cursor-default"
            : "bg-white/20 cursor-pointer hover:bg-white/30"
        }`}
      >
        ◀ 지난주
      </button>

      <div className="text-center px-1">
        <div className="text-xs sm:text-base font-bold text-white">
          {startDate} ~ {endDate}
        </div>
        {isCurrentWeek && (
          <div className="text-[11px] sm:text-[13px] opacity-80 text-white mt-0.5">
            📍 이번 주 할인
          </div>
        )}
      </div>

      <button
        onClick={() => onWeekChange(weekOffset + 1)}
        disabled={isCurrentWeek}
        className={`border-none text-white rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-base font-bold transition-colors whitespace-nowrap ${
          isCurrentWeek
            ? "bg-white/10 text-white/40 cursor-default"
            : "bg-white/20 cursor-pointer hover:bg-white/30"
        }`}
      >
        다음주 ▶
      </button>
    </div>
  );
}
