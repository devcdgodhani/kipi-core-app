import React, { useState, useMemo } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Feather';
import { Theme, useAppTheme } from '../../theme/theme';
import Toast from 'react-native-toast-message';

const PaymentWebViewScreen = ({ route, navigation }: any) => {
    const theme = useAppTheme();
    const { url, orderId, redirectMethod, gatewayData } = route.params || {};
    const [loading, setLoading] = useState(true);

    const styles = useMemo(() => createStyles(theme), [theme]);

    const handleNavigationStateChange = (navState: any) => {
        const { url: currentUrl } = navState;
        console.log('WebView URL:', currentUrl);

        // Define success and failure URL patterns based on backend/gateway callbacks
        const isSuccess =
            currentUrl.includes('/payment/success') ||
            currentUrl.includes('/payment/callback') && currentUrl.includes('status=COMPLETED') ||
            currentUrl.includes('status=SUCCESS');

        const isFailed =
            currentUrl.includes('/payment/failed') ||
            currentUrl.includes('/payment/callback') && currentUrl.includes('status=FAILED') ||
            currentUrl.includes('status=ERROR');

        if (isSuccess) {
            Toast.show({
                type: 'success',
                text1: 'Payment Successful',
                text2: 'Your order has been confirmed.',
            });
            navigation.navigate('OrderSuccess', { orderId });
        } else if (isFailed) {
            Toast.show({
                type: 'error',
                text1: 'Payment Failed',
                text2: 'Please try again or choose another method.',
            });
            navigation.goBack();
        }
    };

    // Prepare WebView source
    const getWebViewSource = () => {
        if (redirectMethod === 'POST' && gatewayData) {
            const formData = new URLSearchParams();
            Object.keys(gatewayData).forEach(key => {
                formData.append(key, gatewayData[key]);
            });
            // Add orderId if needed by gateway
            if (!gatewayData.orderId) {
                formData.append('orderId', orderId);
            }

            return {
                uri: url,
                method: 'POST',
                body: formData.toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            };
        }

        return { uri: url };
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="x" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Secure Payment</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.webviewContainer}>
                <WebView
                    source={getWebViewSource() as any}
                    onNavigationStateChange={handleNavigationStateChange}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color={theme.colors.primary.main} />
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
};

const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
        backgroundColor: theme.colors.background.paper,
    },
    backButton: {
        padding: theme.spacing.xs,
    },
    headerTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        fontWeight: 'bold',
    },
    webviewContainer: {
        flex: 1,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: theme.colors.background.default,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PaymentWebViewScreen;
