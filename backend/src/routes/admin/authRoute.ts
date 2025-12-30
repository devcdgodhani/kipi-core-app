import { Router } from 'express';
import { jwtAuth } from '../../../../middlewares';
import { TOKEN_TYPE } from '../../../../constants';
import AuthController from '../../../../controllers/authController';
import AuthValidator from '../../../../validators/authValidators';

const router = Router();
const authController = new AuthController();
const authValidator = new AuthValidator();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Token Management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - mobile
 *               - password
 *               - firstName
 *               - lastName
 *               - countryCode
 *             properties:
 *               email:
 *                 type: string
 *               mobile:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               countryCode:
 *                 type: string
 *               type:
 *                 $ref: '#/components/schemas/UserType'
 *               gender:
 *                 $ref: '#/components/schemas/Gender'
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', authValidator.registerValidator, authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login for all users
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - type
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               type:
 *                 $ref: '#/components/schemas/UserType'
 *     responses:
 *       200:
 *         description: Logged in successfully
 */
router.post('/login', authValidator.loginValidator, authController.login);

/**
 * @swagger
 * /auth/refreshTokens:
 *   post:
 *     summary: Refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 */
router.post('/refreshTokens', authValidator.refreshTokensValidator, authController.refreshTokens);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successfully
 */
router.post('/logout', jwtAuth(), authController.logout);

/**
 * @swagger
 * /auth/changePassword:
 *   post:
 *     summary: Change password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - newPassword
 *             properties:
 *               password:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.post(
  '/changePassword',
  jwtAuth(),
  authValidator.changePasswordValidator,
  authController.changePassword
);

/**
 * @swagger
 * /auth/sendOtp:
 *   post:
 *     summary: Send OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - type
 *               - otpType
 *             properties:
 *               username:
 *                 type: string
 *               type:
 *                 $ref: '#/components/schemas/UserType'
 *               otpType:
 *                 $ref: '#/components/schemas/OtpType'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post('/sendOtp', authValidator.sendOtpValidator, authController.sendOtp);

/**
 * @swagger
 * /auth/verifyOtp:
 *   post:
 *     summary: Verify OTP
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *               token:
 *                 type: string
 *               otpType:
 *                 $ref: '#/components/schemas/OtpType'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
router.post(
  '/verifyOtp',
  jwtAuth(TOKEN_TYPE.OTP_TOKEN),
  authValidator.verifyOtpValidator,
  authController.verifyOtp
);

router.get(
  '/verifyOtp',
  jwtAuth(TOKEN_TYPE.OTP_TOKEN),
  authValidator.verifyOtpValidator,
  authController.verifyOtp
);

/**
 * @swagger
 * /auth/forgetPassword:
 *   post:
 *     summary: Forget password (update to new)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
router.post(
  '/forgetPassword',
  jwtAuth(TOKEN_TYPE.FORGET_PASSWORD_TOKEN),
  authValidator.forgetPasswordValidator,
  authController.forgetPassword
);

/**
 * @swagger
 * /auth/loggedInUser:
 *   get:
 *     summary: Get logged in user details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 */
router.get('/loggedInUser', jwtAuth(), authController.getLoggedInUser);

export default router;
