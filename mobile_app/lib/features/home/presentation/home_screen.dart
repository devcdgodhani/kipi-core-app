import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../providers/home_provider.dart';
import '../../../theme/app_theme.dart';
import '../../../theme/app_text_styles.dart';
import '../../../core/widgets/product_card.dart';
import '../../../core/widgets/shimmer_loader.dart';
import '../../../common/models/product_model.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bannersAsync = ref.watch(bannersProvider);
    final categoriesAsync = ref.watch(categoriesProvider);
    final productsAsync = ref.watch(featuredProductsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'KIPI',
          style: AppTextStyles.h5.copyWith(
            letterSpacing: 3,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              context.push('/search');
            },
          ),
          IconButton(
            icon: const Icon(Icons.favorite_border),
            onPressed: () {
              context.go('/wishlist');
            },
          ),
          IconButton(
            icon: const Icon(Icons.shopping_bag_outlined),
            onPressed: () {
              context.push('/cart');
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(bannersProvider);
          ref.invalidate(categoriesProvider);
          ref.invalidate(featuredProductsProvider);
        },
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Banners Section
              bannersAsync.when(
                data: (banners) => banners.isEmpty
                    ? const SizedBox.shrink()
                    : _BannerCarousel(banners: banners),
                loading: () => const Padding(
                  padding: EdgeInsets.all(16),
                  child: BannerShimmer(),
                ),
                error: (error, _) => const SizedBox.shrink(),
              ),

              const SizedBox(height: 24),

              // Categories Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Shop by Category',
                      style: AppTextStyles.h5,
                    ),
                    TextButton(
                      onPressed: () {
                        context.go('/categories');
                      },
                      child: const Text('See All'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              categoriesAsync.when(
                data: (categories) => categories.isEmpty
                    ? const SizedBox.shrink()
                    : _CategoryList(categories: categories),
                loading: () => SizedBox(
                  height: 100,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: 5,
                    itemBuilder: (context, index) => const Padding(
                      padding: EdgeInsets.only(right: 12),
                      child: CategoryChipShimmer(),
                    ),
                  ),
                ),
                error: (error, _) => const SizedBox.shrink(),
              ),

              const SizedBox(height: 32),

              // Featured Products
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Featured Products',
                      style: AppTextStyles.h5,
                    ),
                    TextButton(
                      onPressed: () {
                        context.push('/products');
                      },
                      child: const Text('See All'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              productsAsync.when(
                data: (response) => response.data.isEmpty
                    ? const Center(
                        child: Padding(
                          padding: EdgeInsets.all(32),
                          child: Text('No products available'),
                        ),
                      )
                    : _ProductGrid(products: response.data),
                loading: () => Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.65,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    itemCount: 6,
                    itemBuilder: (context, index) => const ProductCardShimmer(),
                  ),
                ),
                error: (error, _) => Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      children: [
                        const Icon(Icons.error_outline, size: 48),
                        const SizedBox(height: 16),
                        Text('Error loading products: $error'),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}

class _BannerCarousel extends StatelessWidget {
  final List banners;

  const _BannerCarousel({required this.banners});

  @override
  Widget build(BuildContext context) {
    return CarouselSlider.builder(
      itemCount: banners.length,
      options: CarouselOptions(
        height: 200,
        viewportFraction: 0.9,
        autoPlay: true,
        autoPlayInterval: const Duration(seconds: 5),
        enlargeCenterPage: true,
      ),
      itemBuilder: (context, index, realIndex) {
        final banner = banners[index];
        return GestureDetector(
          onTap: () {
             if (banner.link != null) {
               // Handle deep links or internal navigation based on linkType
               // For now, just print or show snackbar if not implemented
             }
          },
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: AppColors.scrim,
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: banner.image != null
                  ? CachedNetworkImage(
                      imageUrl: banner.image!,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: AppColors.surfaceVariant,
                        child: const Center(
                          child: CircularProgressIndicator(),
                        ),
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: AppColors.surfaceVariant,
                        child: const Icon(Icons.image_not_supported),
                      ),
                    )
                  : Container(
                      color: AppColors.primary,
                      child: Center(
                        child: Text(
                          banner.title,
                          style: AppTextStyles.h4.copyWith(
                            color: AppColors.textOnPrimary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
            ),
          ),
        );
      },
    );
  }
}

class _CategoryList extends StatelessWidget {
  final List<Category> categories;

  const _CategoryList({required this.categories});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final category = categories[index];
          return GestureDetector(
            onTap: () {
               context.push('/products?categoryId=${category.id}&categoryName=${Uri.encodeComponent(category.name)}');
            },
            child: Container(
              width: 80,
              margin: const EdgeInsets.only(right: 12),
              child: Column(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.border),
                    ),
                    child: category.image != null
                        ? ClipOval(
                            child: CachedNetworkImage(
                              imageUrl: category.image!,
                              fit: BoxFit.cover,
                              errorWidget: (context, url, error) =>
                                  const Icon(Icons.category),
                            ),
                          )
                        : const Icon(Icons.category, size: 32),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    category.name,
                    style: AppTextStyles.labelSmall,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _ProductGrid extends StatelessWidget {
  final List<Product> products;

  const _ProductGrid({required this.products});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
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
               // We need a provider context or callback here to handle favorite toggle properly 
               // For simple grids, usually passed from parent or accessed via Consumer
               // Since _ProductGrid is stateless and doesn't have ref easily without Consumer, 
               // we should ideally wrap or pass callback. 
               // For now, leaving as TODO/Navigation to details.
               context.push('/product/${product.id}');
            },
          );
        },
      ),
    );
  }
}
