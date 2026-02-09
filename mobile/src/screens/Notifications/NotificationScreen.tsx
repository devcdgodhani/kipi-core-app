import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../../context/NotificationContext';
import { useAppTheme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import { format, isValid } from 'date-fns';
import { useNavigation } from '@react-navigation/native';

const NotificationScreen = () => {
    const theme = useAppTheme();
    const navigation = useNavigation<any>();
    const {
        notifications,
        loading,
        refreshNotifications,
        loadNotifications,
        markAsRead,
        markAllRead,
        unreadCount,
        totalNotifications
    } = useNotifications();
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);

    const styles = useMemo(() => createStyles(theme), [theme]);

    useEffect(() => {
        loadNotifications(1);
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshNotifications();
        setPage(1);
        setRefreshing(false);
    };

    const loadMore = () => {
        if (!loading && notifications.length < totalNotifications) {
            const nextPage = page + 1;
            loadNotifications(nextPage);
            setPage(nextPage);
        }
    };

    const getIconName = (type: string) => {
        switch (type) {
            case 'ORDER_STATUS': return 'package';
            case 'PROMOTION': return 'tag';
            case 'WALLET': return 'credit-card';
            case 'SYSTEM': return 'info';
            default: return 'bell';
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'ORDER_STATUS': return theme.colors.primary.main;
            case 'PROMOTION': return theme.colors.warning;
            case 'WALLET': return theme.colors.success;
            case 'SYSTEM': return theme.colors.text.secondary;
            default: return theme.colors.primary.main;
        }
    };

    const handleNotificationPress = async (item: any) => {
        try {
            if (!item.isRead) {
                await markAsRead(item._id);
            }

            // Navigate based on metadata
            if (item.metadata?.orderId) {
                navigation.navigate('OrderDetail', { orderId: item.metadata.orderId });
            } else if (item.metadata?.productId) {
                navigation.navigate('ProductDetail', { id: item.metadata.productId });
            } else if (item.type === 'WALLET') {
                navigation.navigate('Wallet');
            }
        } catch (error) {
            console.error('Notification press error:', error);
        }
    };

    const formatDate = (dateValue: any) => {
        if (!dateValue) return '';
        const date = new Date(dateValue);
        if (!isValid(date)) return '';
        return format(date, 'MMM dd, HH:mm');
    };

    const renderNotification = ({ item }: { item: any }) => {
        if (!item) return null;

        return (
            <TouchableOpacity
                style={[styles.card, !item.isRead && styles.unreadCard]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: item.imageUrl ? 'transparent' : `${getIconColor(item.type)}20` }]}>
                    {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.notificationImage} />
                    ) : (
                        <Icon name={getIconName(item.type)} size={20} color={getIconColor(item.type)} />
                    )}
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.title, !item.isRead && styles.unreadTitle]} numberOfLines={1}>
                            {item.title || 'Notification'}
                        </Text>
                        <Text style={styles.date}>
                            {formatDate(item.createdAt)}
                        </Text>
                    </View>
                    <Text style={styles.message} numberOfLines={2}>
                        {item.message || ''}
                    </Text>
                </View>
                {!item.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <Text style={styles.unreadSub}>{unreadCount} unread messages</Text>
                </View>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={markAllRead} style={styles.markButton}>
                        <Icon name="check-circle" size={16} color={theme.colors.primary.main} />
                        <Text style={styles.markAllRead}>Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item?._id || Math.random().toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary.main]}
                        tintColor={theme.colors.primary.main}
                    />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loading && !refreshing ? (
                        <View style={styles.footerLoader}>
                            <ActivityIndicator size="small" color={theme.colors.primary.main} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconBg}>
                                <Icon name="bell-off" size={40} color={theme.colors.text.tertiary} />
                            </View>
                            <Text style={styles.emptyText}>All caught up!</Text>
                            <Text style={styles.emptySubtext}>We'll notify you when something important happens.</Text>
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
        backgroundColor: theme.colors.background.paper,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.default,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
    },
    headerTitle: {
        ...theme.typography.h3,
        fontSize: theme.typography.fontSize.xl,
        color: theme.colors.text.primary,
        fontWeight: theme.typography.fontWeight.bold,
    },
    unreadSub: {
        ...theme.typography.body2,
        color: theme.colors.text.secondary,
        fontSize: 12,
    },
    markButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: 4,
    },
    markAllRead: {
        ...theme.typography.body2,
        color: theme.colors.primary.main,
        fontWeight: 'bold',
        fontSize: 13,
    },
    listContent: {
        padding: theme.spacing.md,
        flexGrow: 1,
    },
    card: {
        flexDirection: 'row',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.default,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        ...theme.shadows.sm,
    },
    unreadCard: {
        backgroundColor: `${theme.colors.primary.main}08`,
        borderColor: `${theme.colors.primary.main}30`,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
        overflow: 'hidden',
    },
    notificationImage: {
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        ...theme.typography.body1,
        fontWeight: theme.typography.fontWeight.bold,
        flex: 1,
        marginRight: 8,
        color: theme.colors.text.primary,
        fontSize: theme.typography.fontSize.base,
    },
    unreadTitle: {
        color: theme.colors.primary.main,
    },
    date: {
        ...theme.typography.body2,
        fontSize: 11,
        color: theme.colors.text.tertiary,
    },
    message: {
        ...theme.typography.body2,
        color: theme.colors.text.secondary,
        lineHeight: 18,
        fontSize: 13,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.primary.main,
        position: 'absolute',
        top: 12,
        right: 12,
    },
    footerLoader: {
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        marginTop: 60,
    },
    emptyIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.background.default,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        ...theme.shadows.sm,
    },
    emptyText: {
        ...theme.typography.h3,
        fontSize: theme.typography.fontSize['3xl'],
        color: theme.colors.text.primary,
        fontWeight: theme.typography.fontWeight.bold,
        marginBottom: theme.spacing.xs,
    },
    emptySubtext: {
        ...theme.typography.body2,
        color: theme.colors.text.tertiary,
        textAlign: 'center',
        fontSize: 14,
        paddingHorizontal: 20,
    },
});

export default NotificationScreen;
