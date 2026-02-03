import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAppTheme } from '../../theme/theme';
import { productService, categoryService } from '../../services/product.service';
import { ProductCard } from '../../components/ProductCard';
import Icon from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window');
const COLUMN_COUNT = 2;

export default function ProductListScreen({ navigation, route }: any) {
  const theme = useAppTheme();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filter States
  const [search, setSearch] = useState(route.params?.search || '');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || null);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'price' | 'basePrice' | undefined>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc' | undefined>('desc');

  // UI State
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts(1);
  }, [search, selectedCategory, sortBy, sortOrder, minPrice, maxPrice]);

  useEffect(() => {
    if (showFilterDrawer) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showFilterDrawer]);

  const loadCategories = async () => {
    try {
      const allCategories = await categoryService.getAll();
      setCategories(allCategories || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadProducts = async (p: number, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await productService.getWithPagination({
        page: p,
        limit: 20,
        search: search || undefined,
        categoryIds: selectedCategory ? [selectedCategory] : undefined,
        minPrice,
        maxPrice,
        sortBy: (sortBy === 'price' ? 'basePrice' : sortBy) as any,
        sortOrder,
      });

      if (p === 1) {
        setProducts(response.data || []);
      } else {
        setProducts((prev) => [...prev, ...(response.data || [])]);
      }

      setHasMore(response.pagination?.page < response.pagination?.totalPages);
      setPage(p);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadProducts(page + 1);
    }
  };

  const handleRefresh = () => {
    loadProducts(1, true);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSortBy('createdAt');
    setSortOrder('desc');
    setShowFilterDrawer(false);
  };

  const appliedFiltersCount = [selectedCategory, minPrice, maxPrice].filter(Boolean).length + (sortBy !== 'createdAt' ? 1 : 0);

  const renderProduct = ({ item }: { item: any }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { slug: item.slug, id: item._id })}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.searchBar}>
          <Icon name="search" size={16} color={theme.colors.text.tertiary} style={{ marginRight: 8 }} />
          <Text style={styles.searchPlaceholder}>{search || 'Search products...'}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.filterBtn, appliedFiltersCount > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilterDrawer(true)}
        >
          <Icon name="sliders" size={18} color={appliedFiltersCount > 0 ? '#FFF' : theme.colors.text.primary} />
          {appliedFiltersCount > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{appliedFiltersCount}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && page > 1 ? <ActivityIndicator style={{ padding: 20 }} color={theme.colors.primary.main} /> : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBg}>
                  <Icon name="shopping-bag" size={48} color={theme.colors.text.tertiary} />
                </View>
                <Text style={styles.emptyText}>No Products Found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your filters to find what you're looking for.</Text>
                <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
                  <Text style={styles.clearBtnText}>Clear All Filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={theme.colors.primary.main} />
                </View>
            )
          }
        />
      </Animated.View>

      {/* Filter Drawer Modal */}
      <Modal visible={showFilterDrawer} transparent animationType="none">
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={() => setShowFilterDrawer(false)}
          />
          <Animated.View style={[styles.drawerContent, { transform: [{ translateX: slideAnim }] }]}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>Filters</Text>
                <TouchableOpacity onPress={() => setShowFilterDrawer(false)}>
                  <Icon name="x" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.drawerScroll} showsVerticalScrollIndicator={false}>
                {/* Sort Options */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Sort By</Text>
                  <View style={styles.optionGrid}>
                    {[
                      { id: 'new', label: 'Newest', sort: 'createdAt', order: 'desc' },
                      { id: 'p-asc', label: 'Price: Low', sort: 'price', order: 'asc' },
                      { id: 'p-desc', label: 'Price: High', sort: 'price', order: 'desc' },
                      { id: 'name', label: 'Name: A-Z', sort: 'name', order: 'asc' },
                    ].map((opt) => {
                      const isSel = sortBy === opt.sort && sortOrder === opt.order;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[styles.optionChip, isSel && styles.optionChipActive]}
                          onPress={() => { setSortBy(opt.sort as any); setSortOrder(opt.order as any); }}
                        >
                          <Text style={[styles.optionText, isSel && styles.optionTextActive]}>{opt.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Categories */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Category</Text>
                  <View style={styles.categoryList}>
                    {[{ _id: null, name: 'All Categories' }, ...categories].map((cat) => {
                      const isSel = selectedCategory === cat._id;
                      return (
                        <TouchableOpacity
                          key={cat._id || 'all'}
                          style={[styles.catItem, isSel && styles.catItemActive]}
                          onPress={() => setSelectedCategory(cat._id)}
                        >
                          <Text style={[styles.catItemText, isSel && styles.catItemTextActive]}>{cat.name}</Text>
                          {isSel && <Icon name="check" size={16} color={theme.colors.primary.main} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Price Range */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Price Range</Text>
                  <View style={styles.priceRow}>
                    <TouchableOpacity
                      style={[styles.priceChip, minPrice === 0 && styles.priceChipActive]}
                      onPress={() => { setMinPrice(0); setMaxPrice(500); }}
                    >
                      <Text style={[styles.priceText, minPrice === 0 && styles.priceTextActive]}>Under ₹500</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.priceChip, minPrice === 500 && styles.priceChipActive]}
                      onPress={() => { setMinPrice(500); setMaxPrice(1000); }}
                    >
                      <Text style={[styles.priceText, minPrice === 500 && styles.priceTextActive]}>₹500 - ₹1000</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.priceChip, minPrice === 1000 && styles.priceChipActive]}
                      onPress={() => { setMinPrice(1000); setMaxPrice(5000); }}
                    >
                      <Text style={[styles.priceText, minPrice === 1000 && styles.priceTextActive]}>₹1000 - ₹5000</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.priceChip, minPrice === 5000 && styles.priceChipActive]}
                      onPress={() => { setMinPrice(5000); setMaxPrice(undefined); }}
                    >
                      <Text style={[styles.priceText, minPrice === 5000 && styles.priceTextActive]}>Above ₹5000</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.drawerFooter}>
                <TouchableOpacity style={styles.resetBtn} onPress={clearFilters}>
                  <Text style={styles.resetBtnText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilterDrawer(false)}>
                  <Text style={styles.applyBtnText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: theme.colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
    fontWeight: '500',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  filterBtnActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.error || '#FF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.colors.primary.main}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  clearBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.primary.main,
  },
  clearBtnText: {
    color: theme.colors.primary.main,
    fontWeight: '800',
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawerContent: {
    width: width * 0.8,
    height: '100%',
    backgroundColor: theme.colors.background.paper,
    ...theme.shadows.lg,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  drawerScroll: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.text.primary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.background.default,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  optionChipActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  optionText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#FFF',
  },
  categoryList: {
    gap: 4,
  },
  catItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  catItemActive: {
    backgroundColor: `${theme.colors.primary.main}10`,
  },
  catItemText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  catItemTextActive: {
    color: theme.colors.primary.main,
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  priceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  priceChipActive: {
    borderColor: theme.colors.primary.main,
    backgroundColor: `${theme.colors.primary.main}10`,
  },
  priceText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  priceTextActive: {
    color: theme.colors.primary.main,
    fontWeight: '800',
  },
  drawerFooter: {
    padding: 20,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  resetBtn: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text.secondary,
  },
  applyBtn: {
    flex: 2,
    height: 50,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    ...theme.shadows.md,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
