import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAddress } from '../../context/AddressContext';
import { Address } from '../../types/address.types';
import { Theme, useAppTheme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';

const AddressListScreen = () => {
    const theme = useAppTheme();
    const navigation = useNavigation<any>();
    const { addresses, loading, deleteAddress, setDefaultAddress, refreshAddresses } = useAddress();

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            refreshAddresses();
        });

        return unsubscribe;
    }, [navigation]);

    const styles = useMemo(() => createStyles(theme), [theme]);

    const renderAddressCard = (address: Address) => (
        <View key={address._id} style={styles.addressCard}>
            <View style={styles.addressHeader}>
                <View style={styles.typeTag}>
                    <Icon name={address.type === 'HOME' ? 'home' : address.type === 'WORK' ? 'briefcase' : 'map-pin'} size={14} color={theme.colors.primary.main} />
                    <Text style={styles.typeText}>{address.type}</Text>
                </View>
                {address.isDefault && (
                    <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                    </View>
                )}
            </View>

            <View style={styles.addressBody}>
                <Text style={styles.nameText}>{address.name}</Text>
                <Text style={styles.addressText}>
                    {address.street}, {address.landmark ? address.landmark + ', ' : ''}
                    {address.city}, {address.state} - {address.pincode}
                </Text>
                <Text style={styles.phoneText}>Mobile: {address.mobile}</Text>
            </View>

            <View style={styles.addressActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('AddAddress', { addressId: address._id })}
                >
                    <Icon name="edit-2" size={16} color={theme.colors.text.secondary} />
                    <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <View style={styles.vDivider} />
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => deleteAddress(address._id)}
                >
                    <Icon name="trash-2" size={16} color={theme.colors.error} />
                    <Text style={[styles.actionText, { color: theme.colors.error }]}>Delete</Text>
                </TouchableOpacity>
                {!address.isDefault && (
                    <>
                        <View style={styles.vDivider} />
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setDefaultAddress(address._id)}
                        >
                            <Icon name="check-circle" size={16} color={theme.colors.success} />
                            <Text style={[styles.actionText, { color: theme.colors.success }]}>Set Default</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary.main} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Saved Addresses</Text>
                    <Text style={styles.subtitle}>{addresses.length} addresses saved</Text>
                </View>

                {addresses.length > 0 ? (
                    addresses.map(renderAddressCard)
                ) : (
                    <View style={styles.emptyState}>
                        <Icon name="map" size={64} color={theme.colors.text.tertiary} />
                        <Text style={styles.emptyTitle}>No Addresses Found</Text>
                        <Text style={styles.emptyText}>Add a new address to speed up your checkout process.</Text>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddAddress')}
                >
                    <Icon name="plus" size={20} color={theme.colors.text.inverse} />
                    <Text style={styles.addButtonText}>Add New Address</Text>
                </TouchableOpacity>
            </ScrollView>
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
        paddingBottom: theme.spacing.xl * 2,
    },
    header: {
        marginBottom: theme.spacing.lg,
    },
    title: {
        ...theme.typography.h2,
    color: theme.colors.text.primary,
    },
    subtitle: {
        ...theme.typography.body2,
        color: theme.colors.text.secondary,
        marginTop: 4,
    },
    addressCard: {
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        ...theme.shadows.sm,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    typeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.full,
        backgroundColor: `${theme.colors.primary.main}10`,
        gap: 6,
    },
    typeText: {
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.primary.main,
        textTransform: 'uppercase',
    },
    defaultBadge: {
        backgroundColor: theme.colors.success,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    defaultBadgeText: {
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.inverse,
    },
    addressBody: {
        marginBottom: theme.spacing.md,
    },
    nameText: {
        ...theme.typography.body1,
    color: theme.colors.text.primary,
        fontWeight: theme.typography.fontWeight.bold,
        marginBottom: 4,
    },
    addressText: {
        ...theme.typography.body2,
        color: theme.colors.text.secondary,
        lineHeight: 20,
        marginBottom: 4,
    },
    phoneText: {
        ...theme.typography.body2,
        color: theme.colors.text.primary,
        fontWeight: theme.typography.fontWeight.medium,
    },
    addressActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.light,
        paddingTop: theme.spacing.sm,
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        gap: 6,
    },
    actionText: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.text.secondary,
    },
    vDivider: {
        width: 1,
        height: 16,
        backgroundColor: theme.colors.border.light,
        marginHorizontal: theme.spacing.md,
    },
    addButton: {
        backgroundColor: theme.colors.primary.main,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        marginTop: theme.spacing.lg,
        ...theme.shadows.md,
    },
    addButtonText: {
        ...theme.typography.button,
        color: theme.colors.text.inverse,
        marginLeft: theme.spacing.sm,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background.default,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xl * 2,
    },
    emptyTitle: {
        ...theme.typography.h3,
    color: theme.colors.text.primary,
        marginTop: theme.spacing.md,
    },
    emptyText: {
        ...theme.typography.body2,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: theme.spacing.xl,
    },
});

export default AddressListScreen;
