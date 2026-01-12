class AppConstants {
  // App Info
  static const String appName = 'Kipi Fashion';
  static const String appVersion = '1.0.0';
  
  // Storage Keys
  static const String accessTokenKey = 'ACCESS_TOKEN';
  static const String refreshTokenKey = 'REFRESH_TOKEN';
  static const String otpTokenKey = 'OTP_TOKEN';
  static const String userDataKey = 'USER_DATA';
  static const String cartKey = 'CART_DATA';
  static const String themeKey = 'THEME_MODE';
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 50;
  
  // Timeouts
  static const int connectionTimeout = 30000; // 30 seconds
  static const int receiveTimeout = 30000;
  
  // Image Placeholders
  static const String productPlaceholder = 'assets/images/product_placeholder.png';
  static const String avatarPlaceholder = 'assets/images/avatar_placeholder.png';
  
  // Validation
  static const int minPasswordLength = 8;
  static const int otpLength = 6;
  
  // Currency
  static const String currencySymbol = '₹';
  static const String currencyCode = 'INR';
}
