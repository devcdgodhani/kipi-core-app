import React, { useEffect, useState } from 'react';
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
import { theme } from '../../theme/theme';
import { productService, categoryService } from '../../services/product.service';
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appSettings, setAppSettings] = useState<any>(null);
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sectionsData, setSectionsData] = useState<{ [key: string]: Product[] }>({});
  const [searchQuery, setSearchQuery] = useState('');

  const [fadeAnim] = useState(new Animated.Value(0));

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
            let res;
            if (section.sectionId === 'NEW_ARRIVALS') {
              res = await productService.getWithPagination({ limit: section.limit || 10, sortBy: 'createdAt', sortOrder: 'desc' });
            } else {
              res = await productService.getWithPagination({ limit: section.limit || 10 });
            }
            if (res?.data) {
              dataMap[section.sectionId] = res.data.map((product: any) => ({
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

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadHomeData();
  }, [loadHomeData]);

  const getIconName = (icon: string) => {
    if (!icon) return 'star';
    const map: { [key: string]: string } = {
      'Truck': 'truck',
      'ShieldCheck': 'shield',
      'RefreshCw': 'refresh-cw',
    };
    return map[icon] || icon.toLowerCase().replace('check', '-check').replace('cw', '-cw');
  };

  const renderSection = (section: any) => {
    const products = sectionsData[section.sectionId] || [];

    if (!section.isVisible) return null;

    switch (section.sectionId) {
      case 'BANNER':
        if (banners.length === 0) return null;
        return (
          <View key="BANNER" style={styles.bannerContainer}>
            <FlatList
              horizontal
              pagingEnabled
              data={banners}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => {
                const bannerUrl = getSafeImageUrl(item.image) || getSafeImageUrl((item as any).imageId);
                return (
                  <TouchableOpacity
                    onPress={() => item.link && navigation.navigate('Products', { category: item.link })}
                    style={{ width: width - theme.spacing.md * 2, marginRight: theme.spacing.md }}
                  >
                    {bannerUrl ? (
                      <Image source={{ uri: bannerUrl }} style={styles.bannerImage} />
                    ) : (
                      <View style={[styles.bannerImage, { backgroundColor: theme.colors.border.light, justifyContent: 'center', alignItems: 'center' }]}>
                        <Icon name="image" size={48} color={theme.colors.text.tertiary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        );

      case 'FEATURES':
        if (!appSettings?.features || !Array.isArray(appSettings.features)) return null;
        const activeFeatures = appSettings.features.filter((f: any) => f && f.isActive);
        if (activeFeatures.length === 0) return null;

        return (
          <View key="FEATURES" style={styles.featuresSection}>
            {activeFeatures.map((feature: any, index: number) => (
              <View key={index} style={styles.featureItem}>
                <Icon
                  name={getIconName(feature.icon)}
                  size={24}
                  color={theme.colors.primary.main}
                />
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription} numberOfLines={1}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        );

      /* ... other cases ... */
      case 'FLASH_DEALS':
      case 'NEW_ARRIVALS':
      case 'RECOMMENDATIONS':
      case 'RECENTLY_VIEWED':
        if (products.length === 0) return null;
        return (
          <View key={section.sectionId} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.subtitle ? <Text style={styles.sectionSubtitle}>{section.subtitle}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Products')}>
                <View style={styles.seeAllContainer}>
                  <Text style={styles.seeAllText}>See All</Text>
                </View>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={products}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() => navigation.navigate('ProductDetail', { slug: item.slug })}
                  width={width * 0.4}
                />
              )}
              keyExtractor={(item) => item._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        );

      default:
        return null;
    }
  };

  if (loading && !refreshing) {
    /* ... skeleton remains the same ... */
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.header}>
          <Skeleton width={200} height={32} borderRadius={theme.borderRadius.md} style={{ marginBottom: 8 }} />
          <Skeleton width={150} height={20} borderRadius={theme.borderRadius.sm} />
        </View>
        <View style={styles.bannerContainer}>
          <Skeleton height={150} borderRadius={theme.borderRadius.lg} />
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Skeleton width={120} height={24} />
          </View>
          <View style={{ flexDirection: 'row', paddingLeft: theme.spacing.md }}>
            <Skeleton width={width * 0.42} height={200} borderRadius={theme.borderRadius.lg} style={{ marginRight: theme.spacing.md }} />
            <Skeleton width={width * 0.42} height={200} borderRadius={theme.borderRadius.lg} />
          </View>
        </View>
      </View>
    );
  }

  const sections = appSettings?.sections && Array.isArray(appSettings.sections)
    ? [...appSettings.sections].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0))
    : [];

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>{appSettings?.appName || 'Kipi Store'}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Icon name="bell" size={24} color={theme.colors.text.inverse} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={theme.colors.text.tertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => navigation.navigate('Products', { search: searchQuery })}
          />
        </View>
      </View>

      {/* Category Navigation */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => navigation.navigate('Products', { category: item._id })}
            >
              <View style={styles.categoryIconContainer}>
                {getSafeImageUrl(item.image) ? (
                  <Image source={{ uri: getSafeImageUrl(item.image) as string }} style={styles.categoryIcon} />
                ) : (
                  <Icon name="grid" size={24} color={theme.colors.primary.main} />
                )}
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Dynamic Sections */}
      {sections.map((section: any) => renderSection(section))}

      {/* Default Content if no dynamic sections */}
      {sections.length === 0 && (
        <View style={styles.bannerContainer}>
          <View style={styles.banner}>
            <View style={styles.bannerOverlay} />
            <Text style={styles.bannerText}>Welcome to {appSettings?.appName || 'Kipi'}!</Text>
            <Text style={styles.bannerSubtext}>Shop the latest products</Text>
          </View>
        </View>
      )}

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    padding: 0,
    backgroundColor: theme.colors.background.default,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  header: {
    padding: theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : theme.spacing.xl,
    backgroundColor: theme.colors.primary.main,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    ...theme.shadows.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.inverse,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    height: 48,
    ...theme.shadows.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base,
  },
  categoriesWrapper: {
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background.default,
  },
  categoriesList: {
    paddingHorizontal: theme.spacing.md,
  },
  categoryItem: {
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
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    ...theme.shadows.sm,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  categoryName: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: 'medium',
  },
  bannerContainer: {
    padding: theme.spacing.md,
  },
  banner: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'flex-start',
    overflow: 'hidden',
    position: 'relative',
    ...theme.shadows.md,
  },
  bannerImage: {
    width: '100%',
    height: 180,
    borderRadius: theme.borderRadius.lg,
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bannerText: {
    ...theme.typography.h2,
    color: theme.colors.text.inverse,
    marginBottom: 4,
  },
  bannerSubtext: {
    ...theme.typography.body1,
    color: theme.colors.text.inverse,
    opacity: 0.9,
  },
  featuresSection: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  featureInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  featureTitle: {
    ...theme.typography.body1,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  featureDescription: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: -2,
  },
  seeAllContainer: {
    backgroundColor: `${theme.colors.primary.main}15`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  seeAllText: {
    ...theme.typography.body2,
    color: theme.colors.primary.main,
    fontWeight: 'bold',
  },
  horizontalList: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
});
