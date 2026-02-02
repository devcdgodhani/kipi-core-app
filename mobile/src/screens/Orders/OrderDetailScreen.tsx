import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { orderService } from '../../services/order.service';
import { Order } from '../../types/order.types';
import { theme } from '../../theme/theme';
import Toast from 'react-native-toast-message';

type ParamList = {
  OrderDetail: { orderId: string };
};

const OrderDetailScreen = () => {
  const route = useRoute<RouteProp<ParamList, 'OrderDetail'>>();
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      const data = await orderService.getById(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Failed to load order details', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load order details',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderStatusStep = (label: string, isCompleted: boolean, isLast: boolean) => (
    <View style={styles.stepContainer}>
      <View style={[styles.stepDot, isCompleted && styles.activeStepDot]} />
      {!isLast && <View style={[styles.stepLine, isCompleted && styles.activeStepLine]} />}
      <View style={styles.stepLabelContainer}>
        <Text style={[styles.stepLabel, isCompleted && styles.activeStepLabel]}>
          {label}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.headerTitle}>Order #{order.orderNumber}</Text>
          <Text style={styles.dateText}>
            Placed on {new Date(order.createdAt).toLocaleString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemMeta}>
                  Qty: {item.quantity} | ₹{item.price}
                </Text>
              </View>
              <Text style={styles.itemTotal}>₹{item.total}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          {['PENDING', 'CONFIRMED', 'Packed', 'SHIPPED', 'DELIVERED'].map((status, index, array) => {
            const isCompleted = ['DELIVERED', 'SHIPPED', 'CONFIRMED', 'PENDING'].includes(order.orderStatus)
              ? ['PENDING', 'CONFIRMED', 'Packed', 'SHIPPED', 'DELIVERED'].indexOf(order.orderStatus) >= index
              : false;

            // Simplistic mapping for demo purposes
            // In real app, orderStatus usually matches these exactly or mapped
            // Using index comparison for linear progress
            const currentStatusIndex = ['PENDING', 'CONFIRMED', 'Packed', 'SHIPPED', 'DELIVERED'].findIndex(s => s === order.orderStatus || (order.orderStatus === 'PROCESSING' && s === 'Packed'));
            const completed = currentStatusIndex >= index;

            return (
              <View key={status}>
                {renderStatusStep(status, completed, index === array.length - 1)}
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>₹{order.subTotal}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Shipping</Text>
            <Text style={styles.value}>₹{order.shippingCost}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tax</Text>
            <Text style={styles.value}>₹{order.tax}</Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <Text style={styles.addressName}>{order.shippingAddress.name}</Text>
          <Text style={styles.addressText}>
            {order.shippingAddress.street}, {order.shippingAddress.city}
          </Text>
          <Text style={styles.addressText}>
            {order.shippingAddress.state}, {order.shippingAddress.country} - {order.shippingAddress.pincode}
          </Text>
          <Text style={styles.addressText}>Mobile: {order.shippingAddress.mobile}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  content: {
    padding: theme.spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  headerTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xs,
  },
  dateText: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
  },
  sectionTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  itemCard: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    paddingBottom: theme.spacing.sm,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.background.default,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    ...theme.typography.body2,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemMeta: {
    ...theme.typography.body2,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  itemTotal: {
    ...theme.typography.body1,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  label: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
  },
  value: {
    ...theme.typography.body2,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  totalLabel: {
    ...theme.typography.h3,
  },
  totalValue: {
    ...theme.typography.h3,
    color: theme.colors.primary.main,
  },
  addressName: {
    ...theme.typography.body1,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addressText: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  stepContainer: {
    flexDirection: 'row',
    height: 60,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.border.medium,
    marginTop: 4,
    marginRight: theme.spacing.sm,
  },
  activeStepDot: {
    backgroundColor: theme.colors.success,
  },
  stepLine: {
    width: 2,
    backgroundColor: theme.colors.border.medium,
    position: 'absolute',
    left: 5,
    top: 16,
    bottom: -4,
  },
  activeStepLine: {
    backgroundColor: theme.colors.success,
  },
  stepLabelContainer: {
    flex: 1,
  },
  stepLabel: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
  },
  activeStepLabel: {
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  errorText: {
    ...theme.typography.body1,
    color: theme.colors.error,
  },
});

export default OrderDetailScreen;
