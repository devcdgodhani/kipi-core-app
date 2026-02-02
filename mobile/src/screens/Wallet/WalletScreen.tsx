import React, { useEffect, useState } from 'react';
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
import { theme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import { format } from 'date-fns';

const WalletScreen = () => {
    const { wallet, transactions, loading, refreshWallet, loadTransactions } = useWallet();
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);

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
        if (!loading) {
            const nextPage = page + 1;
            loadTransactions(nextPage);
            setPage(nextPage);
        }
    };

    const getTransactionIcon = (type: string, category: string) => {
        if (type === 'CREDIT') return 'arrow-down-left';
        return 'arrow-up-right';
    };

    const getTransactionColor = (type: string) => {
        return type === 'CREDIT' ? theme.colors.success : theme.colors.error;
    };

    const renderTransaction = ({ item }: { item: any }) => (
        <View style={styles.transactionCard}>
            <View style={[
                styles.iconContainer,
                { backgroundColor: item.type === 'CREDIT' ? '#E6F4EA' : '#FDECEA' }
            ]}>
                <Icon
                    name={getTransactionIcon(item.type, item.category)}
                    size={20}
                    color={getTransactionColor(item.type)}
                />
            </View>
            <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>
                    {item.description || item.category}
                </Text>
                <Text style={styles.transactionDate}>
                    {format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}
                </Text>
            </View>
            <Text style={[
                styles.transactionAmount,
                { color: getTransactionColor(item.type) }
            ]}>
                {item.type === 'CREDIT' ? '+' : '-'}₹{item.amount.toFixed(2)}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Total Balance</Text>
                    <Text style={styles.balanceValue}>
                        ₹{wallet?.balance?.toFixed(2) || '0.00'}
                    </Text>
                    <View style={styles.walletStatus}>
                        <View style={[styles.statusDot, { backgroundColor: wallet?.status === 'ACTIVE' ? theme.colors.success : theme.colors.error }]} />
                        <Text style={styles.statusText}>{wallet?.status || 'Active'}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.transactionsContainer}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                <FlatList
                    data={transactions}
                    renderItem={renderTransaction}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Icon name="credit-card" size={48} color={theme.colors.text.tertiary} />
                            <Text style={styles.emptyText}>No transactions yet</Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    header: {
        padding: theme.spacing.md,
    },
    balanceCard: {
        backgroundColor: theme.colors.primary.main,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xl,
        alignItems: 'center',
        ...theme.shadows.md,
    },
    balanceLabel: {
        ...theme.typography.body2,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: theme.spacing.xs,
    },
    balanceValue: {
        ...theme.typography.h2,
        color: '#FFFFFF',
        fontSize: 32,
        marginBottom: theme.spacing.md,
    },
    walletStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
        fontWeight: '600',
    },
    transactionsContainer: {
        flex: 1,
        backgroundColor: theme.colors.background.paper,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        paddingTop: theme.spacing.lg,
    },
    sectionTitle: {
        ...theme.typography.h3,
        fontSize: 18,
        marginLeft: theme.spacing.md,
        marginBottom: theme.spacing.md,
        color: theme.colors.text.primary,
    },
    listContent: {
        padding: theme.spacing.md,
        paddingTop: 0,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.default,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        ...theme.typography.body1,
        fontWeight: '600',
        marginBottom: 2,
        textTransform: 'capitalize',
    },
    transactionDate: {
        ...theme.typography.body2,
        fontSize: 12,
        color: theme.colors.text.tertiary,
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
