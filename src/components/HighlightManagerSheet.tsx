import { useState, useRef, type FormEvent } from 'react';
import { Icon } from '@/components/Icon';
import {
  getCustomColorStyle,
  getHighlightClassNames,
  getRuleStyles,
  getContrastTextColor,
} from '@/lib/highlighter';
import { useHighlight } from '@/store/HighlightContext';
import { useToast } from '@/store/ToastContext';
import type { HighlightColor, UnderlineStyle } from '@/types/highlight';

interface HighlightManagerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialWord?: string;
}

const COLOR_OPTIONS: { id: HighlightColor; label: string; className: string }[] = [
  { id: 'yellow', label: 'สีเหลืองนีออน', className: 'sheet-color-btn--yellow' },
  { id: 'green', label: 'สีเขียวนีออน', className: 'sheet-color-btn--green' },
  { id: 'blue', label: 'สีฟ้านีออน', className: 'sheet-color-btn--blue' },
  { id: 'pink', label: 'สีชมพูนีออน', className: 'sheet-color-btn--pink' },
];

export function HighlightManagerSheet({
  isOpen,
  onClose,
  initialWord = '',
}: HighlightManagerSheetProps) {
  const {
    presets,
    activePresetId,
    activePreset,
    customColors,
    togglePresetEnabled,
    setActivePresetId,
    createPreset,
    updatePreset,
    deletePreset,
    duplicatePreset,
    addRule,
    removeRule,
    addCustomColor,
    removeCustomColor,
    resetToDefaults,
  } = useHighlight();

  const { showToast } = useToast();

  const [inputWord, setInputWord] = useState(initialWord);
  const [selectedColor, setSelectedColor] = useState<HighlightColor | null>('yellow');
  const [selectedUnderline, setSelectedUnderline] = useState<UnderlineStyle | null>(null);
  const [pickerColor, setPickerColor] = useState('#a855f7');
  const colorsGroupRef = useRef<HTMLDivElement>(null);

  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  if (!isOpen) return null;

  const handleSelectColor = (color: HighlightColor) => {
    if (selectedColor === color) {
      // ยกเลิกสีเฉพาะเมื่อมีการเลือกเส้นใต้อยู่ เพื่อไม่ให้กลายเป็นไม่มีสไตล์เลย
      if (selectedUnderline) {
        setSelectedColor(null);
      }
    } else {
      setSelectedColor(color);
    }
  };

  const handleCustomColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    if (!hex) return;
    setPickerColor(hex);
    addCustomColor(hex);
    setSelectedColor(hex);
    setTimeout(() => {
      if (colorsGroupRef.current) {
        colorsGroupRef.current.scrollTo({
          left: colorsGroupRef.current.scrollWidth,
          behavior: 'smooth',
        });
      }
    }, 60);
  };

  const handleDeleteCustomColor = (hex: string) => {
    removeCustomColor(hex);
    if (selectedColor === hex) {
      setSelectedColor('yellow');
    }
    showToast(`ลบสีเรียบร้อย`);
  };

  const handleSelectUnderline = (underline: UnderlineStyle) => {
    if (selectedUnderline === underline) {
      // ยกเลิกเส้นใต้เฉพาะเมื่อมีสีเลือกอยู่ เพื่อไม่ให้กลายเป็นไม่มีสไตล์เลย
      if (selectedColor) {
        setSelectedUnderline(null);
      }
    } else {
      setSelectedUnderline(underline);
    }
  };

  const handleAddRule = (e: FormEvent) => {
    e.preventDefault();
    const word = inputWord.trim();
    if (!word) return;

    const finalColor = selectedColor || (!selectedUnderline ? 'yellow' : null);
    const finalUnderline = selectedUnderline || null;

    if (!activePreset) {
      const p = createPreset('ชุดคำสำคัญของฉัน');
      addRule(p.id, word, finalColor, finalUnderline);
    } else {
      addRule(activePreset.id, word, finalColor, finalUnderline);
    }

    showToast(`เพิ่มคำว่า "${word}" เรียบร้อย`);
    setInputWord('');
  };

  const handleCreateNewPreset = (e: FormEvent) => {
    e.preventDefault();
    const name = newPresetName.trim();
    if (!name) return;

    const created = createPreset(name);
    setIsCreatingPreset(false);
    setNewPresetName('');
    showToast(`สร้างชุด "${created.name}" เรียบร้อย`);
  };

  const handleSaveEditedName = (e: FormEvent) => {
    e.preventDefault();
    if (!activePreset) return;
    const name = editNameValue.trim();
    if (name) {
      updatePreset(activePreset.id, { name });
      showToast(`แก้ไขชื่อชุดเป็น "${name}"`);
    }
    setIsEditingName(false);
  };

  const handleDeleteActivePreset = () => {
    if (!activePreset) return;
    if (window.confirm(`ต้องการลบชุดคำสำคัญ "${activePreset.name}" ใช่หรือไม่?`)) {
      const name = activePreset.name;
      deletePreset(activePreset.id);
      showToast(`ลบชุด "${name}" แล้ว`);
    }
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="จัดการชุดคำสำคัญช่วยจำ"
      >
        {/* Sheet Header */}
        <div className="sheet-header">
          <div className="sheet-header__title-group">
            <Icon name="highlighter" size={19} className="sheet-header__icon" />
            <h2 className="sheet-header__title">คำสำคัญช่วยจำ</h2>
          </div>

          <div className="sheet-header__actions">
            <button
              type="button"
              className="icon-button"
              onClick={onClose}
              aria-label="ปิดหน้าต่าง"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>

        {/* Preset Selector Chips */}
        <div className="sheet-preset-chips-wrap">
          <div className="sheet-preset-chips">
            {presets.map((preset) => {
              const isPresetEnabled = preset.enabled !== false;
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`chip sheet-preset-chip ${
                    !isPresetEnabled ? 'sheet-preset-chip--off' : ''
                  }`}
                  aria-pressed={isSelected}
                  onClick={() => setActivePresetId(preset.id)}
                >
                  {preset.name} ({preset.rules.length})
                  {!isPresetEnabled && <span className="sheet-preset-off-label">· ปิด</span>}
                </button>
              );
            })}
            <button
              type="button"
              className="chip chip--action"
              onClick={() => {
                setIsCreatingPreset(true);
                setNewPresetName('');
              }}
            >
              <Icon name="plus" size={13} style={{ marginRight: '4px' }} />
              เพิ่มชุดใหม่
            </button>
          </div>
        </div>

        {/* Create New Preset Input Box */}
        {isCreatingPreset && (
          <form onSubmit={handleCreateNewPreset} className="sheet-create-form">
            <input
              type="text"
              placeholder="ชื่อชุดคำ เช่น วิชาละเมิด, อาญา ม.59..."
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="sheet-input"
              autoFocus
            />
            <div className="sheet-create-form__btns">
              <button type="submit" className="sheet-btn sheet-btn--primary">
                บันทึก
              </button>
              <button
                type="button"
                className="sheet-btn"
                onClick={() => setIsCreatingPreset(false)}
              >
                ยกเลิก
              </button>
            </div>
          </form>
        )}

        {/* Active Preset Header & Management */}
        {activePreset && !isCreatingPreset && (
          <div className="sheet-active-meta">
            {isEditingName ? (
              <form onSubmit={handleSaveEditedName} className="sheet-inline-edit">
                <input
                  type="text"
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  className="sheet-input"
                  autoFocus
                />
                <button type="submit" className="sheet-btn sheet-btn--primary">
                  บันทึก
                </button>
                <button
                  type="button"
                  className="sheet-btn"
                  onClick={() => setIsEditingName(false)}
                >
                  ยกเลิก
                </button>
              </form>
            ) : (
              <div className="sheet-active-title-row">
                <h3 className="sheet-active-name">{activePreset.name}</h3>

                <div className="sheet-active-actions">
                  <button
                    type="button"
                    className={`sheet-small-btn ${
                      activePreset.enabled !== false
                        ? 'sheet-small-btn--active'
                        : 'sheet-small-btn--muted'
                    }`}
                    onClick={() => {
                      togglePresetEnabled(activePreset.id);
                      showToast(
                        activePreset.enabled !== false
                          ? `ปิดใช้งานชุด "${activePreset.name}"`
                          : `เปิดใช้งานชุด "${activePreset.name}"`,
                      );
                    }}
                    title={
                      activePreset.enabled !== false
                        ? 'แตะเพื่อปิดใช้งานชุดนี้'
                        : 'แตะเพื่อเปิดใช้งานชุดนี้'
                    }
                  >
                    {activePreset.enabled !== false ? (
                      <>
                        <Icon name="check" size={13} />
                        เปิดใช้อยู่
                      </>
                    ) : (
                      'ปิดใช้อยู่'
                    )}
                  </button>
                  <button
                    type="button"
                    className="sheet-small-btn"
                    onClick={() => {
                      setIsEditingName(true);
                      setEditNameValue(activePreset.name);
                    }}
                    title="เปลี่ยนชื่อชุดคำ"
                  >
                    <Icon name="edit" size={13} />
                    แก้ไขชื่อ
                  </button>
                  <button
                    type="button"
                    className="sheet-small-btn"
                    onClick={() => {
                      duplicatePreset(activePreset.id);
                      showToast('คัดลอกสำเนาชุดคำแล้ว');
                    }}
                    title="คัดลอกชุดคำนี้"
                  >
                    ทำสำเนา
                  </button>
                  {presets.length > 1 && (
                    <button
                      type="button"
                      className="sheet-small-btn sheet-small-btn--danger"
                      onClick={handleDeleteActivePreset}
                      title="ลบชุดคำนี้"
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Word Form */}
        {activePreset && (
          <form onSubmit={handleAddRule} className="sheet-add-word-form">
            <div className="sheet-add-word-row">
              <input
                type="text"
                placeholder="พิมพ์คำที่ต้องการเน้น เช่น สัญญา, โมฆะ..."
                value={inputWord}
                onChange={(e) => setInputWord(e.target.value)}
                className="sheet-input sheet-input--grow"
              />
              <button
                type="submit"
                className="sheet-btn sheet-btn--primary sheet-btn--add"
                disabled={!inputWord.trim()}
              >
                <Icon name="plus" size={15} />
                เพิ่มคำ
              </button>
            </div>

            {/* Simultaneous Color & Underline Style Bar */}
            <div className="sheet-style-bar">
              {/* Color Swatches & Wheel (Left Half - Scrollable) */}
              <div
                ref={colorsGroupRef}
                className="sheet-style-group sheet-style-group--colors"
                role="group"
                aria-label="เลือกสี"
              >
                {/* Default Neon Swatches */}
                {COLOR_OPTIONS.map((c) => {
                  const isSelected = selectedColor === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`sheet-color-btn ${c.className} ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => handleSelectColor(c.id)}
                      aria-label={c.label}
                      aria-pressed={isSelected}
                    >
                      {isSelected && <Icon name="check" size={14} />}
                    </button>
                  );
                })}

                {/* User Saved Custom Colors */}
                {customColors.map((hex) => {
                  const isSelected = selectedColor === hex;
                  return (
                    <div key={hex} className="sheet-custom-color-wrap">
                      <button
                        type="button"
                        className={`sheet-color-btn ${isSelected ? 'is-selected' : ''}`}
                        style={{ backgroundColor: hex, color: getContrastTextColor(hex) }}
                        onClick={() => handleSelectColor(hex)}
                        aria-label={`สีที่กำหนดเอง ${hex}`}
                        aria-pressed={isSelected}
                      >
                        {isSelected && <Icon name="check" size={14} />}
                      </button>
                      <button
                        type="button"
                        className={`sheet-custom-color-del ${isSelected ? 'is-visible' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomColor(hex);
                        }}
                        title={`ลบสี ${hex}`}
                        aria-label={`ลบสี ${hex}`}
                      >
                        <Icon name="close" size={9} />
                      </button>
                    </div>
                  );
                })}

                {/* Color Wheel Button */}
                <label
                  className="sheet-color-wheel-btn"
                  title="เลือกสีใหม่ด้วยวงล้อสี"
                  aria-label="วงล้อสี"
                >
                  <input
                    type="color"
                    value={pickerColor}
                    onChange={handleCustomColorPicker}
                    className="sheet-color-wheel-input"
                    aria-label="วงล้อเลือกสี"
                  />
                </label>
              </div>

              {/* Center Divider Locked at Middle */}
              <div className="sheet-style-divider" />

              {/* Underline Style Buttons (Right Half) */}
              <div
                className="sheet-style-group sheet-style-group--lines"
                role="group"
                aria-label="เลือกรูปแบบเส้นใต้"
              >
                {/* Solid Underline */}
                <button
                  type="button"
                  className={`sheet-line-btn ${selectedUnderline === 'solid' ? 'is-selected' : ''}`}
                  onClick={() => handleSelectUnderline('solid')}
                  aria-label="ขีดเส้นใต้"
                  aria-pressed={selectedUnderline === 'solid'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3.5v7a6 6 0 0 0 12 0v-7" strokeWidth="2" />
                    <line x1="4" y1="20" x2="20" y2="20" strokeWidth="2" />
                  </svg>
                </button>

                {/* Double Underline */}
                <button
                  type="button"
                  className={`sheet-line-btn ${selectedUnderline === 'double' ? 'is-selected' : ''}`}
                  onClick={() => handleSelectUnderline('double')}
                  aria-label="เส้นใต้คู่"
                  aria-pressed={selectedUnderline === 'double'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3.5v7a6 6 0 0 0 12 0v-7" strokeWidth="2" />
                    <line x1="4" y1="18.5" x2="20" y2="18.5" strokeWidth="1.8" />
                    <line x1="4" y1="22" x2="20" y2="22" strokeWidth="1.8" />
                  </svg>
                </button>

                {/* Circle / Oval Outline */}
                <button
                  type="button"
                  className={`sheet-line-btn ${selectedUnderline === 'circle' ? 'is-selected' : ''}`}
                  onClick={() => handleSelectUnderline('circle')}
                  aria-label="วงรอบคำ"
                  aria-pressed={selectedUnderline === 'circle'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    {/* Centered U */}
                    <path d="M8.5 7.5v4a3.5 3.5 0 0 0 7 0v-4" strokeWidth="2" />
                    {/* Horizontal Oval / Capsule boundary surrounding U */}
                    <rect x="2" y="4" width="20" height="16" rx="8" strokeWidth="1.8" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Rules Word List in Current Preset */}
        <div className="sheet-rules-section">
          <div className="sheet-rules-heading">
            <span>คำที่ตั้งค่าไว้ ({activePreset?.rules.length || 0})</span>
          </div>

          {!activePreset || activePreset.rules.length === 0 ? (
            <div className="sheet-rules-empty">
              ยังไม่มีคำสำคัญในชุดนี้
            </div>
          ) : (
            <div className="sheet-rule-chips">
              {activePreset.rules.map((rule) => {
                const styles = getRuleStyles(rule);
                const classNames = getHighlightClassNames(styles.color, styles.underline);
                const customStyle = getCustomColorStyle(styles.color);

                return (
                  <div key={rule.id} className="sheet-rule-tag">
                    <span className={classNames} style={customStyle}>{rule.word}</span>
                    <button
                      type="button"
                      className="sheet-rule-remove"
                      onClick={() => {
                        removeRule(activePreset.id, rule.id);
                        showToast(`ลบคำว่า "${rule.word}" แล้ว`);
                      }}
                      aria-label={`ลบคำว่า ${rule.word}`}
                    >
                      <Icon name="close" size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sheet-footer">
          <button
            type="button"
            className="sheet-reset-btn"
            onClick={() => {
              if (window.confirm('ต้องการคืนค่าชุดคำสำคัญเริ่มต้นทั้งหมดใช่หรือไม่?')) {
                resetToDefaults();
                showToast('คืนค่าชุดคำสำคัญเริ่มต้นเรียบร้อย');
              }
            }}
          >
            คืนค่าเริ่มต้น
          </button>
        </div>
      </div>
    </div>
  );
}

