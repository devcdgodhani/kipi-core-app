import CategoryModel from '../models/categoryModel';
import slugify from 'slugify';
import { CATEGORY_STATUS } from '../../../constants';

interface ISeedCategory {
  name: string;
  description?: string;
  children?: ISeedCategory[];
}

const clothesCategories: ISeedCategory[] = [
  {
    name: 'Men',
    description: 'Clothing for men',
    children: [
      { name: 'Shirts' },
      { name: 'T-Shirts' },
      { name: 'Jeans' },
      { name: 'Trousers' },
      { name: 'Jackets' },
      { name: 'Innerwear' },
    ],
  },
  {
    name: 'Women',
    description: 'Clothing for women',
    children: [
      { name: 'Dresses' },
      { name: 'Tops' },
      { name: 'T-Shirts' },
      { name: 'Jeans' },
      { name: 'Skirts' },
      { name: 'Ethnic Wear' },
      { name: 'Lingerie' },
    ],
  },
  {
    name: 'Kids',
    description: 'Clothing for kids',
    children: [
      { name: 'Boys' },
      { name: 'Girls' },
      { name: 'Infants' },
    ],
  },
  {
    name: 'Accessories',
    description: 'Fashion accessories',
    children: [
      { name: 'Belts' },
      { name: 'Wallets' },
      { name: 'Sunglasses' },
      { name: 'Watches' },
    ],
  },
];

export const seedCategories = async () => {
  console.log('🌱 Seeding categories...');
  try {
    for (const cat of clothesCategories) {
      await upsertCategory(cat);
    }
    console.log('✅ Category seeding completed.');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  }
};

const upsertCategory = async (cat: ISeedCategory, parentId: any = null) => {
  const slug = slugify(cat.name, { lower: true });
  
  let category = await CategoryModel.findOne({ slug });
  
  if (!category) {
    category = await CategoryModel.create({
      name: cat.name,
      slug,
      parentId,
      description: cat.description || '',
      status: CATEGORY_STATUS.ACTIVE,
      order: 0,
    });
    console.log(`+ Created category: ${cat.name}`);
  } else {
    // console.log(`~ Category already exists: ${cat.name}`);
  }

  if (cat.children && cat.children.length > 0) {
    for (const child of cat.children) {
      await upsertCategory(child, category._id);
    }
  }
};
