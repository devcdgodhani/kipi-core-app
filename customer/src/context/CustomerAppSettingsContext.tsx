import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CustomerAppSettings, HomePageSection, FeatureCard, FooterConfig } from '../types/customerAppSettings.types';
import { getActiveAppSettings } from '../services/customerAppSettings.service';

interface CustomerAppSettingsContextType {
  settings: CustomerAppSettings | null;
  isLoading: boolean;
  error: string | null;
  getSection: (sectionId: string) => HomePageSection | undefined;
  getVisibleSections: () => HomePageSection[];
  getFeatures: () => FeatureCard[];
  getFooter: () => FooterConfig | undefined;
}

const CustomerAppSettingsContext = createContext<CustomerAppSettingsContextType | undefined>(undefined);

export const CustomerAppSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CustomerAppSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getActiveAppSettings();
        setSettings(data);

        // Set document title if appName is available
        if (data.appName) {
          document.title = data.appName;
        }

        if (data.favicon) {
          const faviconUrl = typeof data.favicon === 'string' ? data.favicon : data.favicon.preSignedUrl;
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = faviconUrl;
        }
      } catch (err) {
        console.error('Failed to fetch app settings:', err);
        setError('Failed to load application settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const getSection = (sectionId: string) => {
    return settings?.sections.find(s => s.sectionId === sectionId);
  };

  const getVisibleSections = () => {
    return settings?.sections
      .filter(s => s.isVisible)
      .sort((a, b) => a.displayOrder - b.displayOrder) || [];
  };

  const getFeatures = () => {
    return settings?.features
      .filter(f => f.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder) || [];
  };

  const getFooter = () => {
    return settings?.footer;
  };

  return (
    <CustomerAppSettingsContext.Provider
      value={{
        settings,
        isLoading,
        error,
        getSection,
        getVisibleSections,
        getFeatures,
        getFooter,
      }}
    >
      {children}
    </CustomerAppSettingsContext.Provider>
  );
};

export const useCustomerAppSettings = (): CustomerAppSettingsContextType => {
  const context = useContext(CustomerAppSettingsContext);
  if (context === undefined) {
    throw new Error('useCustomerAppSettings must be used within a CustomerAppSettingsProvider');
  }
  return context;
};
