import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { orderService } from '../../services/order.service';
import { returnService } from '../../services/returnService';
import { reviewService } from '../../services/review.service';
import { Order } from '../../types/order.types';
import { useAppTheme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { format, isValid } from 'date-fns';

type ParamList = {
  OrderDetail: { orderId: string };
};

const OrderDetailScreen = () => {
  const route = useRoute<RouteProp<ParamList, 'OrderDetail'>>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params;
  const theme = useAppTheme();

  const [order, setOrder] = useState<Order | null>(null);
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Return Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const [orderRes, returnsRes] = await Promise.all([
        orderService.getById(orderId),
        returnService.getMyReturns({ orderId })
      ]);

      if (orderRes) setOrder(orderRes);
      if (returnsRes?.recordList) {
        setReturns(returnsRes.recordList.filter((r: any) => String(r.orderId?._id || r.orderId) === String(orderId)));
      }
    } catch (error) {
      console.error('Failed to load order details', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load order details' });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReturn = async () => {
    if (!returnReason.trim()) {
      Toast.show({ type: 'error', text1: 'Required', text2: 'Please provide a reason' });
      return;
    }

    try {
      setSubmittingReturn(true);
      await returnService.requestReturn({
        orderId: order!._id,
        reason: returnReason,
        items: order!.items.map(item => ({ productId: item.productId, quantity: item.quantity }))
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Return request submitted' });
      setShowReturnModal(false);
      loadOrderDetails();
    } catch (error) {
      console.error('Return request error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to request return' });
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleCancelReturn = async (returnId: string) => {
    try {
      await returnService.cancel(returnId);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Return request cancelled' });
      loadOrderDetails();
    } catch (error) {
      console.error('Cancel return error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to cancel return' });
    }
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      Toast.show({ type: 'error', text1: 'Required', text2: 'Please enter a comment' });
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewService.submit({
        productId: selectedProduct.productId,
        orderId: order!._id,
        rating,
        comment,
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Review submitted' });
      setShowReviewModal(false);
      setComment('');
    } catch (error) {
      console.error('Submit review error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to submit review' });
    } finally {
      setSubmittingReview(false);
    }
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

  const formatDate = (date: any) => {
    const d = new Date(date);
    return isValid(d) ? format(d, 'MMM dd, yyyy HH:mm') : 'N/A';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const steps = [
    { status: 'PENDING', label: 'Placed' },
    { status: 'CONFIRMED', label: 'Confirmed' },
    { status: 'PROCESSING', label: 'Processing' },
    { status: 'SHIPPED', label: 'Shipped' },
    { status: 'DELIVERED', label: 'Delivered' }
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.orderStatus);
  const activeReturn = returns.find(r => r.status !== 'CANCELLED');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.orderNo}>Order #{order.orderNumber}</Text>
              <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.orderStatus)}15` }]}>
              <Icon name={getStatusIcon(order.orderStatus)} size={12} color={getStatusColor(order.orderStatus)} style={{ marginRight: 6 }} />
              <Text style={[styles.statusText, { color: getStatusColor(order.orderStatus) }]}>{order.orderStatus}</Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Progress</Text>
          <View style={styles.timelineRow}>
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isActive = idx === currentStepIndex;
              return (
                <View key={step.status} style={styles.timelineStep}>
                  <View style={[
                    styles.timelineDot,
                    isCompleted && styles.activeDot,
                    isActive && styles.currentDot
                  ]} />
                  <Text style={[styles.timelineLabel, isCompleted && styles.activeLabel]}>{step.label}</Text>
                  {idx < steps.length - 1 && (
                    <View style={[styles.timelineLine, idx < currentStepIndex && styles.activeLine]} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemImageContainer}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                ) : (
                  <View style={styles.itemPlaceholder}><Icon name="package" size={24} color={theme.colors.text.tertiary} /></View>
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemMeta}>Qty: {item.quantity} × ₹{item.price}</Text>
                {order.orderStatus === 'DELIVERED' && (
                  <TouchableOpacity
                    style={styles.reviewBtn}
                    onPress={() => {
                      setSelectedProduct(item);
                      setShowReviewModal(true);
                    }}
                  >
                    <Icon name="star" size={12} color={theme.colors.primary.main} />
                    <Text style={styles.reviewBtnText}>Rate Product</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.itemTotal}>₹{item.total}</Text>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressBox}>
            <Icon name="map-pin" size={18} color={theme.colors.primary.main} style={{ marginTop: 2, marginRight: 10 }} />
            <View>
              <Text style={styles.addressName}>{order.shippingAddress.name}</Text>
              <Text style={styles.addressText}>{order.shippingAddress.street}</Text>
              <Text style={styles.addressText}>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</Text>
              <Text style={styles.addressText}>Phone: {order.shippingAddress.mobile}</Text>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{order.subTotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>₹{order.shippingCost}</Text>
          </View>
          {order.discountAmount ? (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.success }]}>Discount ({order.couponCode})</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>-₹{order.discountAmount}</Text>
            </View>
          ) : null}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
          </View>
          <View style={styles.paymentInfoRow}>
            <Icon name="credit-card" size={14} color={theme.colors.text.secondary} />
            <Text style={styles.paymentMethodText}>Paid via {order.paymentMethod} • {order.paymentStatus}</Text>
          </View>
        </View>

        {/* Return Information / Actions */}
        <View style={styles.actionContainer}>
          {order.orderStatus === 'DELIVERED' && !activeReturn && (
            <TouchableOpacity style={styles.returnMainBtn} onPress={() => setShowReturnModal(true)}>
              <Icon name="rotate-ccw" size={18} color={theme.colors.text.inverse} style={{ marginRight: 8 }} />
              <Text style={styles.returnMainBtnText}>Request Return</Text>
            </TouchableOpacity>
          )}

          {activeReturn && (
            <View style={[styles.returnStatusCard, { borderColor: theme.colors.primary.main }]}>
              <View style={styles.returnStatusHeader}>
                <Icon name="refresh-ccw" size={18} color={theme.colors.primary.main} />
                <Text style={styles.returnStatusTitle}>Return Requested</Text>
                <View style={[styles.badgeSmall, { backgroundColor: `${theme.colors.primary.main}20` }]}>
                  <Text style={{ color: theme.colors.primary.main, fontSize: 10, fontWeight: 'bold' }}>{activeReturn.status}</Text>
                </View>
              </View>
              <Text style={styles.returnReasonText}>Reason: {activeReturn.reason}</Text>
              {activeReturn.status === 'PENDING' && (
                <TouchableOpacity
                  style={styles.cancelReturnBtn}
                  onPress={() => handleCancelReturn(activeReturn._id)}
                >
                  <Text style={styles.cancelReturnText}>Cancel Return Request</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Return Modal */}
      <Modal visible={showReturnModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Return</Text>
            <Text style={styles.label}>Reason for return</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Search, Size mismatch, Damaged, etc."
              multiline
              numberOfLines={4}
              value={returnReason}
              onChangeText={setReturnReason}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowReturnModal(false)}>
                <Text style={styles.cancelBtnText}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleRequestReturn}
                disabled={submittingReturn}
              >
                {submittingReturn ? <ActivityIndicator color={theme.colors.text.inverse} /> : <Text style={styles.confirmBtnText}>Submit Request</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Review Modal */}
      <Modal visible={showReviewModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate Product</Text>
            <Text style={styles.productNameReview}>{selectedProduct?.name}</Text>

            <View style={styles.starPicker}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRating(s)} style={{ padding: 8 }}>
                  <Icon name="star" size={32} color={s <= rating ? theme.colors.warning : theme.colors.border.light} />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Write your feedback here..."
              multiline
              numberOfLines={3}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.submitReviewBtn}
              onPress={handleSubmitReview}
              disabled={submittingReview}
            >
              {submittingReview ? <ActivityIndicator color={theme.colors.text.inverse} /> : <Text style={styles.submitReviewBtnText}>Submit Review</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowReviewModal(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNo: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.text.primary,
  },
  orderDate: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.text.primary,
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.border.light,
    zIndex: 2,
  },
  activeDot: {
    backgroundColor: theme.colors.primary.main,
  },
  currentDot: {
    borderWidth: 3,
    borderColor: `${theme.colors.primary.main}40`,
    transform: [{ scale: 1.3 }],
  },
  timelineLabel: {
    fontSize: 10,
    color: theme.colors.text.tertiary,
    marginTop: 8,
    fontWeight: '700',
  },
  activeLabel: {
    color: theme.colors.text.primary,
  },
  timelineLine: {
    position: 'absolute',
    top: 5,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: theme.colors.border.light,
    zIndex: 1,
  },
  activeLine: {
    backgroundColor: theme.colors.primary.main,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  itemImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 15,
    backgroundColor: theme.colors.background.default,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  reviewBtnText: {
    fontSize: 11,
    color: theme.colors.primary.main,
    fontWeight: '800',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '900',
    color: theme.colors.text.primary,
  },
  addressBox: {
    flexDirection: 'row',
  },
  addressName: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 6,
  },
  addressText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    lineHeight: 18,
    fontWeight: '500',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: theme.colors.text.primary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.primary.main,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    gap: 8,
  },
  paymentMethodText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actionContainer: {
    marginBottom: 30,
  },
  returnMainBtn: {
    backgroundColor: theme.colors.error || '#FF4444',
    height: 56,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  returnMainBtnText: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: '900',
  },
  returnStatusCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: theme.colors.background.paper,
    borderWidth: 1.5,
    ...theme.shadows.sm,
  },
  returnStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  returnStatusTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: theme.colors.text.primary,
    flex: 1,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  returnReasonText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    lineHeight: 18,
    marginBottom: 15,
  },
  cancelReturnBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  cancelReturnText: {
    fontSize: 13,
    color: theme.colors.error || '#FF4444',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text.primary,
    marginBottom: 15,
  },
  productNameReview: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: theme.colors.background.default,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    padding: 15,
    height: 100,
    color: theme.colors.text.primary,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  cancelBtnText: {
    color: theme.colors.text.secondary,
    fontWeight: '800',
  },
  confirmBtn: {
    flex: 2,
    backgroundColor: theme.colors.primary.main,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  confirmBtnText: {
    color: theme.colors.text.inverse,
    fontWeight: '900',
  },
  starPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  submitReviewBtn: {
    backgroundColor: theme.colors.primary.main,
    height: 54,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  submitReviewBtnText: {
    color: theme.colors.text.inverse,
    fontWeight: '900',
    fontSize: 16,
  },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  closeBtnText: {
    color: theme.colors.text.tertiary,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    fontWeight: 'bold',
  },
});

export default OrderDetailScreen;
