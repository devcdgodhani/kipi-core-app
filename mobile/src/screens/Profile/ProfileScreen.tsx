import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../theme/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useWishlist } from '../../context/WishlistContext';
import { orderService } from '../../services/order.service';

export default function ProfileScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<any>();
  const { logout, user } = useAuth();
  const { wallet, refreshWallet } = useWallet();
  const { wishlistItems } = useWishlist();
  const [orderCount, setOrderCount] = useState<number | string>('0');
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = React.useState(new Animated.Value(0));

  const styles = useMemo(() => createStyles(theme), [theme]);

  const fetchOrderCount = async () => {
    try {
      const response = await orderService.getMyOrders({ page: 1, limit: 1 });
      // response is already the unwrapped data (OrderListResponse)
      if (response && typeof response.totalRecords !== 'undefined') {
        setOrderCount(response.totalRecords);
      }
    } catch (error) {
      console.error('Failed to fetch order count:', error);
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    fetchOrderCount();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshWallet(),
      fetchOrderCount()
    ]);
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  const getFullName = () => {
    if (!user) return 'Guest User';
    if (user.name) return user.name;
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.username || user.email || 'Guest User';
  };

  const getInitials = (name: string) => {
    if (!name || name === 'Guest User') return 'U';
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase();
  };

  const menuItems = [
    {
      label: 'My Orders',
      icon: 'package',
      screen: 'Orders'
    },
    {
      label: 'Shipping Addresses',
      icon: 'map-pin',
      screen: 'AddressList'
    },
    {
      label: 'Wishlist',
      icon: 'heart',
      screen: 'Wishlist'
    },
    {
      label: 'Edit Profile',
      icon: 'user',
      screen: 'EditProfile'
    },
    {
      label: 'Change Password',
      icon: 'lock',
      screen: 'ChangePassword'
    },
    {
      label: 'Notifications',
      icon: 'bell',
      screen: 'Notifications',
      disabled: false
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.avatarContainer}>
                <Text style={styles.initials}>{getInitials(getFullName())}</Text>
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.name}>{getFullName()}</Text>
                <Text style={styles.email}>{user?.email || 'N/A'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.statCount}>{orderCount}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statBox, styles.statBorder]} onPress={() => navigation.navigate('Wallet')}>
              <Text style={styles.statCount}>₹{(wallet?.availableBalance ?? 0).toFixed(2)}</Text>
              <Text style={styles.statLabel}>Wallet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('Wishlist')}>
              <Text style={styles.statCount}>{wishlistItems?.length || 0}</Text>
              <Text style={styles.statLabel}>Wishlist</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconBox, item.icon === 'heart' ? styles.wishlistIcon : null]}>
                    <Icon name={item.icon} size={20} color={item.icon === 'heart' ? '#EF4444' : theme.colors.primary.main} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Icon name="chevron-right" size={20} color={theme.colors.text.tertiary} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="log-out" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.paper,
  },
  content: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    backgroundColor: theme.colors.background.default,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    ...theme.shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  initials: {
    ...theme.typography.h2,
    color: '#FFFFFF',
    fontSize: 24,
  },
  headerInfo: {
    marginLeft: theme.spacing.md,
  },
  name: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  email: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.default,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colors.border.light,
  },
  statCount: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontSize: 18,
  },
  statLabel: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: theme.colors.background.default,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  wishlistIcon: {
    backgroundColor: '#FEE2E2',
  },
  menuLabel: {
    ...theme.typography.body1,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: theme.spacing.xl,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#FEE2E2',
  },
  logoutText: {
    marginLeft: theme.spacing.sm,
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 16,
  },
});
