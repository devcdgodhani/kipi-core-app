import React, { useEffect, useState } from 'react';
import { useCheckout } from '../../context/CheckoutContext';
import { useAddress } from '../../context/AddressContext';
import { useCart } from '../../context/CartContext';
import AddressCard from '../../components/Address/AddressCard';
import { Loader2, CheckCircle, CreditCard, Banknote, Ticket, X, ShieldCheck } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { couponService } from '../../services/coupon.service';

const CheckoutPage: React.FC = () => {
    const {
        selectedAddress,
        setSelectedAddress,
        paymentMethod,
        setPaymentMethod,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        orderSummary,
        placeOrder,
        loading: contextLoading,
        walletBalance,
        wallet,
        toggleWallet
    } = useCheckout();

    const { addresses, loading: loadingAddresses } = useAddress();
    const { cart } = useCart();

    const [couponCode, setCouponCode] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const handlePlaceOrder = async () => {
        setIsRedirecting(true);
        try {
            await placeOrder();
        } catch (error) {
            setIsRedirecting(false);
        }
    };

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                // Pass subTotal to filter eligible coupons based on minOrderAmount
                const res = await couponService.getAll({ orderAmount: orderSummary.subTotal });
                setAvailableCoupons(res);
            } catch (err) {
                console.error("Failed to fetch coupons", err);
            }
        };
        fetchCoupons();
    }, [orderSummary.subTotal]);

    useEffect(() => {
        // Auto-select default address
        if (!selectedAddress && addresses.length > 0) {
            const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
            setSelectedAddress(defaultAddr);
        }
    }, [addresses, selectedAddress, setSelectedAddress]);

    const handleApplyCoupon = async (code: string) => {
        const targetCode = code || couponCode;
        if (!targetCode.trim()) return;
        setApplyingCoupon(true);
        try {
            await applyCoupon(targetCode);
            setCouponCode('');
        } finally {
            setApplyingCoupon(false);
        }
    };

    if ((!cart || !cart.items || cart.items.length === 0) && !contextLoading && !isRedirecting) {
        return <Navigate to="/cart" />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                    <p className="text-gray-500 mt-2 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-green-600" />
                        Secure Checkout Experience
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Info */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. Address Section */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-bold">1</span>
                                Delivery Address
                            </h2>

                            {loadingAddresses ? (
                                <div className="flex items-center gap-2 text-gray-500 animate-pulse">
                                    <Loader2 size={20} className="animate-spin" />
                                    Loading addresses...
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {addresses.map(addr => (
                                        <AddressCard
                                            key={addr._id}
                                            address={addr}
                                            onEdit={() => { }}
                                            selectable
                                            selected={selectedAddress?._id === addr._id}
                                            onSelect={setSelectedAddress}
                                        />
                                    ))}
                                    <Link to="/addresses" className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group">
                                        <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">+</span>
                                        <span className="font-semibold text-sm">Add New Address</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* 2. Payment Section */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-bold">2</span>
                                Payment Method
                            </h2>

                            <div className="grid md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPaymentMethod('ONLINE')}
                                    className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${paymentMethod === 'ONLINE' ? 'border-primary bg-primary/5 shadow-inner' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'}`}
                                >
                                    <div className={`p-3 rounded-xl transition-colors ${paymentMethod === 'ONLINE' ? 'bg-primary text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
                                        <CreditCard size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900 uppercase tracking-tight text-sm">Online Payment</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Cards, UPI, Netbanking</p>
                                    </div>
                                    {paymentMethod === 'ONLINE' && <CheckCircle size={20} className="ml-auto text-primary" />}
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5 shadow-inner' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'}`}
                                >
                                    <div className={`p-3 rounded-xl transition-colors ${paymentMethod === 'COD' ? 'bg-primary text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
                                        <Banknote size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900 uppercase tracking-tight text-sm">Cash on Delivery</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Pay at your doorstep</p>
                                    </div>
                                    {paymentMethod === 'COD' && <CheckCircle size={20} className="ml-auto text-primary" />}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-24 space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Ticket size={22} className="text-primary" />
                                Order Summary
                            </h2>

                            {/* Coupon Input */}
                            <div className="space-y-4 pt-2">
                                {!appliedCoupon ? (
                                    <>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter Coupon"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-300 transition-all"
                                            />
                                            <button
                                                onClick={() => handleApplyCoupon(couponCode)}
                                                disabled={applyingCoupon || !couponCode}
                                                className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black disabled:bg-gray-200 transition-all flex items-center justify-center shrink-0"
                                            >
                                                {applyingCoupon ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                                            </button>
                                        </div>
                                        {/* Available Coupons Horizontal Scroll */}
                                        {availableCoupons.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Available Offers</p>
                                                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                                    {availableCoupons.map(coupon => (
                                                        <button
                                                            key={coupon._id}
                                                            onClick={() => handleApplyCoupon(coupon.code)}
                                                            className="flex-shrink-0 bg-primary/5 border border-dashed border-primary/20 rounded-xl px-4 py-2 text-left hover:bg-primary/10 transition-all active:scale-95"
                                                        >
                                                            <p className="text-[10px] font-black text-primary uppercase">{coupon.code}</p>
                                                            <p className="text-[8px] text-gray-500 font-bold uppercase truncate w-24">{coupon.description || 'Save on your order'}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center">
                                                <Ticket size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Applied</p>
                                                <p className="text-sm font-bold text-gray-900 uppercase">{appliedCoupon.code}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={removeCoupon}
                                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Wallet Section */}
                            {walletBalance > 0 && (
                                <div className="bg-purple-50/50 border border-purple-100 rounded-3xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center shadow-lg shadow-purple-200">
                                                <CreditCard size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Wallet Balance</p>
                                                <p className="text-sm font-bold text-gray-900">₹{walletBalance.toFixed(2)} Available</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={wallet.useWallet}
                                                onChange={(e) => {
                                                    toggleWallet(e.target.checked);
                                                }}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                        </label>
                                    </div>

                                    {wallet.useWallet && (
                                        <div className="pt-2 border-t border-purple-100/50 flex justify-between items-center text-xs font-bold text-purple-800 uppercase tracking-tight">
                                            <span>Paid from Wallet</span>
                                            <span>-₹{wallet.amountToUse.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Order Items List */}
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {cart?.items.map((item, idx) => {
                                    const productRef = (item.productId as any)?.name ? (item.productId as any) : (item.product || {});
                                    const skuRef = (item.skuId as any)?.skuCode ? (item.skuId as any) : (item.sku || {});
                                    const price = skuRef?.offerPrice || skuRef?.salePrice || skuRef?.basePrice ||
                                        productRef?.offerPrice || productRef?.salePrice || productRef?.basePrice ||
                                        item.salePrice || item.price || 0;

                                    return (
                                        <div key={idx} className="flex gap-4">
                                            <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                                                <img
                                                    src={skuRef?.media?.[0]?.url || productRef.mainImage || '/placeholder-product.png'}
                                                    alt={productRef.name || 'Product'}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-gray-900 truncate">{productRef.name || 'Unknown Product'}</h4>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Qty: {item.quantity}</p>
                                                <p className="text-xs font-black text-primary mt-1">₹{price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-4 border-t border-gray-50 pt-6">
                                <div className="flex justify-between text-sm font-medium text-gray-500">
                                    <span>Subtotal ({cart?.items?.length || 0} items)</span>
                                    <span className="text-gray-900 font-bold">₹{orderSummary.subTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-gray-500">
                                    <span>Shipping</span>
                                    <span className={`font-bold ${orderSummary.shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                        {orderSummary.shipping === 0 ? 'FREE' : `₹${orderSummary.shipping.toFixed(2)}`}
                                    </span>
                                </div>
                                {orderSummary.discount > 0 && (
                                    <div className="flex justify-between text-sm font-medium text-green-600">
                                        <span>Coupon Discount</span>
                                        <span className="font-bold">-₹{orderSummary.discount.toFixed(2)}</span>
                                    </div>
                                )}
                                {orderSummary.walletDiscount > 0 && (
                                    <div className="flex justify-between text-sm font-medium text-purple-600">
                                        <span>Wallet Used</span>
                                        <span className="font-bold">-₹{orderSummary.walletDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-100 pt-4 flex justify-between font-black text-xl text-gray-900 uppercase tracking-tighter">
                                    <span>Final Total</span>
                                    <span className="text-primary">₹{orderSummary.total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={contextLoading || !selectedAddress}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary/90 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 relative overflow-hidden group"
                            >
                                {contextLoading && <Loader2 size={18} className="animate-spin" />}
                                <span>{contextLoading ? 'Fulfilling...' : 'Confirm Order'}</span>
                                <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:-translate-x-full transition-transform duration-700 pointer-events-none" />
                            </button>

                            <div className="space-y-2 text-center pt-2">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    Premium Secure checkout
                                </p>
                                <p className="text-[9px] text-gray-400 px-4">
                                    By placing order, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default CheckoutPage;
