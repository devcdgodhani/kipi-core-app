import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { CartProvider } from './context/CartContext.tsx'
import { WishlistProvider } from './context/WishlistContext.tsx'
import { AddressProvider } from './context/AddressContext.tsx'
import { Provider } from 'react-redux';
import { store } from './features/store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <CartProvider>
          <WishlistProvider>
            <AddressProvider>
              <App />
            </AddressProvider>
          </WishlistProvider>
        </CartProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
