import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { useWallet } from '../../context/WalletContext';
import { useAppTheme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import { format, isValid } from 'date-fns';

const WalletScreen = () => {
    const theme = useAppTheme();
    const {
        wallet,
        transactions,
        loading,
        refreshWallet,
        loadTransactions,
        totalTransactions,
        expiringSoon,
        totalExpired
    } = useWallet();
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);

    const styles = useMemo(() => createStyles(theme), [theme]);

    useEffect(() => {
        const initWallet = async () => {
            await refreshWallet();
            await loadTransactions(1);
        };
        initWallet();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshWallet();
        await loadTransactions(1);
        setPage(1);
        setRefreshing(false);
    };

    const loadMore = () => {
        if (!loading && transactions.length < totalTransactions) {
            const nextPage = page + 1;
            loadTransactions(nextPage);
            setPage(nextPage);
        }
    };

    const getTransactionIcon = (type: string) => {
        if (type === 'CREDIT') return 'arrow-down-left';
        return 'arrow-up-right';
    };

    const renderTransaction = ({ item }: { item: any }) => (
        <View style={styles.transactionCard}>
            <View style={[
                styles.iconContainer,
                { backgroundColor: item.transactionType === 'CREDIT' ? `${theme.colors.success}15` : `${theme.colors.error}15` }
            ]}>
                <Icon
                    name={getTransactionIcon(item.transactionType)}
                    size={20}
                    color={item.transactionType === 'CREDIT' ? theme.colors.success : theme.colors.error}
                />
            </View>
            <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>
                    {item.description || item.sourceType?.replace('_', ' ') || item.category}
                </Text>
                <View style={styles.txMeta}>
                    <Text style={styles.transactionDate}>
                        {format(new Date(item.createdAt), 'dd MMM yyyy, HH:mm')}
                    </Text>
                    {item.transactionType === 'CREDIT' && item.expiryDate && (
                        <Text style={styles.expiryTag}>
                            Expires: {format(new Date(item.expiryDate), 'dd MMM yy')}
                        </Text>
                    )}
                </View>
            </View>
            <View style={styles.txAmountContainer}>
                <Text style={[
                    styles.transactionAmount,
                    { color: item.transactionType === 'CREDIT' ? theme.colors.success : theme.colors.text.primary }
                ]}>
                    {item.transactionType === 'CREDIT' ? '+' : '-'}₹{item.amount.toFixed(2)}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'CONFIRMED' ? `${theme.colors.success}15` : `${theme.colors.warning}15` }]}>
                    <Text style={[styles.statusBadgeText, { color: item.status === 'CONFIRMED' ? theme.colors.success : theme.colors.warning }]}>
                        {item.status}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary.main]} />
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <View style={styles.titleSection}>
                            <Text style={styles.mainTitle}>My Wallet</Text>
                            <Text style={styles.subtitle}>Manage your balance and rewards</Text>
                        </View>

                        {/* Expiry Warning */}
                        {expiringSoon && (
                            <View style={styles.warningCard}>
                                <View style={styles.warningIcon}>
                                    <Icon name="alert-circle" size={20} color={theme.colors.warning} />
                                </View>
                                <View style={styles.warningContent}>
                                    <Text style={styles.warningTitle}>Points Expiring Soon!</Text>
                                    <Text style={styles.warningText}>
                                        ₹{expiringSoon.amount} will expire on {format(new Date(expiringSoon.expiryDate!), 'dd MMM yyyy')}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.balanceCard}>
                            <Text style={styles.balanceLabel}>Available Balance</Text>
                            <Text style={styles.balanceValue}>
                                ₹{(wallet?.availableBalance ?? 0).toFixed(2)}
                            </Text>
                            <View style={styles.walletStatus}>
                                <View style={[styles.statusDot, { backgroundColor: wallet?.status === 'ACTIVE' ? theme.colors.success : theme.colors.error }]} />
                                <Text style={styles.statusText}>{wallet?.status || 'Active'}</Text>
                            </View>
                        </View>

                        <View style={styles.summaryGrid}>
                            <View style={styles.summaryCard}>
                                <View style={[styles.summaryIconContainer, { backgroundColor: `${theme.colors.warning}15` }]}>
                                    <Icon name="clock" size={16} color={theme.colors.warning} />
                                </View>
                                <View>
                                    <Text style={styles.summaryLabel}>Blocked</Text>
                                    <Text style={styles.summaryValue}>₹{(wallet?.blockedBalance ?? 0).toFixed(2)}</Text>
                                </View>
                            </View>

                            <View style={styles.summaryCard}>
                                <View style={[styles.summaryIconContainer, { backgroundColor: `${theme.colors.primary.main}15` }]}>
                                    <Icon name="credit-card" size={16} color={theme.colors.primary.main} />
                                </View>
                                <View>
                                    <Text style={styles.summaryLabel}>Earnings</Text>
                                    <Text style={styles.summaryValue}>₹{(wallet?.totalEarned ?? 0).toFixed(2)}</Text>
                                </View>
                            </View>

                            <View style={styles.summaryCard}>
                                <View style={[styles.summaryIconContainer, { backgroundColor: `${theme.colors.error}15` }]}>
                                    <Icon name="x-circle" size={16} color={theme.colors.error} />
                                </View>
                                <View>
                                    <Text style={styles.summaryLabel}>Expired</Text>
                                    <Text style={styles.summaryValue}>₹{(wallet?.totalExpired ?? 0).toFixed(2)}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.sectionHeader, { marginTop: theme.spacing.lg }]}>
                            <Text style={styles.sectionTitle}>Transaction History</Text>
                            {totalTransactions > 0 && (
                                <Text style={styles.recordsCount}>{totalTransactions} RECORDS</Text>
                            )}
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <Icon name="credit-card" size={48} color={theme.colors.text.tertiary} />
                            <Text style={styles.emptyText}>No transactions yet</Text>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    header: {
        padding: theme.spacing.md,
        paddingBottom: 0,
    },
    titleSection: {
        marginBottom: theme.spacing.lg,
    },
    mainTitle: {
        ...theme.typography.h1,
    color: theme.colors.text.primary,
        fontSize: theme.typography.fontSize['4xl'],
        fontWeight: theme.typography.fontWeight.bold,
    },
    subtitle: {
        ...theme.typography.body2,
        color: theme.colors.text.secondary,
        marginTop: 4,
    },
    warningCard: {
        backgroundColor: `${theme.colors.warning}15`,
        borderWidth: 1,
        borderColor: `${theme.colors.warning}30`,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    warningIcon: {
        width: 36,
        height: 36,
        borderRadius: theme.borderRadius.md,
        backgroundColor: `${theme.colors.warning}15`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    warningContent: {
        flex: 1,
    },
    warningTitle: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.warning,
    },
    warningText: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginTop: 2,
    },
    balanceCard: {
        backgroundColor: theme.colors.primary.main,
        borderRadius: 24,
        padding: theme.spacing.xl,
        alignItems: 'center',
        ...theme.shadows.md,
        marginBottom: theme.spacing.lg,
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    summaryIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.secondary,
        textTransform: 'uppercase',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    balanceLabel: {
        ...theme.typography.body2,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: theme.spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    balanceValue: {
        ...theme.typography.h1,
    color: theme.colors.text.primary,
        color: theme.colors.text.inverse,
        fontSize: theme.typography.fontSize['5xl'],
        fontWeight: theme.typography.fontWeight.black,
        marginBottom: theme.spacing.md,
    },
    walletStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.full,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        ...theme.typography.body2,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.inverse,
        fontWeight: theme.typography.fontWeight.bold,
    },
    txMeta: {
        flexDirection: 'column',
    },
    txAmountContainer: {
        alignItems: 'flex-end',
        gap: 4,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusBadgeText: {
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    expiryTag: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.warning,
        fontWeight: theme.typography.fontWeight.bold,
        marginTop: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        ...theme.typography.h3,
    color: theme.colors.text.primary,
        fontSize: 18,
        color: theme.colors.text.primary,
        fontWeight: 'bold',
    },
    recordsCount: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.primary.main,
        backgroundColor: `${theme.colors.primary.main}15`,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    listContent: {
        padding: theme.spacing.md,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.default,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        ...theme.typography.body1,
    color: theme.colors.text.primary,
        fontWeight: 'bold',
        marginBottom: 2,
        textTransform: 'capitalize',
        color: theme.colors.text.primary,
    },
    transactionDate: {
        ...theme.typography.body2,
        fontSize: 11,
        color: theme.colors.text.secondary,
    },
    transactionAmount: {
        ...theme.typography.body1,
    color: theme.colors.text.primary,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        marginTop: theme.spacing.xl,
    },
    emptyText: {
        ...theme.typography.body2,
        color: theme.colors.text.tertiary,
        marginTop: theme.spacing.md,
    },
});

export default WalletScreen;
