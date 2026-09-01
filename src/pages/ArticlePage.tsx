import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BookmarkButton } from '@/components/BookmarkButton';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DecisionRow } from '@/components/DecisionRow';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { PrevNextBar } from '@/components/PrevNextBar';
import { SectionHeading } from '@/components/SectionHeading';
import { PageHeader } from '@/layouts/PageHeader';
import { nodeLabel } from '@/lib/format';
import {
  getAdjacentArticleIds,
  getArticle,
  getArticleNode,
  getDecisionsForArticle,
  getLawIdForArticle,
  getLawMeta,
} from '@/lib/lawIndex';
import { routes } from '@/navigation/routes';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useLibrary } from '@/store/LibraryContext';
import { useTheme } from '@/store/ThemeContext';
import { useToast } from '@/store/ToastContext';

export function ArticlePage() {
  const { articleId = '' } = useParams<{ articleId: string }>();
  const [searchParams] = useSearchParams();
  const lawIdParam = searchParams.get('law') || undefined;
  const navigate = useNavigate();

  const resolvedLawId = getLawIdForArticle(articleId, lawIdParam);
  const law = getLawMeta(resolvedLawId);
  const article = getArticle(articleId, resolvedLawId);

  const { markAsRead } = useLibrary();
  const { cycleFontScale, fontScaleLabel } = useTheme();
  const { showToast } = useToast();

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isHorizontalSwipeRef = useRef(false);
  const isVerticalScrollRef = useRef(false);

  useEffect(() => {
    if (article) markAsRead(article.id);
    // Reset swipe state when article changes
    setDragX(0);
    setIsDragging(false);
    setIsAnimating(false);
    setExitDirection(null);
    window.scrollTo({ top: 0 });
  }, [article, markAsRead]);

  // Keyboard navigation for desktop: Left arrow (prev), Right arrow (next)
  useEffect(() => {
    if (!article) return;
    const { previous, next } = getAdjacentArticleIds(article.id, resolvedLawId);

    const onKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is focused on an input/search
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowLeft' && previous) {
        navigate(routes.article(previous, resolvedLawId));
      } else if (e.key === 'ArrowRight' && next) {
        navigate(routes.article(next, resolvedLawId));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [article, resolvedLawId, navigate]);

  if (!article) return <NotFoundPage message={`ไม่พบมาตรา ${articleId} ในฐานข้อมูล`} />;

  const node = getArticleNode(article.id, resolvedLawId);
  const decisions = getDecisionsForArticle(article.id);
  const { previous, next } = getAdjacentArticleIds(article.id, resolvedLawId);

  const handleFontScale = () => {
    cycleFontScale();
    showToast(`ขนาดตัวอักษร: ${fontScaleLabel}`);
  };

  // --- Touch Swipe Handlers ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (exitDirection) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    isHorizontalSwipeRef.current = false;
    isVerticalScrollRef.current = false;
    setIsAnimating(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || isVerticalScrollRef.current || exitDirection) return;

    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (!isHorizontalSwipeRef.current) {
      if (Math.abs(dy) > 7 && Math.abs(dy) > Math.abs(dx)) {
        isVerticalScrollRef.current = true;
        return;
      }
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        isHorizontalSwipeRef.current = true;
        setIsDragging(true);
      }
    }

    if (isHorizontalSwipeRef.current) {
      // Apply rubber-band effect if at start/end of law
      let effectiveDx = dx;
      if (dx > 0 && !previous) {
        effectiveDx = dx * 0.22;
      } else if (dx < 0 && !next) {
        effectiveDx = dx * 0.22;
      }
      setDragX(effectiveDx);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || isVerticalScrollRef.current || !isHorizontalSwipeRef.current || exitDirection) {
      touchStartRef.current = null;
      isHorizontalSwipeRef.current = false;
      isVerticalScrollRef.current = false;
      return;
    }

    const elapsed = Date.now() - touchStartRef.current.time;
    const isQuickFlick = elapsed < 280 && Math.abs(dragX) > 35;
    const isThresholdPassed = Math.abs(dragX) > 70 || isQuickFlick;

    if (dragX > 0 && isThresholdPassed && previous) {
      // Swipe Right -> ไปมาตราก่อนหน้า
      setExitDirection('right');
      setTimeout(() => {
        navigate(routes.article(previous, resolvedLawId));
      }, 150);
    } else if (dragX < 0 && isThresholdPassed && next) {
      // Swipe Left -> ไปมาตราถัดไป
      setExitDirection('left');
      setTimeout(() => {
        navigate(routes.article(next, resolvedLawId));
      }, 150);
    } else {
      // Snap back smoothly
      setIsAnimating(true);
      setIsDragging(false);
      setDragX(0);
    }

    touchStartRef.current = null;
    isHorizontalSwipeRef.current = false;
    isVerticalScrollRef.current = false;
  };

  const cardStyle: React.CSSProperties = {
    transform:
      exitDirection === 'left'
        ? 'translateX(-120%) rotate(-10deg)'
        : exitDirection === 'right'
        ? 'translateX(120%) rotate(10deg)'
        : isDragging || dragX !== 0
        ? `translateX(${dragX}px) rotate(${dragX * 0.025}deg)`
        : 'none',
    opacity:
      exitDirection
        ? 0
        : isDragging && Math.abs(dragX) > 0
        ? Math.max(0.65, 1 - Math.abs(dragX) / 500)
        : 1,
  };

  const activeSwipeDirection: 'prev' | 'next' | null =
    exitDirection === 'right' || (isDragging && dragX > 20)
      ? 'prev'
      : exitDirection === 'left' || (isDragging && dragX < -20)
      ? 'next'
      : null;

  return (
    <>
      <PageHeader
        title={`มาตรา ${article.id}`}
        actions={
          <>
            <button
              type="button"
              className="icon-button icon-button--text"
              onClick={handleFontScale}
              aria-label="ปรับขนาดตัวอักษร"
            >
              ก
            </button>
            <BookmarkButton
              kind="article"
              id={article.id}
              addedMessage={`บันทึกมาตรา ${article.id} (${law.code})`}
            />
          </>
        }
      />

      <main
        className="page page--reader"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div
          className={`swipe-card-wrapper ${isAnimating ? 'is-animating' : ''} ${
            exitDirection === 'left'
              ? 'is-exiting-left'
              : exitDirection === 'right'
              ? 'is-exiting-right'
              : ''
          }`}
          style={cardStyle}
        >
          {node ? <Breadcrumbs nodeId={node.id} current={`มาตรา ${article.id}`} /> : null}

          <div className="article-head">
            <p className="article-number">
              มาตรา {article.id}
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--muted)',
                  marginLeft: '8px',
                }}
              >
                {law.code}
              </span>
            </p>
            {node ? (
              <Link to={routes.node(node.id, resolvedLawId)} className="article-location">
                {nodeLabel(node)}
                <Icon name="chevronRight" size={13} />
              </Link>
            ) : null}
          </div>

          <article className="article-body">
            {article.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {article.note ? <p className="article-note">{article.note}</p> : null}
          </article>

          {/* ส่วนฎีกา แยกจากตัวบทด้วยเส้นคั่นหนา เพื่อไม่ให้ผู้ใช้สับสนว่าเป็นตัวบท */}
          <SectionHeading
            title="ฎีกาที่เกี่ยวข้อง"
            meta={decisions.length > 0 ? `${decisions.length} รายการ` : 'ยังไม่มีข้อมูล'}
            divider
          />
          {decisions.length > 0 ? (
            <div className="list">
              {decisions.map((decision) => (
                <DecisionRow key={decision.id} decision={decision} />
              ))}
            </div>
          ) : (
            <EmptyState>
              ยังไม่มีคำพิพากษาฎีกาที่เชื่อมกับมาตรานี้
              <br />
              ส่วนนี้เตรียมไว้สำหรับข้อมูลที่จะเพิ่มในอนาคต
            </EmptyState>
          )}

          <p className="readonly-note">
            ตัวบทกฎหมายและคำพิพากษาเป็นข้อมูลอ่านอย่างเดียว · แก้ไขไม่ได้
          </p>
        </div>
      </main>

      <PrevNextBar
        previousArticleId={previous}
        nextArticleId={next}
        activeDirection={activeSwipeDirection}
      />
    </>
  );
}
