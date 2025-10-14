// DEFAULT_SECTIONS for homepage admin UI

import Section from '@/types/homepage';

// Single source of truth for section ids
export const SECTION_IDS = {
  ADVERTISEMENT: 'advertisement',
  HERO: 'hero',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  BRAND: 'brand',
  WHATSHOT: 'whatshot',
  ICONIC: 'iconic',
  SHOES: 'shoes',
  STYLING: 'styling',
} as const;

export type SECTION_ID = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

export const DEFAULT_SECTIONS: Section[] = [
  {
    section_id: 'advertisement',
    label: 'Advertisement',
    data: {
      title: 'KHÔNG CẦN CÓC CHO NGƯỜI CŨ ĐÃ MUA HÀNG SHOP BUIDDOI 2HAND',
    },
  },
  {
    section_id: 'hero',
    label: 'Hero Banner',
    data: {
      boxOne: {
        title: 'SẢN PHẨM TẬP MỚI NHẤT',
        description: 'Khám phá những sản phẩm 2hand vintage mới nhất đang được cập nhật tại shop.',
        buttonText: 'MUA NGAY',
        images: [],
      },
      boxTwo: {
        title: 'FEEDBACK',
        description: 'Top phản hồi sản phẩm',
        images: [],
      },
    },
  },
  {
    section_id: 'categories',
    label: 'Category Tabs',
    data: [
      { label: 'Tất cả' },
      { label: 'Áo' },
      { label: 'Quần' },
      { label: 'Giày' },
      { label: 'Phụ kiện' },
    ],
  },
  { section_id: 'products', label: 'Products', data: [] },
  {
    section_id: 'brand',
    label: 'Brand Story',
    data: {
      image: '',
      title: 'BUIDOI - KHO BÁU 2HAND TUYỂN CHỌN & THỜI TRANG BỀN VỮNG',
      description:
        'Vượt lên trên xu hướng. Chúng tôi săn lùng và tuyển chọn những món đồ 2hand giá trị, từ vintage kinh điển đến các thương hiệu hiện đại. Nơi phong cách và sự lựa chọn thông minh gặp gỡ.',
    },
  },
  { section_id: 'whatshot', label: "What's Hot", data: [] },
  {
    section_id: 'iconic',
    label: 'Iconic Collections',
    data: {
      title: 'ICONIC KITS. TIMELESS LEGACY.',
      images: [],
      products: [],
      boxFooter: {
        title: 'T-SHIRT SINGLE STITCH',
        buttonText: 'MUA NGAY',
      },
    },
  },
  {
    section_id: 'shoes',
    label: 'Shoes Section',
    data: {
      title: '2HAND SHOES',
      products: [],
    },
  },
  { section_id: 'styling', label: 'Styling Section', data: [] },
];

export default DEFAULT_SECTIONS;
