import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArticleRow } from '@/components/ArticleRow';
import { DecisionRow } from '@/components/DecisionRow';
import { FilterChips } from '@/components/FilterChips';
import { Highlight } from '@/components/Highlight';
import { PageHeader } from '@/layouts/PageHeader';
import { nodeLabel, nodeShortLabel } from '@/lib/format';
import { getLawIdForNode, getLawMeta, getNodePath } from '@/lib/lawIndex';
import { searchAll, type SearchScope } from '@/lib/search';
import { routes } from '@/navigation/routes';

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [scope, setScope] = useState<SearchScope>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /** เก็บคำค้นไว้ใน URL เพื่อให้แชร์/ย้อนกลับได้ */
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setParams(query ? { q: query } : {}, { replace: true });
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [query, setParams]);

  const results = useMemo(() => searchAll(query), [query]);
  const trimmed = query.trim();
  const show = (target: SearchScope) => scope === 'all' || scope === target;

  return (
    <>
      <PageHeader title="ค้นหา" showBack={false} />

      <div className="search-bar">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="เลขมาตรา · คำสำคัญ · ชื่อหมวด/ส่วน · เลขฎีกา"
          aria-label="ช่องค้นหา"
          autoComplete="off"
        />
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
                  {results.articleItems.map((item) => (
                    <ArticleRow
                      key={`${item.lawId}-${item.id}`}
                      articleId={item.id}
                      lawId={item.lawId}
                      showLawCode
                      query={trimmed}
                    />
                  ))}
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
                  {results.nodes.map((node) => {
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
                </div>
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}
