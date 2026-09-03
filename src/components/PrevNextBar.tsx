import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { routes } from '@/navigation/routes';

interface PrevNextBarProps {
  previousArticleId?: string;
  nextArticleId?: string;
  activeDirection?: 'prev' | 'next' | null;
  lawId?: string;
}

/** อ่านต่อเนื่องได้โดยไม่ต้องย้อนกลับไปหน้าสารบัญ */
export function PrevNextBar({
  previousArticleId,
  nextArticleId,
  activeDirection,
  lawId,
}: PrevNextBarProps) {
  return (
    <div className="prevnext">
      {previousArticleId ? (
        <Link
          to={routes.article(previousArticleId, lawId)}
          className={`prevnext__button ${activeDirection === 'prev' ? 'is-swipe-active' : ''}`}
        >
          <Icon name="chevronLeft" size={15} />
          <span>
            ก่อนหน้า <b>{previousArticleId === 'คำปรารภ' ? 'คำปรารภ' : `ม.${previousArticleId}`}</b>
          </span>
        </Link>
      ) : (
        <span className={`prevnext__button is-disabled ${activeDirection === 'prev' ? 'is-swipe-active' : ''}`}>
          <Icon name="chevronLeft" size={15} />
          <span>ต้นประมวล</span>
        </span>
      )}
      <span className="prevnext__divider" />
      {nextArticleId ? (
        <Link
          to={routes.article(nextArticleId, lawId)}
          className={`prevnext__button prevnext__button--next ${activeDirection === 'next' ? 'is-swipe-active' : ''}`}
        >
          <span>
            ถัดไป <b>{nextArticleId === 'คำปรารภ' ? 'คำปรารภ' : `ม.${nextArticleId}`}</b>
          </span>
          <Icon name="chevronRight" size={15} />
        </Link>
      ) : (
        <span className={`prevnext__button prevnext__button--next is-disabled ${activeDirection === 'next' ? 'is-swipe-active' : ''}`}>
          <span>ท้ายประมวล</span>
          <Icon name="chevronRight" size={15} />
        </span>
      )}
    </div>
  );
}