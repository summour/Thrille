import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArticleRow } from '@/components/ArticleRow';
import { DecisionRow } from '@/components/DecisionRow';
import { FilterChips } from '@/components/FilterChips';
import { Highlight } from '@/components/Highlight';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/layouts/PageHeader';
import { nodeLabel, nodeShortLabel } from '@/lib/format';
import { getLawIdForNode, getLawMeta, getNodePath } from '@/lib/lawIndex';
import { searchAll, type SearchScope } from '@/lib/search';
import { routes } from '@/navigation/routes';

const ARTICLE_PAGE_SIZE = 40;
const NODE_PAGE_SIZE = 30;

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initialQuery = params.get('q') ?? '';
  const [inputValue, setInputValue] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [scope, setScope] = useState<SearchScope>('all');
  const [visibleArticleCount, setVisibleArticleCount] = useState(ARTICLE_PAGE_SIZE);
  const [visibleNodeCount, setVisibleNodeCount] = useState(NODE_PAGE_SIZE);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce การค้นหาเพื่อให้การพิมพ์บนคีย์บอร์ดมือถือลื่นไหล 60fps ไม่ค้าง
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [inputValue]);

  // รีเซ็ตการแบ่งหน้าเมื่อคำค้นหาเปลี่ยน
  useEffect(() => {
    setVisibleArticleCount(ARTICLE_PAGE_SIZE);
    setVisibleNodeCount(NODE_PAGE_SIZE);
  }, [debouncedQuery]);

  // เก็บคำค้นไว้ใน URL อย่างปลอดภัย ไม่รบกวนจังหวะการพิมพ์
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = debouncedQuery.trim();
      const currentQ = params.get('q') ?? '';
      if (trimmed !== currentQ) {
        setParams(trimmed ? { q: trimmed } : {}, { replace: true });
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [debouncedQuery, params, setParams]);

  // ใช้ deferred value เพื่อให้ React จัดการเรนเดอร์ผลลัพธ์เป็น non-blocking background task
  const deferredQuery = useDeferredValue(debouncedQuery);
  const results = useMemo(() => searchAll(deferredQuery), [deferredQuery]);
  const trimmed = deferredQuery.trim();

  const handleClear = useCallback(() => {
    setInputValue('');
    setDebouncedQuery('');
    inputRef.current?.focus();
  }, []);

  const show = (target: SearchScope) => scope === 'all' || scope === target;

  const visibleArticles = results.articleItems.slice(0, visibleArticleCount);
  const hasMoreArticles = results.articleItems.length > visibleArticleCount;
  const remainingArticles = results.articleItems.length - visibleArticleCount;

  const visibleNodes = results.nodes.slice(0, visibleNodeCount);
  const hasMoreNodes = results.nodes.length > visibleNodeCount;
  const remainingNodes = results.nodes.length - visibleNodeCount;

  return (
    <>
      <PageHeader title="ค้นหา" showBack={false} />

      <div className="search-bar">
        <div className="search-bar__inner">
          <input
            ref={inputRef}
            type="search"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="เลขมาตรา · คำสำคัญ · ชื่อหมวด/ส่วน · เลขฎีกา"
            aria-label="ช่องค้นหา"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          {inputValue ? (
            <button
              type="button"
              className="search-bar__clear"
              onClick={handleClear}
              aria-label="ล้างข้อความค้นหา"
            >
              <Icon name="close" size={13} />
            </button>
          ) : null}
        </div>
      </div>

      <FilterChips
        ariaLabel="กรองผลการค้นหา"
        value={scope}
        onChange={setScope}
        options={[
          { value: 'all', label: 'ทั้งหมด' },
          { value: 'article', label: `มาตรา${trimmed ? ` ${results.articleItems.length}` : ''}` },
          { value: 'decision', label: `ฎีกา${trimmed ? ` ${results.decisions.length}` : ''}` },
          { value: 'node', label: `สารบัญ${trimmed ? ` ${results.nodes.length}` : ''}` },
        ]}
      />

      <main className="page">
        {!trimmed ? (
          <p className="note note--hint">
            ค้นหาได้จาก
            <br />
            <b>เลขมาตรา</b> เช่น 150, 288, 55
            <br />
            <b>คำสำคัญในตัวบท</b> เช่น สุจริต, โมฆะ, เจตนา, ฟ้องร้อง
            <br />
            <b>ชื่อหมวด/ส่วน</b> เช่น นิติกรรม, ซื้อขาย, ความผิดเกี่ยวกับชีวิต
            <br />
            <b>เลขฎีกา</b> เช่น 1234/2565
          </p>
        ) : results.total === 0 ? (
          <p className="note">ไม่พบผลลัพธ์สำหรับ “{trimmed}”</p>
        ) : (
          <>
            {show('article') && results.articleItems.length > 0 && (
              <>
                <p className="eyebrow">มาตรา · {results.articleItems.length}</p>
                <div className="list">
                  {visibleArticles.map((item) => (
                    <ArticleRow
                      key={`${item.lawId}-${item.id}`}
                      articleId={item.id}
                      lawId={item.lawId}
                      showLawCode
                      query={trimmed}
                    />
                  ))}
                  {hasMoreArticles && (
                    <button
                      type="button"
                      className="load-more-row"
                      onClick={() => setVisibleArticleCount((prev) => prev + ARTICLE_PAGE_SIZE)}
                    >
                      แสดงอีก {Math.min(ARTICLE_PAGE_SIZE, remainingArticles)} มาตรา (เหลือ {remainingArticles})
                    </button>
                  )}
                </div>
              </>
            )}

            {show('decision') && results.decisions.length > 0 && (
              <>
                <p className="eyebrow">ฎีกา · {results.decisions.length}</p>
                <div className="list">
                  {results.decisions.map((decision) => (
                    <DecisionRow key={decision.id} decision={decision} query={trimmed} />
                  ))}
                </div>
              </>
            )}

            {show('node') && results.nodes.length > 0 && (
              <>
                <p className="eyebrow">สารบัญ · {results.nodes.length}</p>
                <div className="list">
                  {visibleNodes.map((node) => {
                    const parents = getNodePath(node.id).slice(0, -1);
                    const lawId = getLawIdForNode(node.id);
                    const law = getLawMeta(lawId);

                    return (
                      <div className="row" key={node.id}>
                        <Link to={routes.node(node.id, lawId)} className="row__main">
                          <span className="row__title">
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: 'var(--muted)',
                                marginRight: '6px',
                              }}
                            >
                              [{law.code}]
                            </span>
                            <Highlight text={nodeLabel(node)} query={trimmed} />
                          </span>
                          <span className="row__subtitle">
                            {parents.length > 0
                              ? parents.map(nodeShortLabel).join(' / ')
                              : `${law.title} (ระดับบนสุด)`}
                          </span>
                        </Link>
                      </div>
                    );
                  })}
                  {hasMoreNodes && (
                    <button
                      type="button"
                      className="load-more-row"
                      onClick={() => setVisibleNodeCount((prev) => prev + NODE_PAGE_SIZE)}
                    >
                      แสดงอีก {Math.min(NODE_PAGE_SIZE, remainingNodes)} รายการ (เหลือ {remainingNodes})
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}
