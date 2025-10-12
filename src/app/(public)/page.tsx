import Link from 'next/link';

export default function PublicHome() {
  return (
    <div className="min-h-screen">
      {/* Top Banner Announcement */}
      <div className="bg-neutral-900 text-white text-center py-2 px-4 text-sm">
        <p className="font-medium">MIỄN PHÍ VẬN CHUYỂN CHO ĐỐI VỚI THÀNH VIÊN CỦA CLUB</p>
      </div>

      {/* Hero Banner - Featured Collection */}
      <section className="relative bg-neutral-100 overflow-hidden">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 py-8">
            {/* Main Hero Image */}
            <div className="lg:col-span-2 relative aspect-[16/10] lg:aspect-[16/9] bg-neutral-200 rounded-lg overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white z-10">
                <h2 className="text-3xl lg:text-5xl font-bold font-headline mb-2 tracking-tight">
                  BST VIỆT NAM GRAPHIC TEE
                </h2>
                <p className="text-base lg:text-lg mb-4 max-w-md">
                  BST graphic tee Việt Nam giới hạn, cảm hứng từ sân phòng cách và văn hóa
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-sm font-semibold hover:bg-neutral-100 transition"
                >
                  MUA NGAY
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Side Image */}
            <div className="relative aspect-[4/3] lg:aspect-auto bg-neutral-200 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white z-10">
                <h3 className="text-xl font-bold font-headline mb-2">PHONG CÁCH MỚI</h3>
                <p className="text-sm mb-3">Khám phá bộ sưu tập mới nhất</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="container mx-auto">
          <div className="flex gap-2 py-3 overflow-x-auto">
            <button className="px-4 py-2 bg-neutral-900 text-white rounded-full text-sm font-medium whitespace-nowrap">
              Pickleball ●
            </button>
            <button className="px-4 py-2 bg-neutral-100 text-neutral-900 rounded-full text-sm font-medium hover:bg-neutral-200 whitespace-nowrap">
              Padel ●
            </button>
            <button className="px-4 py-2 bg-neutral-100 text-neutral-900 rounded-full text-sm font-medium hover:bg-neutral-200 whitespace-nowrap">
              Bán chạy nhất
            </button>
            <button className="px-4 py-2 bg-neutral-100 text-neutral-900 rounded-full text-sm font-medium hover:bg-neutral-200 whitespace-nowrap">
              Hàng Mới Về
            </button>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-12 bg-neutral-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-headline">SẢN PHẨM NỔI BẬT</h2>
            <Link href="/products" className="text-sm font-semibold underline hover:no-underline">
              Xem Thêm
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="bg-white rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition"
              >
                <div className="relative aspect-square bg-neutral-100">
                  <div className="absolute top-3 right-3 z-10">
                    <button className="w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-neutral-500 mb-1">Performance</p>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    VPI Pickleball RX Team CTRL
                  </h3>
                  <p className="font-bold text-base">
                    {(1800000 + item * 100000).toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-16 bg-neutral-900 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <svg className="w-16 h-16 mx-auto mb-6" viewBox="0 0 50 50" fill="currentColor">
              <path d="M25 2L5 15v20l20 13 20-13V15L25 2zm0 4.5L42 18v16L25 45.5 8 34V18l17-11.5z" />
            </svg>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold font-headline mb-6">
            CỬA HÀNG THỂ THAO - HIỆU NĂNG, PHONG CÁCH & ĐỔI MỚI TỪ NĂM 2024
          </h2>
          <p className="text-base lg:text-lg text-neutral-300 leading-relaxed max-w-3xl mx-auto">
            Thể thao nâng cao sức khỏe. Giúp bạn luôn tinh tấm. Kết nối chúng ta. Thông qua thể
            thao, chúng ta có sức mạnh để thay đổi cuộc sống—bằng những sản phẩm chuyên về các vận
            động viên truyền cảm hứng, cộng nghĩ phi và cách quản lý hành tinh, công nghệ và văn
            động.
          </p>
        </div>
      </section>

      {/* What's Hot Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold font-headline mb-8 text-center">WHAT&apos;S HOT</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'SONG FOR THE MUTE X 006',
              'CLOT Taekwondo by Caroline Hú',
              'adidas x Brain Dead',
              'Sporty & Rich',
            ].map((title, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden mb-3">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition" />
                </div>
                <h3 className="font-bold text-sm mb-1">{title}</h3>
                <p className="text-xs text-neutral-600 mb-2">
                  {idx === 0 && 'Nơi những biểu tượng kinh điển được tái hiện qua phần khẳng lắng'}
                  {idx === 1 && 'Thanh thoát những kiến đình.'}
                  {idx === 2 && 'Barricade 13 – theo cách của Brain Dead.'}
                  {idx === 3 && 'Hồi nợ sau giờ chạy'}
                </p>
                <button className="text-xs font-bold underline hover:no-underline">MUA NGAY</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Iconic Collections - Large Banner */}
      <section className="py-0 bg-neutral-900">
        <div className="container mx-auto">
          <div className="text-center text-white py-12">
            <h2 className="text-3xl lg:text-4xl font-bold font-headline mb-2 tracking-tight">
              ICONIC KITS. TIMELESS LEGACY.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
            {['LIVERPOOL FC', 'MAN UTD', 'JUVENTUS', 'REAL MADRID'].map((team, idx) => (
              <div key={idx} className="relative aspect-[3/4] bg-neutral-800 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-8 left-6 text-white z-10">
                  <h3 className="text-2xl font-bold font-headline mb-2">{team}</h3>
                  <button className="text-sm font-semibold underline hover:no-underline">
                    Mua ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* World Cup Highlight */}
      <section className="py-16 bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/hexagon.svg')] bg-repeat" />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-6xl font-bold font-headline mb-4 tracking-tight">
              TRIONDA
            </h2>
            <p className="text-lg mb-6">
              Quả bóng thi đấu chính thức của FIFA World Cup 26™ đã xuất hiện
            </p>
            <Link
              href="/products/trionda"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-sm font-semibold hover:bg-neutral-100 transition"
            >
              Mua ngay
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Styling Section */}
      <section className="py-12 bg-neutral-50">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold font-headline mb-8">STYLING WITH SUPERSTAR SHOES</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="group cursor-pointer">
                <div className="relative aspect-square bg-neutral-200 rounded-lg overflow-hidden mb-3">
                  <div className="absolute bottom-3 left-3 bg-white/90 px-3 py-1 rounded text-xs font-semibold">
                    {item} mặt hàng
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / Membership CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold font-headline mb-4">
            TRỞ THÀNH HỘI VIÊN & HƯỞNG ƯU ĐÃI 10%
          </h2>
          <p className="text-lg mb-6 text-primary-50">
            Đăng ký ngay để nhận tin tức mới nhất và ưu đãi độc quyền
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-3 rounded-sm font-semibold hover:bg-neutral-100 transition"
          >
            ĐĂNG KÝ MIỄN PHÍ
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

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
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide">Theo Dõi Chúng Tôi</h3>
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
            <p>© 2025 Quinn Clothing Store. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
