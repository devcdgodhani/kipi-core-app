import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Theme, useAppTheme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import { getSafeImageUrl } from '../../utils/imageUtils';
import { useMemo } from 'react';

type RootStackParamList = {
  ProductDetail: { productId: string };
};

const WishlistScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleAddToCart = (product: any) => {
    addToCart({
      _id: product._id,
      productId: product._id,
      name: product.name,
      price: product.price || product.basePrice,
      quantity: 1,
      thumbnail: getSafeImageUrl(product.mainImage) || getSafeImageUrl(product.thumbnail) || (product.media?.[0] ? getSafeImageUrl(product.media[0].fileStorageId) : undefined) || undefined,
      maxStock: product.stock,
    });
  };

  const renderItem = ({ item }: { item: any }) => {
    const imageUrl = getSafeImageUrl(item.mainImage) || getSafeImageUrl(item.thumbnail) || (item.media?.[0] ? getSafeImageUrl(item.media[0].fileStorageId) || getSafeImageUrl(item.media[0]) : null);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
      >
        <Image
          source={{ uri: imageUrl || 'https://via.placeholder.com/150' }}
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.price}>
            ₹{item.price || item.basePrice}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeFromWishlist(item._id)}
            >
              <Icon name="trash-2" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
          keyExtractor={(item) => item._id}
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
    color: theme.colors.text.primary,
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
    color: theme.colors.text.primary,
  },
  emptySubtext: {
    ...theme.typography.body2,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
});

export default WishlistScreen;
