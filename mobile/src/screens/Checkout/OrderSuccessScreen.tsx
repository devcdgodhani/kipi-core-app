import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Theme, useAppTheme } from '../../theme/theme';
import { useMemo } from 'react';

const OrderSuccessScreen = ({ route, navigation }: any) => {
    const { orderId } = route.params || {};
    const theme = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Icon name="check-circle" size={80} color={theme.colors.success} />
                </View>
                <Text style={styles.title}>Order Placed Successfully!</Text>
                <Text style={styles.subtitle}>
                    Thank you for your purchase. Your order has been placed and is being processed.
                </Text>
                {orderId && (
                    <Text style={styles.orderIdText}>Order ID: {orderId}</Text>
                )}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('Orders')}
                    >
                        <Text style={styles.primaryButtonText}>View My Orders</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
                    >
                        <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
                    </TouchableOpacity>
                </View>
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    iconContainer: {
        marginBottom: theme.spacing.xl,
    },
    title: {
        ...theme.typography.h2,
    color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    subtitle: {
        ...theme.typography.body1,
    color: theme.colors.text.primary,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
        paddingHorizontal: theme.spacing.md,
    },
    orderIdText: {
        ...theme.typography.body2,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        backgroundColor: `${theme.colors.primary.main}10`,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.xl,
    },
    buttonContainer: {
        width: '100%',
        gap: theme.spacing.md,
    },
    primaryButton: {
        backgroundColor: theme.colors.primary.main,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
    },
    primaryButtonText: {
        ...theme.typography.button,
        color: theme.colors.text.inverse,
    },
    secondaryButton: {
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.primary.main,
    },
    secondaryButtonText: {
        ...theme.typography.button,
        color: theme.colors.primary.main,
    },
});

export default OrderSuccessScreen;
