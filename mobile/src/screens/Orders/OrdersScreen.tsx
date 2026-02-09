import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { orderService } from '../../services/order.service';
import { Order } from '../../types/order.types';
import { Theme, useAppTheme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { format, isValid } from 'date-fns';

type RootStackParamList = {
  OrderDetail: { orderId: string };
};

const OrdersScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'DELIVERED'>('ALL');
  const LIMIT = 10;

  const styles = useMemo(() => createStyles(theme), [theme]);



  const loadOrders = async (pageNum: number, shouldRefresh = false) => {
    if (!shouldRefresh && (loadingMore || !hasMore)) return;

    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await orderService.getMyOrders({
        page: pageNum,
        limit: LIMIT,
        sort: { createdAt: -1 }
      });

      const newOrders = response?.recordList || (Array.isArray(response) ? response : []);

      if (shouldRefresh || pageNum === 1) {
        setOrders(newOrders);
      } else {
        setOrders(prev => [...prev, ...newOrders]);
      }

      setHasMore(newOrders.length === LIMIT);
      setPage(pageNum);

    } catch (error) {
      console.error('Failed to load orders', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load your orders',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders(1, true);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    loadOrders(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      loadOrders(page + 1);
    }
  };



  const getFilteredOrders = () => {
    if (activeTab === 'ALL') return orders;
    if (activeTab === 'PENDING') {
      return orders.filter(o => ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.orderStatus));
    }
    if (activeTab === 'DELIVERED') {
      return orders.filter(o => o.orderStatus === 'DELIVERED');
    }
    return orders;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return theme.colors.success;
      case 'CANCELLED': 
      case 'RETURNED': return theme.colors.error;
      case 'SHIPPED': return theme.colors.primary.main;
      default: return theme.colors.warning;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'check-circle';
      case 'CANCELLED': return 'x-circle';
      case 'RETURNED': return 'rotate-ccw';
      case 'SHIPPED': return 'package';
      case 'CONFIRMED': return 'check';
      case 'PROCESSING': return 'refresh-cw';
      default: return 'clock';
    }
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    const date = new Date(dateValue);
    if (!isValid(date)) return 'Invalid Date';
    return format(date, 'dd MMM yyyy');
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.orderStatus)}20` }]}>
          <Icon name={getStatusIcon(item.orderStatus)} size={12} color={getStatusColor(item.orderStatus)} style={{ marginRight: 4 }} />
          <Text style={[styles.orderStatus, { color: getStatusColor(item.orderStatus) }]}>
            {item.orderStatus}
          </Text>
        </View>
      </View>
      
      <Text style={styles.orderDate}>
        Placed on {formatDate(item.createdAt)}
      </Text>
      
      <View style={styles.divider} />
      
      <View style={styles.orderFooter}>
        <Text style={styles.itemCount}>
          {item.items.length} {item.items.length === 1 ? 'Item' : 'Items'}
        </Text>
        <Text style={styles.orderTotal}>₹{item.totalAmount.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {(['ALL', 'PENDING', 'DELIVERED'] as const).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 20 }} />;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={theme.colors.primary.main} />
      </View>
    );
  };

  if (loading && !refreshing && orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderTabs()}
      <FlatList
        data={getFilteredOrders()}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary.main]} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Icon name="package" size={64} color={theme.colors.text.tertiary} />
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.paper,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.default,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  tab: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    marginRight: theme.spacing.lg,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary.main,
  },
  tabText: {
    ...theme.typography.body2,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: theme.colors.primary.main,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  orderCard: {
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    ...theme.shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    ...theme.typography.body1,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderStatus: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  orderDate: {
    ...theme.typography.body2,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginVertical: theme.spacing.sm,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
  },
  orderTotal: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    ...theme.typography.body1,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
});

export default OrdersScreen;
