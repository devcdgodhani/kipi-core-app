import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/product_provider.dart';
import '../../../core/widgets/product_card.dart';
import '../../../core/widgets/shimmer_loader.dart';
import '../../../theme/app_theme.dart';
import '../../../theme/app_text_styles.dart';
import 'package:go_router/go_router.dart';

class ProductListScreen extends ConsumerStatefulWidget {
  final String? categoryId;
  final String? categoryName;

  const ProductListScreen({
    this.categoryId,
    this.categoryName,
    super.key,
  });

  @override
  ConsumerState<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends ConsumerState<ProductListScreen> {
  final ScrollController _scrollController = ScrollController();
  ProductFilters _filters = const ProductFilters();
  bool _isGridView = true;

  @override
  void initState() {
    super.initState();
    _filters = ProductFilters(categoryId: widget.categoryId);
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      // Load more when near bottom
      ref.read(productListProvider(filters: _filters).notifier).loadMore();
    }
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => _FilterSheet(
        currentFilters: _filters,
        onApply: (newFilters) {
          setState(() {
            _filters = newFilters;
          });
          ref.read(productListProvider(filters: _filters).notifier).reset();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(productListProvider(filters: _filters));

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.categoryName ?? 'Products'),
        actions: [
          IconButton(
            icon: Icon(_isGridView ? Icons.view_list : Icons.grid_view),
            onPressed: () {
              setState(() {
                _isGridView = !_isGridView;
              });
            },
          ),
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterSheet,
          ),
        ],
      ),
      body: productsAsync.when(
        data: (response) {
          if (response.data.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shopping_bag_outlined, size: 64),
                  SizedBox(height: 16),
                  Text('No products found'),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.read(productListProvider(filters: _filters).notifier).reset();
            },
            child: _isGridView
                ? GridView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.65,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    itemCount: response.data.length,
                    itemBuilder: (context, index) {
                      final product = response.data[index];
                      return ProductCard(
                        product: product,
                        onTap: () {
                          context.push('/product/${product.id}');
                        },
                      );
                    },
                  )
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: response.data.length,
                    itemBuilder: (context, index) {
                      final product = response.data[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: ProductCard(
                          product: product,
                          onTap: () {
                            context.push('/product/${product.id}');
                          },
                        ),
                      );
                    },
                  ),
          );
        },
        loading: () => GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.65,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: 6,
          itemBuilder: (context, index) => const ProductCardShimmer(),
        ),
        error: (error, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64),
              const SizedBox(height: 16),
              Text('Error: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  ref.read(productListProvider(filters: _filters).notifier).reset();
                },
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FilterSheet extends StatefulWidget {
  final ProductFilters currentFilters;
  final Function(ProductFilters) onApply;

  const _FilterSheet({
    required this.currentFilters,
    required this.onApply,
  });

  @override
  State<_FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends State<_FilterSheet> {
  late RangeValues _priceRange;
  String? _sortBy;

  @override
  void initState() {
    super.initState();
    _priceRange = RangeValues(
      widget.currentFilters.minPrice ?? 0,
      widget.currentFilters.maxPrice ?? 10000,
    );
    _sortBy = widget.currentFilters.sortBy;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Filters', style: AppTextStyles.h5),
              TextButton(
                onPressed: () {
                  setState(() {
                    _priceRange = const RangeValues(0, 10000);
                    _sortBy = null;
                  });
                },
                child: const Text('Clear All'),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Text('Price Range', style: AppTextStyles.labelLarge),
          RangeSlider(
            values: _priceRange,
            min: 0,
            max: 10000,
            divisions: 100,
            labels: RangeLabels(
              '₹${_priceRange.start.round()}',
              '₹${_priceRange.end.round()}',
            ),
            onChanged: (values) {
              setState(() {
                _priceRange = values;
              });
            },
          ),
          const SizedBox(height: 24),
          Text('Sort By', style: AppTextStyles.labelLarge),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: [
              ChoiceChip(
                label: const Text('Price: Low to High'),
                selected: _sortBy == 'price_asc',
                onSelected: (selected) {
                  setState(() {
                    _sortBy = selected ? 'price_asc' : null;
                  });
                },
              ),
              ChoiceChip(
                label: const Text('Price: High to Low'),
                selected: _sortBy == 'price_desc',
                onSelected: (selected) {
                  setState(() {
                    _sortBy = selected ? 'price_desc' : null;
                  });
                },
              ),
              ChoiceChip(
                label: const Text('Newest'),
                selected: _sortBy == 'newest',
                onSelected: (selected) {
                  setState(() {
                    _sortBy = selected ? 'newest' : null;
                  });
                },
              ),
            ],
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                widget.onApply(
                  ProductFilters(
                    categoryId: widget.currentFilters.categoryId,
                    minPrice: _priceRange.start,
                    maxPrice: _priceRange.end,
                    sortBy: _sortBy,
                  ),
                );
                Navigator.pop(context);
              },
              child: const Text('Apply Filters'),
            ),
          ),
        ],
      ),
    );
  }
}
