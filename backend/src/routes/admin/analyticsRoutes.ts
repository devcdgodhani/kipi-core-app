import express from 'express';
import { analyticsController } from '../../controllers/analyticsController';
import { jwtAuth } from '../../middlewares';

const router = express.Router();

router.get(
  '/sales',
  jwtAuth(), // Uses default TOKEN_TYPE.ACCESS_TOKEN
  analyticsController.getSalesAnalytics
);

router.get(
  '/products',
  jwtAuth(),
  analyticsController.getProductAnalytics
);

router.get(
  '/customers',
  jwtAuth(),
  analyticsController.getCustomerAnalytics
);

router.get(
  '/tax-summary',
  jwtAuth(),
  analyticsController.getTaxSummary
);

router.get(
  '/lots',
  jwtAuth(),
  analyticsController.getInventoryAnalytics
);

router.get(
  '/dashboard-summary',
  jwtAuth(),
  analyticsController.getDashboardSummary
);

router.get(
  '/logistics',
  jwtAuth(),
  analyticsController.getLogisticsAnalytics
);

router.get(
  '/wallet',
  jwtAuth(),
  analyticsController.getWalletAnalytics
);

router.get(
  '/couriers',
  jwtAuth(),
  analyticsController.getCourierPerformance
);

router.get(
  '/export',
  jwtAuth(),
  analyticsController.exportAnalytics
);

export const analyticsRoutes = router;
