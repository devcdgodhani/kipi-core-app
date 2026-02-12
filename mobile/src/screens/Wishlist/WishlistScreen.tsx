import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Theme, useAppTheme } from '../../theme/theme';
import { Product } from '../../types/product.types';
import Icon from 'react-native-vector-icons/Feather';
import { getSafeImageUrl } from '../../utils/imageUtils';
import { useMemo } from 'react';

type RootStackParamList = {
  ProductDetail: { productId: string; skuId?: string };
};

const WishlistScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleAddToCart = (product: Product, skuId?: string) => {
    const selectedSku = product.skus?.find(s => s._id === skuId);
    const price = selectedSku ? (selectedSku.offerPrice || selectedSku.salePrice || selectedSku.basePrice) : (product.price || product.basePrice);

    addToCart({
      _id: product._id,
      productId: product._id,
      skuId: skuId || product._id,
      name: product.name,
      price: price,
      quantity: 1,
      thumbnail: (selectedSku?.media?.[0] ? getSafeImageUrl(selectedSku.media[0].fileStorageId) : (getSafeImageUrl(product.mainImage) || getSafeImageUrl(product.thumbnail) || (product.media?.[0] ? getSafeImageUrl(product.media[0].fileStorageId) : undefined))) || undefined,
      maxStock: selectedSku?.quantity ?? product.stock,
    });
    removeFromWishlist(product._id, skuId);
  };

  const renderItem = ({ item }: { item: Product }) => {
    const selectedSku = item.skus?.find(s => s._id === item.skuId);
    const price = selectedSku ? (selectedSku.offerPrice || selectedSku.salePrice || selectedSku.basePrice) : (item.price || item.basePrice);

    const imageUrl = selectedSku?.media?.[0] ?
      (getSafeImageUrl(selectedSku.media[0].fileStorageId) || getSafeImageUrl(selectedSku.media[0])) :
      (getSafeImageUrl(item.mainImage) || getSafeImageUrl(item.thumbnail) || (item.media?.[0] ? getSafeImageUrl(item.media[0].fileStorageId) || getSafeImageUrl(item.media[0]) : null));

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ProductDetail', { productId: item._id, skuId: item.skuId })}
      >
        <Image
          source={{ uri: imageUrl || 'https://via.placeholder.com/150' }}
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {selectedSku?.skuCode && (
            <Text style={{ fontSize: 10, color: theme.colors.text.tertiary, marginBottom: 2 }}>
              SKU: {selectedSku.skuCode}
            </Text>
          )}
          <Text style={styles.price}>
            ₹{price}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={() => handleAddToCart(item, item.skuId)}
            >
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeFromWishlist(item._id, item.skuId)}
            >
              <Icon name="trash-2" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home' as any)}
        style={styles.backButton}
      >
        <Icon name="arrow-left" size={24} color={theme.colors.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>My Wishlist</Text>
      <View style={styles.backButton} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      {wishlistItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="heart" size={64} color={theme.colors.text.tertiary} />
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtext}>
            Save items you love here for later.
          </Text>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          renderItem={renderItem}
            keyExtractor={(item) => `${item._id}-${item.skuId || 'default'}`}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  list: {
    padding: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    padding: theme.spacing.sm,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.background.default,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    ...theme.typography.body1,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: 4,
  },
  price: {
    ...theme.typography.body1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  addToCartBtn: {
    backgroundColor: theme.colors.primary.main,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
  },
  addToCartText: {
    ...theme.typography.button,
    fontSize: 12,
    color: theme.colors.text.inverse,
  },
  removeBtn: {
    padding: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
  },
  emptySubtext: {
    ...theme.typography.body2,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
});

export default WishlistScreen;
