import { Link } from 'react-router-dom';
import { PageHeader } from '@/layouts/PageHeader';
import { routes } from '@/navigation/routes';

interface NotFoundPageProps {
  message?: string;
}

export function NotFoundPage({ message = 'ไม่พบหน้าที่ต้องการ' }: NotFoundPageProps) {
  return (
    <>
      <PageHeader title="ไม่พบข้อมูล" />
      <main className="page">
        <p className="note">{message}</p>
        <p className="note">
          <Link to={routes.toc()}>กลับไปที่สารบัญกฎหมาย</Link>
        </p>
      </main>
    </>
  );
}