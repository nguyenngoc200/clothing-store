export type BaseSettingRow = {
  id?: string;
  key: string;
  tab: string;
  created_at?: string;
  updated_at?: string;
};

export type HomepageSettingsData = {
  // Legacy payload: whole homepage stored as { sections: [...] }
  sections?: Array<Record<string, unknown>>;

  // New per-tab payloads are free-form and depend on the section type.
  // We keep this as an index signature to allow arbitrary shapes.
  [key: string]: unknown;
};

export type HomepageSettingRow = BaseSettingRow & {
  // For backwards compatibility this may be the legacy sections payload
  // or a per-tab JSON object depending on how the row was created.
  data?: HomepageSettingsData | Record<string, unknown> | null;
};

export type CalculationOption = {
  key: string;
  label: string;
  amount?: number | null;
};

export type CalculationSettingRow = BaseSettingRow & {
  data?: Record<string, unknown> | null; // legacy
  // New columns (nullable)
  advertising?: string | null;
  packaging?: string | null;
  shipping?: string | null;
  personnel?: string | null;
  rent?: string | null;
};

export type ProductCostSettingRow = BaseSettingRow & {
  title?: string | null;
  advertising?: string | null;
  packaging?: string | null;
  shipping?: string | null;
  personnel?: string | null;
  rent?: string | null;
  profit_margin?: number | null;
  data?: Record<string, unknown> | null; // legacy
};

export type ApiListResponse<T> =
  | { success: boolean; data: T }
  | { success: false; message?: string };

// General Setting row used across services
export type SettingRow = {
  id: string;
  key: string;
  tab: string;
  data: unknown;
  created_at: string;
  updated_at: string;
};
