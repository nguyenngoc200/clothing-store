import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-[#070707]">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">Trang không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Link href={ROUTES.HOME} className="inline-block rounded bg-sky-600 px-4 py-2 text-white">
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
