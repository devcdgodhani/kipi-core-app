import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    ActivityIndicator,
    Image,
    Switch,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { useAddress } from '../../context/AddressContext';
import { useCheckout } from '../../context/CheckoutContext';
import { Theme, useAppTheme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { couponService } from '../../services/coupon.service';
import { useMemo } from 'react';

const CheckoutScreen = ({ navigation }: any) => {
    const { items: cartItems, selectedItems } = useCart();
    const { addresses } = useAddress();
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
        loading: checkoutLoading,
        walletBalance,
        wallet,
        toggleWallet
    } = useCheckout();

    const theme = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [couponCode, setCouponCode] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

    useEffect(() => {
        // Auto-select default address if none selected
        if (!selectedAddress && addresses.length > 0) {
            const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
            setSelectedAddress(defaultAddr);
        }
    }, [addresses, selectedAddress]);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                // Pass subTotal to filter eligible coupons
                const res = await couponService.getAll({ orderAmount: orderSummary.subTotal });
                setAvailableCoupons(res);
            } catch (err) {
                console.error("Failed to fetch coupons", err);
            }
        };
        fetchCoupons();
    }, [orderSummary.subTotal]);

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

    const handlePlaceOrder = async () => {
        try {
            await placeOrder(navigation);
        } catch (error) {
            // Error is already handled in CheckoutContext with Toast
            // This catch prevents unhandled promise rejection from showing duplicate error
        }
    };

    const renderSummaryItem = (item: any) => (
        <TouchableOpacity
            key={item._id}
            style={styles.orderItem}
            onPress={() => navigation.navigate('MainTabs', {
                screen: 'Products',
                params: {
                    screen: 'ProductDetail',
                    params: { id: item.productId, skuId: item.skuId }
                }
            })}
        >
            <Image
                source={{ uri: item.thumbnail || 'https://via.placeholder.com/60' }}
                style={styles.orderItemImage}
            />
            <View style={styles.orderItemDetails}>
                <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
                {item.skuName && (
                    <Text style={styles.orderItemSku}>{item.skuName}</Text>
                )}
                <Text style={styles.orderItemQty}>Qty: {item.quantity}</Text>
                <Text style={styles.orderItemPrice}>₹{item.price.toFixed(2)}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* 1. Address Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="map-pin" size={20} color={theme.colors.primary.main} />
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                    </View>
                    {addresses.map((address) => (
                        <TouchableOpacity
                            key={address._id}
                            style={[
                                styles.addressCard,
                                selectedAddress?._id === address._id && styles.selectedAddressCard,
                            ]}
                            onPress={() => setSelectedAddress(address)}
                        >
                            <View style={styles.addressHeaderRow}>
                                <View style={styles.radioButton}>
                                    {selectedAddress?._id === address._id && <View style={styles.radioButtonSelected} />}
                                </View>
                                <Text style={styles.addressType}>{address.type}</Text>
                            </View>
                            <Text style={styles.addressName}>{address.name}</Text>
                            <Text style={styles.addressPhone}>Phone: {address.mobile}</Text>
                            <Text style={styles.addressText}>
                                {address.street}, {address.landmark ? address.landmark + ', ' : ''}
                                {address.city}, {address.state} - {address.pincode}
                            </Text>
                            <Text style={styles.addressCountry}>{address.country}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        style={styles.addAddressButton}
                        onPress={() => navigation.navigate('AddAddress')}
                    >
                        <Icon name="plus" size={18} color={theme.colors.primary.main} />
                        <Text style={styles.addAddressText}>Add New Address</Text>
                    </TouchableOpacity>
                </View>

                {/* 2. Payment Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="credit-card" size={20} color={theme.colors.primary.main} />
                        <Text style={styles.sectionTitle}>Payment Method</Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === 'COD' && styles.selectedPaymentOption,
                        ]}
                        onPress={() => setPaymentMethod('COD')}
                    >
                        <View style={styles.radioButton}>
                            {paymentMethod === 'COD' && <View style={styles.radioButtonSelected} />}
                        </View>
                        <Text style={styles.paymentText}>Cash on Delivery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === 'ONLINE' && styles.selectedPaymentOption,
                        ]}
                        onPress={() => setPaymentMethod('ONLINE')}
                    >
                        <View style={styles.radioButton}>
                            {paymentMethod === 'ONLINE' && <View style={styles.radioButtonSelected} />}
                        </View>
                        <Text style={styles.paymentText}>Online Payment</Text>
                    </TouchableOpacity>
                </View>

                {/* 3. Coupons Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="tag" size={20} color={theme.colors.primary.main} />
                        <Text style={styles.sectionTitle}>Coupons</Text>
                    </View>
                    {!appliedCoupon ? (
                        <View>
                            <View style={styles.couponInputContainer}>
                                <TextInput
                                    style={styles.couponInput}
                                    placeholder="Enter Coupon Code"
                                    value={couponCode}
                                    onChangeText={(text) => setCouponCode(text.toUpperCase())}
                                    autoCapitalize="characters"
                                />
                                <TouchableOpacity
                                    style={[styles.applyCouponButton, !couponCode && styles.disabledButton]}
                                    onPress={() => handleApplyCoupon(couponCode)}
                                    disabled={applyingCoupon || !couponCode}
                                >
                                    {applyingCoupon ? (
                                        <ActivityIndicator size="small" color={theme.colors.text.inverse} />
                                    ) : (
                                        <Text style={styles.applyCouponText}>Apply</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                            {availableCoupons.length > 0 && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.availableCouponsScroll}>
                                    {availableCoupons.map((coupon) => (
                                        <TouchableOpacity
                                            key={coupon._id}
                                            style={styles.availableCouponCard}
                                            onPress={() => handleApplyCoupon(coupon.code)}
                                        >
                                            <Text style={styles.availableCouponCode}>{coupon.code}</Text>
                                            <Text style={styles.availableCouponDesc} numberOfLines={1}>{coupon.description}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                        </View>
                    ) : (
                        <View style={styles.appliedCouponContainer}>
                            <View style={styles.appliedCouponInfo}>
                                <Icon name="check-circle" size={18} color={theme.colors.success} />
                                <Text style={styles.appliedCouponText}>Applied: {appliedCoupon.code}</Text>
                            </View>
                            <TouchableOpacity onPress={removeCoupon}>
                                <Icon name="x" size={20} color={theme.colors.error} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* 4. Wallet Section */}
                {walletBalance > 0 && (
                    <View style={styles.section}>
                        <View style={styles.walletCard}>
                            <View style={styles.walletInfo}>
                                <View style={styles.walletIconContainer}>
                                    <Icon name="briefcase" size={20} color={theme.colors.text.inverse} />
                                </View>
                                <View>
                                    <Text style={styles.walletLabel}>Wallet Balance</Text>
                                    <Text style={styles.walletAmount}>₹{walletBalance.toFixed(2)} Available</Text>
                                </View>
                            </View>
                            <Switch
                                value={wallet.useWallet}
                                onValueChange={toggleWallet}
                                trackColor={{ false: theme.colors.border.medium, true: theme.colors.primary.main }}
                            />
                        </View>
                        {wallet.useWallet && (
                            <View style={styles.walletUsageInfo}>
                                <Text style={styles.walletUsageText}>Paid from wallet</Text>
                                <Text style={styles.walletUsageAmount}>-₹{wallet.amountToUse.toFixed(2)}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* 5. Order Items */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="shopping-bag" size={20} color={theme.colors.primary.main} />
                        <Text style={styles.sectionTitle}>Order Items</Text>
                    </View>
                    <View style={styles.orderItemsContainer}>
                        {cartItems.filter(item => selectedItems.includes(item._id)).map(renderSummaryItem)}
                    </View>
                </View>

                {/* 6. Order Summary */}
                <View style={styles.section}>
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>₹{orderSummary.subTotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Shipping</Text>
                            <Text style={[styles.summaryValue, { color: orderSummary.shipping === 0 ? theme.colors.success : theme.colors.text.primary }]}>
                                {orderSummary.shipping === 0 ? 'FREE' : `₹${orderSummary.shipping.toFixed(2)}`}
                            </Text>
                        </View>
                        {orderSummary.discount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.discountLabel}>Coupon Discount</Text>
                                <Text style={styles.discountValue}>-₹{orderSummary.discount.toFixed(2)}</Text>
                            </View>
                        )}
                        {orderSummary.walletDiscount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.walletDiscountLabel}>Wallet Used</Text>
                                <Text style={styles.walletDiscountValue}>-₹{orderSummary.walletDiscount.toFixed(2)}</Text>
                            </View>
                        )}
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Grand Total</Text>
                            <Text style={styles.totalValue}>₹{orderSummary.total.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.footerInfo}>
                    <Text style={styles.footerTotalLabel}>Total Payable</Text>
                    <Text style={styles.footerTotalAmount}>₹{orderSummary.total.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.placeOrderButton, checkoutLoading && styles.disabledButton]}
                    onPress={handlePlaceOrder}
                    disabled={checkoutLoading}
                >
                    {checkoutLoading ? (
                        <ActivityIndicator size="small" color={theme.colors.text.inverse} />
                    ) : (
                        <Text style={styles.placeOrderText}>Place Order</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    content: {
        padding: theme.spacing.md,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    sectionTitle: {
        ...theme.typography.h3,
    color: theme.colors.text.primary,
    },
    addressCard: {
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        marginBottom: theme.spacing.md,
        backgroundColor: theme.colors.background.paper,
    },
    selectedAddressCard: {
        borderColor: theme.colors.primary.main,
        backgroundColor: `${theme.colors.primary.main}05`,
    },
    addressHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    addressType: {
        ...theme.typography.body2,
        fontWeight: 'bold',
        marginLeft: theme.spacing.sm,
        textTransform: 'uppercase',
        flex: 1,
    },
    selectedBadge: {
        backgroundColor: theme.colors.primary.main,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.sm,
    },
    selectedBadgeText: {
        fontSize: 10,
        color: theme.colors.text.inverse,
        fontWeight: 'bold',
    },
    addressName: {
        ...theme.typography.body1,
    color: theme.colors.text.primary,
        fontWeight: '600',
        marginBottom: 4,
    },
    addressText: {
        ...theme.typography.body2,
        color: theme.colors.text.secondary,
        marginBottom: 4,
    },
    addressPhone: {
        ...theme.typography.body2,
        color: theme.colors.text.secondary,
        fontWeight: '500',
    },
    addressCountry: {
        ...theme.typography.body2,
        color: theme.colors.text.secondary,
        marginTop: 2,
    },
    addAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.primary.main,
        borderRadius: theme.borderRadius.lg,
        borderStyle: 'dashed',
    },
    addAddressText: {
        ...theme.typography.button,
        color: theme.colors.primary.main,
        marginLeft: theme.spacing.sm,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        marginBottom: theme.spacing.sm,
        backgroundColor: theme.colors.background.paper,
    },
    selectedPaymentOption: {
        borderColor: theme.colors.primary.main,
        backgroundColor: `${theme.colors.primary.main}05`,
    },
    paymentText: {
        ...theme.typography.body1,
    color: theme.colors.text.primary,
        marginLeft: theme.spacing.md,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: theme.colors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary.main,
    },
    summaryCard: {
        backgroundColor: theme.colors.background.paper,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    },
    summaryLabel: {
        ...theme.typography.body2,
        color: theme.colors.text.secondary,
    },
    summaryValue: {
        ...theme.typography.body2,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.text.primary,
    },
    totalRow: {
        marginTop: theme.spacing.sm,
        paddingTop: theme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.light,
    },
    totalLabel: {
        ...theme.typography.h3,
    color: theme.colors.text.primary,
    },
    totalValue: {
        ...theme.typography.h3,
        color: theme.colors.primary.main,
    },
    footer: {
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.paper,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.light,
        flexDirection: 'row',
        alignItems: 'center',
        ...theme.shadows.lg,
    },
    footerInfo: {
        flex: 1,
    },
    footerTotalLabel: {
        ...theme.typography.body2,
        color: theme.colors.text.secondary,
    },
    footerTotalAmount: {
        ...theme.typography.h3,
        color: theme.colors.primary.main,
    },
    placeOrderButton: {
        backgroundColor: theme.colors.primary.main,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadows.md,
    },
    disabledButton: {
        opacity: 0.7,
    },
    placeOrderText: {
        ...theme.typography.button,
        color: theme.colors.text.inverse,
    },
    orderItemsContainer: {
        marginTop: theme.spacing.sm,
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        padding: theme.spacing.sm,
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    orderItemImage: {
        width: 60,
        height: 60,
        borderRadius: theme.borderRadius.sm,
        marginRight: theme.spacing.md,
    },
    orderItemDetails: {
        flex: 1,
    },
    orderItemName: {
        ...theme.typography.body1,
    color: theme.colors.text.primary,
        fontWeight: theme.typography.fontWeight.bold,
        marginBottom: 2,
    },
    orderItemSku: {
        ...theme.typography.body2,
        color: theme.colors.text.secondary,
        fontSize: 12,
        marginBottom: 4,
    },
    orderItemQty: {
        ...theme.typography.body2,
        color: theme.colors.text.secondary,
    },
    orderItemPrice: {
        ...theme.typography.body1,
        color: theme.colors.primary.main,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    couponInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    couponInput: {
        flex: 1,
        height: 45,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.background.paper,
    },
    applyCouponButton: {
        backgroundColor: theme.colors.primary.main,
        height: 45,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyCouponText: {
        ...theme.typography.button,
        color: theme.colors.text.inverse,
    },
    availableCouponsScroll: {
        marginBottom: theme.spacing.sm,
    },
    availableCouponCard: {
        width: 150,
        padding: theme.spacing.sm,
        backgroundColor: `${theme.colors.primary.main}10`,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.primary.main,
        borderStyle: 'dashed',
        marginRight: theme.spacing.sm,
    },
    availableCouponCode: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.primary.main,
        marginBottom: 2,
    },
    availableCouponDesc: {
        fontSize: 10,
        color: theme.colors.text.secondary,
    },
    appliedCouponContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
        backgroundColor: `${theme.colors.success}10`,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.success,
    },
    appliedCouponInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    appliedCouponText: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.success,
    },
    walletCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    walletInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    walletIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
    },
    walletLabel: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.text.secondary,
    },
    walletAmount: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.primary,
    },
    walletUsageInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
    },
    walletUsageText: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.text.secondary,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    walletUsageAmount: {
        fontSize: 12,
        color: theme.colors.primary.main,
        fontWeight: 'bold',
    },
    discountLabel: {
        ...theme.typography.body2,
        color: theme.colors.success,
        fontWeight: '600',
    },
    discountValue: {
        ...theme.typography.body2,
        color: theme.colors.success,
        fontWeight: 'bold',
    },
    walletDiscountLabel: {
        ...theme.typography.body2,
        color: theme.colors.text.primary,
        fontWeight: '600',
    },
    walletDiscountValue: {
        ...theme.typography.body2,
        color: theme.colors.text.primary,
        fontWeight: 'bold',
    },
});

export default CheckoutScreen;
