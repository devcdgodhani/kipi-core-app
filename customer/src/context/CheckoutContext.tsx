import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Address } from '../types/address.types';
import type { CheckoutState, CreateOrderRequest, CouponInfo } from '../types/checkout.types';
import { orderService } from '../services/order.service';
import { couponService } from '../services/coupon.service';
import { loyaltyService } from '../services/loyalty.service';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface CheckoutContextType extends CheckoutState {
    setStep: (step: CheckoutState['step']) => void;
    setSelectedAddress: (address: Address) => void;
    setPaymentMethod: (method: 'COD' | 'ONLINE') => void;
    applyCoupon: (code: string) => Promise<void>;
    removeCoupon: () => void;
    toggleLoyaltyPoints: (use: boolean, points?: number) => void;
    placeOrder: () => Promise<void>;
    availablePoints: number;
    loading: boolean;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const { cart, clearCart } = useCart();
    const [loading, setLoading] = useState(false);

    const [state, setState] = useState<CheckoutState>({
        step: 'CART',
        selectedAddress: null,
        paymentMethod: 'COD',
        appliedCoupon: null,
        orderSummary: {
            subTotal: 0,
            tax: 0,
            shipping: 0,
            discount: 0,
            pointsDiscount: 0,
            total: 0
        },
        loyaltyPoints: {
            usePoints: false,
            pointsToUse: 0
        },
        availablePoints: 0
    });

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((acc, item) => {
            const price = item.sku?.salePrice || item.sku?.basePrice || item.product?.salePrice || item.product?.basePrice || 0;
            return acc + (price * item.quantity);
        }, 0);
    };

    useEffect(() => {
        const fetchPoints = async () => {
            try {
                const res = await loyaltyService.getStatus({ options: { limit: 1 } });
                setState(prev => ({ ...prev, availablePoints: res.balance }));
            } catch (err) {
                console.error("Failed to fetch loyalty points", err);
            }
        };
        fetchPoints();
    }, []);

    useEffect(() => {
        const subTotal = calculateTotal();
        const tax = 0;
        const shipping = subTotal > 499 ? 0 : 40;

        let discount = 0;
        if (state.appliedCoupon) {
            if (state.appliedCoupon.type === 'PERCENTAGE') {
                discount = (subTotal * state.appliedCoupon.value) / 100;
            } else {
                discount = state.appliedCoupon.value;
            }
        }

        let pointsDiscount = 0;
        if (state.loyaltyPoints.usePoints) {
            pointsDiscount = state.loyaltyPoints.pointsToUse; // 1 point = 1 INR
        }

        const total = subTotal + tax + shipping - discount - pointsDiscount;

        setState(prev => ({
            ...prev,
            orderSummary: { subTotal, tax, shipping, discount, pointsDiscount, total }
        }));
    }, [cart, state.appliedCoupon, state.loyaltyPoints.usePoints, state.loyaltyPoints.pointsToUse]);

    const setStep = (step: CheckoutState['step']) => {
        setState(prev => ({ ...prev, step }));
    };

    const setSelectedAddress = (address: Address) => {
        setState(prev => ({ ...prev, selectedAddress: address }));
    };

    const setPaymentMethod = (method: 'COD' | 'ONLINE') => {
        setState(prev => ({ ...prev, paymentMethod: method }));
    };

    const applyCoupon = async (code: string) => {
        try {
            setLoading(true);
            const couponData = await couponService.apply(code, state.orderSummary.subTotal);

            const couponInfo: CouponInfo = {
                code: couponData.code,
                discountAmount: 0, // Calculated in useEffect
                description: couponData.description,
                type: couponData.type,
                value: couponData.value
            };

            setState(prev => ({ ...prev, appliedCoupon: couponInfo }));
            toast.success("Coupon applied successfully!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid coupon code");
            setState(prev => ({ ...prev, appliedCoupon: null }));
        } finally {
            setLoading(false);
        }
    };

    const removeCoupon = () => {
        setState(prev => ({ ...prev, appliedCoupon: null }));
        toast.success("Coupon removed");
    };

    const toggleLoyaltyPoints = (use: boolean, points: number = 0) => {
        setState(prev => ({
            ...prev,
            loyaltyPoints: {
                usePoints: use,
                pointsToUse: points
            }
        }));
    };

    const placeOrder = async () => {
        if (!state.selectedAddress) {
            toast.error("Please select a delivery address");
            return;
        }
        if (!cart || !cart.items || cart.items.length === 0) {
            toast.error("Cart is empty");
            return;
        }

        setLoading(true);
        try {
            const items = cart.items.map(item => ({
                productId: item.productId,
                skuId: item.skuId,
                name: item.product.name,
                quantity: item.quantity,
                price: item.sku?.salePrice || item.sku?.basePrice || item.product.salePrice || item.product.basePrice || 0,
                total: ((item.sku?.salePrice || item.sku?.basePrice || item.product.salePrice || item.product.basePrice) || 0) * item.quantity,
                image: item.sku?.media?.[0]?.url || item.product.mainImage || item.product.media?.[0]?.url
            }));

            const orderData: CreateOrderRequest = {
                items,
                shippingAddress: {
                    name: state.selectedAddress.name,
                    mobile: state.selectedAddress.mobile,
                    street: state.selectedAddress.street,
                    city: state.selectedAddress.city,
                    state: state.selectedAddress.state,
                    country: state.selectedAddress.country,
                    pincode: state.selectedAddress.pincode,
                    landmark: state.selectedAddress.landmark
                } as any,
                billingAddress: {
                    name: state.selectedAddress.name,
                    mobile: state.selectedAddress.mobile,
                    street: state.selectedAddress.street,
                    city: state.selectedAddress.city,
                    state: state.selectedAddress.state,
                    country: state.selectedAddress.country,
                    pincode: state.selectedAddress.pincode,
                    landmark: state.selectedAddress.landmark
                } as any,
                paymentMethod: state.paymentMethod,
                couponCode: state.appliedCoupon?.code,
                subTotal: state.orderSummary.subTotal,
                tax: state.orderSummary.tax,
                shippingCost: state.orderSummary.shipping,
                pointsUsed: state.loyaltyPoints.usePoints ? state.loyaltyPoints.pointsToUse : 0,
                totalAmount: state.orderSummary.total
            };

            const order = await orderService.create(orderData);

            toast.success("Order placed successfully!");
            await clearCart();
            setState(prev => ({ ...prev, appliedCoupon: null }));
            navigate(`/order/success/${order._id}`);

        } catch (error) {
            console.error(error);
            toast.error("Failed to place order");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CheckoutContext.Provider value={{
            ...state,
            setStep,
            setSelectedAddress,
            setPaymentMethod,
            applyCoupon,
            removeCoupon,
            toggleLoyaltyPoints,
            placeOrder,
            availablePoints: state.availablePoints,
            loading
        }}>
            {children}
        </CheckoutContext.Provider>
    );
};

export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (context === undefined) {
        throw new Error('useCheckout must be used within a CheckoutProvider');
    }
    return context;
};
