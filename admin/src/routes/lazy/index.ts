import { lazy } from 'react';

export const LoginLazy = lazy(() => import('../../pages/Auth/Login'));
export const RegisterLazy = lazy(() => import('../../pages/Auth/Register'));
export const VerifyOTPLazy = lazy(() => import('../../pages/Auth/VerifyOTP'));
export const DashboardLazy = lazy(() => import('../../pages/Dashboard/Index'));
export const ManageProductsLazy = lazy(() => import('../../pages/Product/ProductList'));
export const ManageProductFormLazy = lazy(() => import('../../pages/Product/ProductForm'));
export const ManageSkusLazy = lazy(() => import('../../pages/SKU/SkuList'));
export const ManageSkuFormLazy = lazy(() => import('../../pages/SKU/SkuForm'));
export const ManageOrdersLazy = lazy(() => import('../../pages/Orders/OrderList'));
export const ManageOrderDetailsLazy = lazy(() => import('../../pages/Orders/OrderDetails'));

export const ManageUsersLazy = lazy(() => import('../../pages/User/UserList'));
export const ProfileLazy = lazy(() => import('../../pages/Profile/Profile'));
export const ChangePasswordLazy = lazy(() => import('../../pages/Auth/ChangePassword'));

export const WhatsAppDashboardLazy = lazy(() => import('../../pages/WhatsApp/WhatsAppDashboard'));
export const WhatsAppAccountsLazy = lazy(() => import('../../pages/WhatsApp/WhatsAppAccounts'));
export const WhatsAppAccountDetailsLazy = lazy(() => import('../../pages/WhatsApp/WhatsAppAccountDetails'));
export const WhatsAppQueueLazy = lazy(() => import('../../pages/WhatsApp/WhatsAppQueue'));
export const WhatsAppContactsLazy = lazy(() => import('../../pages/WhatsApp/WhatsAppContacts'));
export const WhatsAppRiskLazy = lazy(() => import('../../pages/WhatsApp/WhatsAppRisk'));
export const WhatsAppSystemLazy = lazy(() => import('../../pages/WhatsApp/WhatsAppSystem'));
export const ManageLotsLazy = lazy(() => import('../../pages/Lot/LotList'));
export const ManageLotFormLazy = lazy(() => import('../../pages/Lot/LotForm'));
export const ManageCategoriesLazy = lazy(() => import('../../pages/Category/CategoryList'));
export const ManageCategoryFormLazy = lazy(() => import('../../pages/Category/CategoryForm'));
export const ManageUserFormLazy = lazy(() => import('../../pages/User/UserForm'));
export const ForgotPasswordLazy = lazy(() => import('../../pages/Auth/ForgotPassword'));
export const ResetPasswordLazy = lazy(() => import('../../pages/Auth/ResetPassword'));
export const ManageAttributesLazy = lazy(() => import('../../pages/Attribute/AttributeList'));
export const ManageAttributeFormLazy = lazy(() => import('../../pages/Attribute/AttributeForm'));
export const ManageReviewsLazy = lazy(() => import('../../pages/Review/ReviewList'));
export const ManageReturnsLazy = lazy(() => import('../../pages/Return/ReturnList').then(module => ({ default: module.ReturnList })));
export const ManageReturnDetailsLazy = lazy(() => import('../../pages/Return/ReturnDetails'));
export const ManageCouponsLazy = lazy(() => import('../../pages/Coupon/CouponList'));
export const ManageCouponFormLazy = lazy(() => import('../../pages/Coupon/CouponForm'));
export const FileManagerLazy = lazy(() => import('../../pages/FileStorage/FileManager').then(module => ({ default: module.FileManager })));
export const ManageStockLedgerLazy = lazy(() => import('../../pages/Inventory/StockLedgerList'));
export const ManageLoyaltyLazy = lazy(() => import('../../pages/Loyalty/LoyaltyAuditList'));

// Intelligence Section - Split Analytics Pages
export const SalesAnalyticsLazy = lazy(() => import('../../pages/Analytics/SalesAnalytics'));
export const ProductInsightsLazy = lazy(() => import('../../pages/Analytics/ProductInsights'));
export const CustomerInsightsLazy = lazy(() => import('../../pages/Analytics/CustomerInsights'));
export const FinancialReportsLazy = lazy(() => import('../../pages/Analytics/FinancialReports'));
export const LotAnalyticsLazy = lazy(() => import('../../pages/Analytics/LotAnalytics'));
export const LogisticsAnalyticsLazy = lazy(() => import('../../pages/Analytics/LogisticsAnalytics'));
export const CourierAnalyticsLazy = lazy(() => import('../../pages/Analytics/CourierAnalytics'));

// Logistics
export const ShipmentListLazy = lazy(() => import('../../pages/Shipment/ShipmentList').then(module => ({ default: module.ShipmentList })));
export const ShipmentDetailsLazy = lazy(() => import('../../pages/Shipment/ShipmentDetails').then(module => ({ default: module.ShipmentDetails })));
export const RtoDashboardLazy = lazy(() => import('../../pages/RTO/RtoDashboard'));
export const CourierConfigLazy = lazy(() => import('../../pages/Courier/CourierConfig').then(module => ({ default: module.CourierConfig })));
export const WarehouseListLazy = lazy(() => import('../../pages/Warehouse/WarehouseList').then(module => ({ default: module.WarehouseList })));
export const WarehouseFormLazy = lazy(() => import('../../pages/Warehouse/WarehouseForm').then(module => ({ default: module.WarehouseForm })));
export const NdrDashboardLazy = lazy(() => import('../../pages/NDR/NdrDashboard').then(module => ({ default: module.NdrDashboard })));
export const CronJobHubLazy = lazy(() => import('../../pages/CronJob/CronJobHub').then(module => ({ default: module.CronJobHub })));

// Payment Management
export const PaymentGatewayListLazy = lazy(() => import('../../pages/Payment/PaymentGatewayList'));
export const GatewayConfigFormLazy = lazy(() => import('../../pages/Payment/GatewayConfigForm'));
export const WebhookLogListLazy = lazy(() => import('../../pages/Payment/WebhookLogList'));
