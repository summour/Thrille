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
import type {
  HighlightColor,
  HighlightStyle,
  KeywordPreset,
  KeywordRule,
  UnderlineStyle,
} from '@/types/highlight';

interface HighlightContextValue {
  presets: KeywordPreset[];
  activePresetId: string | null;
  isEnabled: boolean;
  activePreset: KeywordPreset | null;
  activeRules: KeywordRule[];
  enabledPresetsCount: number;
  customColors: string[];
  setIsEnabled: (enabled: boolean) => void;
  toggleEnabled: () => void;
  togglePresetEnabled: (presetId: string) => void;
  setPresetEnabled: (presetId: string, enabled: boolean) => void;
  setActivePresetId: (id: string | null) => void;
  createPreset: (name: string, description?: string) => KeywordPreset;
  updatePreset: (id: string, updates: Partial<KeywordPreset>) => void;
  deletePreset: (id: string) => void;
  duplicatePreset: (id: string) => void;
  addRule: (
    presetId: string,
    word: string,
    color?: HighlightColor | HighlightStyle | null,
    underline?: UnderlineStyle | null,
  ) => void;
  updateRule: (presetId: string, ruleId: string, updates: Partial<KeywordRule>) => void;
  removeRule: (presetId: string, ruleId: string) => void;
  addCustomColor: (color: string) => void;
  removeCustomColor: (color: string) => void;
  resetToDefaults: () => void;
}

const HighlightContext = createContext<HighlightContextValue | undefined>(undefined);

const STORAGE_PRESETS_KEY = 'clr.highlight_presets';
const STORAGE_ACTIVE_ID_KEY = 'clr.active_preset_id';
const STORAGE_ENABLED_KEY = 'clr.highlight_enabled';
const STORAGE_CUSTOM_COLORS_KEY = 'clr.custom_highlight_colors';

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
  const [customColors, setCustomColors] = useLocalStorage<string[]>(
    STORAGE_CUSTOM_COLORS_KEY,
    [],
  );

  const activePreset = useMemo(() => {
    if (!activePresetId) return null;
    return presets.find((p) => p.id === activePresetId) || null;
  }, [presets, activePresetId]);

  const enabledPresetsCount = useMemo(() => {
    return presets.filter((p) => p.enabled !== false).length;
  }, [presets]);

  const activeRules = useMemo(() => {
    if (!isEnabled) return [];
    const enabledPresets = presets.filter((p) => p.enabled !== false);
    const rulesMap = new Map<string, KeywordRule>();
    for (const preset of enabledPresets) {
      for (const rule of preset.rules) {
        const key = rule.word.toLowerCase();
        if (!rulesMap.has(key)) {
          rulesMap.set(key, rule);
        }
      }
    }
    return Array.from(rulesMap.values());
  }, [isEnabled, presets]);

  const toggleEnabled = useCallback(() => {
    setIsEnabled((prev) => !prev);
  }, [setIsEnabled]);

  const togglePresetEnabled = useCallback(
    (presetId: string) => {
      setPresets((prev) =>
        prev.map((p) =>
          p.id === presetId ? { ...p, enabled: p.enabled === false ? true : false } : p,
        ),
      );
    },
    [setPresets],
  );

  const setPresetEnabled = useCallback(
    (presetId: string, enabled: boolean) => {
      setPresets((prev) =>
        prev.map((p) => (p.id === presetId ? { ...p, enabled } : p)),
      );
    },
    [setPresets],
  );

  const createPreset = useCallback(
    (name: string, description = ''): KeywordPreset => {
      const newPreset: KeywordPreset = {
        id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: name.trim() || 'ชุดคำสำคัญใหม่',
        description: description.trim(),
        enabled: true,
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
        enabled: target.enabled !== false,
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
    (
      presetId: string,
      word: string,
      colorOrStyle?: HighlightColor | HighlightStyle | null,
      underline?: UnderlineStyle | null,
    ) => {
      const cleanWord = word.trim();
      if (!cleanWord) return;

      let finalColor: HighlightColor | null = null;
      let finalUnderline: UnderlineStyle | null = underline ?? null;

      if (typeof colorOrStyle === 'string') {
        const lower = colorOrStyle.toLowerCase();
        if (['yellow', 'green', 'blue', 'pink'].includes(lower)) {
          finalColor = lower as HighlightColor;
        } else if (colorOrStyle.startsWith('#')) {
          finalColor = colorOrStyle;
        } else {
          if (lower.includes('yellow')) finalColor = 'yellow';
          else if (lower.includes('green')) finalColor = 'green';
          else if (lower.includes('blue')) finalColor = 'blue';
          else if (lower.includes('pink')) finalColor = 'pink';
          else if (colorOrStyle.includes('#')) {
            const match = colorOrStyle.match(/#[0-9a-fA-F]{3,8}/);
            if (match) finalColor = match[0];
          }

          if (lower.includes('double')) finalUnderline = 'double';
          else if (lower.includes('bold')) finalUnderline = 'bold';
          else if (lower.includes('underline')) finalUnderline = 'solid';
        }
      }

      if (!finalColor && !finalUnderline) {
        finalColor = 'yellow';
      }

      const newRule: KeywordRule = {
        id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        word: cleanWord,
        color: finalColor,
        underline: finalUnderline,
      };

      setPresets((prev) =>
        prev.map((p) => {
          if (p.id !== presetId) return p;
          // ตรวจสอบว่ามีคำนี้อยู่แล้วหรือไม่ ถ้ามีให้อัปเดตสไตล์แทน
          const existingIdx = p.rules.findIndex(
            (r) => r.word.toLowerCase() === cleanWord.toLowerCase(),
          );
          if (existingIdx !== -1) {
            const updatedRules = [...p.rules];
            updatedRules[existingIdx] = {
              ...updatedRules[existingIdx],
              color: finalColor,
              underline: finalUnderline,
            };
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

  const addCustomColor = useCallback(
    (color: string) => {
      const clean = color.trim().toLowerCase();
      if (!clean) return;
      setCustomColors((prev) => {
        const filtered = prev.filter((c) => c !== clean);
        // Append to the end
        return [...filtered, clean];
      });
    },
    [setCustomColors],
  );

  const removeCustomColor = useCallback(
    (color: string) => {
      const clean = color.trim().toLowerCase();
      setCustomColors((prev) => prev.filter((c) => c !== clean));
    },
    [setCustomColors],
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
      enabledPresetsCount,
      customColors,
      setIsEnabled,
      toggleEnabled,
      togglePresetEnabled,
      setPresetEnabled,
      setActivePresetId,
      createPreset,
      updatePreset,
      deletePreset,
      duplicatePreset,
      addRule,
      updateRule,
      removeRule,
      addCustomColor,
      removeCustomColor,
      resetToDefaults,
    }),
    [
      presets,
      activePresetId,
      isEnabled,
      activePreset,
      activeRules,
      enabledPresetsCount,
      customColors,
      setIsEnabled,
      toggleEnabled,
      togglePresetEnabled,
      setPresetEnabled,
      setActivePresetId,
      createPreset,
      updatePreset,
      deletePreset,
      duplicatePreset,
      addRule,
      updateRule,
      removeRule,
      addCustomColor,
      removeCustomColor,
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
