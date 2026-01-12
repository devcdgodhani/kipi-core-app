import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/kipi_button.dart';
import '../../../theme/app_theme.dart';
import '../../../theme/app_text_styles.dart';
import '../domain/address_models.dart';
import '../providers/address_provider.dart';

class AddressListScreen extends ConsumerWidget {
  final bool isSelectionMode;

  const AddressListScreen({
    this.isSelectionMode = false,
    super.key,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final addressesAsync = ref.watch(addressNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(isSelectionMode ? 'Select Address' : 'My Addresses'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              context.push('/addresses/add');
            },
          ),
        ],
      ),
      body: addressesAsync.when(
        data: (addresses) {
          if (addresses.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.location_off_outlined, size: 64, color: AppColors.textHint),
                  const SizedBox(height: 16),
                  Text('No addresses found', style: AppTextStyles.h6),
                  const SizedBox(height: 16),
                  KipiButton(
                    text: 'Add New Address',
                    onPressed: () {
                      context.push('/addresses/add');
                    },
                    width: 200,
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: addresses.length,
            itemBuilder: (context, index) {
              final address = addresses[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: InkWell(
                  onTap: isSelectionMode
                      ? () => context.pop(address)
                      : null,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                address.type,
                                style: AppTextStyles.labelSmall.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            if (address.isDefault) ...[
                              const SizedBox(width: 8),
                              Text(
                                '(Default)',
                                style: AppTextStyles.labelSmall.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                            const Spacer(),
                            if (!isSelectionMode)
                              Row(
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.edit, size: 20),
                                    onPressed: () {
                                      context.push('/addresses/edit', extra: address);
                                    },
                                    constraints: const BoxConstraints(),
                                    padding: EdgeInsets.zero,
                                  ),
                                  const SizedBox(width: 16),
                                  IconButton(
                                    icon: const Icon(Icons.delete_outline, size: 20, color: AppColors.error),
                                    onPressed: () {
                                      // Confirm delete
                                      showDialog(
                                        context: context,
                                        builder: (context) => AlertDialog(
                                          title: const Text('Delete Address'),
                                          content: const Text('Are you sure you want to delete this address?'),
                                          actions: [
                                            TextButton(
                                              onPressed: () => Navigator.pop(context),
                                              child: const Text('Cancel'),
                                            ),
                                            TextButton(
                                              onPressed: () {
                                                ref.read(addressNotifierProvider.notifier).deleteAddress(address.id!);
                                                Navigator.pop(context);
                                              },
                                              child: const Text('Delete'),
                                            ),
                                          ],
                                        ),
                                      );
                                    },
                                    constraints: const BoxConstraints(),
                                    padding: EdgeInsets.zero,
                                  ),
                                ],
                              ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(address.name, style: AppTextStyles.h6),
                        const SizedBox(height: 4),
                        Text(address.mobile, style: AppTextStyles.bodyMedium),
                        const SizedBox(height: 8),
                        Text(
                          '${address.addressLine1}, ${address.addressLine2 ?? ''}',
                          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                        ),
                        Text(
                          '${address.city}, ${address.state} - ${address.pincode}',
                          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
      ),
    );
  }
}
