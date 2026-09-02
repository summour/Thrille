export type PresetHighlightColor = 'yellow' | 'green' | 'blue' | 'pink';
export type HighlightColor = PresetHighlightColor | string;
export type UnderlineStyle = 'solid' | 'bold' | 'double';

export type HighlightStyle =
  | HighlightColor
  | 'underline'
  | 'underline-bold'
  | 'underline-double'
  | `${PresetHighlightColor}+underline`
  | `${PresetHighlightColor}+underline-bold`
  | `${PresetHighlightColor}+underline-double`;

export interface KeywordRule {
  id: string;
  word: string;
  color?: HighlightColor | null;
  underline?: UnderlineStyle | null;
  style?: HighlightStyle;
}

export interface KeywordPreset {
  id: string;
  name: string;
  description?: string;
  rules: KeywordRule[];
  createdAt: number;
}

