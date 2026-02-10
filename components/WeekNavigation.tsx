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

  return (
    <div className="flex items-center justify-between bg-white/15 rounded-xl px-3.5 py-2.5 mb-3">
      <button
        onClick={() => onWeekChange(-1)}
        className="bg-white/20 border-none text-white rounded-lg px-3 py-1.5 text-base font-bold cursor-pointer hover:bg-white/30 transition-colors"
      >
        ◀ 지난주
      </button>

      <div className="text-center">
        <div className="text-base font-bold text-white">
          {startDate} ~ {endDate}
        </div>
        {isCurrentWeek && (
          <div className="text-[13px] opacity-80 text-white mt-0.5">
            📍 이번 주 할인
          </div>
        )}
      </div>

      <button
        onClick={() => onWeekChange(0)}
        disabled={isCurrentWeek}
        className={`border-none text-white rounded-lg px-3 py-1.5 text-base font-bold transition-colors ${
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
