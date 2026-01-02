import React, { useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import CartItem from './CartItem';
import { useNavigate } from 'react-router-dom';

const CartDrawer: React.FC = () => {
    const { cart, isCartOpen, closeCart } = useCart();
    const navigate = useNavigate();
    const drawerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
                closeCart();
            }
        };

        if (isCartOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Prevent body scroll (optional)
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isCartOpen, closeCart]);

    const subtotal = cart?.items.reduce((sum, item) => sum + (item.quantity * (item.salePrice || item.price)), 0) || 0;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="text-primary" />
                            <h2 className="text-lg font-bold text-gray-900">Shopping Cart</h2>
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                                {cart?.items.length || 0}
                            </span>
                        </div>
                        <button
                            onClick={closeCart}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Items */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {!cart || cart.items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                    <ShoppingBag size={40} className="text-gray-300" />
                                </div>
                                <div>
                                    <p className="text-gray-900 font-semibold text-lg">Your cart is empty</p>
                                    <p className="text-gray-500 text-sm">Looks like you haven't added anything yet.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        closeCart();
                                        navigate('/products');
                                    }}
                                    className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors mt-4"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {cart.items.map((item) => (
                                    <CartItem key={item.skuId} item={item} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cart && cart.items.length > 0 && (
                        <div className="border-t border-gray-100 p-6 bg-gray-50/50">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-600 font-medium">Subtotal</span>
                                <span className="text-xl font-bold text-primary">
                                    ${subtotal.toFixed(2)}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-4 text-center">
                                Shipping and taxes calculated at checkout
                            </p>
                            <button
                                onClick={() => {
                                    closeCart();
                                    navigate('/checkout'); // Or /cart
                                }}
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                Checkout
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartDrawer;
