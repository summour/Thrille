import { Fragment, useMemo } from 'react';
import { parseHighlightedText } from '@/lib/highlighter';
import type { HighlightStyle, KeywordRule } from '@/types/highlight';

interface SmartArticleTextProps {
  text: string;
  rules?: KeywordRule[];
  enabled?: boolean;
}

const STYLE_CLASS_MAP: Record<HighlightStyle, string> = {
  yellow: 'hl hl--yellow',
  green: 'hl hl--green',
  blue: 'hl hl--blue',
  pink: 'hl hl--pink',
  underline: 'hl hl--underline',
  'underline-bold': 'hl hl--underline-bold',
  'underline-double': 'hl hl--underline-double',
};

export function SmartArticleText({
  text,
  rules = [],
  enabled = true,
}: SmartArticleTextProps) {
  const segments = useMemo(() => {
    return parseHighlightedText(text, rules, enabled);
  }, [text, rules, enabled]);

  if (segments.length === 1 && !segments[0].isMatch) {
    return <>{text}</>;
  }

  return (
    <>
      {segments.map((seg, idx) => {
        if (!seg.isMatch || !seg.style) {
          return <Fragment key={idx}>{seg.text}</Fragment>;
        }

        const className = STYLE_CLASS_MAP[seg.style] || 'hl hl--yellow';

        return (
          <mark key={idx} className={className} data-word={seg.word}>
            {seg.text}
          </mark>
        );
      })}
    </>
  );
}
