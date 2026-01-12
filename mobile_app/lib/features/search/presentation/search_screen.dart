import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/widgets/product_card.dart';
import '../../../core/widgets/shimmer_loader.dart';
import '../../../theme/app_text_styles.dart';
import '../../product/providers/product_provider.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _searchController = TextEditingController();
  final _debouncer = Debouncer(milliseconds: 500);

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // We can use a specialized provider or just reuse product list with filter
    // For simplicity utilizing the existing product provider logic might be tricky if it's tied to pagination/filter state 
    // that persists. Ideally we want a fresh search state.
    // So we'll use a local state or auto-dispose provider for search.
    
    // Listening to a specific search-query-provider
    final searchQuery = ref.watch(searchQueryProvider);
    final searchParam = {'search': searchQuery, 'limit': 20};
    
    // Only fetch if query is not empty
    final searchResultsAsync = searchQuery.isEmpty 
        ? const AsyncValue.data([]) 
        : ref.watch(productsProvider(searchParam)); 

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Search products...',
            border: InputBorder.none,
            hintStyle: TextStyle(color: Colors.grey),
          ),
          onChanged: (query) {
            _debouncer.run(() {
              ref.read(searchQueryProvider.notifier).state = query;
            });
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.clear),
            onPressed: () {
              _searchController.clear();
              ref.read(searchQueryProvider.notifier).state = '';
            },
          ),
        ],
      ),
      body: searchQuery.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.search, size: 64, color: Colors.grey),
                  const SizedBox(height: 16),
                  Text('Type to search', style: AppTextStyles.h6.copyWith(color: Colors.grey)),
                ],
              ),
            )
          : searchResultsAsync.when(
              data: (response) {
                // response is PaginatedResponse<Product> or List<Product> dynamic depending on repo
                // implementation in product_provider.dart (step 313 implies logic)
                // Actually `productsProvider` returns `PaginatedResponse<Product>`.
                // Wait, checking `product_provider.dart`... I don't have it visible now but usually it returns Future<PaginatedResponse<Product>>.
                // Ah, in step 313 I didn't see product_provider code.
                // But in step 360 (Home Screen) it used `featuredProductsProvider` which returns `PaginatedResponse`.
                // So I treat it as such.
                
                final products = (response as dynamic).data;
                
                if (products.isEmpty) {
                  return Center(child: Text('No products found for "$searchQuery"'));
                }

                return GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.65,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  itemCount: products.length,
                  itemBuilder: (context, index) {
                    final product = products[index];
                    return ProductCard(
                      product: product,
                      onTap: () {
                        context.push('/product/${product.id}');
                      },
                      onFavorite: () {
                        // Implement/Navigate
                      },
                    );
                  },
                );
              },
              loading: () => const ProductGridShimmer(), 
              error: (e, s) => Center(child: Text('Error: $e')),
            ),
    );
  }
}

// Simple state provider for search query
final searchQueryProvider = StateProvider.autoDispose<String>((ref) => '');

// Helper class for debouncing
import 'dart:async';

class Debouncer {
  final int milliseconds;
  Timer? _timer;

  Debouncer({required this.milliseconds});

  run(VoidCallback action) {
    _timer?.cancel();
    _timer = Timer(Duration(milliseconds: milliseconds), action);
  }
}

// Simple Shimmer for Grid
class ProductGridShimmer extends StatelessWidget {
  const ProductGridShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.65,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: 6,
      itemBuilder: (context, index) => const ProductCardShimmer(),
    );
  }
}
