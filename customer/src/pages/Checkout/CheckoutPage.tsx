import React, { useEffect } from 'react';
import { useCheckout } from '../../context/CheckoutContext';
import { useAddress } from '../../context/AddressContext';
import { useCart } from '../../context/CartContext';
import AddressCard from '../../components/Address/AddressCard';
import { Loader2, CheckCircle, CreditCard, Banknote } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const CheckoutPage: React.FC = () => {
    const {
        selectedAddress,
        setSelectedAddress,
        paymentMethod,
        setPaymentMethod,
        orderSummary,
        placeOrder,
        loading: placingOrder
    } = useCheckout();

    const { addresses, loading: loadingAddresses } = useAddress();
    const { cart } = useCart();

    useEffect(() => {
        // Auto-select default address
        if (!selectedAddress && addresses.length > 0) {
            const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
            setSelectedAddress(defaultAddr);
        }
    }, [addresses, selectedAddress, setSelectedAddress]);

    if (!cart || !cart.items || cart.items.length === 0) {
        return <Navigate to="/cart" />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Info */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. Address Section */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm">1</span>
                                Delivery Address
                            </h2>

                            {loadingAddresses ? (
                                <div>Loading addresses...</div>
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
                                    <Link to="/addresses" className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors font-medium">
                                        + Add New Address
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* 2. Payment Section */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm">2</span>
                                Payment Method
                            </h2>

                            <div className="grid md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPaymentMethod('ONLINE')}
                                    className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${paymentMethod === 'ONLINE' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <CreditCard size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900">Online Payment</p>
                                        <p className="text-xs text-gray-500">UPI, Cards, Netbanking</p>
                                    </div>
                                    {paymentMethod === 'ONLINE' && <CheckCircle size={20} className="ml-auto text-primary" />}
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                        <Banknote size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900">Cash on Delivery</p>
                                        <p className="text-xs text-gray-500">Pay when you get it</p>
                                    </div>
                                    {paymentMethod === 'COD' && <CheckCircle size={20} className="ml-auto text-primary" />}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cart?.items?.length || 0} items)</span>
                                    <span>₹{orderSummary.subTotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className={orderSummary.shipping === 0 ? 'text-green-600' : ''}>
                                        {orderSummary.shipping === 0 ? 'Free' : `₹${orderSummary.shipping}`}
                                    </span>
                                </div>
                                <div className="border-t pt-4 flex justify-between font-bold text-lg text-gray-900">
                                    <span>Total</span>
                                    <span>₹{orderSummary.total}</span>
                                </div>
                            </div>

                            <button
                                onClick={placeOrder}
                                disabled={placingOrder || !selectedAddress}
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {placingOrder && <Loader2 size={20} className="animate-spin" />}
                                {placingOrder ? 'Placing Order...' : 'Place Order'}
                            </button>

                            <p className="text-xs text-gray-400 text-center mt-4">
                                By placing order, you agree to our Terms & Conditions
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
