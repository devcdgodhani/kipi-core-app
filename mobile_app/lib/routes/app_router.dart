import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/presentation/login_screen.dart';
import '../features/auth/providers/auth_provider.dart';
import '../features/home/presentation/home_screen.dart';
import '../features/product/presentation/product_list_screen.dart';
import '../features/product/presentation/product_detail_screen.dart';
import '../features/cart/presentation/cart_screen.dart';
import '../features/wishlist/presentation/wishlist_screen.dart';
import '../features/orders/presentation/order_list_screen.dart';
import '../features/orders/presentation/order_detail_screen.dart';
import '../features/profile/presentation/profile_screen.dart';
import '../features/address/presentation/address_list_screen.dart';
import '../features/address/presentation/add_edit_address_screen.dart';
import '../features/address/domain/address_models.dart';
import '../features/cart/presentation/checkout_screen.dart';
import '../features/search/presentation/search_screen.dart';
import '../features/wallet/presentation/wallet_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      return authState.when(
        data: (auth) {
          final isAuthenticated = auth.isAuthenticated;
          final isLoginRoute = state.matchedLocation == '/login';

          // If not authenticated and not on login page, redirect to login
          if (!isAuthenticated && !isLoginRoute) {
            return '/login';
          }

          // If authenticated and on login page, redirect to home
          if (isAuthenticated && isLoginRoute) {
            return '/';
          }

          return null; // No redirect needed
        },
        loading: () => null,
        error: (_, __) => '/login',
      );
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => MainScaffold(child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/categories',
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Categories - To be implemented')),
            ),
          ),
          GoRoute(
            path: '/wishlist',
            builder: (context, state) => const WishlistScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
      // Product routes (outside bottom nav)
      GoRoute(
        path: '/products',
        builder: (context, state) {
          final categoryId = state.uri.queryParameters['categoryId'];
          final categoryName = state.uri.queryParameters['categoryName'];
          return ProductListScreen(
            categoryId: categoryId,
            categoryName: categoryName,
          );
        },
      ),
      GoRoute(
        path: '/product/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return ProductDetailScreen(productId: id);
        },
      ),
      GoRoute(
        path: '/cart',
        builder: (context, state) => const CartScreen(),
      ),
      GoRoute(
        path: '/orders',
        builder: (context, state) => const OrderListScreen(),
      ),
      GoRoute(
        path: '/order/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return OrderDetailScreen(orderId: id);
        },
      ),
      GoRoute(
        path: '/addresses',
        builder: (context, state) {
          final selectionMode = state.uri.queryParameters['selectionMode'] == 'true';
          return AddressListScreen(isSelectionMode: selectionMode);
        },
        routes: [
          GoRoute(
            path: 'add',
            builder: (context, state) => const AddEditAddressScreen(),
          ),
          GoRoute(
            path: 'edit',
            builder: (context, state) {
              final address = state.extra as Address;
              return AddEditAddressScreen(address: address);
            },
          ),
        ],
      ),
      GoRoute(
        path: '/checkout',
        builder: (context, state) => const CheckoutScreen(),
      ),
      GoRoute(
        path: '/search',
        builder: (context, state) => const SearchScreen(),
      ),
      GoRoute(
        path: '/wallet',
        builder: (context, state) => const WalletScreen(),
      ),
    ],
  );
});

class MainScaffold extends StatefulWidget {
  final Widget child;

  const MainScaffold({required this.child, super.key});

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  int _selectedIndex = 0;

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });

    switch (index) {
      case 0:
        context.go('/');
        break;
      case 1:
        context.go('/categories');
        break;
      case 2:
        context.go('/wishlist');
        break;
      case 3:
        context.go('/profile');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    // Determine selected index based on current route
    final location = GoRouterState.of(context).matchedLocation;
    if (location == '/') {
      _selectedIndex = 0;
    } else if (location == '/categories') {
      _selectedIndex = 1;
    } else if (location == '/wishlist') {
      _selectedIndex = 2;
    } else if (location == '/profile') {
      _selectedIndex = 3;
    }

    return Scaffold(
      body: widget.child,
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.grid_view_outlined),
            activeIcon: Icon(Icons.grid_view),
            label: 'Categories',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.favorite_border),
            activeIcon: Icon(Icons.favorite),
            label: 'Wishlist',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

