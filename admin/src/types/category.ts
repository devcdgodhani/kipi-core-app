export const CATEGORY_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type CATEGORY_STATUS = (typeof CATEGORY_STATUS)[keyof typeof CATEGORY_STATUS];

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | {
    _id: string;
    name: string;
    slug: string;
  };
  description?: string;
  image?: any; // Changed from string to any (FileStorage object)
  status: CATEGORY_STATUS;
  order: number;
  createdAt: string;
  updatedAt: string;
  children?: ICategory[];
  attributeIds?: string[];
}

export interface ICategoryFilters {
  search?: string;
  status?: CATEGORY_STATUS | CATEGORY_STATUS[];
  parentId?: string;
  isTree?: boolean;
  page?: number;
  limit?: number;
  isPaginate?: boolean;
}
