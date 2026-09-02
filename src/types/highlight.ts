export type HighlightStyle =
  | 'yellow'
  | 'green'
  | 'blue'
  | 'pink'
  | 'underline'
  | 'underline-bold'
  | 'underline-double';

export interface KeywordRule {
  id: string;
  word: string;
  style: HighlightStyle;
}

export interface KeywordPreset {
  id: string;
  name: string;
  description?: string;
  rules: KeywordRule[];
  createdAt: number;
}
