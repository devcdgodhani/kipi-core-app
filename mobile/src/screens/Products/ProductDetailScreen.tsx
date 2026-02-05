import React, { useEffect, useState, useMemo } from 'react';
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
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useAppTheme } from '../../theme/theme';
import { productService } from '../../services/product.service';
import { reviewService } from '../../services/review.service';
import { recentlyViewedService } from '../../services/recentlyViewed.service';
import { Skeleton } from '../../components/Skeleton';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Feather';
import { Product, SKU } from '../../types/product.types';
import { Review } from '../../types/review.types';
import { getSafeImageUrl } from '../../utils/imageUtils';
import Toast from 'react-native-toast-message';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }: any) {
  const { slug, id } = route.params || {};
  const theme = useAppTheme();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [skus, setSkus] = useState<SKU[]>([]);
  const [selectedSKU, setSelectedSKU] = useState<SKU | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Additional Data
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [frequentlyBought, setFrequentlyBought] = useState<Product[]>([]);
  const [recentlyBought, setRecentlyBought] = useState<Product[]>([]);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

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

      // Track view
      recentlyViewedService.trackView(product._id).catch(() => { });

      // Load related data
      loadRelatedData(product._id);
    }
  }, [loading, product]);

  const loadProduct = async () => {
    if (!slug && !id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let productData;
      if (slug) {
        productData = await productService.getBySlug(slug);
      } else if (id) {
        productData = await productService.getById(id);
      }

      if (productData) {
        setProduct(productData);
        // SKUs are now pre-fetched and attached to the product object by the backend
        const productSkus = productData.skus || [];
        if (productSkus.length > 0) {
          setSkus(productSkus);

          // Check for pre-selected SKU from navigation
          const targetSkuId = route.params?.skuId;
          const preSelectedSku = targetSkuId
            ? productSkus.find(s => s._id === targetSkuId)
            : null;

          setSelectedSKU(preSelectedSku || productSkus[0]);
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load product' });
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedData = async (productId: string) => {
    try {
      const [revRes, simRes, freqRes, recRes] = await Promise.all([
        reviewService.getByProduct(productId),
        productService.getSimilar(productId, 6),
        productService.getFrequentlyBoughtTogether(productId, 4),
        productService.getRecommended(6) // Using recommended as "Recently Bought" proxy if needed
      ]);

      if (revRes) {
        if (revRes.recordList) {
          setReviews(revRes.recordList);
        } else if (Array.isArray(revRes)) {
          setReviews(revRes);
        } else {
          setReviews([]);
        }
      }
      if (simRes) setSimilarProducts(simRes);
      if (freqRes) setFrequentlyBought(freqRes);
      if (recRes) setRecentlyBought(recRes);
    } catch (error) {
      console.error('Error loading related data:', error);
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
    const skuName = selectedSKU?.variantAttributes?.map(a => a.value).join(' / ');
    const cartItem = {
      _id: selectedSKU ? selectedSKU._id : product._id,
      productId: product._id,
      name: product.name,
      price: price || 0,
      quantity: quantity,
      thumbnail: getSafeImageUrl(product.mainImage) || getSafeImageUrl(product.media?.[0]?.url) || undefined,
      skuId: selectedSKU?._id,
      skuName: skuName,
      maxStock: selectedSKU ? selectedSKU.quantity : product.stock,
    };
    await addToCart(cartItem);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await handleAddToCart();
    navigation.navigate('Cart');
  };

  const handleSubmitReview = async () => {
    if (!user) {
      Toast.show({ type: 'info', text1: 'Login Required', text2: 'Please login to submit a review' });
      navigation.navigate('Login');
      return;
    }
    if (!comment.trim()) {
      Toast.show({ type: 'error', text1: 'Required', text2: 'Please enter a comment' });
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewService.submit({
        productId: product!._id,
        orderId: '', // Ideally we need an orderId, but some systems allow general reviews
        rating,
        comment,
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Review submitted successfully' });
      setShowReviewModal(false);
      setComment('');
      loadRelatedData(product!._id);
    } catch (error) {
      console.error('Submit review error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to submit review' });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = product.media && product.media.length > 0
    ? product.media.map(m => m.url)
    : (product.mainImage ? [product.mainImage] : []);

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.relatedCard}
      onPress={() => navigation.push('ProductDetail', { id: item._id })}
    >
      <Image source={{ uri: getSafeImageUrl(item.mainImage) || 'https://via.placeholder.com/150' }} style={styles.relatedImage} />
      <Text style={styles.relatedName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.relatedPrice}>₹{(item.offerPrice || item.salePrice || item.basePrice || 0).toFixed(0)}</Text>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageCarousel}>
          {images[currentImageIndex] ? (
            <Image
              source={{ uri: images[currentImageIndex] || '' }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImage, styles.placeholderImage]}>
                <Icon name="image" size={48} color={theme.colors.text.tertiary} />
            </View>
          )}

          {images.length > 1 && (
            <View style={styles.imageIndicators}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    currentImageIndex === index && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() => {
              if (isInWishlist(product._id)) {
                removeFromWishlist(product._id);
              } else {
                addToWishlist(product);
              }
            }}
          >
            <Icon
              name="heart"
              size={22}
              color={isInWishlist(product._id) ? theme.colors.error : theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={styles.ratingRow}>
                <Icon name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {reviews.length > 0
                    ? `${(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} (${reviews.length} review${reviews.length !== 1 ? 's' : ''})`
                    : 'No reviews yet'}
                </Text>
              </View>
            </View>
            <Text style={styles.productPrice}>₹{getPrice().toFixed(2)}</Text>
          </View>

          {/* SKU Selection */}
          {skus.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Variant</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.skuList}>
                {skus.map((sku) => (
                  <TouchableOpacity
                    key={sku._id}
                    style={[
                      styles.skuChip,
                      selectedSKU?._id === sku._id && styles.selectedSKU,
                    ]}
                    onPress={() => setSelectedSKU(sku)}
                  >
                    <Text style={[styles.skuText, selectedSKU?._id === sku._id && styles.selectedSKUText]}>
                      {sku.variantAttributes?.map(a => a.value).join(' / ') || 'Variant'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Quantity */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Icon name="minus" size={18} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Icon name="plus" size={18} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Trust Icons */}
          <View style={styles.trustSection}>
            <View style={styles.trustItem}>
              <View style={[styles.trustIconContainer, { backgroundColor: '#10B98115' }]}>
                <Icon name="truck" size={16} color="#10B981" />
              </View>
              <Text style={styles.trustText}>Free Shipping</Text>
            </View>
            <View style={styles.trustItem}>
              <View style={[styles.trustIconContainer, { backgroundColor: '#3B82F615' }]}>
                <Icon name="shield" size={16} color="#3B82F6" />
              </View>
              <Text style={styles.trustText}>Secure Payment</Text>
            </View>
            <View style={styles.trustItem}>
              <View style={[styles.trustIconContainer, { backgroundColor: '#F59E0B15' }]}>
                <Icon name="repeat" size={16} color="#F59E0B" />
              </View>
              <Text style={styles.trustText}>Easy Returns</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Product</Text>
            <Text style={styles.description}>{product.description || 'No description available.'}</Text>
          </View>

          {/* Frequently Bought Together */}
          {frequentlyBought.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Frequently Bought Together</Text>
              <FlatList
                data={frequentlyBought}
                renderItem={renderProductItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Similar Products</Text>
              <FlatList
                data={similarProducts}
                renderItem={renderProductItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Recently Bought / Recommended */}
          {recentlyBought.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>You May Also Like</Text>
              <FlatList
                data={recentlyBought}
                renderItem={renderProductItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Reviews Section */}
          <View style={[styles.section, styles.reviewsSection]}>
            <View style={styles.reviewHeader}>
              <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(true)}>
                <Text style={styles.addReviewText}>Write a Review</Text>
              </TouchableOpacity>
            </View>

            {reviews.length > 0 ? (
              reviews.slice(0, 3).map((review) => (
                <View key={review._id} style={styles.reviewCard}>
                  <View style={styles.reviewUserRow}>
                    <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>U</Text></View>
                    <View>
                      <Text style={styles.reviewUser}>Verified Buyer</Text>
                      <View style={styles.starRow}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <Icon key={s} name="star" size={10} color={s <= review.rating ? "#FFD700" : "#CCC"} />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>{format(new Date(review.createdAt), 'MMM dd, yyyy')}</Text>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyReviews}>No reviews yet. Be the first to review!</Text>
            )}

            {reviews.length > 3 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All Reviews</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.addToCartButton]}
          onPress={handleAddToCart}
        >
          <Icon name="shopping-cart" size={20} color={theme.colors.primary.main} style={{ marginRight: 8 }} />
          <Text style={styles.actionButtonText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.buyNowButton]}
          onPress={handleBuyNow}
        >
          <Icon name="zap" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={[styles.actionButtonText, styles.buyNowText]}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      {/* Review Submission Modal */}
      <Modal visible={showReviewModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <Icon name="x" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Rate this product</Text>
            <View style={styles.ratingPicker}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRating(s)} style={styles.starTouch}>
                  <Icon name="star" size={32} color={s <= rating ? "#FFD700" : "#EEE"} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Your comment</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Tell us what you think..."
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitReview}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.paper,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    ...theme.typography.h3,
    color: theme.colors.text.secondary,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  imageCarousel: {
    width: width,
    height: width,
    backgroundColor: '#F5F5F5',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  activeIndicator: {
    backgroundColor: theme.colors.primary.main,
    width: 24,
  },
  wishlistButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  productInfo: {
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: theme.colors.background.paper,
    marginTop: -30,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  productName: {
    ...theme.typography.h3,
    fontSize: 22,
    color: theme.colors.text.primary,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.primary.main,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  skuList: {
    paddingBottom: 4,
  },
  skuChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.border.light,
    marginRight: 10,
    backgroundColor: theme.colors.background.default,
  },
  selectedSKU: {
    borderColor: theme.colors.primary.main,
    backgroundColor: `${theme.colors.primary.main}10`,
  },
  skuText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  selectedSKUText: {
    color: theme.colors.primary.main,
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  quantityButton: {
    padding: 10,
  },
  quantityText: {
    paddingHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  horizontalList: {
    paddingRight: 20,
  },
  relatedCard: {
    width: 140,
    marginRight: 16,
  },
  relatedImage: {
    width: 140,
    height: 160,
    borderRadius: 16,
    backgroundColor: '#F9F9F9',
  },
  relatedName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginTop: 8,
  },
  relatedPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.primary.main,
    marginTop: 2,
  },
  reviewsSection: {
    paddingBottom: 100,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addReviewText: {
    fontSize: 14,
    color: theme.colors.primary.main,
    fontWeight: 'bold',
  },
  reviewCard: {
    backgroundColor: theme.colors.background.default,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  reviewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    marginLeft: 'auto',
    fontSize: 11,
    color: theme.colors.text.tertiary,
  },
  reviewComment: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  emptyReviews: {
    textAlign: 'center',
    color: theme.colors.text.tertiary,
    fontSize: 14,
    paddingVertical: 20,
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.colors.background.default,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  trustItem: {
    alignItems: 'center',
    flex: 1,
  },
  trustIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  trustText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text.secondary,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: theme.colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    gap: 12,
    ...theme.shadows.lg,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  addToCartButton: {
    backgroundColor: theme.colors.background.default,
    borderWidth: 1.5,
    borderColor: theme.colors.primary.main,
  },
  buyNowButton: {
    backgroundColor: theme.colors.primary.main,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary.main,
  },
  buyNowText: {
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background.paper,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  ratingPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  starTouch: {
    padding: 4,
  },
  reviewInput: {
    backgroundColor: theme.colors.background.default,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    padding: 16,
    height: 120,
    color: theme.colors.text.primary,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: theme.colors.primary.main,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
