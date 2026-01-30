import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { orderService } from '../../services/order.service';
import { Order } from '../../types/order.types';
import { theme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';

type RootStackParamList = {
  OrderDetail: { orderId: string };
};

const OrdersScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'DELIVERED'>('ALL');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderService.getMyOrders({
        page: 1,
        limit: 100, // Load initial batch
        sort: { createdAt: -1 }
      });
      if (response && response.recordList) {
        setOrders(response.recordList);
      }
    } catch (error) {
      console.error('Failed to load orders', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load your orders',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
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

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
        <Text style={[styles.orderStatus, { color: getStatusColor(item.orderStatus) }]}>
          {item.orderStatus}
        </Text>
      </View>
      
      <Text style={styles.orderDate}>
        Placed on {new Date(item.createdAt).toLocaleDateString()}
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

  if (loading) {
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="package" size={64} color={theme.colors.text.tertiary} />
            <Text style={styles.emptyText}>No orders found</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.paper,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  tab: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary.main,
  },
  tabText: {
    ...theme.typography.body2,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: theme.colors.primary.main,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  orderCard: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderNumber: {
    ...theme.typography.body1,
    fontWeight: 'bold',
  },
  orderStatus: {
    ...theme.typography.body2,
    fontWeight: 'bold',
  },
  orderDate: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
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
    fontSize: 16,
    color: theme.colors.primary.main,
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
