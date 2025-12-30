import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import { TOKEN_TYPE } from '../../constants';
import AuthController from '../../controllers/authController';
import AuthValidator from '../../validators/authValidators';



  const router = Router();
  const authController = new AuthController();
  const authValidator = new AuthValidator();

  // Public routes
  router.post('/register', authValidator.registerValidator, authController.register);
  router.post('/login', authValidator.loginValidator, authController.login);
  router.post('/sendOtp', authValidator.sendOtpValidator, authController.sendOtp);

  // OTP verification routes (requires OTP_TOKEN)
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

  // Token management
  router.post('/refreshTokens', authValidator.refreshTokensValidator, authController.refreshTokens);

  // Protected routes (requires ACCESS_TOKEN)
  router.post('/logout', jwtAuth(), authController.logout);
  
  router.post(
    '/changePassword',
    jwtAuth(),
    authValidator.changePasswordValidator,
    authController.changePassword
  );

  router.get('/me', jwtAuth(), authController.getLoggedInUser);

  // Password reset (requires FORGET_PASSWORD_TOKEN)
  router.post(
    '/forgetPassword',
    jwtAuth(TOKEN_TYPE.FORGET_PASSWORD_TOKEN),
    authValidator.forgetPasswordValidator,
    authController.forgetPassword
  );


export default router;
