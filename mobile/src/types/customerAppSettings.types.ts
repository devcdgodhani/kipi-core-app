export interface HomePageSection {
  sectionId: string;
  isVisible: boolean;
  displayOrder: number;
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllText?: string;
  limit?: number;
}

export interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
}

export interface SocialLink {
  platform: string;
  url: string;
  isActive: boolean;
}

export interface FooterLink {
  label: string;
  url: string;
  isActive: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
  displayOrder: number;
}

export interface FooterConfig {
  brand: {
    name: string;
    tagline: string;
    description: string;
  };
  socialLinks: SocialLink[];
  columns: FooterColumn[];
  contact: {
    address: string;
    phone: string;
    email: string;
  };
  copyright: string;
  language: string;
  currency: string;
}

export interface CustomerAppSettings {
  _id?: string;
  sections: HomePageSection[];
  features: FeatureCard[];
  footer: FooterConfig;
  logo?: string | { _id: string; preSignedUrl: string };
  appName: string;
  favicon?: string | { _id: string; preSignedUrl: string };
  status?: string;
  isDefault?: boolean;
}

export interface CustomerAppSettingsResponse {
  status: number;
  code: number;
  message: string;
  data: CustomerAppSettings;
}
