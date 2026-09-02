import type { MouseEvent } from 'react';
import { Icon } from '@/components/Icon';
import { useLibrary } from '@/store/LibraryContext';
import type { BookmarkKind } from '@/types/law';

interface BookmarkButtonProps {
  kind: BookmarkKind;
  id: string;
  /** ข้อความเสริม (deprecated) */
  addedMessage?: string;
}

export function BookmarkButton({ kind, id }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useLibrary();
  const active = isBookmarked(kind, id);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    toggleBookmark(kind, id);
  };

  return (
    <button
      type="button"
      className={`bookmark-button ${active ? 'is-active' : ''}`}
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? 'ลบออกจากรายการบันทึก' : 'บันทึกไว้อ่านภายหลัง'}
    >
      <Icon name={active ? 'bookmarkFilled' : 'bookmark'} size={19} />
    </button>
  );
}
