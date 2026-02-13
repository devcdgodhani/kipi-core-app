import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useAppTheme, Theme } from '../theme/theme';
import { getSafeImageUrl } from '../utils/imageUtils';
import Icon from 'react-native-vector-icons/Feather';
import { useCart } from '../context/CartContext';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

interface SKU {
  _id: string;
  skuCode: string;
  variantAttributes: Array<{ attributeId: string; value: string; label?: string }>;
  basePrice: number;
  price?: number;
  salePrice?: number;
  offerPrice?: number;
  quantity: number;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  mainImage?: any;
  basePrice?: number;
  salePrice?: number;
  offerPrice?: number;
  isFlashDeal?: boolean;
  skus?: SKU[];
  media?: any[];
}

interface ProductCardProps {
  product: Product;
  onPress: (skuId?: string) => void;
  width?: number;
  showSkus?: boolean;
  isFlashDeal?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  width: customWidth,
  showSkus = true,
  isFlashDeal = false
}) => {
  const theme = useAppTheme();
  const { addToCart } = useCart();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Use pre-fetched SKUs from product object
  const productSkus = product.skus || [];
  const [selectedSku, setSelectedSku] = useState<SKU | null>(productSkus.length > 0 ? productSkus[0] : null);

  // Update selectedSku if product changes (e.g. in a list)
  useEffect(() => {
    if (productSkus.length > 0) {
      setSelectedSku(productSkus[0]);
    } else {
      setSelectedSku(null);
    }
  }, [product._id]);

  const COLUMN_COUNT = 2;
  const CARD_WIDTH = (width - theme.spacing.md * 3) / COLUMN_COUNT;

  const getProductPrice = () => {
    if (selectedSku) {
      return selectedSku.offerPrice || selectedSku.salePrice || selectedSku.price || selectedSku.basePrice || 0;
    }
    return product.offerPrice || product.salePrice || product.basePrice || 0;
  };

  const getBasePrice = () => {
    return selectedSku ? selectedSku.basePrice : product.basePrice || 0;
  };

  const price = getProductPrice();
  const basePrice = getBasePrice();
  const hasDiscount = price < basePrice;
  const imageUri = getSafeImageUrl(product) || getSafeImageUrl(product.media?.[0]);

  const handlePress = () => {
    onPress(selectedSku?._id);
  };

  const handleSkuPress = (sku: SKU) => {
    setSelectedSku(sku);
  };

  const onAddToCart = async (e: any) => {
    e.stopPropagation();
    try {
      const cartItem = {
        _id: selectedSku?._id || product._id,
        productId: product._id,
        name: product.name,
        price: price,
        quantity: 1,
        thumbnail: imageUri || undefined,
        skuId: selectedSku?._id,
        skuName: selectedSku?.variantAttributes?.map(a => a.value).join(' / '),
        maxStock: selectedSku?.quantity || 99
      };

      await addToCart(cartItem);
    } catch (error) {
      console.error('Failed to add to cart', error);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, customWidth ? { width: customWidth } : { width: CARD_WIDTH }]} 
      onPress={handlePress}
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
        {hasDiscount && !isFlashDeal && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {Math.round(((basePrice - price) / basePrice) * 100)}% OFF
            </Text>
          </View>
        )}
        {isFlashDeal && (
          <View style={[styles.badge, { backgroundColor: theme.colors.error || '#E11D48' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Icon name="zap" size={8} color={theme.colors.text.inverse} />
              <Text style={styles.badgeText}>FLASH SALE</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{price.toFixed(0)}</Text>
            {hasDiscount && (
              <Text style={styles.oldPrice}>₹{basePrice.toFixed(0)}</Text>
            )}
          </View>

          <TouchableOpacity style={styles.addToCartBtn} onPress={onAddToCart}>
            <Icon name="shopping-cart" size={16} color={theme.colors.text.inverse} />
          </TouchableOpacity>
        </View>

        {/* SKU Variants - Show even for single SKU */}
        {showSkus && productSkus.length >= 1 && (
          <View style={styles.skuContainer}>
            {productSkus.slice(0, 3).map((sku: SKU) => (
              <TouchableOpacity
                key={sku._id}
                onPress={() => handleSkuPress(sku)}
                style={[
                  styles.skuChip,
                  selectedSku?._id === sku._id && styles.skuChipSelected
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.skuChipText,
                  selectedSku?._id === sku._id && styles.skuChipTextSelected
                ]}>
                  {sku.variantAttributes[0]?.value?.substring(0, 1).toUpperCase() || 'V'}
                </Text>
              </TouchableOpacity>
            ))}
            {productSkus.length > 3 && (
              <Text style={styles.skuMore}>+{productSkus.length - 3}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.paper,
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
    backgroundColor: theme.colors.background.default,
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
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    color: theme.colors.background.paper,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.black,
    letterSpacing: 0.5,
  },
  info: {
    padding: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: 6,
    height: 36,
    lineHeight: 18,
  },
  skuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  skuChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.default,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  skuChipSelected: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  skuChipText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.secondary,
    letterSpacing: 0.3,
  },
  skuChipTextSelected: {
    color: theme.colors.background.paper,
  },
  skuMore: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.tertiary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.primary.main,
  },
  oldPrice: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addToCartBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
});
