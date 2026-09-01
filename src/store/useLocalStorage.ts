import { useCallback, useEffect, useState } from 'react';

/**
 * เก็บ state ลง localStorage — ใช้กับ bookmark และประวัติการอ่าน
 * ข้อมูลกฎหมายเองไม่ต้องเก็บ เพราะ bundle มาพร้อมแอปอยู่แล้ว (offline-first)
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* โหมดส่วนตัวหรือพื้นที่เต็ม — ข้ามไปโดยไม่ทำให้แอปพัง */
    }
  }, [key, value]);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return [value, setValue, reset] as const;
}