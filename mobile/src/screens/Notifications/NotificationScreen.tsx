import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    SafeAreaView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useNotifications } from '../../context/NotificationContext';
import { theme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import { format } from 'date-fns';

const NotificationScreen = () => {
    const {
        notifications,
        loading,
        refreshNotifications,
        loadNotifications,
        markAsRead,
        markAllRead,
        unreadCount
    } = useNotifications();
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);

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
        if (!loading) {
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
        if (!item.isRead) {
            await markAsRead(item._id);
        }
        // Handle navigation based on item.data or item.actionUrl if needed
    };

    const renderNotification = ({ item }: { item: any }) => (
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
                        {item.title}
                    </Text>
                    <Text style={styles.date}>
                        {format(new Date(item.createdAt), 'MMM dd, HH:mm')}
                    </Text>
                </View>
                <Text style={styles.message} numberOfLines={2}>
                    {item.message}
                </Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications ({unreadCount})</Text>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={markAllRead}>
                        <Text style={styles.markAllRead}>Mark all as read</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Icon name="bell-off" size={48} color={theme.colors.text.tertiary} />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                        <Text style={styles.emptySubtext}>We'll notify you when something important happens.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.paper,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
    },
    headerTitle: {
        ...theme.typography.h3,
        fontSize: 18,
        color: theme.colors.text.primary,
    },
    markAllRead: {
        ...theme.typography.body2,
        color: theme.colors.primary.main,
        fontWeight: '600',
    },
    listContent: {
        padding: theme.spacing.md,
    },
    card: {
        flexDirection: 'row',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.sm,
        borderLeftWidth: 3,
        borderLeftColor: 'transparent',
    },
    unreadCard: {
        backgroundColor: theme.colors.background.default, // Slightly different if needed, potentially highlighted
        borderLeftColor: theme.colors.primary.main,
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
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    unreadTitle: {
        fontWeight: 'bold',
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
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.primary.main,
        position: 'absolute',
        top: theme.spacing.md,
        right: theme.spacing.md,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        marginTop: theme.spacing.xl * 2,
    },
    emptyText: {
        ...theme.typography.h3,
        fontSize: 18,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    emptySubtext: {
        ...theme.typography.body2,
        color: theme.colors.text.tertiary,
        textAlign: 'center',
    },
});

export default NotificationScreen;
