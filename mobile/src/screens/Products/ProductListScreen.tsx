import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Animated,
} from 'react-native';
import { theme } from '../../theme/theme';
import { productService, categoryService } from '../../services/product.service';
import { Skeleton } from '../../components/Skeleton';
import { ProductCard } from '../../components/ProductCard';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const CARD_WIDTH = (width - theme.spacing.md * 3) / COLUMN_COUNT;

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  basePrice?: number;
  salePrice?: number;
  offerPrice?: number;
}

export default function ProductListScreen({ navigation, route }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState(route.params?.search || '');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || null);
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'price' | undefined>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc' | undefined>('desc');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
    Animated.spring(fadeAnim, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [page, search, selectedCategory, sortBy, sortOrder]);

  const loadCategories = async () => {
    try {
      const allCategories = await categoryService.getAll();
      setCategories(allCategories || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getWithPagination({
        page,
        limit: 20,
        search: search || undefined,
        categoryIds: selectedCategory ? [selectedCategory] : undefined,
        sortBy,
        sortOrder,
      });

      if (page === 1) {
        setProducts(response.data || []);
      } else {
        setProducts((prev) => [...prev, ...(response.data || [])]);
      }

      setHasMore(response.pagination?.page < response.pagination?.totalPages);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    setPage(1);
    setProducts([]);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { slug: item.slug })}
    />
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary.main} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filters Bar */}
      <View style={styles.filtersWrapper}>
        <FlatList
          horizontal
          data={[{ _id: 'all', name: 'All' }, ...categories]}
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => {
            const isSelected = item._id === 'all' ? !selectedCategory : selectedCategory === item._id;
            return (
              <TouchableOpacity
                style={[styles.filterChip, isSelected && styles.activeFilterChip]}
                onPress={() => {
                  setSelectedCategory(item._id === 'all' ? null : item._id);
                  setPage(1);
                  setProducts([]);
                }}
              >
                <Text style={[styles.filterText, isSelected && styles.activeFilterText]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Sort Bar */}
      <View style={styles.sortBar}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'createdAt' && styles.activeSortButton]}
          onPress={() => { setSortBy('createdAt'); setSortOrder('desc'); setPage(1); setProducts([]); }}
        >
          <Text style={[styles.sortButtonText, sortBy === 'createdAt' && styles.activeSortButtonText]}>Latest</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'price' && sortOrder === 'asc' && styles.activeSortButton]}
          onPress={() => { setSortBy('price'); setSortOrder('asc'); setPage(1); setProducts([]); }}
        >
          <Icon name="arrow-up" size={14} color={sortBy === 'price' && sortOrder === 'asc' ? theme.colors.text.inverse : theme.colors.text.secondary} />
          <Text style={[styles.sortButtonText, sortBy === 'price' && sortOrder === 'asc' && styles.activeSortButtonText]}>Price</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'price' && sortOrder === 'desc' && styles.activeSortButton]}
          onPress={() => { setSortBy('price'); setSortOrder('desc'); setPage(1); setProducts([]); }}
        >
          <Icon name="arrow-down" size={14} color={sortBy === 'price' && sortOrder === 'desc' ? theme.colors.text.inverse : theme.colors.text.secondary} />
          <Text style={[styles.sortButtonText, sortBy === 'price' && sortOrder === 'desc' && styles.activeSortButtonText]}>Price</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Product Grid */}
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            loading ? (
              <View style={styles.skeletonContainer}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} width={CARD_WIDTH} height={200} borderRadius={theme.borderRadius.lg} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="package" size={48} color={theme.colors.text.tertiary} />
                <Text style={styles.emptyText}>No products found</Text>
              </View>
            )
          }
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  searchContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  filtersWrapper: {
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  filtersList: {
    paddingHorizontal: theme.spacing.md,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.colors.background.paper,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  filterText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  activeFilterText: {
    color: theme.colors.text.inverse,
  },
  sortBar: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.paper,
    gap: 4,
  },
  activeSortButton: {
    backgroundColor: theme.colors.primary.main,
  },
  sortButtonText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  activeSortButtonText: {
    color: theme.colors.text.inverse,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  footerLoader: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: theme.spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
});
