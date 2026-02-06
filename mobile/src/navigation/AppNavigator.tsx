import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import { useAppTheme } from '../theme/theme';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import ProductListScreen from '../screens/Products/ProductListScreen';
import ProductDetailScreen from '../screens/Products/ProductDetailScreen';
import CartScreen from '../screens/Cart/CartScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import VerifyOTPScreen from '../screens/Auth/VerifyOTPScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';
import CheckoutScreen from '../screens/Checkout/CheckoutScreen';
import PaymentGatewayScreen from '../screens/Checkout/PaymentGatewayScreen';
import OrderSuccessScreen from '../screens/Checkout/OrderSuccessScreen';
import AddAddressScreen from '../screens/Address/AddAddressScreen';
import OrdersScreen from '../screens/Orders/OrdersScreen';
import OrderDetailScreen from '../screens/Orders/OrderDetailScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';
import WishlistScreen from '../screens/Wishlist/WishlistScreen';
import WalletScreen from '../screens/Wallet/WalletScreen';
import NotificationScreen from '../screens/Notifications/NotificationScreen';
import AddressListScreen from '../screens/Address/AddressListScreen';
import PaymentWebViewScreen from '../screens/Checkout/PaymentWebViewScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} options={{ title: 'Verify OTP' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot Password' }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset Password' }} />
    </Stack.Navigator>
  );
}

// Home Stack
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

// Products Stack
function ProductsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProductList" component={ProductListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  const theme = useAppTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Products') {
            iconName = 'grid';
          } else if (route.name === 'Cart') {
            iconName = 'shopping-bag';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          } else if (route.name === 'Wishlist') {
            iconName = 'heart';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: theme.colors.background.paper,
          elevation: 20,
          height: Platform.OS === 'ios' ? 88 : 80,
          paddingBottom: Platform.OS === 'ios' ? 30 : 20,
          paddingTop: 10,
          shadowColor: theme.colors.text.primary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: -4,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Products" component={ProductsStack} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// App Stack (Authenticated)
function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <Stack.Screen name="PaymentGateway" component={PaymentGatewayScreen} options={{ title: 'Select Gateway' }} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddAddress" component={AddAddressScreen} options={{ title: 'Add New Address' }} />
      <Stack.Screen name="AddressList" component={AddressListScreen} options={{ title: 'Shipping Addresses' }} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
      <Stack.Screen name="PaymentWebView" component={PaymentWebViewScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'My Wishlist' }} />
      <Stack.Screen name="Wallet" component={WalletScreen} options={{ title: 'My Wallet' }} />
      <Stack.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
}

// Root Navigator
export default function AppNavigator() {
  const theme = useAppTheme();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.default }}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
