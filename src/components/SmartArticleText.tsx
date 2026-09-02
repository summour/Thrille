import { Fragment, useMemo } from 'react';
import {
  getCustomColorStyle,
  getHighlightClassNames,
  parseHighlightedText,
} from '@/lib/highlighter';
import type { KeywordRule } from '@/types/highlight';

interface SmartArticleTextProps {
  text: string;
  rules?: KeywordRule[];
  enabled?: boolean;
}

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
        if (!seg.isMatch || (!seg.color && !seg.underline)) {
          return <Fragment key={idx}>{seg.text}</Fragment>;
        }

        const className = getHighlightClassNames(seg.color ?? null, seg.underline ?? null);
        const style = getCustomColorStyle(seg.color);

        return (
          <mark key={idx} className={className} style={style} data-word={seg.word}>
            {seg.text}
          </mark>
        );
      })}
    </>
  );
}

