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
                    <p className="text-gray-500 font-medium">Loading your cart...</p>
                </div>
            </div>
        );
    }

    const items = cart?.items || [];

    const calculateTotal = () => {
        return items.reduce((sum, item) => {
            const price = item.sku?.salePrice || item.sku?.basePrice || item.sku?.price || 0;
            return sum + (price * item.quantity);
        }, 0);
    };

    const total = calculateTotal();

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase font-mono">My Cart</h1>
                    <span className="bg-white px-4 py-2 rounded-full border border-gray-200 text-sm font-bold text-gray-500">
                        {items.length} Items
                    </span>
                </div>

                {items.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-xl shadow-gray-200/50 border border-gray-100">
                        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100">
                            <ShoppingBag size={56} className="text-gray-300" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase font-mono">Your basket is empty</h2>
                        <p className="text-gray-500 mb-10 text-lg max-w-md mx-auto">Looks like you haven't added anything to your cart yet. Build your dream collection now.</p>
                        <button
                            onClick={() => navigate('/products')}
                            className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-2xl font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 uppercase tracking-widest text-sm"
                        >
                            Start Shopping <ArrowRight size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-6">
                            {items.map((item) => {
                                const product = item.product;
                                const sku = item.sku;
                                const price = sku?.salePrice || sku?.basePrice || sku?.price || 0;
                                const image = sku?.media?.[0]?.url || product?.mainImage || '/placeholder-product.png';

                                return (
                                    <div key={item.skuId || item.productId} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex gap-6 group hover:border-primary/20 transition-all">
                                        <div className="w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-50 group-hover:scale-95 transition-transform duration-500">
                                            <img
                                                src={image}
                                                alt={product?.name || 'Product'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="flex justify-between gap-4">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-xl leading-tight group-hover:text-primary transition-colors">{product?.name || 'Unknown Product'}</h3>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-black text-gray-400 uppercase tracking-widest border border-gray-100">
                                                            {sku?.skuCode || 'NO-SKU'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.skuId || '')}
                                                    className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                                                    <button
                                                        onClick={() => updateQuantity(item.skuId || '', Math.max(1, item.quantity - 1))}
                                                        className="w-8 h-8 flex items-center justify-center bg-white text-gray-500 rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm border border-gray-100"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="text-base font-black w-6 text-center font-mono">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.skuId || '', item.quantity + 1)}
                                                        className="w-8 h-8 flex items-center justify-center bg-white text-gray-500 rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm border border-gray-100"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-gray-900">₹{(price * item.quantity).toFixed(2)}</p>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">₹{price.toFixed(2)} / unit</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-24">
                                <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase font-mono tracking-tight">Summary</h2>
                                <div className="space-y-5 mb-10">
                                    <div className="flex justify-between items-center text-gray-500 text-sm font-bold uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span className="text-gray-900 text-lg">₹{total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-500 text-sm font-bold uppercase tracking-widest">
                                        <span>Shipping</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-emerald-500 font-black">FREE</span>
                                            <span className="text-[10px] text-gray-300 line-through">₹99.00</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">Total Pay</p>
                                            <p className="text-4xl font-black text-primary font-mono tracking-tighter">₹{total.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full py-5 bg-primary text-white rounded-2xl font-black hover:bg-primary/95 transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-primary/30 uppercase tracking-widest text-sm active:scale-95"
                                >
                                    Proceed To Checkout
                                    <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-center gap-6">
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
