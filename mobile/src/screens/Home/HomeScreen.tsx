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
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../theme/theme';
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
          <Image source={{ uri: getSafeImageUrl(item.image) }} style={styles.categoryImage} />
        ) : (
          <Icon name="grid" size={24} color={theme.colors.primary.main} />
        )}
      </View>
      <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProductSection = (section: any) => {
    const products = sectionsData[section.sectionId] || [];
    if (products.length === 0) return null;

    return (
      <View key={section._id} style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Products', { screen: 'ProductList' })}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={products}
          renderItem={({ item }) => (
            <ProductCard
              product={item} 
              onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
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
        <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
          <Icon name="shopping-bag" size={24} color={theme.colors.primary.main} />
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
                  <Image source={{ uri: getSafeImageUrl(banner.imageUrl) }} style={styles.bannerImage} />
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

        {appSettings?.sections?.map((section: any) => renderProductSection(section))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
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
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  cartButton: {
    width: 48,
    height: 48,
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
    fontSize: 12,
    color: theme.colors.text.primary,
    fontWeight: '500',
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
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
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
