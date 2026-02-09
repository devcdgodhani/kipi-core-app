import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useAppTheme, Theme } from '../../theme/theme';
import { Order } from '../../types/order.types';
import { returnService } from '../../services/returnService';
import Toast from 'react-native-toast-message';

type ParamList = {
  ReturnRequest: { order: Order };
};

const RETURN_REASONS = [
  { label: 'Defective/Damaged Product', value: 'DEFECTIVE' },
  { label: 'Wrong Item Sent', value: 'WRONG_ITEM' },
  { label: 'Size/Fit Issue', value: 'SIZE_ISSUE' },
  { label: 'Quality Not as Expected', value: 'QUALITY_ISSUE' },
  { label: 'Better Price Available', value: 'BETTER_PRICE' },
  { label: 'No Longer Needed', value: 'NO_LONGER_NEEDED' },
];

export default function ReturnRequestScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'ReturnRequest'>>();
  const { order } = route.params;
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const getIdentifier = (item: any) => {
    const id = item.skuId?._id || item.skuId || item.productId?._id || item.productId;
    return id?.toString() || '';
  };

  const toggleItem = (item: any) => {
    const itemKey = getIdentifier(item);
    setSelectedItems(prev => {
      const exists = prev.find(i => getIdentifier(i) === itemKey);
      if (exists) return prev.filter(i => getIdentifier(i) !== itemKey);
      return [...prev, {
        productId: item.productId?._id || item.productId,
        skuId: item.skuId?._id || item.skuId,
        quantity: 1, // Default to 1
        price: item.price,
        name: item.name,
        image: item.image,
        maxQuantity: item.quantity
      }];
    });
  };

  const updateItemQty = (id: string, qty: number) => {
    setSelectedItems(prev => prev.map(i => getIdentifier(i) === id ? { ...i, quantity: qty } : i));
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      Toast.show({ type: 'error', text1: 'Selection Required', text2: 'Please select at least one item to return.' });
      return;
    }
    if (!reason) {
      Toast.show({ type: 'error', text1: 'Reason Required', text2: 'Please select a reason for return.' });
      return;
    }

    try {
      setLoading(true);
      const totalRefundAmount = selectedItems.reduce((acc, curr) => {
        return acc + (Number(curr.price) * Number(curr.quantity));
      }, 0);

      const payload = {
        orderId: order._id,
        items: selectedItems.map(item => ({
          skuId: getIdentifier(item), // Using skuId field for identifier as per web logic, or productId if sku is missing
          quantity: item.quantity,
          price: item.price,
          reason: reason,
          description: description
        })),
        totalRefundAmount,
        pickupAddress: order.shippingAddress
      };

      await returnService.requestReturn(payload);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Return request submitted successfully.' });
      navigation.goBack();
    } catch (error: any) {
      console.error('Return request error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message || 'Failed to submit return request' });
    } finally {
      setLoading(false);
    }
  };

  const refundAmount = selectedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Return Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Source Order</Text>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</Text>
        </View>

        {/* Item Selection */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Select Items to Return</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{selectedItems.length} Selected</Text>
            </View>
          </View>
          
          {order.items.map((item: any, index: number) => {
            const itemKey = getIdentifier(item);
            const isSelected = selectedItems.find(i => getIdentifier(i) === itemKey);
            
            return (
              <TouchableOpacity
                key={index}
                style={[styles.itemRow, isSelected && styles.selectedItemRow]}
                onPress={() => toggleItem(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isSelected && styles.checkedCheckbox]}>
                  {isSelected && <Icon name="check" size={12} color="#FFF" />}
                </View>
                
                <Image 
                  source={{ uri: item.image || 'https://via.placeholder.com/100' }} 
                  style={styles.itemImage} 
                />
                
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                </View>

                {isSelected && (
                  <View style={styles.qtyControl}>
                    <TouchableOpacity 
                      style={styles.qtyBtn} 
                      onPress={(e: any) => {
                        e.stopPropagation();
                        updateItemQty(itemKey, Math.max(1, isSelected.quantity - 1));
                      }}
                    >
                      <Icon name="minus" size={12} color={theme.colors.text.secondary} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{isSelected.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.qtyBtn}
                      onPress={(e: any) => {
                         e.stopPropagation();
                         updateItemQty(itemKey, Math.min(item.quantity, isSelected.quantity + 1));
                      }}
                    >
                       <Icon name="plus" size={12} color={theme.colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Reason Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Why are you returning this?</Text>
          <View style={styles.reasonsContainer}>
            {RETURN_REASONS.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[styles.reasonChip, reason === r.value && styles.selectedReasonChip]}
                onPress={() => setReason(r.value)}
              >
                <Text style={[styles.reasonText, reason === r.value && styles.selectedReasonText]}>
                  {r.label}
                </Text>
                {reason === r.value && <Icon name="check-circle" size={14} color={theme.colors.text.inverse} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Additional Comments (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the issue..."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        {/* Refund Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated Refund</Text>
            <Text style={styles.refundAmount}>₹{refundAmount.toLocaleString()}</Text>
          </View>
          <Text style={styles.summaryNote}>Refund will be processed to source payment method.</Text>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color={theme.colors.text.inverse} />
          ) : (
            <>
              <Icon name="rotate-ccw" size={18} color={theme.colors.text.inverse} style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>Submit Return Request</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    paddingBottom: 100, // For footer
  },
  card: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  orderNumber: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.text.primary,
  },
  orderDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  badge: {
    backgroundColor: `${theme.colors.error}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: theme.colors.error,
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background.default,
  },
  selectedItemRow: {
    borderColor: theme.colors.primary.main,
    backgroundColor: `${theme.colors.primary.main}05`,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedCheckbox: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: theme.colors.background.paper,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginLeft: 8,
  },
  qtyBtn: {
    padding: 6,
  },
  qtyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    minWidth: 16,
    textAlign: 'center',
  },
  reasonsContainer: {
    gap: 8,
  },
  reasonChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.default,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  selectedReasonChip: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  reasonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
  },
  selectedReasonText: {
    color: theme.colors.text.inverse,
  },
  textArea: {
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    padding: 12,
    height: 100,
    color: theme.colors.text.primary,
  },
  summaryCard: {
    backgroundColor: `${theme.colors.success}08`, // Slight green tint
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.success}20`,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.success,
    textTransform: 'uppercase',
  },
  refundAmount: {
    fontSize: 24,
    fontWeight: 'black',
    color: theme.colors.success,
  },
  summaryNote: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  submitButton: {
    backgroundColor: theme.colors.error, // Return is typically red/warning action
    borderRadius: theme.borderRadius.lg,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
