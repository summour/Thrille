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
import { type LawSpeechState, speechReader } from '@/lib/speech';
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

  const { markAsRead, toggleBookmark } = useLibrary();
  const { cycleFontScale, fontScaleLabel } = useTheme();
  const { showToast } = useToast();

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  const [speechState, setSpeechState] = useState<LawSpeechState>(speechReader.getState());

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const isHorizontalSwipeRef = useRef(false);
  const isVerticalScrollRef = useRef(false);

  useEffect(() => {
    const unsubscribe = speechReader.subscribe((state) => {
      setSpeechState(state);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // เมื่อระบบอ่านเบื้องหลังเปลี่ยนไปยังมาตราถัดไป ให้ปรับหน้าจอตามสิ่งที่กำลังอ่าน
  useEffect(() => {
    if (
      speechState.isPlaying &&
      speechState.currentArticleId &&
      speechState.currentArticleId !== articleId &&
      speechState.currentLawId === resolvedLawId
    ) {
      navigate(routes.article(speechState.currentArticleId, speechState.currentLawId), {
        replace: true,
      });
    }
  }, [
    speechState.isPlaying,
    speechState.currentArticleId,
    speechState.currentLawId,
    articleId,
    resolvedLawId,
    navigate,
  ]);

  const handleDoubleTap = () => {
    if (!article) return;
    toggleBookmark('article', article.id);
  };

  const node = article ? getArticleNode(article.id, resolvedLawId) : undefined;
  const decisions = article ? getDecisionsForArticle(article.id) : [];
  const { previous, next } = article
    ? getAdjacentArticleIds(article.id, resolvedLawId)
    : { previous: undefined, next: undefined };

  const isSpeakingCurrent =
    speechState.isPlaying && speechState.currentArticleId === articleId;

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

  const handleToggleSpeech = () => {
    if (!article) return;
    if (isSpeakingCurrent) {
      speechReader.stop();
    } else {
      speechReader.setAutoPlay(true);
      speechReader.playArticle(article.id, resolvedLawId);
    }
  };

  const handleCycleSpeechRate = () => {
    const nextRate = speechState.rate === 1.0 ? 1.25 : speechState.rate === 1.25 ? 1.5 : 1.0;
    speechReader.setRate(nextRate);
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
              className={`icon-button ${isSpeakingCurrent ? 'icon-button--active' : ''}`}
              onClick={handleToggleSpeech}
              aria-label={isSpeakingCurrent ? 'หยุดอ่าน' : 'อ่านออกเสียงมาตรานี้'}
              title={isSpeakingCurrent ? 'หยุดอ่าน' : 'อ่านออกเสียงมาตรานี้ (เล่นเบื้องหลังได้)'}
            >
              <Icon name={isSpeakingCurrent ? 'volume' : 'volumeOff'} size={20} />
            </button>
            {isSpeakingCurrent && (
              <button
                type="button"
                className="icon-button icon-button--text"
                onClick={handleCycleSpeechRate}
                aria-label={`ความเร็วเสียงอ่าน ${speechState.rate} เท่า`}
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                {speechState.rate}x
              </button>
            )}
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

