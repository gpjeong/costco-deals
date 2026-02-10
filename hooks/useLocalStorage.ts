"use client";

import { useState, useEffect } from "react";

/**
 * SSR-safe localStorage 커스텀 훅
 * @param key localStorage 키
 * @param initialValue 초기값
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // SSR에서는 initialValue 사용
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // 마운트 후 localStorage에서 값 로드
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
    }
  }, [key]);

  // 값 저장 함수
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 함수형 업데이트 지원
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
