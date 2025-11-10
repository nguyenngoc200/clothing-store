import Link from 'next/link';
import { ADMIN_MODULES } from '@/constants/admin';

export default function AdminPage() {
  return (
    <div className="container mt-5 font-sans min-h-screen w-full">
      <h1 className="text-2xl font-bold mb-8">Bảng điều khiển Quản trị</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ADMIN_MODULES.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="text-xl mb-3">{module.icon}</div>
            <h2 className="text-lg font-bold mb-2">{module.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{module.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
