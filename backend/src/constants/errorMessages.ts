export enum USER_ERROR_MESSAGES {
  CREATE_FAIL = 'Unable to create user!',
  GET_FAIL = 'Unable to retrieve user details!',
  UPDATE_FAIL = 'Unable to update user details!',
  DELETE_FAIL = 'Unable to delete user details!',
  NOT_FOUND = 'Unable to find user details!',
  EXIST = 'User is already exist!',
}

export enum AUTH_ERROR_MESSAGES {
  ACCOUNT_EXIST = 'User account already exist!',
  ACCOUNT_CREATE_FAILED = 'Unable to create account!',
  INVALID_TOKEN = 'Invalid token!',
  EXPIRED_TOKEN = 'Token expired!',
  TOKEN_NOT_FOUND = 'Token not found!',
  EMAIL_VERIFICATION_PENDING = 'Your email verification is pending!',
  MOBILE_VERIFICATION_PENDING = 'Your mobile verification is pending!',
  INVALID_VERIFICATION_OTP = 'Otp is invalid or expired!',
  OLD_PASSWORD_SAME = 'New password can not be the same as old password!',
  INVALID_USERNAME = 'Invalid username!',
  INVALID_PASSWORD = 'Invalid password!',
  PENDING_ACCOUNT_VERIFICATION = 'Account Verification is pending!',
}

export enum OTP_ERROR_MESSAGES {
  INVALID_OTP = 'Invalid otp!',
}

