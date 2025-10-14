export const CATEGORY_TABS = [
  { label: 'Jacket', active: true },
  { label: 'Sơ mi', active: true },
  { label: 'Áo thun', active: false },
  { label: 'Quần túi hộp', active: false },
  { label: 'Đồ thể thao', active: true },
  { label: 'Quần jean', active: false },
  { label: 'Sản phẩm độc lạ', active: false },
];

export type CategoryTab = (typeof CATEGORY_TABS)[number];
