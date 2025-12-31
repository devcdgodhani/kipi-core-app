import rateLimit from 'express-rate-limit';

export const apiRateLimit = rateLimit({
  max: 100 * 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in one hour',
  validate: { trustProxy: false },
});
