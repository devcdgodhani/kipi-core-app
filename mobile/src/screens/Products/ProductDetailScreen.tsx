import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { theme } from '../../theme/theme';
import { productService } from '../../services/product.service';
import { Skeleton } from '../../components/Skeleton';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import Icon from 'react-native-vector-icons/Feather';
import { Product, SKU } from '../../types/product.types';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }: any) {
  const { slug, id } = route.params || {};
  const [product, setProduct] = useState<Product | null>(null);
  const [skus, setSkus] = useState<SKU[]>([]); // Use SKU directly
  const [selectedSKU, setSelectedSKU] = useState<SKU | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProduct();
  }, [slug, id]);

  useEffect(() => {
    if (!loading && product) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, product]);

  const loadProduct = async () => {
    if (!slug && !id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Load product details
      let productData;
      if (slug) {
        productData = await productService.getBySlug(slug);
      } else if (id) {
        productData = await productService.getById(id);
      }

      if (productData) {
        setProduct(productData);

        // Load SKUs
        const skusResponse = await productService.getProductSKUs(productData._id);
        if (skusResponse && skusResponse.length > 0) {
          setSkus(skusResponse);
          setSelectedSKU(skusResponse[0]);
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = () => {
    if (selectedSKU) {
      return selectedSKU.offerPrice || selectedSKU.salePrice || selectedSKU.price || selectedSKU.basePrice;
    }
    return product?.offerPrice || product?.salePrice || product?.basePrice || 0;
  };

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = async () => {
    if (!product) return;

    const price = getPrice();
    const cartItem = {
      _id: selectedSKU ? selectedSKU._id : product._id,
      productId: product._id,
      name: product.name,
      price: price || 0,
      quantity: quantity,
      thumbnail: product.mainImage || product.media?.[0]?.url,
      skuId: selectedSKU?._id,
      maxStock: selectedSKU ? selectedSKU.quantity : product.stock,
    };

    await addToCart(cartItem);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await handleAddToCart();
    navigation.navigate('Cart');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Skeleton height={300} />
        <View style={{ padding: theme.spacing.md }}>
          <Skeleton width={200} height={30} style={{ marginBottom: 10 }} />
          <Skeleton width={150} height={20} style={{ marginBottom: 20 }} />
          <Skeleton height={100} />
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = product.media && product.media.length > 0
    ? product.media.map(m => m.url)
    : (product.mainImage ? [product.mainImage] : []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView>
        {/* Image Carousel */}
        <View style={styles.imageCarousel}>
          {images[currentImageIndex] ? (
            <Image
              source={{ uri: images[currentImageIndex] }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}

          {images.length > 1 && (
            <View style={styles.imageIndicators}>
              {images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.indicator,
                    currentImageIndex === index && styles.activeIndicator,
                  ]}
                  onPress={() => setCurrentImageIndex(index)}
                />
              ))}
            </View>
          )}

          {/* Wishlist Button */}
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() => {
              if (isInWishlist(product._id)) {
                removeFromWishlist(product._id);
              } else {
                addToWishlist({
                  ...product,
                  id: product._id, // Ensure compatibility if Product type mismatch
                  price: getPrice(),
                  thumbnail: product.mainImage || product.media?.[0]?.url,
                } as any);
              }
            }}
          >
            <Icon
              name="heart"
              size={24}
              color={isInWishlist(product._id) ? theme.colors.error : theme.colors.text.secondary}
              style={isInWishlist(product._id) ? styles.wishlistActive : undefined}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>₹{getPrice().toFixed(2)}</Text>

          {/* Description */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* SKU Selection */}
          {skus.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Variant</Text>
              <View style={styles.skuContainer}>
                {skus.map((sku) => (
                  <TouchableOpacity
                    key={sku._id}
                    style={[
                      styles.skuChip,
                      selectedSKU?._id === sku._id && styles.selectedSKU,
                    ]}
                    onPress={() => setSelectedSKU(sku)}
                  >
                    <Text
                      style={[
                        styles.skuText,
                        selectedSKU?._id === sku._id && styles.selectedSKUText,
                      ]}
                    >
                      ₹{(sku.offerPrice || sku.salePrice || sku.price || sku.basePrice).toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.addToCartButton]}
          onPress={handleAddToCart}
        >
          <Text style={styles.actionButtonText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.buyNowButton]}
          onPress={handleBuyNow}
        >
          <Text style={[styles.actionButtonText, styles.buyNowText]}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    ...theme.typography.body1,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  backButtonText: {
    color: theme.colors.primary.contrastText,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  imageCarousel: {
    width: width,
    height: width,
    backgroundColor: theme.colors.border.light,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.tertiary,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeIndicator: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.text.inverse,
  },
  productInfo: {
    padding: theme.spacing.lg,
  },
  productName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  productPrice: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  skuContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  skuChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border.medium,
    backgroundColor: theme.colors.background.paper,
  },
  selectedSKU: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  skuText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  selectedSKUText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.bold,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
  },
  quantityButtonText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  quantityText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : theme.spacing.md,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    ...theme.shadows.lg,
  },
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  addToCartButton: {
    backgroundColor: theme.colors.background.paper,
    borderWidth: 1.5,
    borderColor: theme.colors.primary.main,
  },
  buyNowButton: {
    backgroundColor: theme.colors.primary.main,
    ...theme.shadows.md,
  },
  actionButtonText: {
    ...theme.typography.body1,
    fontWeight: 'bold',
    color: theme.colors.primary.main,
  },
  buyNowText: {
    color: theme.colors.text.inverse,
  },
  wishlistButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.background.paper,
    padding: 8,
    borderRadius: 20,
    ...theme.shadows.md,
    zIndex: 10,
  },
  wishlistActive: {
    // color handled in prop
  },
});
