import React, { createContext, useContext, useState, useEffect } from 'react';
import { Address } from '../types/address.types';
import { CheckoutState, CouponInfo } from '../types/checkout.types';
import { CreateOrderRequest } from '../types/order.types';
import { orderService } from '../services/order.service';
import { couponService } from '../services/coupon.service';
import { walletService } from '../services/wallet.service';
import { useCart } from './CartContext';
import { useWallet } from './WalletContext';
import Toast from 'react-native-toast-message';
import { getSafeImageUrl } from '../utils/imageUtils';

interface CheckoutContextType extends CheckoutState {
    setStep: (step: CheckoutState['step']) => void;
    setSelectedAddress: (address: Address) => void;
    setPaymentMethod: (method: 'COD' | 'ONLINE') => void;
    applyCoupon: (code: string) => Promise<void>;
    removeCoupon: () => void;
    toggleWallet: (use: boolean) => void;
    placeOrder: (navigation: any) => Promise<void>;
    loading: boolean;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { items: cartItems, cartTotal: cartSubTotal, clearCart, selectedItems, removeFromCart } = useCart();
    const { wallet, refreshWallet } = useWallet();
    const [loading, setLoading] = useState(false);

    const [state, setState] = useState<CheckoutState>({
        step: 'ADDRESS',
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

    useEffect(() => {
        if (wallet) {
            setState(prev => ({ ...prev, walletBalance: wallet.availableBalance || 0 }));
        }
    }, [wallet]);

    useEffect(() => {
        const subTotal = cartItems
            .filter(item => selectedItems.includes(item._id))
            .reduce((acc, item) => acc + (item.price * item.quantity), 0);

        const tax = 0;
        const shipping = subTotal > 499 ? 0 : 40;

        let discount = 0;
        if (state.appliedCoupon) {
            if (state.appliedCoupon.type === 'PERCENTAGE') {
                discount = (subTotal * state.appliedCoupon.value) / 100;
                if (state.appliedCoupon.maxDiscountAmount && discount > state.appliedCoupon.maxDiscountAmount) {
                    discount = state.appliedCoupon.maxDiscountAmount;
                }
            } else {
                discount = state.appliedCoupon.value;
            }
        }

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
    }, [cartItems, selectedItems, state.appliedCoupon, state.wallet.useWallet, state.walletBalance]);

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
                value: couponData.value,
                maxDiscountAmount: couponData.maxDiscountAmount
            };

            setState(prev => ({ ...prev, appliedCoupon: couponInfo }));
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Coupon applied successfully!'
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || "Invalid coupon code"
            });
            setState(prev => ({ ...prev, appliedCoupon: null }));
        } finally {
            setLoading(false);
        }
    };

    const removeCoupon = () => {
        setState(prev => ({ ...prev, appliedCoupon: null }));
        Toast.show({
            type: 'success',
            text1: 'Removed',
            text2: 'Coupon removed'
        });
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

    const placeOrder = async (navigation: any) => {
        if (!state.selectedAddress) {
            Toast.show({ type: 'error', text1: 'Address Required', text2: "Please select a delivery address" });
            return;
        }
        if (!cartItems || cartItems.length === 0) {
            Toast.show({ type: 'error', text1: 'Cart Empty', text2: "Cart is empty" });
            return;
        }
        if (selectedItems.length === 0) {
            Toast.show({ type: 'error', text1: 'Selection Required', text2: "No items selected for checkout" });
            return;
        }

        setLoading(true);
        try {
            const items = cartItems
                .filter(item => selectedItems.includes(item._id))
                .map(item => ({
                    productId: item.productId,
                    skuId: item.skuId || null,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity,
                    image: getSafeImageUrl(item.thumbnail) || ''
                }));

            const orderData: CreateOrderRequest = {
                items: items as any,
                shippingAddress: {
                    name: state.selectedAddress.name || '',
                    mobile: state.selectedAddress.mobile || '',
                    street: state.selectedAddress.street || '',
                    city: state.selectedAddress.city || '',
                    state: state.selectedAddress.state || '',
                    country: state.selectedAddress.country || 'India',
                    pincode: state.selectedAddress.pincode || '',
                    landmark: state.selectedAddress.landmark || ''
                },
                billingAddress: {
                    name: state.selectedAddress.name || '',
                    mobile: state.selectedAddress.mobile || '',
                    street: state.selectedAddress.street || '',
                    city: state.selectedAddress.city || '',
                    state: state.selectedAddress.state || '',
                    country: state.selectedAddress.country || 'India',
                    pincode: state.selectedAddress.pincode || '',
                    landmark: state.selectedAddress.landmark || ''
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

            Toast.show({ type: 'success', text1: 'Order Placed', text2: "Order placed successfully!" });

            if (state.paymentMethod === 'ONLINE' && state.orderSummary.total > 0) {
                navigation.navigate('PaymentGateway', { orderId: order._id });
            } else {
                navigation.navigate('OrderSuccess', { orderId: order._id });
            }

            // Clear ordered items from cart
            if (selectedItems.length === cartItems.length) {
                await clearCart();
            } else {
                for (const id of selectedItems) {
                    await removeFromCart(id);
                }
            }

            setState(prev => ({ ...prev, appliedCoupon: null }));
            refreshWallet(); // Update wallet balance

        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to place order";
            Toast.show({ type: 'error', text1: 'Order Failed', text2: errorMessage });
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
