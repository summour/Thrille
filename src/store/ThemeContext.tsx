/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '@/store/useLocalStorage';

export type ThemeMode = 'light' | 'dark';
/** 1 = เล็ก, 2 = ปกติ, 3 = ใหญ่ (ปรับ line-height ให้เหมาะกับการอ่านตัวบทยาว ๆ) */
export type FontScale = 1 | 2 | 3;

interface ThemeContextValue {
  theme: ThemeMode;
  fontScale: FontScale;
  toggleTheme: () => void;
  cycleFontScale: () => void;
  fontScaleLabel: string;
}

const FONT_SCALE_LABELS: Record<FontScale, string> = { 1: 'เล็ก', 2: 'ปกติ', 3: 'ใหญ่' };

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useLocalStorage<ThemeMode>('clr.theme', 'light');
  const [fontScale, setFontScale] = useLocalStorage<FontScale>('clr.fontScale', 2);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.fontScale = String(fontScale);

    const themeHex = theme === 'dark' ? '#0d0d0d' : '#ffffff';
    const metaTags = document.querySelectorAll('meta[name="theme-color"]');
    metaTags.forEach((tag) => {
      tag.setAttribute('content', themeHex);
    });

    const appleStatusMeta = document.getElementById('apple-status-bar-meta') || document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (appleStatusMeta) {
      appleStatusMeta.setAttribute('content', theme === 'dark' ? 'black' : 'default');
    }
  }, [theme, fontScale]);

  const toggleTheme = useCallback(
    () => setTheme((current) => (current === 'light' ? 'dark' : 'light')),
    [setTheme],
  );

  const cycleFontScale = useCallback(
    () => setFontScale((current) => ((current % 3) + 1) as FontScale),
    [setFontScale],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      fontScale,
      toggleTheme,
      cycleFontScale,
      fontScaleLabel: FONT_SCALE_LABELS[fontScale],
    }),
    [theme, fontScale, toggleTheme, cycleFontScale],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within <ThemeProvider>');
  return context;
}