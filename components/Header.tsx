"use client";

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenCart: () => void;
  uncheckedCartCount: number;
}

export default function Header({
  darkMode,
  onToggleDarkMode,
  onOpenCart,
  uncheckedCartCount,
}: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-[#005DAA] to-[#003F7D] dark:from-[#0A1628] dark:to-[#162544] px-4 pt-5 pb-4 text-white shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
      <div className="max-w-[960px] mx-auto">
        {/* 로고 + 타이틀 + 버튼들 */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex flex-col leading-none select-none">
              <span className="text-[22px] font-black tracking-[0.06em] text-white">COSTCO</span>
              <span className="text-[8px] font-bold tracking-[0.28em] text-white/70">WHOLESALE</span>
            </div>
            <h1 className="text-[22px] font-extrabold m-0 tracking-tight">
              할인 모아보기
            </h1>
          </div>

          <div className="flex gap-2">
            {/* 다크모드 토글 */}
            <button
              onClick={onToggleDarkMode}
              className="bg-white/15 border-none text-white rounded-[10px] w-[44px] h-[44px] text-lg cursor-pointer flex items-center justify-center hover:bg-white/25 transition-colors"
              aria-label="다크모드 토글"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            {/* 장바구니 버튼 */}
            <button
              onClick={onOpenCart}
              className="relative bg-white/15 border-none text-white rounded-[10px] w-[44px] h-[44px] text-lg cursor-pointer flex items-center justify-center hover:bg-white/25 transition-colors"
              aria-label="장바구니 열기"
            >
              🛒
              {uncheckedCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-costco-red text-white rounded-full w-5 h-5 text-[11px] font-extrabold flex items-center justify-center">
                  {uncheckedCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
