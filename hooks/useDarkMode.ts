"use client";

import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "@/lib/constants";
import { useEffect } from "react";

/**
 * 다크모드 관리 훅
 */
export function useDarkMode() {
  const [darkMode, setDarkMode] = useLocalStorage<boolean>(
    STORAGE_KEYS.DARK_MODE,
    false
  );

  // html 요소에 dark 클래스 토글
  useEffect(() => {
    if (typeof window !== "undefined") {
      const html = document.documentElement;
      if (darkMode) {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return {
    darkMode,
    setDarkMode,
    toggleDarkMode,
  };
}
