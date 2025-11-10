/**
 * Shared service option types for server-side service methods
 */
export type BaseServiceOptions = {
  cookieHeader?: string;
};

export type GetByIdsOptions = BaseServiceOptions & {
  // no extra fields yet, kept for clarity and future growth
  ids: string[];
};

export type GetByIdOptions = BaseServiceOptions & {
  // could include expand flags in future
  id: string;
};

export type GetAllOptions = BaseServiceOptions & {
  categoryId?: string;
};

export default BaseServiceOptions;
