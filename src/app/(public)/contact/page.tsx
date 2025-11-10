import Link from 'next/link'

export default function Page() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4">Liên hệ</h1>
      <p className="mb-4">Bạn muốn liên hệ với chúng tôi? Gửi email tới <a href="mailto:hello@example.com">hello@example.com</a> hoặc gọi <strong>0123-456-789</strong>.</p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Hoặc gửi tin nhắn</h2>
        <p>Form liên hệ tạm thời — bạn có thể thay bằng component form thực tế hoặc tích hợp với hệ thống backend.</p>
      </section>

      <nav className="flex gap-4">
        <Link href="/">Trang chủ</Link>
        <Link href="/about">Về chúng tôi</Link>
        <Link href="/posts">Bài viết</Link>
      </nav>
    </div>
  )
}
