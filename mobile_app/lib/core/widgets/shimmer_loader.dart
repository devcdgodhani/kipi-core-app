import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../theme/app_theme.dart';

class ShimmerLoader extends StatelessWidget {
  final double width;
  final double height;
  final BorderRadius? borderRadius;

  const ShimmerLoader({
    required this.width,
    required this.height,
    this.borderRadius,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.shimmerBase,
      highlightColor: AppColors.shimmerHighlight,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.shimmerBase,
          borderRadius: borderRadius ?? BorderRadius.circular(8),
        ),
      ),
    );
  }
}

class ProductCardShimmer extends StatelessWidget {
  const ProductCardShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image shimmer
          const Expanded(
            child: ShimmerLoader(
              width: double.infinity,
              height: double.infinity,
              borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
            ),
          ),

          // Info shimmer
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const ShimmerLoader(width: double.infinity, height: 14),
                const SizedBox(height: 8),
                const ShimmerLoader(width: 120, height: 14),
                const SizedBox(height: 12),
                const ShimmerLoader(width: 80, height: 18),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class BannerShimmer extends StatelessWidget {
  const BannerShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return const ShimmerLoader(
      width: double.infinity,
      height: 200,
      borderRadius: BorderRadius.all(Radius.circular(12)),
    );
  }
}

class CategoryChipShimmer extends StatelessWidget {
  const CategoryChipShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return const ShimmerLoader(
      width: 100,
      height: 40,
      borderRadius: BorderRadius.all(Radius.circular(20)),
    );
  }
}
