import { Fragment } from 'react';

interface HighlightProps {
  text: string;
  query?: string;
}

/** เน้นคำค้นในผลลัพธ์ โดยไม่ใช้ dangerouslySetInnerHTML */
export function Highlight({ text, query }: HighlightProps) {
  const needle = query?.trim();
  if (!needle) return <>{text}</>;

  const parts: { value: string; match: boolean }[] = [];
  const lowerText = text.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  let cursor = 0;

  for (;;) {
    const index = lowerText.indexOf(lowerNeedle, cursor);
    if (index === -1) break;
    if (index > cursor) parts.push({ value: text.slice(cursor, index), match: false });
    parts.push({ value: text.slice(index, index + needle.length), match: true });
    cursor = index + needle.length;
  }
  parts.push({ value: text.slice(cursor), match: false });

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>{part.match ? <mark>{part.value}</mark> : part.value}</Fragment>
      ))}
    </>
  );
}