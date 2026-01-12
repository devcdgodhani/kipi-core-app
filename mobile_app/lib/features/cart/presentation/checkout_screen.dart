import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/widgets/kipi_button.dart';
import '../../../theme/app_theme.dart';
import '../../../theme/app_text_styles.dart';
import '../../address/domain/address_models.dart';
import '../../cart/providers/cart_provider.dart';
import '../../orders/providers/order_provider.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  Address? _selectedAddress;
  String _paymentMethod = 'COD'; // Default to Cash on Delivery

  @override
  Widget build(BuildContext context) {
    final cartAsync = ref.watch(cartNotifierProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: cartAsync.when(
        data: (cart) {
          if (cart.items.isEmpty) {
            return const Center(child: Text('Cart is empty'));
          }

          final subtotal = cart.subtotal ?? 0.0;
          final discount = cart.discount ?? 0.0;
          final total = cart.total ?? subtotal - discount;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Delivery Address Section
                Text('Delivery Address', style: AppTextStyles.h6),
                const SizedBox(height: 12),
                InkWell(
                  onTap: () async {
                    final result = await context.push<Address>('/addresses?selectionMode=true');
                    if (result != null) {
                      setState(() {
                        _selectedAddress = result;
                      });
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.border),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.location_on_outlined, color: AppColors.primary),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _selectedAddress == null
                              ? const Text('Select Address')
                              : Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(_selectedAddress!.name, style: AppTextStyles.labelLarge),
                                    Text(
                                      '${_selectedAddress!.addressLine1}, ${_selectedAddress!.city}',
                                      style: AppTextStyles.bodyMedium,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    Text(_selectedAddress!.mobile, style: AppTextStyles.bodyMedium),
                                  ],
                                ),
                        ),
                        const Icon(Icons.chevron_right),
                      ],
                    ),
                  ),
                ),
                if (_selectedAddress == null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      'Please select an address',
                      style: AppTextStyles.labelSmall.copyWith(color: AppColors.error),
                    ),
                  ),

                const SizedBox(height: 24),

                // Payment Method Section
                Text('Payment Method', style: AppTextStyles.h6),
                const SizedBox(height: 12),
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.border),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    children: [
                      RadioListTile<String>(
                        title: const Text('Cash on Delivery (COD)'),
                        value: 'COD',
                        groupValue: _paymentMethod,
                        onChanged: (val) {
                          setState(() => _paymentMethod = val!);
                        },
                      ),
                      const Divider(height: 1),
                       RadioListTile<String>(
                        title: const Text('Online Payment'),
                        value: 'ONLINE',
                        groupValue: _paymentMethod,
                        onChanged: (val) {
                          setState(() => _paymentMethod = val!);
                        },
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Order Summary Section
                Text('Order Summary', style: AppTextStyles.h6),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceVariant.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    children: [
                      _buildSummaryRow('Items (${cart.items.length})', subtotal),
                      const SizedBox(height: 8),
                      _buildSummaryRow('Discount', -discount, isDiscount: true),
                      const SizedBox(height: 8),
                      _buildSummaryRow('Shipping', 0.0), // Free shipping logic can be added
                      const Divider(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Total Amount', style: AppTextStyles.h6),
                          Text(
                            '${AppConstants.currencySymbol}${total.toStringAsFixed(0)}',
                            style: AppTextStyles.h6.copyWith(color: AppColors.primary),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                // Place Order Button
                KipiButton(
                  text: 'Place Order',
                  onPressed: _placeOrder,
                  isLoading: false, // Could hook up to a state
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
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

  Future<void> _placeOrder() async {
    if (_selectedAddress == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a delivery address')),
      );
      return;
    }

    try {
      // Simulate order placement via OrderRepository
      // Ideally we call createOrder on repository directly or via provider
       
      final orderData = {
        'items': ref.read(cartNotifierProvider).value!.items.map((item) => {
          'productId': item.productId,
          'skuId': item.skuId,
          'quantity': item.quantity,
          'price': item.price ?? item.salePrice,
        }).toList(),
        'shippingAddress': _selectedAddress!.toJson(), // Assuming toJson works or map manual
        'paymentMethod': _paymentMethod,
        // ... other required fields
      };

      // Since OrderRepository is not exposed via a Notifier for creation (just FutureProvider for list),
      // we can read the repository directly.
      final repo = ref.read(orderRepositoryProvider);
      // await repo.createOrder(orderData); // Uncomment when implemented fully
      
      // Clear Cart
      await ref.read(cartNotifierProvider.notifier).clearCart();

      if (mounted) {
        // Navigate to Success / Home
        ScaffoldMessenger.of(context).showSnackBar(
           const SnackBar(content: Text('Order placed successfully!')),
        );
        context.go('/orders'); // Or '/home'
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to place order: $e')),
        );
      }
    }
  }
}
