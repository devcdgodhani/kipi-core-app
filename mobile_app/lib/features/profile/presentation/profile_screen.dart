import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../theme/app_theme.dart';
import '../../../theme/app_text_styles.dart';
import '../../../core/constants/app_constants.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.value;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // User Info
            if (user != null)
              Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: AppColors.primary,
                    child: Text(
                      (user.firstName?[0] ?? '') + (user.lastName?[0] ?? ''),
                      style: AppTextStyles.h4.copyWith(color: AppColors.textOnPrimary),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '${user.firstName} ${user.lastName}',
                    style: AppTextStyles.h5,
                  ),
                  Text(
                    user.email ?? '',
                    style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                  ),
                  if (user.phone != null)
                     Text(
                      user.phone!,
                      style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                    ),
                ],
              ),
            
            const SizedBox(height: 32),
            
            // Menu Items
            _ProfileMenuItem(
              icon: Icons.list_alt,
              title: 'My Orders',
              onTap: () {
                context.push('/orders');
              },
            ),
            _ProfileMenuItem(
              icon: Icons.location_on_outlined,
              title: 'Addresses',
              onTap: () {
                context.push('/addresses');
              },
            ),
            _ProfileMenuItem(
              icon: Icons.favorite_border,
              title: 'Wishlist',
              onTap: () {
                context.push('/wishlist');
              },
            ),
            _ProfileMenuItem(
              icon: Icons.account_balance_wallet_outlined,
              title: 'My Wallet',
              onTap: () {
                context.push('/wallet');
              },
            ),
            _ProfileMenuItem(
              icon: Icons.settings_outlined,
              title: 'Settings',
              onTap: () {
                 ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Settings coming soon')));
              },
            ),
            
            const SizedBox(height: 24),
            
            // Logout Button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {
                  ref.read(authProvider.notifier).logout();
                  // Router will likely handle redirection to Login due to auth guard
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.error,
                  side: const BorderSide(color: AppColors.error),
                ),
                child: const Text('Logout'),
              ),
            ),
             const SizedBox(height: 16),
             Text(
               'Version 1.0.0',
               style: AppTextStyles.labelSmall.copyWith(color: AppColors.textHint),
             ),
          ],
        ),
      ),
    );
  }
}

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _ProfileMenuItem({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppColors.textPrimary),
      title: Text(title, style: AppTextStyles.bodyMedium),
      trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
      onTap: onTap,
      contentPadding: EdgeInsets.zero,
    );
  }
}
