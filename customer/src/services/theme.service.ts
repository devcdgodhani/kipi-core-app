import http from './http';

export interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
}

export interface Theme {
    _id?: string;
    appName: 'admin' | 'customer';
    name?: string;
    colors: ThemeColors;
    status: 'ACTIVE' | 'INACTIVE';
}

export const themeService = {
    getByAppName: async (appName: string): Promise<{ data: Theme }> => {
        return http.get(`/themes/${appName}`);
    }
};
