import { LOCAL_STORAGE_KEYS } from '../../constants';

export class TokenManager {
  static getAccessToken(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  }

  static setAccessToken(token: string): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  static clearTokens(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  }
}
