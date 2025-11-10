export const SETTINGS = {
  HOMEPAGE: {
    key: 'homepage_v1',
    tab: 'homepage',
  },
  CALCULATION: {
    key: 'calculation_v1',
    tab: 'calculation',
  },
  PRODUCT_COST: {
    key: 'product_cost_v1',
    tab: 'product_cost',
  },
  // Add other settings records here as needed, e.g.
  // THEME: { key: 'theme_v1', tab: 'appearance' }
} as const;

export type SettingsKey = (typeof SETTINGS)[keyof typeof SETTINGS];

export default SETTINGS;

// Friendly labels for the settings tabs (used in admin UI)
export const SETTINGS_TABS: Array<{ value: string; label: string }> = [
  { value: SETTINGS.HOMEPAGE.tab, label: 'Trang chủ' },
  { value: SETTINGS.CALCULATION.tab, label: 'Tính toán' },
  { value: SETTINGS.PRODUCT_COST.tab, label: 'Chi phí sản phẩm' },
];
