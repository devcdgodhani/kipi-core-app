import http from './http';

export interface Banner {
  _id: string;
  name: string;
  image: string;
  link?: string;
  linkType?: 'PRODUCT' | 'CATEGORY' | 'EXTERNAL';
  isActive: boolean;
}

export interface CustomerAppSettings {
  sections: any[];
  features: any[];
  footer: any;
  appName: string;
}

export const configService = {
  getAppSettings: async (): Promise<CustomerAppSettings> => {
    const response: any = await http.get('/app-settings/active');
    return response.data;
  },

  getActiveBanners: async (): Promise<Banner[]> => {
    const response: any = await http.get('/banner/getActive');
    return response.data;
  },
};
