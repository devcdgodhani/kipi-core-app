import React from 'react';
import { useCart } from '../../context/CartContext';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CartItem from '../../components/Cart/CartItem';

const CartPage: React.FC = () => {
    const { cart, loading, selectedItems, selectAll, clearSelection } = useCart();
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
            // Robust extraction: Check if it's a populated object (has _id) or fallback to string
            const itemId = (item.skuId as any)?._id ||
                (typeof item.skuId === 'string' ? item.skuId : '') ||
                (item.productId as any)?._id ||
                (typeof item.productId === 'string' ? item.productId : '');

            if (!itemId || !selectedItems.includes(itemId)) return sum;

            const productRef = (item.productId as any)?.name ? (item.productId as any) : (item.product || {});
            const skuRef = (item.skuId as any)?.skuCode ? (item.skuId as any) : (item.sku || {});
            const price = skuRef?.offerPrice || skuRef?.salePrice || skuRef?.basePrice ||
                productRef?.offerPrice || productRef?.salePrice || productRef?.basePrice ||
                item.salePrice || item.price || 0;

            console.log('CartPage calculateTotal item:', { id: itemId, price, qty: item.quantity, selected: selectedItems.includes(itemId) });
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
                                {/* Header Row for Select All */}
                                <div className="flex items-center gap-4 py-4 border-b border-primary/10">
                                    <div className="flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.length === items.length && items.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    selectAll();
                                                } else {
                                                    clearSelection();
                                                }
                                            }}
                                            className="w-5 h-5 rounded border-2 border-primary/20 text-primary cursor-pointer"
                                            style={{ accentColor: 'var(--primary)' }}
                                        />
                                    </div>
                                    <span className="font-bold text-primary text-sm uppercase tracking-widest">
                                        {selectedItems.length === items.length ? 'Deselect All' : 'Select All'}
                                    </span>
                                </div>

                                {items.map((item) => (
                                    <CartItem key={item.skuId || item.productId} item={item} />
                                ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                                <div className="bg-background p-8 rounded-[2.5rem] shadow-xl shadow-primary/5 border border-primary/10 sticky top-24">
                                    <h2 className="text-2xl font-black text-primary mb-8 uppercase font-mono tracking-tight">Summary</h2>
                                <div className="space-y-5 mb-10">
                                        <div className="flex justify-between items-center text-secondary text-sm font-bold uppercase tracking-widest">
                                        <span>Subtotal</span>
                                            <span className="text-primary text-lg">
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(total)}
                                            </span>
                                    </div>
                                        <div className="flex justify-between items-center text-secondary text-sm font-bold uppercase tracking-widest">
                                        <span>Shipping</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-emerald-500 font-black">FREE</span>
                                                <span className="text-[10px] text-secondary/40 line-through">₹99.00</span>
                                        </div>
                                    </div>
                                        <div className="border-t border-primary/10 pt-6 flex justify-between items-end">
                                        <div>
                                                <p className="text-xs text-secondary font-black uppercase tracking-widest mb-2">Total Pay</p>
                                                <p className="text-4xl font-black text-primary font-mono tracking-tighter">
                                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(total)}
                                                </p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/checkout')}
                                        disabled={selectedItems.length === 0}
                                        className="w-full py-5 bg-primary text-background rounded-2xl font-black hover:bg-primary/95 transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-primary/30 uppercase tracking-widest text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                        Proceed To Checkout ({selectedItems.length})
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
