import { AdvertisementSection } from '@/components/admin/sections/AdvertisementSection';
import { BrandSection } from '@/components/admin/sections/BrandSection';
import { CategorySection } from '@/components/admin/sections/CategorySection';
import { HeroSection } from '@/components/admin/sections/HeroSection';
import { IconicSection } from '@/components/admin/sections/IconicSection';
import { ProductSelectionSection } from '@/components/admin/sections/ProductSelectionSection';
import { StylingSection } from '@/components/admin/sections/StylingSection';
import { SECTION_IDS } from '@/constants/homepage';

interface SectionRendererProps {
  sectionId: string;
  index: number;
}

/**
 * Render nội dung cụ thể cho từng loại section dựa vào section_id
 * Tách logic switch/case ra khỏi component chính để dễ đọc và maintain
 */
export function SectionRenderer({ sectionId, index }: SectionRendererProps) {
  switch (sectionId) {
    case SECTION_IDS.ADVERTISEMENT:
      return <AdvertisementSection index={index} />;

    case SECTION_IDS.HERO:
      return <HeroSection index={index} />;

    case SECTION_IDS.CATEGORIES:
      return <CategorySection index={index} />;

    case SECTION_IDS.PRODUCTS:
      return <ProductSelectionSection index={index} label="Chọn sản phẩm nổi bật" />;

    case SECTION_IDS.BRAND:
      return <BrandSection index={index} />;

    case SECTION_IDS.WHATSHOT:
      return <ProductSelectionSection index={index} label="Chọn sản phẩm What's Hot" />;

    case SECTION_IDS.ICONIC:
      return <IconicSection index={index} />;

    case SECTION_IDS.SHOES:
      return <ProductSelectionSection index={index} label="Chọn sản phẩm Shoes" />;

    case SECTION_IDS.STYLING:
      return <StylingSection index={index} />;

    default:
      return null;
  }
}
