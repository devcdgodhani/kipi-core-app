import { CustomerAppSettingsModel } from '../models/customerAppSettingsModel';
import { CUSTOMER_APP_SETTINGS_STATUS } from '../../../constants/customerAppSettings';

export const seedCustomerAppSettings = async () => {
  try {
    const existingSettings = await CustomerAppSettingsModel.findOne({ isDefault: true });
    
    if (existingSettings) {
      console.log('⚠️ Default customer app settings already exist. Skipping seeding.');
      return;
    }

    const defaultSettings = {
      sections: [
        {
          sectionId: 'BANNER',
          isVisible: true,
          displayOrder: 1,
          title: '',
          subtitle: '',
        },
        {
          sectionId: 'FLASH_DEALS',
          isVisible: true,
          displayOrder: 2,
          title: 'Flash Deals',
          subtitle: 'Limited time offers',
          viewAllLink: '/products?filter=flash-deals',
          viewAllText: 'View All',
          limit: 8,
        },
        {
          sectionId: 'FEATURES',
          isVisible: true,
          displayOrder: 3,
        },
        {
          sectionId: 'NEW_ARRIVALS',
          isVisible: true,
          displayOrder: 4,
          title: 'Trending Now',
          subtitle: 'Fresh Drops',
          viewAllLink: '/products',
          viewAllText: 'View All',
          limit: 8,
        },
        {
          sectionId: 'RECENTLY_VIEWED',
          isVisible: true,
          displayOrder: 5,
          title: 'Recently Viewed',
          subtitle: 'Pick up where you left off',
        },
        {
          sectionId: 'RECOMMENDATIONS',
          isVisible: true,
          displayOrder: 6,
          title: 'Recommended for You',
          subtitle: 'Based on your style',
          limit: 4,
        },
      ],
      features: [
        {
          icon: 'Truck',
          title: 'Global Shipping',
          description: 'Free express delivery on all orders over $200',
          isActive: true,
          displayOrder: 1,
        },
        {
          icon: 'ShieldCheck',
          title: 'Secure Payment',
          description: '100% secure transaction with encrypted checkout',
          isActive: true,
          displayOrder: 2,
        },
        {
          icon: 'RefreshCw',
          title: 'Easy Returns',
          description: '30-day return policy for a hassle-free experience',
          isActive: true,
          displayOrder: 3,
        },
      ],
      footer: {
        brand: {
          name: 'Kipi',
          tagline: 'Modern Elegance',
          description: 'Redefining modern elegance with curated collections for the discerning individual.',
        },
        socialLinks: [
          { platform: 'Facebook', url: '#', isActive: true },
          { platform: 'Twitter', url: '#', isActive: true },
          { platform: 'Instagram', url: '#', isActive: true },
        ],
        columns: [
          {
            title: 'Shop',
            links: [
              { label: 'New Arrivals', url: '#', isActive: true },
              { label: 'Best Sellers', url: '#', isActive: true },
              { label: "Men's Collection", url: '#', isActive: true },
              { label: "Women's Collection", url: '#', isActive: true },
              { label: 'Accessories', url: '#', isActive: true },
            ],
            displayOrder: 1,
          },
          {
            title: 'Support',
            links: [
              { label: 'Help Center', url: '#', isActive: true },
              { label: 'Shipping & Returns', url: '#', isActive: true },
              { label: 'Size Guide', url: '#', isActive: true },
              { label: 'Track Order', url: '#', isActive: true },
              { label: 'Privacy Policy', url: '#', isActive: true },
            ],
            displayOrder: 2,
          },
          {
            title: 'Contact',
            links: [],
            displayOrder: 3,
          },
        ],
        contact: {
          address: '123 Fashion Ave, NY 10001',
          phone: '+1 (555) 123-4567',
          email: 'support@kipi.com',
        },
        copyright: '© 2026 Kipi Inc. All rights reserved.',
        language: 'English (US)',
        currency: 'USD ($)',
      },
      appName: 'Kipi',
      status: CUSTOMER_APP_SETTINGS_STATUS.ACTIVE,
      isDefault: true,
    };

    await CustomerAppSettingsModel.create(defaultSettings);
    console.log('✅ Customer app settings seeded successfully.');
  } catch (error) {
    console.error('❌ Error seeding customer app settings:', error);
  }
};
