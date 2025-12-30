import { faker } from '@faker-js/faker';
import { attributeService, categoryService, productService, userService } from '../../../services';
import { ATTRIBUTE_TYPE, PRODUCT_STATUS, USER_TYPE } from '../../../constants';
import { IAttributeAttributes, ICategoryAttributes, IProductAttributes } from '../../../interfaces';
import { Types } from 'mongoose';

export const productSeeder = async () => {
  try {
    console.log('🌱 Seeding Product System (Massive)...');

    // 0. Clean (if running isolated, though main orchestrator does it)
    // await productService.delete({}); 

    // 1. Create Attributes
    console.log('   Creating Attributes...');

    // Fetch suppliers for product association
    const suppliers = await userService.findAll({ type: USER_TYPE.SUPPLIER });
    const supplierIds = suppliers.map(s => (s as any)._id);

    // Create 100+ placeholder attributes for various specs
    for (let i = 0; i < 110; i++) {
        const attrCode = `attr_${i}`;
        let attr = await attributeService.findByCode(attrCode);
        if (!attr) {
            await attributeService.create({
                name: faker.commerce.productAdjective() + ' ' + faker.commerce.productMaterial(),
                code: attrCode,
                type: ATTRIBUTE_TYPE.TEXT,
                isRequired: false,
                isActive: true
            } as any);
        }
    }

    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
    const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Orange', 'Pink', 'Grey', 'Brown', 'Navy'];
    const materials = ['Cotton', 'Polyester', 'Leather', 'Denim', 'Wool', 'Silk', 'Linen', 'Nylon', 'Spandex'];

    let sizeAttr = await attributeService.findByCode('size');
    if (!sizeAttr) {
      sizeAttr = await attributeService.create({ name: 'Size', code: 'size', type: ATTRIBUTE_TYPE.SELECT, options: sizes, isRequired: false, isActive: true } as any) as any;
    }
    let colorAttr = await attributeService.findByCode('color');
    if (!colorAttr) {
      colorAttr = await attributeService.create({ name: 'Color', code: 'color', type: ATTRIBUTE_TYPE.SELECT, options: colors, isRequired: false, isActive: true } as any) as any;
    }
    let materialAttr = await attributeService.findByCode('material');
    if (!materialAttr) {
        materialAttr = await attributeService.create({ name: 'Material', code: 'material', type: ATTRIBUTE_TYPE.SELECT, options: materials, isRequired: false, isActive: true } as any) as any;
    }

    // 2. Create Categories (Hierarchy)
    console.log('   Creating Categories...');
    const mainCats = ['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Beauty', 'Toys', 'Books', 'Groceries', 'Automotive', 'Health'];
    const categoryDocs = [];

    for (const catName of mainCats) {
        const parent = await categoryService.create({
            name: catName,
            slug: faker.helpers.slugify(catName).toLowerCase() + '-' + faker.random.alphaNumeric(3),
            description: faker.lorem.sentence(),
            isActive: true
        } as any) as any;
        
        // Subcategories: 10 per main category to reach 100+ total
        for (let i = 0; i < 10; i++) {
            const subName = faker.commerce.department() + ' ' + faker.random.alphaNumeric(4).toUpperCase();
            await categoryService.create({
                name: subName,
                slug: faker.helpers.slugify(subName).toLowerCase() + '-' + faker.random.alphaNumeric(3),
                parentId: (parent as any)._id,
                attributes: catName === 'Fashion' ? [(sizeAttr as any)!._id, (colorAttr as any)!._id, (materialAttr as any)!._id] : [],
                isActive: true
            } as any);
        }
        categoryDocs.push(parent);
    }
    
    // Fetch all leaf categories for products
    const allCategories = await categoryService.findAll({});
    const leafCategories = allCategories.filter(c => (c as any).parentId); 

    // 3. Create Products with Variants (100+)
    console.log('   Generating 120 Products...');
    for (let i = 0; i < 120; i++) {
        const productName = faker.commerce.productName();
        const category = leafCategories[Math.floor(Math.random() * leafCategories.length)];
        const mrp = parseFloat(faker.commerce.price(1000, 5000));
        const sellingPrice = mrp * 0.9; // 10% discount
        const costPrice = mrp * 0.6; // 40% margin

        // Prepare Variants: Empty for simple products as per new requirement
        const variants: any[] = [];

        const sourceType = Math.random() > 0.3 ? 'SUPPLIER' : 'SELF_MANUFACTURE';
        let supplierId = undefined;
        
        if (sourceType === 'SUPPLIER' && supplierIds.length > 0) {
            supplierId = supplierIds[Math.floor(Math.random() * supplierIds.length)];
        }

        await productService.createWithVariants({
            name: productName,
            slug: faker.helpers.slugify(productName).toLowerCase() + '-' + faker.random.alphaNumeric(6),
            description: faker.commerce.productDescription(),
            category: (category as any)._id,
            brand: faker.company.name(),
            mrp: mrp,
            sellingPrice: sellingPrice,
            costPrice: costPrice,
            status: PRODUCT_STATUS.ACTIVE,
            variants: variants, // Can be empty
            hasLotTracking: Math.random() > 0.5, // 50% products tracked by lots
            sourceType: sourceType,
            supplierId: supplierId
        });
        
        if (i % 20 === 0) console.log(`      ...created ${i} products`);
    }

    console.log('✅ Product System Seeded Successfully (120+ Products)!');
  } catch (error) {
    console.error('Error seeding product system:', error);
  }
};

export const clearProducts = async () => {
  try {
    console.log('Clearing Product System...');
    await productService.delete({});
    await categoryService.delete({});
    await attributeService.delete({});
    console.log('Product System Cleared!');
  } catch (error) {
    console.error('Error clearing product system:', error);
  }
};
