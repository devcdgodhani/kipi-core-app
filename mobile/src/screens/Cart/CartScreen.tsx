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
import { theme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';

type RootStackParamList = {
  ProductDetail: { slug: string; id: string };
  Checkout: undefined;
};

const CartScreen = () => {
  const { items, removeFromCart, updateQuantity, cartTotal, itemCount } = useCart();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.thumbnail || 'https://via.placeholder.com/100' }}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => updateQuantity(item._id, item.quantity - 1)}
            style={styles.qtyButton}
          >
            <Icon name="minus" size={16} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => updateQuantity(item._id, item.quantity + 1)}
            style={styles.qtyButton}
          >
            <Icon name="plus" size={16} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => removeFromCart(item._id)}
        style={styles.removeButton}
      >
        <Icon name="trash-2" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Icon name="shopping-cart" size={64} color={theme.colors.text.secondary} />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('Products' as any)}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
        <View style={styles.footer}>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal ({itemCount} items)</Text>
              <Text style={styles.priceValue}>₹{cartTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Shipping</Text>
              <Text style={[styles.priceValue, { color: theme.colors.success }]}>FREE</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax</Text>
              <Text style={styles.priceValue}>₹0.00</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalAmount}>₹{cartTotal.toFixed(2)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate('Checkout')}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  emptyText: {
    ...theme.typography.h3,
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
    color: theme.colors.primary.contrastText,
  },
  listContent: {
    padding: theme.spacing.md,
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
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.default,
  },
  itemDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'space-between',
  },
  itemName: {
    ...theme.typography.body1,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  itemPrice: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  qtyButton: {
    padding: 4,
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  quantityText: {
    ...theme.typography.body1,
    marginHorizontal: theme.spacing.md,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: theme.spacing.sm,
    justifyContent: 'center',
  },
  footer: {
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    ...theme.shadows.lg,
  },
  priceBreakdown: {
    marginBottom: theme.spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  priceLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  priceValue: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary.main,
  },
  checkoutButton: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  checkoutButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;
