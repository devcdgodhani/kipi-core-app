import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../common/models/product_model.dart';
import '../../theme/app_theme.dart';
import '../../theme/app_text_styles.dart';
import '../../core/constants/app_constants.dart';

class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback? onTap;
  final VoidCallback? onFavorite;
  final bool isFavorite;

  const ProductCard({
    required this.product,
    this.onTap,
    this.onFavorite,
    this.isFavorite = false,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final hasDiscount = product.salePrice != null &&
        product.basePrice != null &&
        product.salePrice! < product.basePrice!;

    final discountPercentage = hasDiscount
        ? (((product.basePrice! - product.salePrice!) / product.basePrice!) * 100)
            .round()
        : 0;

    final displayPrice = product.salePrice ?? product.basePrice ?? 0.0;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Section
            Expanded(
              child: Stack(
                children: [
                  // Product Image
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(12),
                    ),
                    child: product.images != null && product.images!.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: product.images!.first,
                            width: double.infinity,
                            height: double.infinity,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => Container(
                              color: AppColors.surfaceVariant,
                              child: const Center(
                                child: CircularProgressIndicator(strokeWidth: 2),
                              ),
                            ),
                            errorWidget: (context, url, error) => Container(
                              color: AppColors.surfaceVariant,
                              child: const Icon(Icons.image_not_supported),
                            ),
                          )
                        : Container(
                            color: AppColors.surfaceVariant,
                            child: const Icon(Icons.image, size: 48),
                          ),
                  ),

                  // Badges
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (product.isNewArrival == true)
                          _Badge(
                            text: 'NEW',
                            color: AppColors.info,
                          ),
                        if (hasDiscount)
                          _Badge(
                            text: '$discountPercentage% OFF',
                            color: AppColors.error,
                          ),
                      ],
                    ),
                  ),

                  // Favorite Button
                  if (onFavorite != null)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: GestureDetector(
                        onTap: onFavorite,
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppColors.surface.withOpacity(0.9),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            isFavorite ? Icons.favorite : Icons.favorite_border,
                            size: 20,
                            color: isFavorite ? AppColors.error : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Product Info
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Product Name
                  Text(
                    product.name,
                    style: AppTextStyles.bodyMedium.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  const SizedBox(height: 8),

                  // Price Row
                  Row(
                    children: [
                      Text(
                        '${AppConstants.currencySymbol}${displayPrice.toStringAsFixed(0)}',
                        style: AppTextStyles.priceRegular.copyWith(
                          color: AppColors.primary,
                        ),
                      ),
                      if (hasDiscount) ...[
                        const SizedBox(width: 8),
                        Text(
                          '${AppConstants.currencySymbol}${product.basePrice!.toStringAsFixed(0)}',
                          style: AppTextStyles.priceStrikethrough.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ],
                  ),

                  // Rating (if available)
                  if (product.rating != null && product.rating! > 0) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(
                          Icons.star,
                          size: 14,
                          color: AppColors.warning,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          product.rating!.toStringAsFixed(1),
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        if (product.reviewCount != null && product.reviewCount! > 0)
                          Text(
                            ' (${product.reviewCount})',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final String text;
  final Color color;

  const _Badge({
    required this.text,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      margin: const EdgeInsets.only(bottom: 4),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        text,
        style: AppTextStyles.labelSmall.copyWith(
          color: AppColors.textOnPrimary,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
