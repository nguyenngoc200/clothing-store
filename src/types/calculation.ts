export type Item = {
  label?: string;
  // only store absolute amount (VND). Percent-based items are no longer supported.
  amount?: number | null;
};

export type CalcForm = {
  advertising?: Item[];
  packaging?: Item[];
  shipping?: Item[];
  personnel?: Item[];
  rent?: Item[];
  freeship?: Item[];
};

export type Category = {
  key: keyof CalcForm;
  label: string;
};

// Backwards-compatible aliases matching the shape used in CalculationCostsInput
export type CostItem = Item;
export type CalculationData = CalcForm;

export type CalculationCostsInputProps = {
  values: {
    advertising_cost?: number;
    packaging_cost?: number;
    shipping_cost?: number;
    personnel_cost?: number;
    rent_cost?: number;
    freeship_cost?: number;
  };
  onChange: (costs: {
    advertising_cost: number;
    packaging_cost: number;
    shipping_cost: number;
    personnel_cost: number;
    rent_cost: number;
    freeship_cost: number;
  }) => void;
  productPrice?: number; // legacy - no longer used (percent items removed)
  // optional preloaded calculation data (normalized shape). If provided, the component will
  // use this data instead of fetching from the calculation service.
  initialCalculationData?: CalculationData | null;
};
