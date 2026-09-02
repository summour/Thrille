import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BookmarkButton } from '@/components/BookmarkButton';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DecisionRow } from '@/components/DecisionRow';
import { EmptyState } from '@/components/EmptyState';
import { HighlightManagerSheet } from '@/components/HighlightManagerSheet';
import { Icon } from '@/components/Icon';
import { PrevNextBar } from '@/components/PrevNextBar';
import { SectionHeading } from '@/components/SectionHeading';
import { SmartArticleText } from '@/components/SmartArticleText';
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
import { useHighlight } from '@/store/HighlightContext';
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

  const { markAsRead, toggleBookmark } = useLibrary();
  const { cycleFontScale, fontScaleLabel } = useTheme();
  const { showToast } = useToast();
  const { activeRules, isEnabled, activePreset } = useHighlight();

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [isHighlightSheetOpen, setIsHighlightSheetOpen] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const isHorizontalSwipeRef = useRef(false);
  const isVerticalScrollRef = useRef(false);

  const handleDoubleTap = () => {
    if (!article) return;
    toggleBookmark('article', article.id);
  };

  const node = article ? getArticleNode(article.id, resolvedLawId) : undefined;
  const decisions = article ? getDecisionsForArticle(article.id) : [];
  const { previous, next } = article
    ? getAdjacentArticleIds(article.id, resolvedLawId)
    : { previous: undefined, next: undefined };

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
    const { previous: prevArt, next: nextArt } = getAdjacentArticleIds(article.id, resolvedLawId);

    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowLeft' && prevArt) {
        navigate(routes.article(prevArt, resolvedLawId));
      } else if (e.key === 'ArrowRight' && nextArt) {
        navigate(routes.article(nextArt, resolvedLawId));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [article, resolvedLawId, navigate]);

  if (!article) return <NotFoundPage message={`ไม่พบมาตรา ${articleId} ในฐานข้อมูล`} />;

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
      let effectiveDx = dx;
      if (dx > 0 && !previous) {
        effectiveDx = dx * 0.22;
      } else if (dx < 0 && !next) {
        effectiveDx = dx * 0.22;
      }
      setDragX(effectiveDx);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndPos = e.changedTouches?.[0];
    const isTap =
      touchStartRef.current &&
      !isHorizontalSwipeRef.current &&
      !isVerticalScrollRef.current &&
      touchEndPos &&
      Math.hypot(
        touchEndPos.clientX - touchStartRef.current.x,
        touchEndPos.clientY - touchStartRef.current.y,
      ) < 18;

    if (isTap && touchEndPos) {
      const now = Date.now();
      if (
        lastTapRef.current &&
        now - lastTapRef.current.time < 320 &&
        Math.hypot(
          touchEndPos.clientX - lastTapRef.current.x,
          touchEndPos.clientY - lastTapRef.current.y,
        ) < 40
      ) {
        handleDoubleTap();
        lastTapRef.current = null;
      } else {
        lastTapRef.current = { time: now, x: touchEndPos.clientX, y: touchEndPos.clientY };
      }
    }

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
      setExitDirection('right');
      setTimeout(() => {
        navigate(routes.article(previous, resolvedLawId));
      }, 150);
    } else if (dragX < 0 && isThresholdPassed && next) {
      setExitDirection('left');
      setTimeout(() => {
        navigate(routes.article(next, resolvedLawId));
      }, 150);
    } else {
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
        backTo={node ? routes.node(node.id, resolvedLawId) : routes.toc(resolvedLawId)}
        actions={
          <>
            <button
              type="button"
              className={`icon-button ${
                isEnabled && activeRules.length > 0 ? 'icon-button--active' : ''
              }`}
              onClick={() => setIsHighlightSheetOpen(true)}
              aria-label="ตั้งค่าคำสำคัญและไฮไลท์"
              title={
                activePreset
                  ? `ชุดคำสำคัญ: ${activePreset.name} (${activeRules.length} คำ)`
                  : 'ตั้งค่าคำสำคัญช่วยจำ'
              }
            >
              <Icon name="highlighter" size={19} />
            </button>
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
        onDoubleClick={handleDoubleTap}
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
              <p key={index}>
                <SmartArticleText
                  text={paragraph}
                  rules={activeRules}
                  enabled={isEnabled}
                />
              </p>
            ))}
            {article.note ? (
              <p className="article-note">
                <SmartArticleText
                  text={article.note}
                  rules={activeRules}
                  enabled={isEnabled}
                />
              </p>
            ) : null}
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

      <HighlightManagerSheet
        isOpen={isHighlightSheetOpen}
        onClose={() => setIsHighlightSheetOpen(false)}
      />
    </>
  );
}

