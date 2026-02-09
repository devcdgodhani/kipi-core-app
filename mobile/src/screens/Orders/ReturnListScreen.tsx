import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { returnService } from '../../services/returnService';
import { Theme, useAppTheme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { format, isValid } from 'date-fns';

type RootStackParamList = {
  ReturnDetail: { returnId: string };
};

const ReturnListScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<any>();
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    loadReturns(1, true);
  }, []);

  const loadReturns = async (pageNum: number, shouldRefresh = false) => {
    if (!shouldRefresh && (loadingMore || !hasMore)) return;

    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await returnService.getMyReturns({
        page: pageNum,
        limit: LIMIT,
        sort: { createdAt: -1 }
      });
      
      const newReturns = response?.recordList || (Array.isArray(response) ? response : []);
      
      if (shouldRefresh || pageNum === 1) {
        setReturns(newReturns);
      } else {
        setReturns(prev => [...prev, ...newReturns]);
      }
      
      setHasMore(newReturns.length === LIMIT);
      setPage(pageNum);
      
    } catch (error) {
      console.error('Failed to load returns', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load return history',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    loadReturns(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      loadReturns(page + 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'APPROVED': return theme.colors.success; // Emerald equivalent
        case 'REJECTED': return theme.colors.error;
        case 'PICKED_UP': return theme.colors.primary.main; // Indigo equivalent-ish
        case 'REFUNDED': return theme.colors.primary.main;
        default: return theme.colors.warning;
    }
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    const date = new Date(dateValue);
    if (!isValid(date)) return 'Invalid Date';
    return format(date, 'MMM dd, yyyy');
  };

  const renderReturnItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ReturnDetail', { returnId: item._id })}
      activeOpacity={0.8}
    >
        <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
                <Text style={styles.orderNumber}>#{item.orderId?.orderNumber || 'ORDER'}</Text>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status}
                </Text>
            </View>
        </View>

        <View style={styles.contentRow}>
            <Image 
          source={{ uri: item.productId?.mainImage || item.product?.mainImage || item.productImage || 'https://via.placeholder.com/100' }}
                style={styles.productImage}
            />
            <View style={styles.infoCol}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.productId?.name || item.product?.name || item.productName || 'Product'}
          </Text>
          {/* Try to show SKU or Variant if available */}
          {(item.skuId?.code || item.skuCode || item.variantName) && (
            <Text style={styles.reasonText}>
              Sku: {item.skuId?.code || item.skuCode || item.variantName}
            </Text>
          )}
          <Text style={styles.reasonText}>Reason: {item.reason || item.returnReason || 'N/A'}</Text>
                {item.awb && (
                    <View style={styles.awbContainer}>
                        <Text style={styles.awbLabel}>Pickup Tracking:</Text>
                        <Text style={styles.awbValue}>{item.awb}</Text>
                    </View>
                )}
            </View>
            <Icon name="chevron-right" size={20} color={theme.colors.text.tertiary} />
        </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 20 }} />;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={theme.colors.primary.main} />
      </View>
    );
  };

  if (loading && !refreshing && returns.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={returns}
        renderItem={renderReturnItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary.main]} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                 <Icon name="package" size={40} color={theme.colors.text.tertiary} />
              </View>
              <Text style={styles.emptyTitle}>No Active Reversals</Text>
              <Text style={styles.emptyText}>You haven't initiated any return requests yet.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    paddingBottom: 8,
  },
  headerLeft: {
     flexDirection: 'column',
  },
  orderNumber: {
    fontSize: 11,
    fontWeight: '900',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  date: {
      fontSize: 10,
      fontWeight: 'bold',
      color: theme.colors.text.tertiary,
      marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contentRow: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  productImage: {
      width: 50,
      height: 50,
      borderRadius: 10,
      backgroundColor: theme.colors.background.default,
      marginRight: 12,
  },
  infoCol: {
      flex: 1,
      justifyContent: 'center',
  },
  productName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginBottom: 2,
  },
  reasonText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
  },
  awbContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      backgroundColor: `${theme.colors.primary.main}10`,
      alignSelf: 'flex-start',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
  },
  awbLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      color: theme.colors.primary.main,
      marginRight: 4,
  },
  awbValue: {
      fontSize: 10,
      color: theme.colors.primary.main,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconBg: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.background.paper,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 2,
      borderColor: theme.colors.border.light,
      borderStyle: 'dashed',
  },
  emptyTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: theme.colors.text.primary,
      marginBottom: 8,
      textTransform: 'uppercase',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ReturnListScreen;
