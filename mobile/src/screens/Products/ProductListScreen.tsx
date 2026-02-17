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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme, useAppTheme } from '../../theme/theme';
import { productService, categoryService } from '../../services/product.service';
import { attributeService } from '../../services/attribute.service';
import { ProductCard } from '../../components/ProductCard';
import Icon from 'react-native-vector-icons/Feather';
import type { Attribute } from '../../types/attribute.types';

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
  const [filters, setFilters] = useState({
    search: route.params?.search || '',
    selectedCategory: route.params?.category || null,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    sortBy: 'createdAt' as 'createdAt' | 'name' | 'price' | 'basePrice' | undefined,
    sortOrder: 'desc' as 'desc' | 'asc' | undefined,
    selectedAttributes: {} as Record<string, string[]>,
    inStock: false,
  });

  const [tempFilters, setTempFilters] = useState(filters);
  const [filterableAttributes, setFilterableAttributes] = useState<Attribute[]>([]);

  // UI State
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState('sort');
  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

  useEffect(() => {
    loadCategories();
    loadFilterableAttributes();
  }, []);

  // Watch for route params changes (e.g., when search is cleared from header)
  useEffect(() => {
    const searchParam = route.params?.search || '';
    const categoryParam = route.params?.category || null;

    // Only update if params actually changed
    if (searchParam !== filters.search || categoryParam !== filters.selectedCategory) {
      setFilters(prev => ({
        ...prev,
        search: searchParam,
        selectedCategory: categoryParam,
        page: 1,
      }));
    }
  }, [route.params?.search, route.params?.category]);

  useEffect(() => {
    loadProducts(1);
  }, [filters]);

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

  const loadFilterableAttributes = async () => {
    try {
      const attrs = await attributeService.getAllFilterable();
      setFilterableAttributes(attrs || []);
    } catch (err) {
      console.error('Error loading filterable attributes:', err);
    }
  };

  const loadProducts = async (p: number, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await productService.getWithPagination({
        page: p,
        limit: 20,
        search: filters.search || undefined,
        categoryIds: filters.selectedCategory ? [filters.selectedCategory] : undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sortBy: (filters.sortBy === 'price' ? 'basePrice' : filters.sortBy) as any,
        sortOrder: filters.sortOrder,
        attributes: filters.selectedAttributes,
        inStock: filters.inStock || undefined,
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

  const handleAttributeToggle = (attributeId: string, value: string) => {
    setTempFilters(prev => {
      const currentValues = prev.selectedAttributes[attributeId] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v: string) => v !== value)
        : [...currentValues, value];

      const newAttributes = { ...prev.selectedAttributes, [attributeId]: newValues };
      if (newValues.length === 0) delete (newAttributes as any)[attributeId];

      return { ...prev, selectedAttributes: newAttributes };
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      selectedCategory: null,
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      selectedAttributes: {},
      inStock: false,
    });
    setTempFilters({
      search: '',
      selectedCategory: null,
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      selectedAttributes: {},
      inStock: false,
    });
    setShowFilterDrawer(false);
  };

  const appliedFiltersCount = [filters.selectedCategory, filters.minPrice, filters.maxPrice].filter(Boolean).length +
    (filters.sortBy !== 'createdAt' ? 1 : 0) +
    Object.values(filters.selectedAttributes).reduce((acc: number, curr: any) => acc + (Array.isArray(curr) ? curr.length : 0), 0) +
    (filters.inStock ? 1 : 0);

  const renderProduct = ({ item }: { item: any }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { slug: item.slug, id: item._id })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.searchBar}>
          <Icon name="search" size={16} color={theme.colors.text.tertiary} style={{ marginRight: 8 }} />
          <Text style={styles.searchPlaceholder}>{filters.search || 'Search products...'}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.filterBtn, appliedFiltersCount > 0 && styles.filterBtnActive]}
          onPress={() => {
            setTempFilters(filters);
            setShowFilterDrawer(true);
          }}
        >
          <Icon name="sliders" size={18} color={appliedFiltersCount > 0 ? theme.colors.text.inverse : theme.colors.text.primary} />
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
                <View style={styles.headerLeft}>
                  <View style={styles.headerIconBox}>
                    <Icon name="filter" size={20} color={theme.colors.text.inverse} />
                  </View>
                  <View>
                    <Text style={styles.drawerTitle}>ADVANCED FILTERS</Text>
                    <Text style={styles.drawerSubtitle}>REFINE YOUR DATA VIEW</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowFilterDrawer(false)} style={styles.closeBtn}>
                  <Icon name="x" size={24} color={theme.colors.text.inverse} />
                </TouchableOpacity>
              </View>

              <View style={styles.drawerBody}>
                {/* Horizontal Tabs */}
                <View style={styles.tabBarContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabBarScroll}
                  >
                    {[
                      { id: 'sort', label: 'SORT' },
                      { id: 'category', label: 'CATEGORY' },
                      { id: 'price', label: 'PRICE' },
                      ...filterableAttributes.map(attr => ({
                        id: attr._id,
                        label: attr.name.toUpperCase(),
                      })),
                      { id: 'status', label: 'STATUS' },
                    ].map((tab) => {
                      const isActive = activeFilterTab === tab.id;
                      return (
                        <TouchableOpacity
                          key={tab.id}
                          style={[styles.chipTab, isActive && styles.chipTabActive]}
                          onPress={() => setActiveFilterTab(tab.id)}
                        >
                          <Text style={[styles.chipTabText, isActive && styles.chipTabTextActive]}>
                            {tab.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Content Pane */}
                <View style={styles.drawerContentPane}>
                  <ScrollView style={styles.drawerScroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
                    {activeFilterTab === 'sort' && (
                      <View style={styles.tabContent}>
                        <View style={styles.contentHeader}>
                          <Text style={styles.tabContentTitle}>SORT PRODUCTS</Text>
                          <Text style={styles.optionCount}>5 Recommended</Text>
                        </View>
                        <View style={styles.cardList}>
                          {[
                            { id: 'new', label: 'Newest First', sort: 'createdAt', order: 'desc', icon: 'trending-up' },
                            { id: 'p-asc', label: 'Price: Low to High', sort: 'price', order: 'asc', icon: 'arrow-down' },
                            { id: 'p-desc', label: 'Price: High to Low', sort: 'price', order: 'desc', icon: 'arrow-up' },
                            { id: 'name-asc', label: 'Name: A-Z', sort: 'name', order: 'asc', icon: 'type' },
                            { id: 'name-desc', label: 'Name: Z-A', sort: 'name', order: 'desc', icon: 'type' },
                          ].map((opt) => {
                            const isSel = tempFilters.sortBy === opt.sort && tempFilters.sortOrder === opt.order;
                            return (
                              <TouchableOpacity
                                key={opt.id}
                                style={[styles.optionCard, isSel && styles.optionCardActive]}
                                onPress={() => { setTempFilters(prev => ({ ...prev, sortBy: opt.sort as any, sortOrder: opt.order as any })); }}
                              >
                                <Text style={[styles.optionCardText, isSel && styles.optionCardTextActive]}>{opt.label.toUpperCase()}</Text>
                                <View style={[styles.checkCircle, isSel && styles.checkCircleActive]}>
                                  {isSel && <Icon name="check" size={12} color={theme.colors.text.inverse} />}
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    )}

                    {activeFilterTab === 'category' && (
                      <View style={styles.tabContent}>
                        <View style={styles.contentHeader}>
                          <Text style={styles.tabContentTitle}>SELECT CATEGORY</Text>
                          <Text style={styles.optionCount}>{categories.length + 1} Options</Text>
                        </View>
                        <View style={styles.cardList}>
                          {[{ _id: null, name: 'All Categories' }, ...categories].map((cat) => {
                            const isSel = tempFilters.selectedCategory === cat._id;
                            return (
                              <TouchableOpacity
                                key={cat._id || 'all'}
                                style={[styles.optionCard, isSel && styles.optionCardActive]}
                                onPress={() => setTempFilters(prev => ({ ...prev, selectedCategory: cat._id }))}
                              >
                                <Text style={[styles.optionCardText, isSel && styles.optionCardTextActive]}>{cat.name.toUpperCase()}</Text>
                                <View style={[styles.checkCircle, isSel && styles.checkCircleActive]}>
                                  {isSel && <Icon name="check" size={12} color={theme.colors.text.inverse} />}
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    )}

                    {activeFilterTab === 'price' && (
                      <View style={styles.tabContent}>
                        <View style={styles.contentHeader}>
                          <Text style={styles.tabContentTitle}>PRICE RANGE</Text>
                          <Text style={styles.optionCount}>4 Options</Text>
                        </View>
                        <View style={styles.cardList}>
                          {[
                            { label: 'Under ₹500', min: 0, max: 500 },
                            { label: '₹500 - ₹1000', min: 500, max: 1000 },
                            { label: '₹1000 - ₹5000', min: 1000, max: 5000 },
                            { label: 'Above ₹5000', min: 5000, max: undefined },
                          ].map((range, idx) => {
                            const isSel = tempFilters.minPrice === range.min && tempFilters.maxPrice === range.max;
                            return (
                              <TouchableOpacity
                                key={idx}
                                style={[styles.optionCard, isSel && styles.optionCardActive]}
                                onPress={() => { setTempFilters(prev => ({ ...prev, minPrice: range.min, maxPrice: range.max })); }}
                              >
                                <Text style={[styles.optionCardText, isSel && styles.optionCardTextActive]}>{range.label.toUpperCase()}</Text>
                                <View style={[styles.checkCircle, isSel && styles.checkCircleActive]}>
                                  {isSel && <Icon name="check" size={12} color={theme.colors.text.inverse} />}
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    )}

                    {filterableAttributes.find(a => a._id === activeFilterTab) && (() => {
                      const attr = filterableAttributes.find(a => a._id === activeFilterTab)!;
                      return (
                        <View style={styles.tabContent}>
                          <View style={styles.contentHeader}>
                            <Text style={styles.tabContentTitle}>{attr.name.toUpperCase()}</Text>
                            <Text style={styles.optionCount}>{attr.options.length} Options</Text>
                          </View>
                          <View style={styles.cardList}>
                            {attr.options.map((opt) => {
                              const isSel = tempFilters.selectedAttributes[attr._id]?.includes(opt.value);
                              return (
                                <TouchableOpacity
                                  key={opt.value}
                                  style={[styles.optionCard, isSel && styles.optionCardActive]}
                                  onPress={() => handleAttributeToggle(attr._id, opt.value)}
                                >
                                  <View style={styles.optionRowLeft}>
                                    {(attr.inputType === 'COLOR' || attr.slug === 'color') && (
                                      <View style={[styles.colorPreview, { backgroundColor: opt.color || opt.value }]} />
                                    )}
                                    <Text style={[styles.optionCardText, isSel && styles.optionCardTextActive]}>{opt.label.toUpperCase()}</Text>
                                  </View>
                                  <View style={[styles.checkCircle, isSel && styles.checkCircleActive]}>
                                    {isSel && <Icon name="check" size={12} color={theme.colors.text.inverse} />}
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      );
                    })()}

                    {activeFilterTab === 'status' && (
                      <View style={styles.tabContent}>
                        <View style={styles.contentHeader}>
                          <Text style={styles.tabContentTitle}>AVAILABILITY</Text>
                          <Text style={styles.optionCount}>2 Options</Text>
                        </View>
                        <View style={styles.cardList}>
                          <TouchableOpacity 
                            style={[styles.optionCard, tempFilters.inStock && styles.optionCardActive]}
                            onPress={() => setTempFilters(prev => ({ ...prev, inStock: !prev.inStock }))}
                          >
                            <Text style={[styles.optionCardText, tempFilters.inStock && styles.optionCardTextActive]}>
                              IN STOCK ONLY
                            </Text>
                            <View style={[styles.checkCircle, tempFilters.inStock && styles.checkCircleActive]}>
                              {tempFilters.inStock && <Icon name="check" size={12} color={theme.colors.text.inverse} />}
                            </View>
                          </TouchableOpacity>

                          <TouchableOpacity 
                            style={[styles.optionCard, !tempFilters.inStock && styles.optionCardActive]}
                            onPress={() => setTempFilters(prev => ({ ...prev, inStock: false }))}
                          >
                            <Text style={[styles.optionCardText, !tempFilters.inStock && styles.optionCardTextActive]}>
                              SHOW ALL
                            </Text>
                            <View style={[styles.checkCircle, !tempFilters.inStock && styles.checkCircleActive]}>
                              {!tempFilters.inStock && <Icon name="check" size={12} color={theme.colors.text.inverse} />}
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.drawerFooter}>
                <TouchableOpacity style={styles.resetBtn} onPress={clearFilters}>
                  <Text style={styles.resetBtnText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => {
                    setFilters(tempFilters);
                    setShowFilterDrawer(false);
                  }}
                >
                  <Text style={styles.applyBtnText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme, insets: any) => StyleSheet.create({
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
    fontWeight: theme.typography.fontWeight.medium,
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
    color: theme.colors.text.inverse,
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
  },
  listContent: {
    padding: 12,
    paddingBottom: 80 + insets.bottom,
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
    fontWeight: theme.typography.fontWeight.black,
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
    fontWeight: theme.typography.fontWeight.bold,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawerContent: {
    width: width,
    height: '100%',
    backgroundColor: theme.colors.background.paper,
    alignSelf: 'flex-end',
  },
  drawerHeader: {
    backgroundColor: theme.colors.primary.main,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: height * 0.05,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.text.inverse,
    letterSpacing: 1,
  },
  drawerSubtitle: {
    fontSize: 10,
    color: `${theme.colors.text.inverse}B3`,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 1,
    marginTop: 2,
  },
  closeBtn: {
    padding: 5,
  },
  drawerBody: {
    flex: 1,
    flexDirection: 'column',
  },
  tabBarContainer: {
    backgroundColor: theme.colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  tabBarScroll: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  chipTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.paper,
  },
  chipTabActive: {
    borderColor: theme.colors.primary.main,
  },
  chipTabText: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.tertiary,
    letterSpacing: 0.5,
  },
  chipTabTextActive: {
    color: theme.colors.primary.main,
  },
  drawerContentPane: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  drawerScroll: {
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  tabContent: {
    flex: 1,
  },
  tabContentTitle: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.primary.main,
    letterSpacing: 0.5,
  },
  optionCount: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  cardList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background.paper,
    borderRadius: 15,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionCardActive: {
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.background.paper,
  },
  optionCardText: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: 0.5,
  },
  optionCardTextActive: {
    color: theme.colors.primary.main,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  optionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  colorPreview: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  drawerFooter: {
    padding: 20,
    paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: theme.colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  resetBtn: {
    flex: 1,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.border.light,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.secondary,
  },
  applyBtn: {
    flex: 2,
    height: 55,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    ...theme.shadows.md,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.text.inverse,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
