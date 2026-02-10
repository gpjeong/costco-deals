"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <input
      type="text"
      placeholder="🔍 상품 검색..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-[10px] border-none text-base outline-none bg-white/95 dark:bg-white/10 text-[#333] dark:text-[#E8E8E8] placeholder:text-[#999]"
    />
  );
}
