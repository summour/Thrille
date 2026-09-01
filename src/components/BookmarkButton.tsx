import type { MouseEvent } from 'react';
import { Icon } from '@/components/Icon';
import { useLibrary } from '@/store/LibraryContext';
import { useToast } from '@/store/ToastContext';
import type { BookmarkKind } from '@/types/law';

interface BookmarkButtonProps {
  kind: BookmarkKind;
  id: string;
  /** ข้อความ toast ตอนบันทึกสำเร็จ */
  addedMessage?: string;
}

export function BookmarkButton({ kind, id, addedMessage }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useLibrary();
  const { showToast } = useToast();
  const active = isBookmarked(kind, id);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const added = toggleBookmark(kind, id);
    showToast(added ? (addedMessage ?? 'บันทึกแล้ว') : 'ลบบุ๊กมาร์กแล้ว');
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