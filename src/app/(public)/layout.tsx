import Header from '@/components/header/Header';
import { getUserServer } from '@/lib/supabase/getUserServer';
import Link from 'next/link';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user: serverUser } = await getUserServer();

  return (
    <div>
      {/* Header is a client component but accepts serverUser as initial state */}
      <Header serverUser={serverUser} />

      <main className="min-h-screen container">{children}</main>

      <footer className="border-t mt-12">
        {/* Footer Navigation Preview */}
        <section className="py-12 bg-neutral-900 text-white">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-bold mb-4 text-sm uppercase tracking-wide">Sản Phẩm</h3>
                <ul className="space-y-2 text-sm text-neutral-400">
                  <li>
                    <Link href="/shoes" className="hover:text-white transition">
                      Giày
                    </Link>
                  </li>
                  <li>
                    <Link href="/clothing" className="hover:text-white transition">
                      Quần áo
                    </Link>
                  </li>
                  <li>
                    <Link href="/accessories" className="hover:text-white transition">
                      Phụ kiện
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold mb-4 text-sm uppercase tracking-wide">Thể Thao</h3>
                <ul className="space-y-2 text-sm text-neutral-400">
                  <li>
                    <Link href="/running" className="hover:text-white transition">
                      Chạy
                    </Link>
                  </li>
                  <li>
                    <Link href="/tennis" className="hover:text-white transition">
                      Quần vợt
                    </Link>
                  </li>
                  <li>
                    <Link href="/gym" className="hover:text-white transition">
                      Gym & Training
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold mb-4 text-sm uppercase tracking-wide">Hỗ Trợ</h3>
                <ul className="space-y-2 text-sm text-neutral-400">
                  <li>
                    <Link href="/help" className="hover:text-white transition">
                      Trợ Giúp
                    </Link>
                  </li>
                  <li>
                    <Link href="/returns" className="hover:text-white transition">
                      Trả Hàng & Hoàn Tiền
                    </Link>
                  </li>
                  <li>
                    <Link href="/shipping" className="hover:text-white transition">
                      Giao hàng
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold mb-4 text-sm uppercase tracking-wide">
                  Theo Dõi Chúng Tôi
                </h3>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700 transition"
                  >
                    <span className="sr-only">Facebook</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700 transition"
                  >
                    <span className="sr-only">Instagram</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
              <p>© 2025 Quinn & BUIDOI. All rights reserved.</p>
            </div>
          </div>
        </section>
      </footer>
    </div>
  );
}
