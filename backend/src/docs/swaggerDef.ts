import { ENV_VARIABLE } from "../configs";
import { USER_TYPE, GENDER, SIGN_UP_TYPE, OTP_TYPE, USER_STATUS } from "../constants";

const swaggerDef = {
    openapi: '3.0.0',
    info: {
        title: 'Api Documentation',
        version: '1.0.0',
        description: 'Comprehensive API documentation for the application, covering Authentication, User Management, and more.',
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
        }
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
};

export default swaggerDef;
