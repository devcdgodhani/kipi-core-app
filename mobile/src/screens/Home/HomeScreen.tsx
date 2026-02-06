import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  Animated,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme, Theme } from '../../theme/theme';
import { productService, categoryService } from '../../services/product.service';
import { flashDealService } from '../../services/flashDeal.service';
import { recentlyViewedService } from '../../services/recentlyViewed.service';
import { configService, Banner as BannerType } from '../../services/config.service';
import { Skeleton } from '../../components/Skeleton';
import { ProductCard } from '../../components/ProductCard';
import { useWishlist } from '../../context/WishlistContext';
import Icon from 'react-native-vector-icons/Feather';
import { Product, SKU } from '../../types/product.types';
import { getSafeImageUrl } from '../../utils/imageUtils';

const { width } = Dimensions.get('window');

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

export default function HomeScreen({ navigation }: any) {
  const theme = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appSettings, setAppSettings] = useState<any>(null);
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sectionsData, setSectionsData] = useState<{ [key: string]: Product[] }>({});
  const [searchQuery, setSearchQuery] = useState('');

  const [fadeAnim] = useState(new Animated.Value(0));
  const styles = useMemo(() => createStyles(theme), [theme]);

  const loadHomeData = React.useCallback(async () => {
    try {
      setLoading(true);

      const [settings, activeBanners, allCategories] = await Promise.all([
        configService.getAppSettings().catch(() => null),
        configService.getActiveBanners().catch(() => []),
        categoryService.getAll().catch(() => [])
      ]);

      setAppSettings(settings);
      setBanners(activeBanners);
      setCategories(allCategories || []);

      if (settings?.sections && Array.isArray(settings.sections)) {
        const productSections = settings.sections.filter((s: any) =>
          ['PRODUCT_CAROUSEL', 'POPULAR_PRODUCTS', 'NEW_ARRIVALS', 'FLASH_DEALS', 'RECOMMENDATIONS', 'RECENTLY_VIEWED'].includes(s.sectionId)
        );

        const dataMap: { [key: string]: Product[] } = {};

        await Promise.all(productSections.map(async (section: any) => {
          try {
            let products: Product[] = [];
            const limit = section.limit || 8;

            if (section.sectionId === 'FLASH_DEALS') {
              const deals = await flashDealService.getActive().catch(() => []);
              if (deals.length > 0) {
                const deal = deals[0];
                const dealProducts = (deal.productIds as Product[]).map(product => {
                  let offerPrice = product.basePrice || 0;
                  if (deal.discountType === 'PERCENTAGE') {
                    offerPrice = (product.basePrice || 0) * (1 - deal.discountValue / 100);
                  } else {
                    offerPrice = Math.max(0, (product.basePrice || 0) - deal.discountValue);
                  }
                  return { ...product, offerPrice, isFlashDeal: true };
                });
                products = dealProducts.slice(0, limit);
              }
            } else if (section.sectionId === 'RECOMMENDATIONS') {
              products = await productService.getRecommended(limit).catch(() => []);
            } else if (section.sectionId === 'RECENTLY_VIEWED') {
              const res = await recentlyViewedService.getRecentlyViewed(limit).catch(() => ({ products: [] }));
              products = res.products || [];
            } else if (section.sectionId === 'NEW_ARRIVALS') {
              const res = await productService.getWithPagination({ limit, sortBy: 'createdAt', sortOrder: 'desc' }).catch(() => null);
              products = res?.data || [];
            } else {
              // Default to getWithPagination for other sections
              const res = await productService.getWithPagination({ limit }).catch(() => null);
              products = res?.data || [];
            }

            if (products.length > 0) {
              dataMap[section.sectionId] = products.map((product: any) => ({
                ...product,
                thumbnail: getSafeImageUrl(product.mainImage) || getSafeImageUrl(product.media?.[0]?.url) || undefined,
              }));
            }
          } catch (err) {
            console.error(`Error fetching data for section ${section.sectionId}:`, err);
          }
        }));

        setSectionsData(dataMap);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => navigation.navigate('Products', { screen: 'ProductList', params: { categoryId: item._id } })}
    >
      <View style={styles.categoryIconContainer}>
        {item.image ? (
          <Image source={{ uri: getSafeImageUrl(item.image) || undefined }} style={styles.categoryImage} />
        ) : (
          <Icon name="grid" size={24} color={theme.colors.primary.main} />
        )}
      </View>
      <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'FLASH_DEALS':
        return { name: 'zap', color: theme.colors.error || '#E11D48' };
      case 'RECOMMENDATIONS':
        return { name: 'sparkles', color: theme.colors.primary.main };
      case 'RECENTLY_VIEWED':
        return { name: 'clock', color: theme.colors.text.secondary };
      case 'NEW_ARRIVALS':
        return { name: 'award', color: theme.colors.warning };
      case 'POPULAR_PRODUCTS':
        return { name: 'trending-up', color: theme.colors.primary.main };
      default:
        return { name: 'star', color: theme.colors.primary.main };
    }
  };

  const renderProductSection = (section: any) => {
    const products = sectionsData[section.sectionId] || [];
    if (products.length === 0) return null;

    const icon = getSectionIcon(section.sectionId);

    return (
      <View key={section._id} style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIconContainer, { backgroundColor: `${icon.color}15` }]}>
              <Icon name={icon.name} size={16} color={icon.color} />
            </View>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Products', { screen: 'ProductList' })}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={products}
          renderItem={({ item }) => (
            <ProductCard
              product={item} 
              onPress={(skuId) => navigation.navigate('ProductDetail', { id: item._id, skuId })}
              showSkus={false}
              isFlashDeal={(item as any).isFlashDeal}
            />
          )}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.horizontalList, { gap: theme.spacing.md }]}
        />
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={theme.colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => navigation.navigate('Products', { screen: 'ProductList', params: { search: searchQuery } })}
          />
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Wishlist')}>
          <Icon name="heart" size={24} color={theme.colors.primary.main} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
          <Icon name="bell" size={24} color={theme.colors.primary.main} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {banners.length > 0 && (
          <View style={styles.bannerContainer}>
            <ScrollView
              horizontal 
              pagingEnabled
              showsHorizontalScrollIndicator={false}
            >
              {banners.map((banner, index) => (
                <View key={index} style={styles.bannerWrapper}>
                  <Image source={{ uri: getSafeImageUrl(banner.image) || undefined }} style={styles.bannerImage} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {appSettings?.sections?.map((section: any, index: number) => {
          const element = renderProductSection(section);
          if (!element) return null;
          return <React.Fragment key={section.sectionId || section._id || index}>{element}</React.Fragment>;
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    marginTop: theme.spacing.md,
  },
  bannerWrapper: {
    width: width,
    paddingHorizontal: theme.spacing.md,
  },
  bannerImage: {
    width: width - theme.spacing.md * 2,
    height: 180,
    borderRadius: theme.borderRadius.lg,
  },
  categoriesContainer: {
    marginTop: theme.spacing.lg,
    paddingLeft: theme.spacing.md,
  },
  categoryList: {
    paddingRight: theme.spacing.md,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: theme.spacing.lg,
    width: 70,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryName: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  sectionContainer: {
    marginTop: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  seeAll: {
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
});
