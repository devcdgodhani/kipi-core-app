import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useCart, CartItem } from '../../context/CartContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Theme, useAppTheme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';

type RootStackParamList = {
  Home: undefined;
  Products: undefined;
  Cart: undefined;
  Profile: undefined;
  ProductDetail: { slug?: string; id?: string; skuId?: string };
  Checkout: undefined;
};

const CartScreen = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    selectedItems,
    toggleSelection,
    selectAll,
    clearSelection,
    isItemSelected,
  } = useCart();
  const theme = useAppTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [fadeAnim] = React.useState(new Animated.Value(0));

  const styles = useMemo(() => createStyles(theme), [theme]);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const selectedTotal = useMemo(() => {
    return items.reduce((sum: number, item: CartItem) => {
      if (selectedItems.includes(item._id)) {
        return sum + (item.price * item.quantity);
      }
      return sum;
    }, 0);
  }, [items, selectedItems]);

  const selectedCount = useMemo(() =>
    items.filter((i: CartItem) => selectedItems.includes(i._id)).length,
    [items, selectedItems]);

  const allSelected = useMemo(() =>
    items.length > 0 && selectedCount === items.length,
    [items.length, selectedCount]);

  const renderItem = ({ item }: { item: CartItem }) => {
    const isSelected = isItemSelected(item._id);
    const itemTotal = item.price * item.quantity;

    return (
      <View style={styles.cartItem}>
        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => toggleSelection(item._id)}
        >
          <Icon
            name={isSelected ? 'check-square' : 'square'}
            size={24}
            color={isSelected ? theme.colors.primary.main : theme.colors.text.secondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.itemContent}
          onPress={() => navigation.navigate('Products', {
            screen: 'ProductDetail',
            params: { id: item.productId, skuId: item.skuId }
          } as any)}
        >
          <Image
            source={{ uri: item.thumbnail || 'https://via.placeholder.com/100' }}
            style={styles.itemImage}
          />

          <View style={styles.itemDetails}>
            <View style={styles.itemHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.skuName && (
                  <Text style={styles.skuNameText}>Variant: {item.skuName}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => removeFromCart(item._id)}
                style={styles.removeButton}
              >
                <Icon name="trash-2" size={18} color={theme.colors.error} />
              </TouchableOpacity>
            </View>


            <View style={styles.controlsRow}>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  onPress={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                  style={styles.qtyButton}
                  disabled={item.quantity <= 1}
                >
                  <Icon name="minus" size={14} color={item.quantity <= 1 ? theme.colors.text.tertiary : theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => updateQuantity(item._id, item.quantity + 1)}
                  style={styles.qtyButton}
                >
                  <Icon name="plus" size={14} color={theme.colors.text.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.totalItemPrice}>₹{itemTotal.toFixed(2)}</Text>
                {item.quantity > 1 && (
                  <Text style={styles.unitPrice}>₹{item.price.toFixed(2)} / Unit</Text>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Icon name="shopping-cart" size={64} color={theme.colors.text.secondary} />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Select All Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.selectAllContainer}
            onPress={() => allSelected ? clearSelection() : selectAll()}
          >
            <Icon
              name={allSelected ? 'check-square' : 'square'}
              size={24}
              color={allSelected ? theme.colors.primary.main : theme.colors.text.secondary}
            />
            <Text style={styles.selectAllText}>{allSelected ? 'Deselect All' : 'Select All'}</Text>
          </TouchableOpacity>
          <Text style={styles.itemCountText}>{items.length} Items</Text>
        </View>

        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />

        <View style={styles.footer}>
          <View style={styles.priceBreakdown}>
            <Text style={styles.summaryTitle}>SUMMARY</Text>

            <View style={styles.priceRow}>
              <View style={styles.rowLabelGroup}>
                <Icon name="file-text" size={14} color={theme.colors.text.tertiary} />
                <Text style={styles.priceLabel}>Subtotal</Text>
              </View>
              <Text style={styles.priceValue}>₹{selectedTotal.toFixed(2)}</Text>
            </View>

            <View style={styles.priceRow}>
              <View style={styles.rowLabelGroup}>
                <Icon name="truck" size={14} color={theme.colors.text.tertiary} />
                <Text style={styles.priceLabel}>Shipping</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.priceValue, { color: theme.colors.success }]}>FREE</Text>
                <Text style={styles.strikethroughPrice}>₹99.00</Text>
              </View>
            </View>

            <View style={[styles.priceRow, styles.totalRow]}>
              <View>
                <View style={styles.totalLabelRow}>
                  <Icon name="credit-card" size={12} color={theme.colors.text.secondary} />
                  <Text style={styles.totalLabel}>Total Pay</Text>
                </View>
                <Text style={styles.totalAmount}>₹{selectedTotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.checkoutButton, selectedCount === 0 && styles.disabledButton]}
            onPress={() => navigation.navigate('Checkout')}
            disabled={selectedCount === 0}
          >
            <Text style={styles.checkoutButtonText}>
              Proceed to Checkout ({selectedCount})
            </Text>
            <Icon name="arrow-right" size={20} color={theme.colors.text.inverse} />
          </TouchableOpacity>

          <View style={styles.paymentIcons}>
            <View style={styles.paymentIconPlaceholder}>
              <Icon name="credit-card" size={12} color={theme.colors.text.secondary} />
              <Text style={styles.paymentIconText}>CARD</Text>
            </View>
            <View style={styles.paymentIconPlaceholder}>
              <Icon name="smartphone" size={12} color={theme.colors.text.secondary} />
              <Text style={styles.paymentIconText}>UPI</Text>
            </View>
            <View style={styles.paymentIconPlaceholder}>
              <Icon name="shield" size={12} color={theme.colors.text.secondary} />
              <Text style={styles.paymentIconText}>SAFE</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  shopButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  shopButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectAllText: {
    ...theme.typography.button,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
    marginLeft: 8,
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 1,
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text.secondary,
    backgroundColor: theme.colors.background.default,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 100, // Extra space for footer
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: theme.spacing.sm,
    padding: 4,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.default,
  },
  itemDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'space-between',
    minHeight: 70,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    ...theme.typography.body1,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  skuNameText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: 2,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: 'uppercase',
  },
  removeButton: {
    padding: 4,
  },

  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.default,
  },
  qtyButton: {
    padding: 6,
  },
  quantityText: {
    ...theme.typography.body2,
    marginHorizontal: 8,
    fontWeight: theme.typography.fontWeight.semibold,
    minWidth: 16,
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  totalItemPrice: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  unitPrice: {
    fontSize: 10,
    color: theme.colors.text.secondary,
    marginTop: 2,
    textTransform: 'uppercase',
  },

  footer: {
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.lg,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    ...theme.shadows.lg,
    elevation: 20,
    marginTop: -20,
  },
  summaryTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  priceBreakdown: {
    marginBottom: theme.spacing.lg,
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  priceValue: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  rowLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    justifyContent: 'flex-end',
  },
  strikethroughPrice: {
    fontSize: 10,
    color: theme.colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  totalRow: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    alignItems: 'flex-end', 
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalAmount: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.text.primary,
    letterSpacing: -1,
  },
  checkoutButton: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    ...theme.shadows.md,
  },
  disabledButton: {
    opacity: 0.5,
  },
  checkoutButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  paymentIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
    opacity: 0.4,
  },
  paymentIconPlaceholder: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentIconText: {
    fontSize: 8,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

export default CartScreen;
