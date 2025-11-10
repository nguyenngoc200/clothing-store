import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4">Về chúng tôi</h1>
      <p className="mb-6">
        Chào mừng đến với cửa hàng quần áo của chúng tôi. Đây là trang giới thiệu tạm thời — bạn có
        thể thay nội dung này bằng văn bản chính thức về thương hiệu, sứ mệnh và đội ngũ.
      </p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Sứ mệnh</h2>
        <p>Mang đến trải nghiệm mua sắm thoải mái với các sản phẩm chất lượng.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Quick note</h2>
        <p className="text-muted-foreground">
          Quinn Store is a demo application built with Next.js and Tailwind CSS.
        </p>
      </section>

      <nav className="flex gap-4">
        <Link href="/">Trang chủ</Link>
        <Link href="/contact">Liên hệ</Link>
        <Link href="/products">Sản phẩm</Link>
        <Link href="/posts">Bài viết</Link>
      </nav>
    </div>
  );
}
