import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { useAddress } from '../../context/AddressContext';
import { theme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';

const CheckoutScreen = ({ navigation }: any) => {
    const { items, cartTotal, clearCart } = useCart();
    const { addresses, getDefaultAddress } = useAddress();
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
        getDefaultAddress()?._id || null
    );
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
    const [loading, setLoading] = useState(false);

    const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            Toast.show({
                type: 'error',
                text1: 'Select Address',
                text2: 'Please select a delivery address',
            });
            return;
        }

        setLoading(true);
        try {
            // Simulate API call
            await new Promise<void>(resolve => setTimeout(resolve, 2000));

            Toast.show({
                type: 'success',
                text1: 'Order Placed!',
                text2: 'Your order has been placed successfully',
            });

            await clearCart();
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Order Failed',
                text2: 'Something went wrong. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const renderAddressSelection = () => (
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
                        selectedAddressId === address._id && styles.selectedAddressCard,
                    ]}
                    onPress={() => setSelectedAddressId(address._id)}
                >
                    <View style={styles.addressHeaderRow}>
                        <View style={styles.radioButton}>
                            {selectedAddressId === address._id && <View style={styles.radioButtonSelected} />}
                        </View>
                        <Text style={styles.addressType}>{address.type}</Text>
                        {selectedAddressId === address._id && (
                            <View style={styles.selectedBadge}>
                                <Text style={styles.selectedBadgeText}>Selected</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.addressName}>{address.name}</Text>
                    <Text style={styles.addressText}>
                        {address.addressLine1}, {address.addressLine2 ? address.addressLine2 + ', ' : ''}
                        {address.city}, {address.state} - {address.pincode}
                    </Text>
                    <Text style={styles.addressPhone}>Phone: {address.phone}</Text>
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
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {renderAddressSelection()}

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

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="file-text" size={20} color={theme.colors.primary.main} />
                        <Text style={styles.sectionTitle}>Order Summary</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>₹{cartTotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Shipping</Text>
                            <Text style={[styles.summaryValue, { color: theme.colors.success }]}>FREE</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tax</Text>
                            <Text style={styles.summaryValue}>₹0.00</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Grand Total</Text>
                            <Text style={styles.totalValue}>₹{cartTotal.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.footerInfo}>
                    <Text style={styles.footerTotalLabel}>Total Payable</Text>
                    <Text style={styles.footerTotalAmount}>₹{cartTotal.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.placeOrderButton, loading && styles.disabledButton]}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    <Text style={styles.placeOrderText}>
                        {loading ? 'Processing...' : 'Place Order'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
        fontWeight: '600',
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
});

export default CheckoutScreen;
