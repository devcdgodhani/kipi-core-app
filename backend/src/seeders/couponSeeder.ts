import { DISCOUNT_TYPE, COUPON_APPLICABILITY } from '../constants';
import CouponModel from '../db/mongodb/models/couponModel';

export const seedCoupons = async (categories: any[], products: any[]) => {
  console.log('🌱 Seeding coupons...');

  const coupons = [
    // Cart-wide coupons
    {
      code: 'WELCOME10',
      description: 'Welcome offer - 10% off on first order',
      discountType: DISCOUNT_TYPE.PERCENTAGE,
      discountValue: 10,
      applicability: COUPON_APPLICABILITY.ALL,
      minCartValue: 500,
      maxDiscountCap: 500,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      totalUsageLimit: 1000,
      perUserUsageLimit: 1,
      canStackWithOthers: false,
      priority: 1,
      isActive: true,
      autoApply: false,
    },
    {
      code: 'FLAT200',
      description: 'Flat ₹200 off on orders above ₹2000',
      discountType: DISCOUNT_TYPE.FIXED_AMOUNT,
      discountValue: 200,
      applicability: COUPON_APPLICABILITY.ALL,
      minCartValue: 2000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      totalUsageLimit: 500,
      perUserUsageLimit: 3,
      canStackWithOthers: true,
      priority: 2,
      isActive: true,
      autoApply: false,
    },
    // Category-specific coupons
    {
      code: 'CATEGORY20',
      description: '20% off on selected category',
      discountType: DISCOUNT_TYPE.PERCENTAGE,
      discountValue: 20,
      applicability: COUPON_APPLICABILITY.CATEGORY,
      applicableCategories: categories.slice(0, 2).map(c => c._id),
      minCartValue: 1000,
      maxDiscountCap: 1000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      totalUsageLimit: 300,
      perUserUsageLimit: 2,
      canStackWithOthers: false,
      priority: 3,
      isActive: true,
      autoApply: false,
    },
    // Product-specific coupons
    {
      code: 'PRODUCT15',
      description: '15% off on selected products',
      discountType: DISCOUNT_TYPE.PERCENTAGE,
      discountValue: 15,
      applicability: COUPON_APPLICABILITY.PRODUCT,
      applicableProducts: products.slice(0, 3).map(p => p._id),
      minCartValue: 500,
      maxDiscountCap: 750,
      startDate: new Date(),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
      totalUsageLimit: 200,
      perUserUsageLimit: 1,
      canStackWithOthers: true,
      priority: 4,
      isActive: true,
      autoApply: false,
    },
    // Festival coupon
    {
      code: 'DIWALI25',
      description: 'Diwali Special - 25% off',
      discountType: DISCOUNT_TYPE.PERCENTAGE,
      discountValue: 25,
      applicability: COUPON_APPLICABILITY.ALL,
      minCartValue: 1500,
      maxDiscountCap: 2000,
      festivalEvent: 'Diwali',
      startDate: new Date(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      totalUsageLimit: 5000,
      perUserUsageLimit: 1,
      canStackWithOthers: false,
      priority: 5,
      isActive: true,
      autoApply: true,
    },
    // BOGO coupon
    {
      code: 'BOGO50',
      description: 'Buy One Get One 50% off',
      discountType: DISCOUNT_TYPE.BOGO,
      discountValue: 50,
      applicability: COUPON_APPLICABILITY.PRODUCT,
      applicableProducts: products.slice(3, 6).map(p => p._id),
      minCartValue: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      totalUsageLimit: 100,
      perUserUsageLimit: 2,
      canStackWithOthers: false,
      priority: 6,
      isActive: true,
      autoApply: false,
    },
  ];

  const createdCoupons = await CouponModel.insertMany(coupons);
  console.log(`✅ Created ${createdCoupons.length} coupons`);
  
  return createdCoupons;
};
