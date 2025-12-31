import AttributeModel from '../models/attributeModel';
import CategoryModel from '../models/categoryModel';
import slugify from 'slugify';
import { 
  ATTRIBUTE_STATUS, 
  ATTRIBUTE_VALUE_TYPE, 
  ATTRIBUTE_INPUT_TYPE 
} from '../../../constants';

interface ISeedAttribute {
  name: string;
  description?: string;
  valueType: ATTRIBUTE_VALUE_TYPE;
  inputType: ATTRIBUTE_INPUT_TYPE;
  options?: { label: string; value: string; color?: string }[];
  unit?: string;
  isFilterable?: boolean;
  isRequired?: boolean;
  isVariant?: boolean;
  categoryNames?: string[]; // Category names to associate with
}

// Common attributes for e-commerce (similar to Meesho, Flipkart, Amazon)
const commonAttributes: ISeedAttribute[] = [
  // Variant Attributes (used for product variations)
  {
    name: 'Size',
    description: 'Product size',
    valueType: ATTRIBUTE_VALUE_TYPE.SELECT,
    inputType: ATTRIBUTE_INPUT_TYPE.DROPDOWN,
    options: [
      { label: 'XS', value: 'xs' },
      { label: 'S', value: 's' },
      { label: 'M', value: 'm' },
      { label: 'L', value: 'l' },
      { label: 'XL', value: 'xl' },
      { label: 'XXL', value: 'xxl' },
      { label: 'XXXL', value: 'xxxl' },
    ],
    isFilterable: true,
    isVariant: true,
    categoryNames: ['Men', 'Women', 'Kids'],
  },
  {
    name: 'Color',
    description: 'Product color',
    valueType: ATTRIBUTE_VALUE_TYPE.COLOR,
    inputType: ATTRIBUTE_INPUT_TYPE.COLOR_PICKER,
    options: [
      { label: 'Red', value: 'red', color: '#FF0000' },
      { label: 'Blue', value: 'blue', color: '#0000FF' },
      { label: 'Green', value: 'green', color: '#00FF00' },
      { label: 'Black', value: 'black', color: '#000000' },
      { label: 'White', value: 'white', color: '#FFFFFF' },
      { label: 'Yellow', value: 'yellow', color: '#FFFF00' },
      { label: 'Pink', value: 'pink', color: '#FFC0CB' },
      { label: 'Purple', value: 'purple', color: '#800080' },
      { label: 'Orange', value: 'orange', color: '#FFA500' },
      { label: 'Brown', value: 'brown', color: '#A52A2A' },
      { label: 'Grey', value: 'grey', color: '#808080' },
    ],
    isFilterable: true,
    isVariant: true,
    categoryNames: ['Men', 'Women', 'Kids', 'Accessories'],
  },
  
  // Common Product Attributes
  {
    name: 'Material',
    description: 'Product material',
    valueType: ATTRIBUTE_VALUE_TYPE.SELECT,
    inputType: ATTRIBUTE_INPUT_TYPE.DROPDOWN,
    options: [
      { label: 'Cotton', value: 'cotton' },
      { label: 'Polyester', value: 'polyester' },
      { label: 'Silk', value: 'silk' },
      { label: 'Wool', value: 'wool' },
      { label: 'Denim', value: 'denim' },
      { label: 'Leather', value: 'leather' },
      { label: 'Synthetic', value: 'synthetic' },
      { label: 'Linen', value: 'linen' },
      { label: 'Rayon', value: 'rayon' },
      { label: 'Nylon', value: 'nylon' },
    ],
    isFilterable: true,
    isRequired: false,
    categoryNames: ['Men', 'Women', 'Kids'],
  },
  {
    name: 'Brand',
    description: 'Product brand',
    valueType: ATTRIBUTE_VALUE_TYPE.TEXT,
    inputType: ATTRIBUTE_INPUT_TYPE.TEXT_INPUT,
    isFilterable: true,
    isRequired: false,
    categoryNames: ['Men', 'Women', 'Kids', 'Accessories'],
  },
  {
    name: 'Pattern',
    description: 'Product pattern',
    valueType: ATTRIBUTE_VALUE_TYPE.SELECT,
    inputType: ATTRIBUTE_INPUT_TYPE.DROPDOWN,
    options: [
      { label: 'Solid', value: 'solid' },
      { label: 'Striped', value: 'striped' },
      { label: 'Checked', value: 'checked' },
      { label: 'Printed', value: 'printed' },
      { label: 'Embroidered', value: 'embroidered' },
      { label: 'Self Design', value: 'self-design' },
      { label: 'Floral', value: 'floral' },
      { label: 'Geometric', value: 'geometric' },
    ],
    isFilterable: true,
    categoryNames: ['Men', 'Women', 'Kids'],
  },
  {
    name: 'Fit',
    description: 'Product fit type',
    valueType: ATTRIBUTE_VALUE_TYPE.SELECT,
    inputType: ATTRIBUTE_INPUT_TYPE.DROPDOWN,
    options: [
      { label: 'Regular Fit', value: 'regular' },
      { label: 'Slim Fit', value: 'slim' },
      { label: 'Loose Fit', value: 'loose' },
      { label: 'Skinny Fit', value: 'skinny' },
      { label: 'Relaxed Fit', value: 'relaxed' },
      { label: 'Oversized', value: 'oversized' },
    ],
    isFilterable: true,
    categoryNames: ['Men', 'Women'],
  },
  {
    name: 'Sleeve Length',
    description: 'Sleeve length type',
    valueType: ATTRIBUTE_VALUE_TYPE.SELECT,
    inputType: ATTRIBUTE_INPUT_TYPE.DROPDOWN,
    options: [
      { label: 'Full Sleeve', value: 'full' },
      { label: 'Half Sleeve', value: 'half' },
      { label: 'Sleeveless', value: 'sleeveless' },
      { label: '3/4 Sleeve', value: 'three-quarter' },
      { label: 'Short Sleeve', value: 'short' },
    ],
    isFilterable: true,
    categoryNames: ['Men', 'Women'],
  },
  {
    name: 'Neck Type',
    description: 'Neck style',
    valueType: ATTRIBUTE_VALUE_TYPE.SELECT,
    inputType: ATTRIBUTE_INPUT_TYPE.DROPDOWN,
    options: [
      { label: 'Round Neck', value: 'round' },
      { label: 'V-Neck', value: 'v-neck' },
      { label: 'Collar', value: 'collar' },
      { label: 'Polo Collar', value: 'polo' },
      { label: 'Boat Neck', value: 'boat' },
      { label: 'Turtle Neck', value: 'turtle' },
    ],
    isFilterable: true,
    categoryNames: ['Men', 'Women'],
  },
  {
    name: 'Occasion',
    description: 'Suitable occasion',
    valueType: ATTRIBUTE_VALUE_TYPE.MULTI_SELECT,
    inputType: ATTRIBUTE_INPUT_TYPE.CHECKBOX,
    options: [
      { label: 'Casual', value: 'casual' },
      { label: 'Formal', value: 'formal' },
      { label: 'Party', value: 'party' },
      { label: 'Sports', value: 'sports' },
      { label: 'Ethnic', value: 'ethnic' },
      { label: 'Wedding', value: 'wedding' },
    ],
    isFilterable: true,
    categoryNames: ['Men', 'Women', 'Kids'],
  },
  {
    name: 'Care Instructions',
    description: 'How to care for the product',
    valueType: ATTRIBUTE_VALUE_TYPE.TEXT,
    inputType: ATTRIBUTE_INPUT_TYPE.TEXT_INPUT,
    isFilterable: false,
    categoryNames: ['Men', 'Women', 'Kids'],
  },
  
  // Accessory Attributes
  {
    name: 'Watch Type',
    description: 'Type of watch',
    valueType: ATTRIBUTE_VALUE_TYPE.SELECT,
    inputType: ATTRIBUTE_INPUT_TYPE.DROPDOWN,
    options: [
      { label: 'Analog', value: 'analog' },
      { label: 'Digital', value: 'digital' },
      { label: 'Smart Watch', value: 'smart' },
      { label: 'Chronograph', value: 'chronograph' },
    ],
    isFilterable: true,
    categoryNames: ['Accessories'],
  },
  {
    name: 'Strap Material',
    description: 'Watch strap material',
    valueType: ATTRIBUTE_VALUE_TYPE.SELECT,
    inputType: ATTRIBUTE_INPUT_TYPE.DROPDOWN,
    options: [
      { label: 'Leather', value: 'leather' },
      { label: 'Metal', value: 'metal' },
      { label: 'Rubber', value: 'rubber' },
      { label: 'Fabric', value: 'fabric' },
    ],
    isFilterable: true,
    categoryNames: ['Accessories'],
  },
  
  // Measurement Attributes
  {
    name: 'Length',
    description: 'Product length',
    valueType: ATTRIBUTE_VALUE_TYPE.NUMBER,
    inputType: ATTRIBUTE_INPUT_TYPE.NUMBER_INPUT,
    unit: 'cm',
    isFilterable: false,
    categoryNames: ['Men', 'Women', 'Kids'],
  },
  {
    name: 'Weight',
    description: 'Product weight',
    valueType: ATTRIBUTE_VALUE_TYPE.NUMBER,
    inputType: ATTRIBUTE_INPUT_TYPE.NUMBER_INPUT,
    unit: 'g',
    isFilterable: false,
    categoryNames: ['Men', 'Women', 'Kids', 'Accessories'],
  },
];

// Store created attributes to avoid duplicates
const createdAttributes = new Map<string, any>();

export const seedAttributes = async () => {
  console.log('🌱 Seeding attributes...');
  try {
    // Get all categories
    const categories = await CategoryModel.find({});
    const categoryMap = new Map(categories.map(cat => [cat.name, cat]));

    for (const attr of commonAttributes) {
      await upsertAttribute(attr, categoryMap);
    }

    console.log('✅ Attribute seeding completed.');
    console.log(`📊 Total attributes created/updated: ${createdAttributes.size}`);
  } catch (error) {
    console.error('❌ Error seeding attributes:', error);
  }
};

const upsertAttribute = async (
  attr: ISeedAttribute,
  categoryMap: Map<string, any>
) => {
  const slug = slugify(attr.name, { lower: true });

  // Check if already created in this session
  if (createdAttributes.has(slug)) {
    // console.log(`~ Attribute already processed in this session: ${attr.name}`);
    return createdAttributes.get(slug);
  }

  // Find or create attribute
  let attribute = await AttributeModel.findOne({ slug });

  // Get category IDs
  const categoryIds: any[] = [];
  if (attr.categoryNames && attr.categoryNames.length > 0) {
    for (const catName of attr.categoryNames) {
      const category = categoryMap.get(catName);
      if (category) {
        categoryIds.push(category._id);
      }
    }
  }

  if (!attribute) {
    // Create new attribute
    attribute = await AttributeModel.create({
      name: attr.name,
      slug,
      description: attr.description || '',
      valueType: attr.valueType,
      inputType: attr.inputType,
      options: attr.options || [],
      unit: attr.unit,
      isFilterable: attr.isFilterable || false,
      isRequired: attr.isRequired || false,
      isVariant: attr.isVariant || false,
      categoryIds,
      order: 0,
      status: ATTRIBUTE_STATUS.ACTIVE,
    });
    console.log(`+ Created attribute: ${attr.name}`);
  } else {
    // Update existing attribute with new category associations
    const existingCategoryIds = attribute.categoryIds.map((id: any) => id.toString());
    const newCategoryIds = categoryIds.filter(
      (id: any) => !existingCategoryIds.includes(id.toString())
    );

    if (newCategoryIds.length > 0) {
      attribute.categoryIds = [...attribute.categoryIds, ...newCategoryIds];
      await attribute.save();
      console.log(`~ Updated attribute categories: ${attr.name}`);
    }
  }

  // Store in map to avoid duplicates
  createdAttributes.set(slug, attribute);

  // Update categories to include this attribute
  for (const categoryId of categoryIds) {
    const category = await CategoryModel.findById(categoryId);
    if (category) {
      const attributeIds = category.attributeIds || [];
      if (!attributeIds.some((id: any) => id.toString() === attribute._id.toString())) {
        attributeIds.push(attribute._id);
        await CategoryModel.updateOne(
          { _id: categoryId },
          { $set: { attributeIds } }
        );
      }
    }
  }

  return attribute;
};
