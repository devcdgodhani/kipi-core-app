export const ATTRIBUTE_VALUE_TYPE = {
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  SELECT: 'SELECT',
  MULTI_SELECT: 'MULTI_SELECT',
  COLOR: 'COLOR',
  DATE: 'DATE',
  RANGE: 'RANGE',
} as const;
export type ATTRIBUTE_VALUE_TYPE = (typeof ATTRIBUTE_VALUE_TYPE)[keyof typeof ATTRIBUTE_VALUE_TYPE];

export const ATTRIBUTE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type ATTRIBUTE_STATUS = (typeof ATTRIBUTE_STATUS)[keyof typeof ATTRIBUTE_STATUS];

export const ATTRIBUTE_INPUT_TYPE = {
  TEXT_INPUT: 'TEXT_INPUT',
  NUMBER_INPUT: 'NUMBER_INPUT',
  DROPDOWN: 'DROPDOWN',
  CHECKBOX: 'CHECKBOX',
  RADIO: 'RADIO',
  COLOR_PICKER: 'COLOR_PICKER',
  DATE_PICKER: 'DATE_PICKER',
  RANGE_SLIDER: 'RANGE_SLIDER',
} as const;
export type ATTRIBUTE_INPUT_TYPE = (typeof ATTRIBUTE_INPUT_TYPE)[keyof typeof ATTRIBUTE_INPUT_TYPE];


export interface IAttributeOption {
  label: string;
  value: string;
  color?: string;
}

export interface IAttributeValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
}

export interface IAttribute {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  valueType: ATTRIBUTE_VALUE_TYPE;
  inputType: ATTRIBUTE_INPUT_TYPE;
  options?: IAttributeOption[];
  defaultValue?: any;
  validation?: IAttributeValidation;
  unit?: string;
  isFilterable: boolean;
  isRequired: boolean;
  isVariant: boolean;
  categoryIds: string[];
  order: number;
  status: ATTRIBUTE_STATUS;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAttributeFilter {
  _id?: string | string[];
  name?: string | string[];
  slug?: string | string[];
  valueType?: string | string[];
  inputType?: string | string[];
  status?: string | string[];
  isFilterable?: boolean;
  isRequired?: boolean;
  isVariant?: boolean;
  categoryIds?: string | string[];
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

export interface IPaginationData<T> {
  recordList: T[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
}

