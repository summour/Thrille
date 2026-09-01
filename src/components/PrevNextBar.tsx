import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { routes } from '@/navigation/routes';

interface PrevNextBarProps {
  previousArticleId?: string;
  nextArticleId?: string;
}

/** อ่านต่อเนื่องได้โดยไม่ต้องย้อนกลับไปหน้าสารบัญ */
export function PrevNextBar({ previousArticleId, nextArticleId }: PrevNextBarProps) {
  return (
    <div className="prevnext">
      {previousArticleId ? (
        <Link to={routes.article(previousArticleId)} className="prevnext__button">
          <Icon name="chevronLeft" size={15} />
          <span>ก่อนหน้า <b>ม.{previousArticleId}</b></span>
        </Link>
      ) : (
        <span className="prevnext__button is-disabled">
          <Icon name="chevronLeft" size={15} />
          <span>ต้นประมวล</span>
        </span>
      )}
      <span className="prevnext__divider" />
      {nextArticleId ? (
        <Link to={routes.article(nextArticleId)} className="prevnext__button prevnext__button--next">
          <span>ถัดไป <b>ม.{nextArticleId}</b></span>
          <Icon name="chevronRight" size={15} />
        </Link>
      ) : (
        <span className="prevnext__button prevnext__button--next is-disabled">
          <span>ท้ายประมวล</span>
          <Icon name="chevronRight" size={15} />
        </span>
      )}
    </div>
  );
}