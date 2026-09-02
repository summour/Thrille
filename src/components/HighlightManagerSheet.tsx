import { useState, type FormEvent } from 'react';
import { Icon } from '@/components/Icon';
import { useHighlight } from '@/store/HighlightContext';
import { useToast } from '@/store/ToastContext';
import type { HighlightStyle } from '@/types/highlight';

interface HighlightManagerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialWord?: string;
}

const STYLE_OPTIONS: { id: HighlightStyle; label: string; previewClass: string }[] = [
  { id: 'yellow', label: 'เหลือง', previewClass: 'hl hl--yellow' },
  { id: 'green', label: 'เขียว', previewClass: 'hl hl--green' },
  { id: 'blue', label: 'ฟ้า', previewClass: 'hl hl--blue' },
  { id: 'pink', label: 'ชมพู', previewClass: 'hl hl--pink' },
  { id: 'underline', label: 'ขีดเส้นใต้', previewClass: 'hl hl--underline' },
  { id: 'underline-bold', label: 'เส้นใต้หนา', previewClass: 'hl hl--underline-bold' },
  { id: 'underline-double', label: 'เส้นคู่', previewClass: 'hl hl--underline-double' },
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
    isEnabled,
    toggleEnabled,
    setActivePresetId,
    createPreset,
    updatePreset,
    deletePreset,
    duplicatePreset,
    addRule,
    removeRule,
    resetToDefaults,
  } = useHighlight();

  const { showToast } = useToast();

  const [inputWord, setInputWord] = useState(initialWord);
  const [selectedStyle, setSelectedStyle] = useState<HighlightStyle>('yellow');
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  if (!isOpen) return null;

  const handleAddRule = (e: FormEvent) => {
    e.preventDefault();
    const word = inputWord.trim();
    if (!word) return;

    if (!activePreset) {
      // ถ้ายังไม่มีชุดที่เลือก ให้สร้างขึ้นมาใหม่อัตโนมัติ
      const p = createPreset('ชุดคำสำคัญของฉัน');
      addRule(p.id, word, selectedStyle);
    } else {
      addRule(activePreset.id, word, selectedStyle);
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
            <h2 className="sheet-header__title">ชุดคำสำคัญช่วยจำ</h2>
          </div>

          <div className="sheet-header__actions">
            <button
              type="button"
              className={`sheet-toggle-btn ${isEnabled ? 'is-active' : ''}`}
              onClick={toggleEnabled}
              title={isEnabled ? 'ปิดการไฮไลท์' : 'เปิดการไฮไลท์'}
            >
              {isEnabled ? 'เปิดใช้งานอยู่' : 'ปิดใช้งาน'}
            </button>
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
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="chip"
                aria-pressed={activePresetId === preset.id}
                onClick={() => setActivePresetId(preset.id)}
              >
                {preset.name} ({preset.rules.length})
              </button>
            ))}
            <button
              type="button"
              className="chip chip--action"
              onClick={() => {
                setIsCreatingPreset(true);
                setNewPresetName('');
              }}
            >
              <Icon name="plus" size={13} style={{ marginRight: '4px' }} />
              เพิ่มชุดวิชาใหม่
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
                <div>
                  <h3 className="sheet-active-name">{activePreset.name}</h3>
                  {activePreset.description ? (
                    <p className="sheet-active-desc">{activePreset.description}</p>
                  ) : null}
                </div>
                <div className="sheet-active-actions">
                  <button
                    type="button"
                    className="sheet-small-btn"
                    onClick={() => {
                      setIsEditingName(true);
                      setEditNameValue(activePreset.name);
                    }}
                    title="เปลี่ยนชื่อชุดคำ"
                  >
                    <Icon name="edit" size={14} />
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
                      <Icon name="trash" size={14} />
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
                placeholder="พิมพ์คำที่ต้องการเน้น (เช่น สัญญา, โมฆะ)..."
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

            {/* Style Selector Chips */}
            <div className="sheet-style-selector">
              <span className="sheet-style-label">เลือกสไตล์:</span>
              <div className="sheet-style-options">
                {STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`sheet-style-chip ${
                      selectedStyle === opt.id ? 'is-selected' : ''
                    }`}
                    onClick={() => setSelectedStyle(opt.id)}
                  >
                    <span className={opt.previewClass}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* Rules Word List in Current Preset */}
        <div className="sheet-rules-section">
          <div className="sheet-rules-heading">
            <span>คำที่ตั้งค่าไว้ในชุดนี้ ({activePreset?.rules.length || 0})</span>
            {activePreset && activePreset.rules.length > 0 && (
              <span className="sheet-rules-sub">แตะที่เครื่องหมายกากบาทเพื่อลบคำ</span>
            )}
          </div>

          {!activePreset || activePreset.rules.length === 0 ? (
            <div className="sheet-rules-empty">
              ยังไม่มีคำสำคัญในชุดนี้ พิมพ์คำและเลือกสไตล์ด้านบนเพื่อเพิ่มคำ
            </div>
          ) : (
            <div className="sheet-rule-chips">
              {activePreset.rules.map((rule) => {
                const styleOpt =
                  STYLE_OPTIONS.find((s) => s.id === rule.style) || STYLE_OPTIONS[0];

                return (
                  <div key={rule.id} className="sheet-rule-tag">
                    <span className={styleOpt.previewClass}>{rule.word}</span>
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

        {/* Footer info */}
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
          <span className="sheet-footer__hint">
            คำที่ตั้งไว้จะถูกไฮไลท์อัตโนมัติขณะเปิดอ่านตัวบทกฎหมาย
          </span>
        </div>
      </div>
    </div>
  );
}
