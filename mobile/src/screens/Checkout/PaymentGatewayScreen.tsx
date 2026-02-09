import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Image,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { Theme, useAppTheme } from '../../theme/theme';
import { paymentService } from '../../services/paymentService';
import Toast from 'react-native-toast-message';

const GatewayIcons: Record<string, string> = {
    RAZORPAY: 'credit-card',
    PHONEPE: 'smartphone',
    PAYTM: 'wallet'
};

const GatewayColors: Record<string, string> = {
    RAZORPAY: '#2B83EA',
    PHONEPE: '#6739B7',
    PAYTM: '#00BAF2'
};

const PaymentGatewayScreen = ({ route, navigation }: any) => {
    const theme = useAppTheme();
    const { orderId } = route.params || {};
    const [gateways, setGateways] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [initiating, setInitiating] = useState(false);
    const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
    const [vpa, setVpa] = useState('');

    const styles = React.useMemo(() => createStyles(theme), [theme]);

    useEffect(() => {
        const fetchGateways = async () => {
            try {
                const data = await paymentService.getEnabledGateways();
                setGateways(data);
            } catch (error) {
                console.error('Failed to fetch gateways:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to load payment gateways',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchGateways();
    }, []);

    const handleSelectGateway = (gateway: any) => {
        if (gateway.name === 'PHONEPE') {
            setSelectedGateway(gateway.name);
        } else {
            initiatePayment(gateway.name);
        }
    };

    const initiatePayment = async (gatewayName: string, vpaInput?: string) => {
        setInitiating(true);
        try {
            const result = await paymentService.initiatePayment(orderId, gatewayName, vpaInput);

            if (result.redirectUrl) {
                navigation.navigate('PaymentWebView', {
                    url: result.redirectUrl,
                    orderId,
                    redirectMethod: result.redirectMethod,
                    gatewayData: result.gatewayData
                });
            } else if (gatewayName === 'PHONEPE' && vpaInput) {
                // Direct UPI Collect initiated
                Toast.show({
                    type: 'success',
                    text1: 'Payment Initiated',
                    text2: 'Please check your UPI app for notification.',
                });
                // Since it's a collect request, we should probably poll or wait
                // For now, redirect to the webview but maybe with a status checker
                navigation.navigate('PaymentWebView', {
                    orderId,
                    isCollect: true,
                    gatewayData: result.gatewayData
                });
            } else {
                throw new Error('No redirection or initiation info received');
            }

        } catch (error: any) {
            console.error('Payment initiation failed:', error);
            Toast.show({
                type: 'error',
                text1: 'Payment Failed',
                text2: error.message || 'Could not initiate payment. Please try again.',
            });
        } finally {
            setInitiating(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary.main} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Select Payment Method</Text>
                <Text style={styles.subtitle}>Choose your preferred payment gateway to complete the transaction.</Text>

                {gateways.map((gateway) => (
                    <TouchableOpacity
                        key={gateway.name}
                        style={[
                            styles.gatewayCard,
                            { borderColor: gateway.isEnabled ? theme.colors.border.light : theme.colors.border.medium }
                        ]}
                        onPress={() => handleSelectGateway(gateway)}
                        disabled={initiating}
                    >
                        <View style={styles.gatewayCardContent}>
                            <View style={styles.gatewayInfo}>
                                <View style={[styles.iconContainer, { backgroundColor: `${GatewayColors[gateway.name] || theme.colors.primary.main}10` }]}>
                                    <Icon
                                        name={GatewayIcons[gateway.name] || 'credit-card'}
                                        size={24}
                                        color={GatewayColors[gateway.name] || theme.colors.primary.main}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.gatewayLabel}>{gateway.displayName}</Text>
                                    <Text style={styles.gatewaySubtitle}>Secure payment via {gateway.displayName}</Text>
                                </View>
                            </View>
                            <Icon name={selectedGateway === gateway.name ? 'chevron-down' : 'chevron-right'} size={20} color={theme.colors.text.secondary} />
                        </View>
                        {selectedGateway === gateway.name && gateway.name === 'PHONEPE' && (
                            <View style={styles.upiContainer}>
                                <Text style={styles.upiLabel}>Enter UPI ID (VPA)</Text>
                                <TextInput
                                    style={styles.upiInput}
                                    placeholder="e.g. success@ybl"
                                    value={vpa}
                                    onChangeText={setVpa}
                                    autoCapitalize="none"
                                />
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={styles.payButton}
                                        onPress={() => initiatePayment('PHONEPE', vpa)}
                                        disabled={!vpa}
                                    >
                                        <Text style={styles.payButtonText}>Pay via UPI ID</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.secondaryButton}
                                        onPress={() => initiatePayment('PHONEPE')}
                                    >
                                        <Text style={styles.secondaryButtonText}>Use Pay Page</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.upiNote}>For sandbox testing, use <Text style={{ fontWeight: 'bold' }}>success@ybl</Text> to simulate success.</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}

                {gateways.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Icon name="alert-circle" size={48} color={theme.colors.error} />
                        <Text style={styles.emptyText}>No payment gateways available at the moment.</Text>
                    </View>
                )}
            </ScrollView>
            {
                initiating && (
                    <View style={styles.overlay}>
                        <ActivityIndicator size="large" color={theme.colors.primary.main} />
                        <Text style={styles.overlayText}>Initiating Payment...</Text>
                    </View>
                )
            }
        </SafeAreaView >
    );
};

const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: theme.spacing.lg,
    },
    title: {
        ...theme.typography.h2,
    color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        ...theme.typography.body2,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xl,
    },
    gatewayCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        ...theme.shadows.sm,
    },
    gatewayInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gatewayLabel: {
        ...theme.typography.body1,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    gatewaySubtitle: {
        ...theme.typography.body2,
        color: theme.colors.text.secondary,
        marginTop: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
        gap: theme.spacing.md,
    },
    emptyText: {
        ...theme.typography.body1,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayText: {
        marginTop: theme.spacing.md,
        ...theme.typography.body1,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.primary.main,
    },
    gatewayCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    upiContainer: {
        marginTop: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.light,
        width: '100%',
    },
    upiLabel: {
        ...theme.typography.body2,
        fontWeight: theme.typography.fontWeight.semibold,
        marginBottom: theme.spacing.sm,
    },
    upiInput: {
        borderWidth: 1,
        borderColor: theme.colors.border.medium,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        backgroundColor: theme.colors.background.default,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    payButton: {
        flex: 1,
        backgroundColor: theme.colors.primary.main,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    payButtonText: {
        ...theme.typography.button,
        color: theme.colors.text.inverse,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border.medium,
    },
    secondaryButtonText: {
        ...theme.typography.button,
        color: theme.colors.text.primary,
    },
    upiNote: {
        marginTop: theme.spacing.sm,
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.text.secondary,
        fontStyle: 'italic',
    },
});

export default PaymentGatewayScreen;
