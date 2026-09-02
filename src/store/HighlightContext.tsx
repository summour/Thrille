/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { DEFAULT_PRESETS } from '@/data/defaultPresets';
import { useLocalStorage } from '@/store/useLocalStorage';
import type { HighlightStyle, KeywordPreset, KeywordRule } from '@/types/highlight';

interface HighlightContextValue {
  presets: KeywordPreset[];
  activePresetId: string | null;
  isEnabled: boolean;
  activePreset: KeywordPreset | null;
  activeRules: KeywordRule[];
  setIsEnabled: (enabled: boolean) => void;
  toggleEnabled: () => void;
  setActivePresetId: (id: string | null) => void;
  createPreset: (name: string, description?: string) => KeywordPreset;
  updatePreset: (id: string, updates: Partial<KeywordPreset>) => void;
  deletePreset: (id: string) => void;
  duplicatePreset: (id: string) => void;
  addRule: (presetId: string, word: string, style: HighlightStyle) => void;
  updateRule: (presetId: string, ruleId: string, updates: Partial<KeywordRule>) => void;
  removeRule: (presetId: string, ruleId: string) => void;
  resetToDefaults: () => void;
}

const HighlightContext = createContext<HighlightContextValue | undefined>(undefined);

const STORAGE_PRESETS_KEY = 'clr.highlight_presets';
const STORAGE_ACTIVE_ID_KEY = 'clr.active_preset_id';
const STORAGE_ENABLED_KEY = 'clr.highlight_enabled';

export function HighlightProvider({ children }: { children: ReactNode }) {
  const [presets, setPresets] = useLocalStorage<KeywordPreset[]>(
    STORAGE_PRESETS_KEY,
    DEFAULT_PRESETS,
  );
  const [activePresetId, setActivePresetId] = useLocalStorage<string | null>(
    STORAGE_ACTIVE_ID_KEY,
    'general-rules',
  );
  const [isEnabled, setIsEnabled] = useLocalStorage<boolean>(
    STORAGE_ENABLED_KEY,
    true,
  );

  const activePreset = useMemo(() => {
    if (!activePresetId) return null;
    return presets.find((p) => p.id === activePresetId) || null;
  }, [presets, activePresetId]);

  const activeRules = useMemo(() => {
    if (!isEnabled || !activePreset) return [];
    return activePreset.rules || [];
  }, [isEnabled, activePreset]);

  const toggleEnabled = useCallback(() => {
    setIsEnabled((prev) => !prev);
  }, [setIsEnabled]);

  const createPreset = useCallback(
    (name: string, description = ''): KeywordPreset => {
      const newPreset: KeywordPreset = {
        id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: name.trim() || 'ชุดคำสำคัญใหม่',
        description: description.trim(),
        rules: [],
        createdAt: Date.now(),
      };

      setPresets((prev) => [newPreset, ...prev]);
      setActivePresetId(newPreset.id);
      setIsEnabled(true);
      return newPreset;
    },
    [setPresets, setActivePresetId, setIsEnabled],
  );

  const updatePreset = useCallback(
    (id: string, updates: Partial<KeywordPreset>) => {
      setPresets((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      );
    },
    [setPresets],
  );

  const deletePreset = useCallback(
    (id: string) => {
      setPresets((prev) => prev.filter((p) => p.id !== id));
      if (activePresetId === id) {
        setPresets((prev) => {
          const remaining = prev.filter((p) => p.id !== id);
          setActivePresetId(remaining.length > 0 ? remaining[0].id : null);
          return remaining;
        });
      }
    },
    [activePresetId, setPresets, setActivePresetId],
  );

  const duplicatePreset = useCallback(
    (id: string) => {
      const target = presets.find((p) => p.id === id);
      if (!target) return;

      const copy: KeywordPreset = {
        ...target,
        id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: `${target.name} (สำเนา)`,
        createdAt: Date.now(),
        rules: target.rules.map((r) => ({
          ...r,
          id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        })),
      };

      setPresets((prev) => [copy, ...prev]);
      setActivePresetId(copy.id);
    },
    [presets, setPresets, setActivePresetId],
  );

  const addRule = useCallback(
    (presetId: string, word: string, style: HighlightStyle) => {
      const cleanWord = word.trim();
      if (!cleanWord) return;

      const newRule: KeywordRule = {
        id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        word: cleanWord,
        style,
      };

      setPresets((prev) =>
        prev.map((p) => {
          if (p.id !== presetId) return p;
          // ตรวจสอบว่ามีคำนี้อยู่แล้วหรือไม่ ถ้ามีให้อัปเดตสไตล์แทน
          const existingIdx = p.rules.findIndex((r) => r.word.toLowerCase() === cleanWord.toLowerCase());
          if (existingIdx !== -1) {
            const updatedRules = [...p.rules];
            updatedRules[existingIdx] = { ...updatedRules[existingIdx], style };
            return { ...p, rules: updatedRules };
          }
          return { ...p, rules: [...p.rules, newRule] };
        }),
      );
    },
    [setPresets],
  );

  const updateRule = useCallback(
    (presetId: string, ruleId: string, updates: Partial<KeywordRule>) => {
      setPresets((prev) =>
        prev.map((p) => {
          if (p.id !== presetId) return p;
          return {
            ...p,
            rules: p.rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)),
          };
        }),
      );
    },
    [setPresets],
  );

  const removeRule = useCallback(
    (presetId: string, ruleId: string) => {
      setPresets((prev) =>
        prev.map((p) => {
          if (p.id !== presetId) return p;
          return {
            ...p,
            rules: p.rules.filter((r) => r.id !== ruleId),
          };
        }),
      );
    },
    [setPresets],
  );

  const resetToDefaults = useCallback(() => {
    setPresets(DEFAULT_PRESETS);
    setActivePresetId('general-rules');
    setIsEnabled(true);
  }, [setPresets, setActivePresetId, setIsEnabled]);

  const value = useMemo<HighlightContextValue>(
    () => ({
      presets,
      activePresetId,
      isEnabled,
      activePreset,
      activeRules,
      setIsEnabled,
      toggleEnabled,
      setActivePresetId,
      createPreset,
      updatePreset,
      deletePreset,
      duplicatePreset,
      addRule,
      updateRule,
      removeRule,
      resetToDefaults,
    }),
    [
      presets,
      activePresetId,
      isEnabled,
      activePreset,
      activeRules,
      setIsEnabled,
      toggleEnabled,
      setActivePresetId,
      createPreset,
      updatePreset,
      deletePreset,
      duplicatePreset,
      addRule,
      updateRule,
      removeRule,
      resetToDefaults,
    ],
  );

  return (
    <HighlightContext.Provider value={value}>
      {children}
    </HighlightContext.Provider>
  );
}

export function useHighlight() {
  const ctx = useContext(HighlightContext);
  if (!ctx) {
    throw new Error('useHighlight must be used within a HighlightProvider');
  }
  return ctx;
}
