export type AdvertisementData = { title?: string };
export type HeroBox = {
  title?: string;
  description?: string;
  buttonText?: string;
  images?: string[]; // Array of image URLs
};
export type HeroData = { boxOne?: HeroBox; boxTwo?: HeroBox };
export type BrandData = { image?: string; title?: string; description?: string };

export type IconicImageItem = {
  url: string;
  title?: string;
};

export type IconicData = {
  title?: string;
  images?: IconicImageItem[]; // Array of image items with titles (max 4)
  products?: unknown[];
  boxFooter?: { title?: string; buttonText?: string };
};
export type ShoesData = { title?: string; products?: unknown[] };
export type StylingData = {
  title?: string;
  url?: string;
  description?: string;
  buttonText?: string;
};

export type CategoryItem = {
  label: string;
  active?: boolean;
};

export type CategoryData = CategoryItem[];

export type ProductsData = string[]; // Array of product IDs

export type WhatsHotData = string[]; // Array of product IDs

export type Section = {
  section_id: string;
  label: string;
  data:
    | AdvertisementData
    | HeroData
    | CategoryData
    | ProductsData
    | BrandData
    | WhatsHotData
    | IconicData
    | ShoesData
    | StylingData
    | unknown[];
};

export default Section;

export type HomepageApiPayload = {
  tab?: string;
  // data can be any free-form object or the legacy aggregated shape with sections
  data?: Record<string, unknown> | { sections: Section[] };
};
