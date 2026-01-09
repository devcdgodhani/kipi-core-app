import { COUPON_TYPE, COUPON_STATUS } from '../../../constants/coupon';
import { couponService } from '../../../services/concrete/couponService';

export const seedCoupons = async () => {
  console.log('🌱 Seeding coupons...');
  try {
    const coupons = [
      {
        code: 'WELCOME500',
        description: 'Flat ₹500 off on your first order',
        type: COUPON_TYPE.FLAT,
        value: 500,
        minOrderAmount: 1500,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)), // 6 months validity
      },
      {
        code: 'SUMMER20',
        description: '20% off on summer collection',
        type: COUPON_TYPE.PERCENTAGE,
        value: 20,
        maxDiscountAmount: 1000,
        minOrderAmount: 1000,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      },
      {
        code: 'EXPIRED10',
        description: 'Expired coupon',
        type: COUPON_TYPE.PERCENTAGE,
        value: 10,
        startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        endDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        status: COUPON_STATUS.EXPIRED,
      },
    ];

    for (const c of coupons) {
      const existing = await couponService.findOne({ code: c.code });
      if (!existing) {
        await couponService.create({
          ...c,
          status: c.status || COUPON_STATUS.ACTIVE,
        } as any);
        console.log(`+ Created Coupon: ${c.code}`);
      }
    }
    console.log('✅ Coupon seeding completed.');
  } catch (error) {
    console.error('❌ Error seeding coupons:', error);
  }
};
