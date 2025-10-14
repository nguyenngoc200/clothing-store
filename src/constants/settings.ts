export const SETTINGS = {
  HOMEPAGE: {
    key: 'homepage_v1',
    tab: 'homepage',
  },
  // Add other settings records here as needed, e.g.
  // THEME: { key: 'theme_v1', tab: 'appearance' }
} as const;

export type SettingsKey = (typeof SETTINGS)[keyof typeof SETTINGS];

export default SETTINGS;
