import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/Logo';
import { HeroCarousel } from '@/components/HeroCarousel';
import { ProductCarousel } from '@/components/ProductCarousel';
import SETTINGS from '@/constants/settings';
import { getSettings } from '@/services/settings.service';
import { productServerService } from '@/services/products.server.service';
import DEFAULT_SECTIONS from '@/constants/homepage';
import Section, {
  IconicData,
  AdvertisementData,
  HeroData,
  BrandData,
  ShoesData,
  StylingData,
  CategoryData,
  ProductsData,
  WhatsHotData,
} from '@/types/homepage';
import type { Product } from '@/types/database';

export default async function PublicHome() {
  // Load homepage settings via service (server component)
  const rows = await getSettings(SETTINGS.HOMEPAGE.tab);
  const payload = rows?.[0]?.data as { sections?: Section[] } | undefined;
  const sections: Section[] = Array.isArray(payload?.sections)
    ? (payload!.sections as Section[])
    : DEFAULT_SECTIONS;

  const byId = new Map<string, Section['data'] | undefined>();
  sections.forEach((s: Section) => byId.set(s.section_id, s.data));

  // Helper to get default value from DEFAULT_SECTIONS
  const getDefault = (sectionId: string) => {
    const defaultSection = DEFAULT_SECTIONS.find((s) => s.section_id === sectionId);
    return defaultSection?.data;
  };

  const advertisement =
    (byId.get('advertisement') as AdvertisementData | undefined) ||
    (getDefault('advertisement') as AdvertisementData);
  const hero = (byId.get('hero') as HeroData | undefined) || (getDefault('hero') as HeroData);
  const categories =
    (byId.get('categories') as CategoryData | undefined) ||
    (getDefault('categories') as CategoryData);
  const productIds = byId.get('products') as ProductsData | undefined;
  const brand = (byId.get('brand') as BrandData | undefined) || (getDefault('brand') as BrandData);
  const whatshotIds = byId.get('whatshot') as WhatsHotData | undefined;
  const iconic =
    (byId.get('iconic') as IconicData | undefined) || (getDefault('iconic') as IconicData);
  const shoes = (byId.get('shoes') as ShoesData | undefined) || (getDefault('shoes') as ShoesData);
  const styling =
    (byId.get('styling') as StylingData | undefined) ||
    ({
      title: 'GIẢM NGAY 20% CHO SẢN PHẨM ĐẦU TIÊN KHI',
      url: 'https://www.instagram.com/buidoi_highhand/',
      description: 'Đăng ký ngay để nhận tin tức mới nhất và ưu đãi độc quyền',
      buttonText: 'ĐĂNG KÝ MIỄN PHÍ',
    } as StylingData);

  // Fetch featured products by IDs using server service
  const featuredProducts: Product[] =
    productIds && Array.isArray(productIds) && productIds.length > 0
      ? await productServerService.getByIds(productIds)
      : [];

  // Fetch what's hot products by IDs using server service
  const whatshotProducts: Product[] =
    whatshotIds && Array.isArray(whatshotIds) && whatshotIds.length > 0
      ? await productServerService.getByIds(whatshotIds)
      : [];

  // Fetch styling products by IDs using server service
  const shoesProducts: Product[] =
    shoes && Array.isArray(shoes) && shoes.length > 0
      ? await productServerService.getByIds(shoes)
      : [];

  return (
    <div className="min-h-screen">
      {/* Top Banner Announcement */}
      <div className="bg-neutral-900 text-white text-center py-2 px-4 text-sm">
        <p className="font-medium">{advertisement?.title}</p>
      </div>

      {/* Hero Banner - Featured Collection */}
      <section className="relative bg-neutral-100 overflow-hidden">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 py-8">
            {/* Main Hero Carousel (Box One) */}
            <div className="lg:col-span-2 relative aspect-[16/10] lg:aspect-[16/9] bg-neutral-200 rounded-lg overflow-hidden group">
              <HeroCarousel
                images={hero?.boxOne?.images || []}
                title={hero?.boxOne?.title}
                description={hero?.boxOne?.description}
                buttonText={hero?.boxOne?.buttonText}
                className="h-full"
              />
            </div>

            {/* Side Carousel (Box Two) */}
            <div className="relative aspect-[4/3] lg:aspect-auto bg-neutral-200 rounded-lg overflow-hidden">
              <HeroCarousel
                images={hero?.boxTwo?.images || []}
                title={hero?.boxTwo?.title}
                description={hero?.boxTwo?.description}
                className="h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="container mx-auto">
          <div className="flex gap-2 py-3 overflow-x-auto">
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((tab, idx) => (
                <button
                  key={`${tab.label}-${idx}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    idx === 0
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))
            ) : (
              <p className="text-sm text-neutral-500">Chưa có category nào.</p>
            )}
          </div>
        </div>
      </section>

      {/* What's Hot Section */}
      <section className="py-12 bg-neutral-50">
        <div className="container mx-auto">
          <ProductCarousel
            products={featuredProducts}
            title="SẢN PHẨM NỔI BẬT"
            showViewMore={true}
            autoplay={true}
            autoplayDelay={6000}
          />
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-16 bg-neutral-900 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          {brand?.image ? (
            <div className="mb-8 flex justify-center items-center">
              <div className="relative w-32 h-32 overflow-hidden">
                <Image
                  src={brand.image}
                  alt="Brand logo"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          ) : (
            <div className="mb-8 flex justify-center items-center">
              <Logo width={100} height={100} />
            </div>
          )}
          <h2 className="text-3xl lg:text-4xl font-bold font-headline mb-6">{brand?.title}</h2>
          <p className="text-base lg:text-lg text-neutral-300 leading-relaxed max-w-3xl mx-auto">
            {brand?.description}
          </p>
        </div>
      </section>

      {/* What's Hot Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto">
          <ProductCarousel
            products={whatshotProducts}
            title="WHAT'S HOT"
            showViewMore={true}
            autoplay={true}
            autoplayDelay={6000}
          />
        </div>
      </section>

      {/* Iconic Collections - Large Banner */}
      <section className="py-0 bg-neutral-900">
        <div className="container mx-auto">
          <div className="text-center text-white py-12">
            <h2 className="text-3xl lg:text-4xl font-bold font-headline mb-2 tracking-tight">
              {iconic?.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
            {(() => {
              // Use images from settings if available
              const iconicImages = iconic?.images || [];

              // Default collections if no images
              const defaultCollections = ['RALPH LAUREN', 'NIKE', 'ADIDAS', 'TOMMY HILFIGER'];

              // If we have images, use them; otherwise use default products
              if (iconicImages.length > 0) {
                return iconicImages.map((imageItem, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[3/4] bg-neutral-800 overflow-hidden group"
                  >
                    <Image
                      src={imageItem.url}
                      alt={imageItem.title || `Collection ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-8 left-6 text-white z-10">
                      <h3 className="text-2xl font-bold font-headline mb-2">
                        {imageItem.title || `Collection ${idx + 1}`}
                      </h3>
                      <button className="text-sm font-semibold underline hover:no-underline">
                        Mua ngay
                      </button>
                    </div>
                  </div>
                ));
              }

              // Fallback to default products
              return defaultCollections.map((label, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[3/4] bg-neutral-800 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-8 left-6 text-white z-10">
                    <h3 className="text-2xl font-bold font-headline mb-2">{label}</h3>
                    <button className="text-sm font-semibold underline hover:no-underline">
                      Mua ngay
                    </button>
                  </div>
                </div>
              ));
            })()}
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
            <h2 className="text-4xl lg:text-6xl font-bold font-headline mb-8 tracking-tight">
              T-SHIRT SINGLE STITCH
            </h2>
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

      {/* Shoes Section */}
      <section className="py-12 bg-neutral-50">
        <div className="container mx-auto">
          <ProductCarousel
            products={shoesProducts}
            title="SHOES"
            showViewMore={true}
            autoplay={true}
            autoplayDelay={3000}
          />
        </div>
      </section>

      {/* Newsletter / Membership CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-black">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold font-headline mb-4">
            {styling?.title}{' '}
            <span>
              <Link
                href={styling?.url || '#'}
                className="text-primary-50 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                FOLLOW INSTAGRAM
              </Link>
            </span>
          </h2>
          <p className="text-lg mb-6 text-primary-50">{styling?.description}</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-3 rounded-sm font-semibold hover:bg-neutral-100 transition"
          >
            {styling?.buttonText}
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
            <p>© 2025 Quinn & BUIDOI. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
