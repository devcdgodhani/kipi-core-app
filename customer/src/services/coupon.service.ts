import http from './http';

const COUPON_BASE_URL = '/coupon';

export const couponService = {
  /**
   * Validate and apply a coupon
   * @param code Coupon code
   * @param orderAmount Total order amount (subtotal)
   */
  apply: async (code: string, orderAmount: number) => {
    const response: any = await http.post(`${COUPON_BASE_URL}/apply`, { code, orderAmount });
    return response.data;
  },
};
