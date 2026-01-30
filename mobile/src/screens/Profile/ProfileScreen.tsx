import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { logout, user } = useAuth();
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
      screen: 'AddAddress'
    },
    {
      label: 'Wishlist',
      icon: 'heart',
      screen: 'Wishlist',
      disabled: false
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
      label: 'My Wallet',
      icon: 'credit-card',
      screen: 'Wallet',
      disabled: false
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
      <Animated.ScrollView contentContainerStyle={styles.content} style={{ opacity: fadeAnim }}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.avatarContainer}>
              <Text style={styles.initials}>{getInitials(user?.name || user?.username)}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{user?.name || user?.username || 'Guest User'}</Text>
              <Text style={styles.email}>{user?.email || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statCount}>0</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={[styles.statBox, styles.statBorder]}>
            <Text style={styles.statCount}>₹0.00</Text>
            <Text style={styles.statLabel}>Wallet</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statCount}>0</Text>
            <Text style={styles.statLabel}>Wishlist</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, item.disabled && styles.disabledMenuItem]}
              onPress={() => {
                if (item.disabled) return;
                if (item.screen) navigation.navigate(item.screen);
              }}
              disabled={!!item.disabled}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, item.disabled && styles.disabledIconContainer]}>
                  <Icon name={item.icon} size={18} color={item.disabled ? theme.colors.text.tertiary : theme.colors.primary.main} />
                </View>
                <Text style={[styles.menuLabel, item.disabled && styles.disabledText]}>{item.label}</Text>
              </View>
              {!item.disabled && <Icon name="chevron-right" size={18} color={theme.colors.border.medium} />}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out" size={18} color={theme.colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.inverse,
  },
  headerInfo: {
    marginLeft: theme.spacing.lg,
  },
  name: {
    ...theme.typography.h3,
    color: theme.colors.text.inverse,
    marginBottom: 4,
  },
  email: {
    ...theme.typography.body2,
    color: theme.colors.text.inverse,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
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
    color: theme.colors.primary.main,
  },
  statLabel: {
    ...theme.typography.body2,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
    marginBottom: theme.spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuLabel: {
    ...theme.typography.body1,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  logoutText: {
    ...theme.typography.button,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
  },
  disabledMenuItem: {
    opacity: 0.7,
  },
  disabledIconContainer: {
    backgroundColor: theme.colors.background.paper,
  },
  disabledText: {
    color: theme.colors.text.tertiary,
  },
});
