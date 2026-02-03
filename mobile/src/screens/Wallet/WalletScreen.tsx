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
                { backgroundColor: item.transactionType === 'CREDIT' ? '#E6F4EA' : '#FDECEA' }
            ]}>
                <Icon
                    name={getTransactionIcon(item.transactionType)}
                    size={20}
                    color={item.transactionType === 'CREDIT' ? '#10B981' : '#EF4444'}
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
                    { color: item.transactionType === 'CREDIT' ? '#10B981' : theme.colors.text.primary }
                ]}>
                    {item.transactionType === 'CREDIT' ? '+' : '-'}₹{item.amount.toFixed(2)}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'CONFIRMED' ? '#E6F4EA' : '#FFF4E5' }]}>
                    <Text style={[styles.statusBadgeText, { color: item.status === 'CONFIRMED' ? '#1E4620' : '#854D0E' }]}>
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
                                    <Icon name="alert-circle" size={20} color="#B45309" />
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
                                <View style={[styles.statusDot, { backgroundColor: wallet?.status === 'ACTIVE' ? '#10B981' : '#EF4444' }]} />
                                <Text style={styles.statusText}>{wallet?.status || 'Active'}</Text>
                            </View>
                        </View>

                        <View style={styles.summaryGrid}>
                            <View style={styles.summaryCard}>
                                <View style={[styles.summaryIconContainer, { backgroundColor: '#FFF4E5' }]}>
                                    <Icon name="clock" size={16} color="#B45309" />
                                </View>
                                <View>
                                    <Text style={styles.summaryLabel}>Blocked</Text>
                                    <Text style={styles.summaryValue}>₹{(wallet?.blockedBalance ?? 0).toFixed(2)}</Text>
                                </View>
                            </View>

                            <View style={styles.summaryCard}>
                                <View style={[styles.summaryIconContainer, { backgroundColor: '#F3E8FF' }]}>
                                    <Icon name="credit-card" size={16} color="#7E22CE" />
                                </View>
                                <View>
                                    <Text style={styles.summaryLabel}>Earnings</Text>
                                    <Text style={styles.summaryValue}>₹{(wallet?.totalEarned ?? 0).toFixed(2)}</Text>
                                </View>
                            </View>

                            <View style={styles.summaryCard}>
                                <View style={[styles.summaryIconContainer, { backgroundColor: '#FEE2E2' }]}>
                                    <Icon name="x-circle" size={16} color="#DC2626" />
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
        fontSize: 28,
        fontWeight: 'bold',
    },
    subtitle: {
        ...theme.typography.body2,
        color: theme.colors.text.secondary,
        marginTop: 4,
    },
    warningCard: {
        backgroundColor: '#FFFBEB',
        borderWidth: 1,
        borderColor: '#FEF3C7',
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
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    warningContent: {
        flex: 1,
    },
    warningTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#92400E',
    },
    warningText: {
        fontSize: 12,
        color: '#B45309',
        marginTop: 2,
    },
    balanceCard: {
        backgroundColor: theme.colors.primary.main === '#000000' ? '#004D40' : theme.colors.primary.main,
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
        fontSize: 9,
        fontWeight: 'bold',
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
        color: '#FFFFFF',
        fontSize: 40,
        fontWeight: '900',
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
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: 'bold',
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
        fontSize: 10,
        color: '#B45309',
        fontWeight: 'bold',
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
        fontSize: 18,
        color: theme.colors.text.primary,
        fontWeight: 'bold',
    },
    recordsCount: {
        fontSize: 12,
        fontWeight: 'bold',
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
