export interface AttributeOption {
  label: string;
  value: string;
  color?: string;
}

export interface Attribute {
  _id: string;
  name: string;
  slug: string;
  inputType: string;
  options: AttributeOption[];
  isFilterable: boolean;
}
