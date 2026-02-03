import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useAppTheme } from '../theme/theme';
import { getSafeImageUrl } from '../utils/imageUtils';

const { width } = Dimensions.get('window');

interface Product {
  _id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  mainImage?: string;
  basePrice?: number;
  salePrice?: number;
  offerPrice?: number;
}

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  width?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, width: customWidth }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const COLUMN_COUNT = 2;
  const CARD_WIDTH = (width - theme.spacing.md * 3) / COLUMN_COUNT;

  const getProductPrice = (p: Product) => {
    return p.offerPrice || p.salePrice || p.basePrice || 0;
  }

  const price = getProductPrice(product);
  const imageUri = getSafeImageUrl(product.thumbnail) || getSafeImageUrl(product.mainImage);

  return (
    <TouchableOpacity 
      style={[styles.container, customWidth ? { width: customWidth } : { width: CARD_WIDTH }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
              <Icon name="image" size={24} color={theme.colors.text.tertiary} />
            <Text style={styles.placeholderText}>NO IMAGE</Text>
          </View>
        )}
        {product.offerPrice && product.basePrice && product.offerPrice < product.basePrice && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {Math.round(((product.basePrice - product.offerPrice) / product.basePrice) * 100)}% OFF
            </Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{price.toFixed(2)}</Text>
          {product.basePrice && product.basePrice > price && (
            <Text style={styles.oldPrice}>₹{product.basePrice.toFixed(2)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Assuming Icon is available or should be imported. Let's use Feather if possible or omit if unsure.
// I'll add Feather import.
import Icon from 'react-native-vector-icons/Feather';

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    ...theme.shadows.sm,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.colors.background.paper,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  placeholderText: {
    fontSize: 10,
    color: theme.colors.text.tertiary,
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: theme.colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  info: {
    padding: theme.spacing.sm,
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: 4,
    height: 36,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary.main,
  },
  oldPrice: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
});
