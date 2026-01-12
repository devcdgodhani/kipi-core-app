/// API Base URL - Update this based on your environment
class ApiConstants {
  static const String baseUrl = 'http://localhost:5000/api/v1';
  
  // Auth Endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String sendOtp = '/auth/sendOtp';
  static const String verifyOtp = '/auth/verifyOtp';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refreshTokens';
  static const String me = '/auth/me';
  static const String changePassword = '/auth/changePassword';
  static const String forgetPassword = '/auth/forgetPassword';
  
  // Product Endpoints
  static const String productGetAll = '/product/getAll';
  static const String productGetWithPagination = '/product/getWithPagination';
  static const String productGetOne = '/product/getOne';
  
  // SKU Endpoints
  static const String skuGetAll = '/sku/getAll';
  static const String skuGetOne = '/sku/getOne';
  
  // Category Endpoints
  static const String categoryGetAll = '/category/getAll';
  static const String categoryGetOne = '/category/getOne';
  
  // Cart Endpoints
  static const String cartGet = '/cart/get';
  static const String cartUpdate = '/cart/update';
  
  // Wishlist Endpoints
  static const String wishlistGetAll = '/wishlist/getAll';
  static const String wishlistAdd = '/wishlist/add';
  static const String wishlistRemove = '/wishlist/remove';
  
  // Address Endpoints
  static const String addressGetAll = '/address/getAll';
  static const String addressCreate = '/address/create';
  static const String addressUpdate = '/address/update';
  static const String addressDelete = '/address/delete';
  
  // Order Endpoints
  static const String orderGetAll = '/order/getAll';
  static const String orderGetOne = '/order/getOne';
  static const String orderCreate = '/order/create';
  
  // Checkout Endpoints
  static const String checkoutProcess = '/checkout/process';
  
  // Payment Endpoints
  static const String paymentInitialize = '/payment/initialize';
  static const String paymentVerify = '/payment/verify';
  
  // Wallet Endpoints
  static const String walletGet = '/wallet/get';
  static const String walletTransactionGetAll = '/walletTransaction/getAll';
  
  // Banner Endpoints
  static const String bannerGetAll = '/banner/getAll';
  
  // Coupon Endpoints
  static const String couponApply = '/coupon/apply';
  static const String couponValidate = '/coupon/validate';
  
  // Notification Endpoints
  static const String notificationGetAll = '/notification/getAll';
  static const String notificationMarkRead = '/notification/markRead';
  
  // Review Endpoints
  static const String reviewGetAll = '/review/getAll';
  static const String reviewCreate = '/review/create';
  
  // Return Endpoints
  static const String returnCreate = '/return/create';
  static const String returnGetAll = '/return/getAll';
}
