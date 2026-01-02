import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Address } from '../types/address.types';
import type { CheckoutState, CreateOrderRequest } from '../types/checkout.types';
import { checkoutService } from '../services/checkout.service';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface CheckoutContextType extends CheckoutState {
    setStep: (step: CheckoutState['step']) => void;
    setSelectedAddress: (address: Address) => void;
    setPaymentMethod: (method: 'COD' | 'ONLINE') => void;
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
        orderSummary: {
            subTotal: 0,
            tax: 0,
            shipping: 0,
            total: 0
        }
    });

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((acc, item) => {
            const price = (item.sku?.salePrice || item.sku?.basePrice || item.product.salePrice || item.product.basePrice) || 0;
            return acc + (price * item.quantity);
        }, 0);
    };

    useEffect(() => {
        const subTotal = calculateTotal();
        const tax = 0;
        const shipping = subTotal > 499 ? 0 : 40;
        const total = subTotal + tax + shipping;

        setState(prev => ({
            ...prev,
            orderSummary: { subTotal, tax, shipping, total }
        }));
    }, [cart]);

    const setStep = (step: CheckoutState['step']) => {
        setState(prev => ({ ...prev, step }));
    };

    const setSelectedAddress = (address: Address) => {
        setState(prev => ({ ...prev, selectedAddress: address }));
    };

    const setPaymentMethod = (method: 'COD' | 'ONLINE') => {
        setState(prev => ({ ...prev, paymentMethod: method }));
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
                shippingAddress: state.selectedAddress,
                billingAddress: state.selectedAddress,
                paymentMethod: state.paymentMethod,
                subTotal: state.orderSummary.subTotal,
                tax: state.orderSummary.tax,
                shippingCost: state.orderSummary.shipping,
                totalAmount: state.orderSummary.total,
                notes: ''
            };

            const order = await checkoutService.createOrder(orderData);

            toast.success("Order placed successfully!");
            await clearCart();
            navigate(`/orders/${order._id}?success=true`);

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
