import CouponModel from '../../db/mongodb/models/couponModel';
import { ICoupon, ICouponAttributes } from '../../interfaces';
import { MongooseCommonService } from './mongooseCommonService';
import { DISCOUNT_TYPE, COUPON_APPLICABILITY } from '../../constants';

interface CartData {
  items: {
    productId: string;
    categoryId: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  userId?: string;
}

export class CouponService extends MongooseCommonService<ICouponAttributes, ICoupon> {
  constructor() {
    super(CouponModel);
  }

  async validateCoupon(code: string, cartData: CartData) {
    const coupon = await this.model.findOne({ 
      code: code.toUpperCase(), 
      isActive: true,
      isDeleted: false 
    });

    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    // Check date validity
    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      return { valid: false, message: 'Coupon not yet active' };
    }
    if (coupon.endDate && coupon.endDate < now) {
      return { valid: false, message: 'Coupon has expired' };
    }

    // Check usage limits
    if (coupon.totalUsageLimit && coupon.currentUsageCount >= coupon.totalUsageLimit) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    // Check minimum cart value
    if (coupon.minCartValue && cartData.subtotal < coupon.minCartValue) {
      return { valid: false, message: `Minimum cart value of ${coupon.minCartValue} required` };
    }

    // Check applicability
    if (coupon.applicability === COUPON_APPLICABILITY.CATEGORY && coupon.applicableCategories) {
      const hasApplicableItem = cartData.items.some(item => 
        coupon.applicableCategories!.some(catId => catId.toString() === item.categoryId)
      );
      if (!hasApplicableItem) {
        return { valid: false, message: 'Coupon not applicable to cart items' };
      }
    }

    if (coupon.applicability === COUPON_APPLICABILITY.PRODUCT && coupon.applicableProducts) {
      const hasApplicableItem = cartData.items.some(item => 
        coupon.applicableProducts!.some(prodId => prodId.toString() === item.productId)
      );
      if (!hasApplicableItem) {
        return { valid: false, message: 'Coupon not applicable to cart items' };
      }
    }

    return { valid: true, coupon };
  }

  async applyCoupon(code: string, cartData: CartData) {
    const validation = await this.validateCoupon(code, cartData);
    if (!validation.valid || !validation.coupon) {
      return { success: false, message: validation.message };
    }

    const coupon = validation.coupon;
    let discount = 0;

    switch (coupon.discountType) {
      case DISCOUNT_TYPE.PERCENTAGE:
        discount = (cartData.subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountCap) {
          discount = Math.min(discount, coupon.maxDiscountCap);
        }
        break;

      case DISCOUNT_TYPE.FIXED_AMOUNT:
        discount = coupon.discountValue;
        break;

      case DISCOUNT_TYPE.FREE_SHIPPING:
        // Shipping discount handled separately
        discount = 0;
        break;

      case DISCOUNT_TYPE.BOGO:
        // BOGO logic - simplified
        discount = 0; // Implement based on specific BOGO rules
        break;
    }

    return {
      success: true,
      discount: Number(discount.toFixed(2)),
      finalAmount: Number((cartData.subtotal - discount).toFixed(2)),
      couponCode: coupon.code,
      discountType: coupon.discountType,
    };
  }

  async getApplicableCoupons(cartData: CartData) {
    const now = new Date();
    const coupons = await this.model.find({
      isActive: true,
      isDeleted: false,
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: null, endDate: null },
      ],
    });

    const applicableCoupons = [];
    for (const coupon of coupons) {
      const validation = await this.validateCoupon(coupon.code, cartData);
      if (validation.valid) {
        const result = await this.applyCoupon(coupon.code, cartData);
        if (result.success) {
          applicableCoupons.push({
            code: coupon.code,
            description: coupon.description,
            discount: result.discount,
            autoApply: coupon.autoApply,
          });
        }
      }
    }

    return applicableCoupons.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  }

  async incrementUsage(couponId: string, userId?: string) {
    return this.model.findByIdAndUpdate(
      couponId,
      { $inc: { currentUsageCount: 1 } },
      { new: true }
    );
  }

  async getActiveCoupons(filters?: {
    applicability?: COUPON_APPLICABILITY;
    discountType?: DISCOUNT_TYPE;
  }) {
    const query: any = { isActive: true, isDeleted: false };
    const now = new Date();

    query.$or = [
      { startDate: { $lte: now }, endDate: { $gte: now } },
      { startDate: null, endDate: null },
    ];

    if (filters?.applicability) {
      query.applicability = filters.applicability;
    }

    if (filters?.discountType) {
      query.discountType = filters.discountType;
    }

    return this.model.find(query).sort({ priority: -1, createdAt: -1 }).exec();
  }

  async scheduleCoupon(couponId: string, schedule: { startDate: Date; endDate: Date }) {
    return this.model.findByIdAndUpdate(
      couponId,
      { startDate: schedule.startDate, endDate: schedule.endDate },
      { new: true }
    );
  }
}

export const couponService = new CouponService();
