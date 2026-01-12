import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/order_provider.dart';
import '../../../theme/app_theme.dart';
import '../../../theme/app_text_styles.dart';
import '../../../core/constants/app_constants.dart';

class OrderDetailScreen extends ConsumerWidget {
  final String orderId;

  const OrderDetailScreen({required this.orderId, super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(orderDetailProvider(orderId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Order Details'),
      ),
      body: orderAsync.when(
        data: (order) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Order Info Card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Order ID', style: AppTextStyles.labelMedium.copyWith(color: AppColors.textSecondary)),
                            Text('#${order.orderNumber}', style: AppTextStyles.labelLarge),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Date', style: AppTextStyles.labelMedium.copyWith(color: AppColors.textSecondary)),
                            Text(
                              order.createdAt != null
                                  ? DateFormat('MMM dd, yyyy hh:mm a').format(order.createdAt!)
                                  : 'N/A',
                              style: AppTextStyles.bodyMedium,
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                         Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Status', style: AppTextStyles.labelMedium.copyWith(color: AppColors.textSecondary)),
                            Text(order.status, style: AppTextStyles.labelLarge.copyWith(color: AppColors.primary)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: 24),
                Text('Items', style: AppTextStyles.h6),
                const SizedBox(height: 12),
                
                // Items List
                ...order.items.map((item) => Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: item.productImage != null
                              ? CachedNetworkImage(
                                  imageUrl: item.productImage!,
                                  width: 60,
                                  height: 60,
                                  fit: BoxFit.cover,
                                )
                              : Container(width: 60, height: 60, color: AppColors.surfaceVariant),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item.productName ?? 'Product', style: AppTextStyles.bodyMedium),
                              const SizedBox(height: 4),
                              Text('Qty: ${item.quantity}', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondary)),
                            ],
                          ),
                        ),
                        Text(
                          '${AppConstants.currencySymbol}${item.price.toStringAsFixed(0)}',
                          style: AppTextStyles.labelLarge,
                        ),
                      ],
                    ),
                  ),
                )).toList(),

                const SizedBox(height: 24),
                Text('Payment Summary', style: AppTextStyles.h6),
                const SizedBox(height: 12),
                
                // Payment Summary
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _buildSummaryRow('Subtotal', order.subtotal),
                        const SizedBox(height: 8),
                        _buildSummaryRow('Discount', -order.discount, isDiscount: true),
                        const SizedBox(height: 8),
                        _buildSummaryRow('Shipping', order.shippingCharge),
                        const Divider(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Total', style: AppTextStyles.h6),
                            Text(
                              '${AppConstants.currencySymbol}${order.total.toStringAsFixed(0)}',
                              style: AppTextStyles.h6.copyWith(color: AppColors.primary),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
      ),
    );
  }

  Widget _buildSummaryRow(String label, double amount, {bool isDiscount = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: AppTextStyles.bodyMedium),
        Text(
          '${AppConstants.currencySymbol}${amount.abs().toStringAsFixed(0)}',
          style: AppTextStyles.bodyMedium.copyWith(
            color: isDiscount ? AppColors.success : AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
