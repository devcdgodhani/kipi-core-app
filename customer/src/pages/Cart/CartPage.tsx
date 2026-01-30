import React from 'react';
import { useCart } from '../../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartPage: React.FC = () => {
    const { cart, updateQuantity, removeItem, loading } = useCart();
    const navigate = useNavigate();

    if (loading && !cart) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full mb-4"></div>
                    <p className="text-secondary font-medium">Loading your cart...</p>
                </div>
            </div>
        );
    }

    const items = cart?.items || [];

    const calculateTotal = () => {
        return items.reduce((sum, item) => {
            const productRef = (item.productId as any)?.name ? (item.productId as any) : (item.product || {});
            const skuRef = (item.skuId as any)?.skuCode ? (item.skuId as any) : (item.sku || {});
            const price = skuRef?.offerPrice || skuRef?.salePrice || skuRef?.basePrice ||
                productRef?.offerPrice || productRef?.salePrice || productRef?.basePrice ||
                item.salePrice || item.price || 0;
            return sum + (price * item.quantity);
        }, 0);
    };

    const total = calculateTotal();

    return (
        <div className="min-h-screen bg-primary/5 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-black text-primary tracking-tight uppercase font-mono">My Cart</h1>
                    <span className="bg-background px-4 py-2 rounded-full border border-primary/10 text-sm font-bold text-secondary">
                        {items.length} Items
                    </span>
                </div>

                {items.length === 0 ? (
                    <div className="bg-background rounded-[2.5rem] p-16 text-center shadow-xl shadow-primary/5 border border-primary/10">
                        <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/10">
                            <ShoppingBag size={56} className="text-secondary/40" />
                        </div>
                        <h2 className="text-3xl font-black text-primary mb-4 uppercase font-mono">Your basket is empty</h2>
                        <p className="text-secondary mb-10 text-lg max-w-md mx-auto">Looks like you haven't added anything to your cart yet. Build your dream collection now.</p>
                        <button
                            onClick={() => navigate('/products')}
                            className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-background rounded-2xl font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 uppercase tracking-widest text-sm"
                        >
                            Start Shopping <ArrowRight size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-6">
                            {items.map((item) => {
                                // Handles both cases: sometimes backend populates into product/sku, 
                                // other times it stays in productId/skuId as objects
                                const productRef = (item.productId as any)?.name ? (item.productId as any) : (item.product || {});
                                const skuRef = (item.skuId as any)?.skuCode ? (item.skuId as any) : (item.sku || {});

                                const price = skuRef?.offerPrice || skuRef?.salePrice || skuRef?.basePrice ||
                                    productRef?.offerPrice || productRef?.salePrice || productRef?.basePrice || 0;

                                const image = skuRef?.media?.[0]?.url || productRef?.mainImage || '/placeholder-product.png';
                                const itemId = item.skuId || item.productId;

                                return (
                                    <div key={item.skuId || item.productId} className="bg-background p-6 rounded-[2rem] shadow-sm border border-primary/10 flex gap-6 group hover:border-primary/20 transition-all">
                                        <div className="w-32 h-32 bg-primary/5 rounded-2xl overflow-hidden flex-shrink-0 border border-primary/5 group-hover:scale-95 transition-transform duration-500">
                                            <img
                                                src={image}
                                                alt={productRef?.name || 'Product'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="flex justify-between gap-4">
                                                <div>
                                                    <h3 className="font-bold text-primary text-xl leading-tight group-hover:text-primary transition-colors">{productRef?.name || 'Unknown Product'}</h3>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] bg-primary/5 px-2 py-0.5 rounded-full font-black text-secondary uppercase tracking-widest border border-primary/10">
                                                            {skuRef?.skuCode || 'NO-SKU'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(itemId)}
                                                    className="w-10 h-10 flex items-center justify-center bg-primary/5 text-secondary rounded-full hover:bg-red-50 hover:text-red-500 transition-all border border-primary/10"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center gap-4 bg-primary/5 rounded-xl p-1.5 border border-primary/10">
                                                    <button
                                                        onClick={() => updateQuantity(itemId, Math.max(1, item.quantity - 1))}
                                                        className="w-8 h-8 flex items-center justify-center bg-background text-secondary rounded-lg hover:bg-primary hover:text-background transition-all shadow-sm border border-primary/10"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="text-base font-black w-6 text-center font-mono">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                                        className="w-8 h-8 flex items-center justify-center bg-background text-secondary rounded-lg hover:bg-primary hover:text-background transition-all shadow-sm border border-primary/10"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-primary">₹{(price * item.quantity).toFixed(2)}</p>
                                                    <p className="text-xs text-secondary font-bold uppercase tracking-tighter">₹{price.toFixed(2)} / unit</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                                <div className="bg-background p-8 rounded-[2.5rem] shadow-xl shadow-primary/5 border border-primary/10 sticky top-24">
                                    <h2 className="text-2xl font-black text-primary mb-8 uppercase font-mono tracking-tight">Summary</h2>
                                <div className="space-y-5 mb-10">
                                        <div className="flex justify-between items-center text-secondary text-sm font-bold uppercase tracking-widest">
                                        <span>Subtotal</span>
                                            <span className="text-primary text-lg">₹{total.toFixed(2)}</span>
                                    </div>
                                        <div className="flex justify-between items-center text-secondary text-sm font-bold uppercase tracking-widest">
                                        <span>Shipping</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-emerald-500 font-black">FREE</span>
                                                <span className="text-[10px] text-secondary/40 line-through">₹99.00</span>
                                        </div>
                                    </div>
                                        <div className="border-t border-primary/10 pt-6 flex justify-between items-center">
                                        <div>
                                                <p className="text-xs text-secondary font-black uppercase tracking-widest mb-1">Total Pay</p>
                                            <p className="text-4xl font-black text-primary font-mono tracking-tighter">₹{total.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/checkout')}
                                        className="w-full py-5 bg-primary text-background rounded-2xl font-black hover:bg-primary/95 transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-primary/30 uppercase tracking-widest text-sm active:scale-95"
                                >
                                    Proceed To Checkout
                                    <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                    <div className="mt-8 pt-8 border-t border-primary/10 flex items-center justify-center gap-6">
                                    <div className="flex flex-col items-center gap-1 opacity-30">
                                        <div className="w-8 h-8 rounded-full border-2 border-current"></div>
                                        <span className="text-[8px] font-black uppercase">Visa</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 opacity-30">
                                        <div className="w-8 h-8 rounded-full border-2 border-current"></div>
                                        <span className="text-[8px] font-black uppercase">Master</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 opacity-30">
                                        <div className="w-8 h-8 rounded-full border-2 border-current"></div>
                                        <span className="text-[8px] font-black uppercase">UPI</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
