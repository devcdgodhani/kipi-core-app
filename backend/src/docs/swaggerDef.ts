import { ENV_VARIABLE } from "../configs";
import { USER_TYPE, GENDER, SIGN_UP_TYPE, OTP_TYPE, USER_STATUS, SOURCE_TYPE, DISCOUNT_TYPE, COUPON_APPLICABILITY, PAYMENT_METHOD } from "../constants";

const swaggerDef = {
    openapi: '3.0.0',
    info: {
        title: 'Kipi Core API Documentation',
        version: '2.0.0',
        description: 'Comprehensive API documentation for Kipi Core application, covering Authentication, User Management, Product Management, Inventory, Pricing, Coupons, and more.',
        license: {
            name: 'MIT',
        },
    },
    servers: [
        {
            url:
                ENV_VARIABLE.NODE_ENV === 'local' || ENV_VARIABLE.NODE_ENV === 'development'
                    ? `http://localhost:${ENV_VARIABLE.PORT}/api/v1`
                    : ENV_VARIABLE.SERVER_URL + '/api/v1',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            // Existing schemas
            UserType: {
                type: 'string',
                enum: Object.values(USER_TYPE),
            },
            Gender: {
                type: 'string',
                enum: Object.values(GENDER),
            },
            SignUpType: {
                type: 'string',
                enum: Object.values(SIGN_UP_TYPE),
            },
            OtpType: {
                type: 'string',
                enum: Object.values(OTP_TYPE),
            },
            UserStatus: {
                type: 'string',
                enum: Object.values(USER_STATUS),
            },
            // New module enums
            SourceType: {
                type: 'string',
                enum: Object.values(SOURCE_TYPE),
            },
            DiscountType: {
                type: 'string',
                enum: Object.values(DISCOUNT_TYPE),
            },
            CouponApplicability: {
                type: 'string',
                enum: Object.values(COUPON_APPLICABILITY),
            },
            PaymentMethod: {
                type: 'string',
                enum: Object.values(PAYMENT_METHOD),
            },
        }
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
    tags: [
        { name: 'Authentication', description: 'Authentication endpoints' },
        { name: 'Users', description: 'User management' },
        { name: 'Categories', description: 'Category management' },
        { name: 'Attributes', description: 'Product attribute management' },
        { name: 'Products', description: 'Product management' },
        { name: 'SKUs', description: 'SKU/Variant management' },
        { name: 'Lots', description: 'Lot/Batch management' },
        { name: 'Prices', description: 'Price management' },
        { name: 'Inventory', description: 'Inventory management' },
        { name: 'Payment Config', description: 'Payment configuration' },
        { name: 'Coupons', description: 'Coupon management' },
    ],
};

export default swaggerDef;
