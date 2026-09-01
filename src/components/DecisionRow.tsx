import { BookmarkButton } from '@/components/BookmarkButton';
import { Highlight } from '@/components/Highlight';
import { NavRow } from '@/components/NavRow';
import { routes } from '@/navigation/routes';
import type { Decision } from '@/types/law';

interface DecisionRowProps {
  decision: Decision;
  query?: string;
}

export function DecisionRow({ decision, query }: DecisionRowProps) {
  return (
    <NavRow
      to={routes.decision(decision.id)}
      title={<>ฎีกาที่ <Highlight text={decision.number} query={query} /></>}
      subtitle={
        <>
          มาตรา {decision.articleIds.join(', ')} ·{' '}
          <Highlight text={decision.keywords.join(' · ')} query={query} />
        </>
      }
      trailing={
        <BookmarkButton kind="decision" id={decision.id} addedMessage="บันทึกฎีกาแล้ว" />
      }
    />
  );
}