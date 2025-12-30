import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import { TOKEN_TYPE } from '../../constants';
import AuthController from '../../controllers/authController';
import AuthValidator from '../../validators/authValidators';

const router = Router();
const authController = new AuthController();
const authValidator = new AuthValidator();

router.post('/register', authValidator.registerValidator, authController.register);

router.post('/login', authValidator.loginValidator, authController.login);

router.post('/refreshTokens', authValidator.refreshTokensValidator, authController.refreshTokens);

router.post('/logout', jwtAuth(), authController.logout);

router.post(
  '/changePassword',
  jwtAuth(),
  authValidator.changePasswordValidator,
  authController.changePassword
);

router.post('/sendOtp', authValidator.sendOtpValidator, authController.sendOtp);

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

router.post(
  '/forgetPassword',
  jwtAuth(TOKEN_TYPE.FORGET_PASSWORD_TOKEN),
  authValidator.forgetPasswordValidator,
  authController.forgetPassword
);

router.get('/loggedInUser', jwtAuth(), authController.getLoggedInUser);

export default router;
