import express from 'express';
import { AnalyticsController } from '../../controllers/analyticsController';
import { jwtAuth } from '../../middlewares';
import { USER_TYPE } from '../../constants';

const router = express.Router();
const analyticsController = new AnalyticsController();

router.get(
  '/sales',
  jwtAuth(), // Uses default TOKEN_TYPE.ACCESS_TOKEN
  analyticsController.getSalesAnalytics.bind(analyticsController)
);

router.get(
  '/products',
  jwtAuth(),
  analyticsController.getProductAnalytics.bind(analyticsController)
);

router.get(
  '/customers',
  jwtAuth(),
  analyticsController.getCustomerAnalytics.bind(analyticsController)
);

router.get(
  '/export/sales',
  jwtAuth(),
  analyticsController.exportSales.bind(analyticsController)
);

router.get(
  '/export/products',
  jwtAuth(),
  analyticsController.exportProducts.bind(analyticsController)
);

router.get(
  '/export/customers',
  jwtAuth(),
  analyticsController.exportCustomers.bind(analyticsController)
);

router.get(
  '/tax-summary',
  jwtAuth(),
  analyticsController.getTaxSummary.bind(analyticsController)
);

export const analyticsRoutes = router;
