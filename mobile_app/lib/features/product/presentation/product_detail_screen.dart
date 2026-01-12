import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../cart/providers/cart_provider.dart';
import '../../wishlist/providers/wishlist_provider.dart';
import '../providers/product_provider.dart';
import '../../../theme/app_theme.dart';
import '../../../theme/app_text_styles.dart';
import '../../../core/widgets/kipi_button.dart';
import '../../../core/constants/app_constants.dart';
import '../../../common/models/product_model.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final String productId;

  const ProductDetailScreen({
    required this.productId,
    super.key,
  });

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  SKU? _selectedSKU;
  int _quantity = 1;

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productProvider(widget.productId));
    final skusAsync = ref.watch(productSKUsProvider(widget.productId));

    return Scaffold(
      body: productAsync.when(
        data: (product) => CustomScrollView(
          slivers: [
            // App Bar with Image
            SliverAppBar(
              expandedHeight: 400,
              pinned: true,
              flexibleSpace: FlexibleSpaceBar(
                background: product.images != null && product.images!.isNotEmpty
                    ? CarouselSlider.builder(
                        itemCount: product.images!.length,
                        options: CarouselOptions(
                          height: 400,
                          viewportFraction: 1.0,
                          enableInfiniteScroll: product.images!.length > 1,
                        ),
                        itemBuilder: (context, index, realIndex) {
                          return CachedNetworkImage(
                            imageUrl: product.images![index],
                            width: double.infinity,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => Container(
                              color: AppColors.surfaceVariant,
                              child: const Center(
                                child: CircularProgressIndicator(),
                              ),
                            ),
                          );
                        },
                      )
                    : Container(
                        color: AppColors.surfaceVariant,
                        child: const Icon(Icons.image, size: 64),
                      ),
              ),
            ),

            // Product Info
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Product Name
                    Text(
                      product.name,
                      style: AppTextStyles.h4,
                    ),

                    const SizedBox(height: 8),

                    // Rating
                    if (product.rating != null && product.rating! > 0)
                      Row(
                        children: [
                          const Icon(Icons.star, color: AppColors.warning, size: 20),
                          const SizedBox(width: 4),
                          Text(
                            product.rating!.toStringAsFixed(1),
                            style: AppTextStyles.labelLarge,
                          ),
                          if (product.reviewCount != null)
                            Text(
                              ' (${product.reviewCount} reviews)',
                              style: AppTextStyles.labelMedium.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                        ],
                      ),

                    const SizedBox(height: 16),

                    // Price
                    Row(
                      children: [
                        Text(
                          '${AppConstants.currencySymbol}${(_selectedSKU?.salePrice ?? product.salePrice ?? product.basePrice ?? 0).toStringAsFixed(0)}',
                          style: AppTextStyles.h3.copyWith(
                            color: AppColors.primary,
                          ),
                        ),
                        if ((product.salePrice ?? 0) < (product.basePrice ?? 0)) ...[
                          const SizedBox(width: 12),
                          Text(
                            '${AppConstants.currencySymbol}${product.basePrice!.toStringAsFixed(0)}',
                            style: AppTextStyles.priceStrikethrough.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.error,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '${(((product.basePrice! - product.salePrice!) / product.basePrice!) * 100).round()}% OFF',
                              style: AppTextStyles.labelSmall.copyWith(
                                color: AppColors.textOnPrimary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),

                    const SizedBox(height: 24),

                    // SKU Selection
                    skusAsync.when(
                      data: (skus) {
                        if (skus.isEmpty) return const SizedBox.shrink();

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Select Variant', style: AppTextStyles.labelLarge),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: skus.map((sku) {
                                final isSelected = _selectedSKU?.id == sku.id;
                                final isOutOfStock = (sku.stock ?? 0) <= 0;

                                return GestureDetector(
                                  onTap: isOutOfStock
                                      ? null
                                      : () {
                                          setState(() {
                                            _selectedSKU = sku;
                                          });
                                        },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: 12,
                                    ),
                                    decoration: BoxDecoration(
                                      color: isSelected
                                          ? AppColors.primary
                                          : AppColors.surface,
                                      border: Border.all(
                                        color: isSelected
                                            ? AppColors.primary
                                            : AppColors.border,
                                        width: isSelected ? 2 : 1,
                                      ),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      sku.attributes?['size'] ?? sku.sku,
                                      style: AppTextStyles.labelMedium.copyWith(
                                        color: isSelected
                                            ? AppColors.textOnPrimary
                                            : isOutOfStock
                                                ? AppColors.textHint
                                                : AppColors.textPrimary,
                                        decoration: isOutOfStock
                                            ? TextDecoration.lineThrough
                                            : null,
                                      ),
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 24),
                          ],
                        );
                      },
                      loading: () => const SizedBox.shrink(),
                      error: (_, __) => const SizedBox.shrink(),
                    ),

                    // Quantity Selector
                    Row(
                      children: [
                        Text('Quantity', style: AppTextStyles.labelLarge),
                        const SizedBox(width: 16),
                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(color: AppColors.border),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.remove),
                                onPressed: _quantity > 1
                                    ? () {
                                        setState(() {
                                          _quantity--;
                                        });
                                      }
                                    : null,
                              ),
                              Text(
                                _quantity.toString(),
                                style: AppTextStyles.labelLarge,
                              ),
                              IconButton(
                                icon: const Icon(Icons.add),
                                onPressed: () {
                                  setState(() {
                                    _quantity++;
                                  });
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),
                    const Divider(),
                    const SizedBox(height: 16),

                    // Description
                    if (product.description != null) ...[
                      Text('Description', style: AppTextStyles.h6),
                      const SizedBox(height: 8),
                      Text(
                        product.description!,
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 100), // Space for bottom bar
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64),
              const SizedBox(height: 16),
              Text('Error: $error'),
            ],
          ),
        ),
      ),
      bottomNavigationBar: productAsync.when(
        data: (product) {
          final isInWishlist = ref.watch(wishlistNotifierProvider.select(
            (state) => state.value?.any((item) => item.productId == product.id) ?? false,
          ));
          
          return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            boxShadow: [
              BoxShadow(
                color: AppColors.scrim,
                blurRadius: 8,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: Row(
            children: [
              Expanded(
                child: KipiButton(
                  text: 'Add to Cart',
                  icon: Icons.shopping_cart_outlined,
                  onPressed: () {
                    // Check if SKU is selected for variable products (if implementation detailed, otherwise just add)
                    // For now assuming simple or pre-selected logic, but ideally enforce SKU if needed
                    // Using first SKU as fallback or product ID directly if simple product
                    
                    final skuId = _selectedSKU?.id; 
                    // Note: In a real app we'd validate if _selectedSKU is required.
                     
                     ref.read(cartNotifierProvider.notifier).addToCart(
                            productId: product.id,
                            skuId: skuId ?? product.id, // Fallback might need adjustment based on backend
                            quantity: _quantity,
                          ).then((_) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Added to cart')),
                            );
                          }).catchError((e) {
                             ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Error: $e')),
                            );
                          });
                  },
                ),
              ),
              const SizedBox(width: 12),
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: IconButton(
                  icon: Icon(
                    isInWishlist ? Icons.favorite : Icons.favorite_border,
                    color: isInWishlist ? AppColors.error : null,
                  ),
                  onPressed: () {
                     final notifier = ref.read(wishlistNotifierProvider.notifier);
                     if (isInWishlist) {
                       notifier.removeFromWishlist(product.id);
                     } else {
                       notifier.addToWishlist(productId: product.id);
                     }
                  },
                ),
              ),
            ],
          );
        },
        loading: () => const SizedBox.shrink(),
        error: (_, __) => const SizedBox.shrink(),
      ),
    );
  }
}
