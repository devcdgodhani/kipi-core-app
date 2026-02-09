import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/context/CartContext';
import { AddressProvider } from './src/context/AddressContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { WalletProvider } from './src/context/WalletContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { CheckoutProvider } from './src/context/CheckoutContext';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import Toast from 'react-native-toast-message';

import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'AxiosError: Request failed with status code 400',
]);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Provider store={store}>
          <CartProvider>
            <AddressProvider>
              <WishlistProvider>
                <WalletProvider>
                  <NotificationProvider>
                    <CheckoutProvider>
                      <SafeAreaProvider>
                        <StatusBar
                          barStyle="dark-content"
                          backgroundColor="transparent"
                          translucent={true}
                        />
                        <AppNavigator />
                        <Toast />
                      </SafeAreaProvider>
                    </CheckoutProvider>
                  </NotificationProvider>
                </WalletProvider>
              </WishlistProvider>
            </AddressProvider>
          </CartProvider>
        </Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}
