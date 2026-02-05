import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useAppTheme } from '../theme/theme';
import { getSafeImageUrl } from '../utils/imageUtils';
import { productService } from '../services/product.service';
import Icon from 'react-native-vector-icons/Feather';

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
  mainImage?: string;
  basePrice?: number;
  salePrice?: number;
  offerPrice?: number;
  isFlashDeal?: boolean;
  skus?: SKU[];
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
  const imageUri = getSafeImageUrl(product.thumbnail) || getSafeImageUrl(product.mainImage);

  const handlePress = () => {
    onPress(selectedSku?._id);
  };

  const handleSkuPress = (sku: SKU) => {
    setSelectedSku(sku);
    onPress(sku._id);
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
          <View style={[styles.badge, { backgroundColor: '#E11D48' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Icon name="zap" size={8} color="#FFF" />
              <Text style={styles.badgeText}>FLASH SALE</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        {/* SKU Variants */}
        {showSkus && productSkus.length > 1 && (
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
                  {sku.variantAttributes[0]?.value?.substring(0, 2).toUpperCase() || 'V'}
                </Text>
              </TouchableOpacity>
            ))}
            {productSkus.length > 3 && (
              <Text style={styles.skuMore}>+{productSkus.length - 3}</Text>
            )}
          </View>
        )}

        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{price.toFixed(2)}</Text>
          {hasDiscount && (
            <Text style={styles.oldPrice}>₹{basePrice.toFixed(2)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
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
    fontSize: 10,
    color: theme.colors.text.tertiary,
    fontWeight: 'bold',
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
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  info: {
    padding: theme.spacing.sm,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
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
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    letterSpacing: 0.3,
  },
  skuChipTextSelected: {
    color: theme.colors.background.paper,
  },
  skuMore: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.colors.text.tertiary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.primary.main,
  },
  oldPrice: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
});
