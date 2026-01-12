import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Address } from '../types/address.types';
import type { CheckoutState, CouponInfo } from '../types/checkout.types';
import type { CreateOrderRequest } from '../types/order.types';
import { orderService } from '../services/order.service';
import { couponService } from '../services/coupon.service';
import { walletService } from '../services/wallet.service';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface CheckoutContextType extends CheckoutState {
    setStep: (step: CheckoutState['step']) => void;
    setSelectedAddress: (address: Address) => void;
    setPaymentMethod: (method: 'COD' | 'ONLINE') => void;
    applyCoupon: (code: string) => Promise<void>;
    removeCoupon: () => void;
    toggleWallet: (use: boolean) => void;
    placeOrder: () => Promise<void>;
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
            walletDiscount: 0,
            total: 0
        },
        wallet: {
            useWallet: false,
            amountToUse: 0
        },
        walletBalance: 0
    });

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((acc, item) => {
            const productRef = (item.productId as any)?.name ? (item.productId as any) : (item.product || {});
            const skuRef = (item.skuId as any)?.skuCode ? (item.skuId as any) : (item.sku || {});

            const price = skuRef?.offerPrice || skuRef?.salePrice || skuRef?.basePrice ||
                productRef?.offerPrice || productRef?.salePrice || productRef?.basePrice ||
                item.salePrice || item.price || 0;
            return acc + (price * item.quantity);
        }, 0);
    };

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const res = await walletService.getMyWallet();
                // If res has .data, use it (single unwrap), otherwise use res itself (double unwrap)
                const walletData = res?.data || res;
                if (walletData) {
                    setState(prev => ({ ...prev, walletBalance: walletData.availableBalance || 0 }));
                }
            } catch (err) {
                console.error("Failed to fetch wallet", err);
            }
        };
        fetchWallet();
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

        // Wallet Logic: Limit usage to min(balance, remaining total)
        // Ensure discount doesn't exceed total
        const totalBeforeWallet = subTotal + tax + shipping - discount;
        let walletDiscount = 0;
        if (state.wallet.useWallet) {
            walletDiscount = Math.min(state.walletBalance, Math.max(0, totalBeforeWallet));
        }

        const total = Math.max(0, totalBeforeWallet - walletDiscount);

        setState(prev => ({
            ...prev,
            wallet: {
                ...prev.wallet,
                amountToUse: walletDiscount
            },
            orderSummary: { subTotal, tax, shipping, discount, walletDiscount, total }
        }));
    }, [cart, state.appliedCoupon, state.wallet.useWallet, state.walletBalance]);

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

    const toggleWallet = (use: boolean) => {
        setState(prev => ({
            ...prev,
            wallet: {
                ...prev.wallet,
                useWallet: use
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
            const items = cart.items.map(item => {
                const productRef = (item.productId as any)?.name ? (item.productId as any) : (item.product || {});
                const skuRef = (item.skuId as any)?.skuCode ? (item.skuId as any) : (item.sku || {});
                const pId = typeof item.productId === 'object' ? (item.productId as any)?._id : item.productId;
                const sId = typeof item.skuId === 'object' ? (item.skuId as any)?._id : item.skuId;

                const price = skuRef?.offerPrice || skuRef?.salePrice || skuRef?.basePrice ||
                    productRef?.offerPrice || productRef?.salePrice || productRef?.basePrice ||
                    item.salePrice || item.price || 0;

                return {
                    productId: pId || '',
                    skuId: sId || pId || '',
                    name: productRef.name || 'Unknown Product',
                    quantity: item.quantity || 1,
                    price: price,
                    total: price * (item.quantity || 1),
                    image: skuRef?.media?.[0]?.url || productRef.mainImage || productRef.media?.[0]?.url || ''
                };
            });

            const orderData: CreateOrderRequest = {
                items: items as any, // Cast for compatibility with OrderItem
                shippingAddress: {
                    name: state.selectedAddress.name,
                    mobile: state.selectedAddress.mobile,
                    street: state.selectedAddress.street,
                    city: state.selectedAddress.city,
                    state: state.selectedAddress.state,
                    country: state.selectedAddress.country,
                    pincode: state.selectedAddress.pincode,
                    landmark: state.selectedAddress.landmark
                },
                billingAddress: {
                    name: state.selectedAddress.name,
                    mobile: state.selectedAddress.mobile,
                    street: state.selectedAddress.street,
                    city: state.selectedAddress.city,
                    state: state.selectedAddress.state,
                    country: state.selectedAddress.country,
                    pincode: state.selectedAddress.pincode,
                    landmark: state.selectedAddress.landmark
                },
                paymentMethod: state.paymentMethod,
                couponCode: state.appliedCoupon?.code,
                subTotal: state.orderSummary.subTotal,
                tax: state.orderSummary.tax,
                shippingCost: state.orderSummary.shipping,
                walletAmountUsed: state.wallet.useWallet ? state.wallet.amountToUse : 0,
                totalAmount: state.orderSummary.total
            };

            const order = await orderService.create(orderData);

            toast.success("Order placed successfully!");

            // If full amount paid by wallet, order might be confirmed directly or pending if backend handles it
            if (state.paymentMethod === 'ONLINE' && state.orderSummary.total > 0) {
                navigate(`/payment/checkout/${order._id}`);
            } else {
                navigate(`/order/success/${order._id}`);
            }

            await clearCart();
            setState(prev => ({ ...prev, appliedCoupon: null }));

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
            toggleWallet,
            placeOrder,
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
