import slugify from 'slugify';
import { PRODUCT_STATUS } from '../../../constants/product';
import { SKU_STATUS } from '../../../constants/sku';
import { attributeService } from '../../../services/concrete/attributeService';
import { categoryService } from '../../../services/concrete/categoryService';
import { productService } from '../../../services/concrete/productService';
import { skuService } from '../../../services/concrete/skuService';

interface ISeedProduct {
  name: string;
  categoryName: string;
  description: string;
  basePrice: number;
  salePrice: number;
  variants: {
    color: string;
    size: string;
    quantity: number;
  }[];
}

const products: ISeedProduct[] = [
  {
    name: "Classic Men's White Shirt",
    categoryName: 'Shirts',
    description: 'Premium cotton white shirt for formal and casual wear.',
    basePrice: 1500,
    salePrice: 1299,
    variants: [
      { color: 'White', size: 'M', quantity: 50 },
      { color: 'White', size: 'L', quantity: 50 },
    ],
  },
  {
    name: "Women's Floral Summer Dress",
    categoryName: 'Dresses',
    description: 'Lightweight floral dress perfect for summer outings.',
    basePrice: 2500,
    salePrice: 1999,
    variants: [
      { color: 'Red', size: 'S', quantity: 30 },
      { color: 'Red', size: 'M', quantity: 40 },
    ],
  },
  {
    name: "Slim Fit Blue Jeans",
    categoryName: 'Jeans',
    description: 'Stretchable slim fit denim jeans for daily comfort.',
    basePrice: 1800,
    salePrice: 1499,
    variants: [
      { color: 'Blue', size: '32', quantity: 60 }, // '32' mapping to 'M' or similar logic if needed, but keeping simple
      { color: 'Blue', size: '34', quantity: 60 }, // '34' mapping to 'L'
    ],
  },
  {
    name: "Leather Wallet",
    categoryName: 'Wallets',
    description: 'Genuine leather wallet with multiple card slots.',
    basePrice: 1200,
    salePrice: 999,
    variants: [
      { color: 'Brown', size: 'Free Size', quantity: 100 }, // 'Free Size' might need 'One Size' logic or just generic
    ],
  },
  {
    name: "Kids Printed T-Shirt",
    categoryName: 'Boys',
    description: 'Fun printed t-shirt for boys.',
    basePrice: 600,
    salePrice: 499,
    variants: [
      { color: 'Yellow', size: 'S', quantity: 40 },
      { color: 'Yellow', size: 'M', quantity: 40 },
    ],
  },
];

export const seedProducts = async () => {
  console.log('🌱 Seeding products...');
  try {
    const sizeAttr = await attributeService.findOne({ name: 'Size' });
    const colorAttr = await attributeService.findOne({ name: 'Color' });

    if (!sizeAttr || !colorAttr) {
      console.warn('⚠️ Attributes "Size" or "Color" not found. Skipping product seeding.');
      return;
    }

    // Cache categories
    const categories = await categoryService.findAll({});
    const categoryMap = new Map(categories.map((c: any) => [c.name, c]));

    for (const p of products) {
      const category = categoryMap.get(p.categoryName);
      if (!category) {
        // console.warn(`⚠️ Category "${p.categoryName}" not found. Skipping product "${p.name}".`);
        continue;
      }

      const slug = slugify(p.name, { lower: true });
      let product = await productService.findOne({ slug });

      if (!product) {
        // Create Product
        product = await productService.create({
          name: p.name,
          slug,
          productCode: `PRD-${Math.floor(Math.random() * 10000)}`,
          description: p.description,
          basePrice: p.basePrice,
          salePrice: p.salePrice,
          categoryIds: [(category as any)._id],
          status: PRODUCT_STATUS.ACTIVE,
          stock: 0, // Will be updated by SKU sync
        });
        console.log(`+ Created product: ${p.name}`);

        // Create SKUs
        for (const v of p.variants) {
          const skuCode = `SKU-${slugify(p.name).substring(0, 3).toUpperCase()}-${v.color.substring(0, 1)}-${v.size}`;
          const existingSku = await skuService.findOne({ skuCode });

          if (!existingSku) {
            // Map attributes
            // Note: Simple mapping. In production, we'd lookup exact option IDs/values.
            // Here assuming text values are stored directly or basic match.
            const variantAttributes = [
              { attributeId: (colorAttr as any)._id, value: v.color },
              { attributeId: (sizeAttr as any)._id, value: v.size },
            ];

            await skuService.create({
              productId: (product as any)._id,
              skuCode,
              variantAttributes,
              quantity: v.quantity,
              basePrice: p.basePrice,
              salePrice: p.salePrice,
              status: SKU_STATUS.ACTIVE,
            } as any);
            // console.log(`  + Created SKU: ${skuCode}`);
          }
        }
      }
    }
    console.log('✅ Product seeding completed.');
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  }
};
