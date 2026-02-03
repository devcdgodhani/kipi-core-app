import { Router } from 'express';
import { productController } from '../../controllers/productController';
import { productValidator } from '../../validators/productValidators';

const router = Router();

// Public routes (no auth required usually, or optional)
router.route('/getOne')
  .get(productValidator.getOne, productController.getOne)
  .post(productValidator.getOne, productController.getOne);

router.route('/getAll')
  .get(productValidator.getAll, productController.getAll)
  .post(productValidator.getAll, productController.getAll);

router.route('/getWithPagination')
  .get(productValidator.getWithPagination, productController.getWithPagination)
  .post(productValidator.getWithPagination, productController.getWithPagination);

// Recommendation routes
router.get('/getRecommended', productController.getRecommended);
router.get('/getSimilar/:productId', productController.getSimilar);
router.get('/getFrequentlyBoughtTogether/:productId', productController.getFrequentlyBoughtTogether);

// SKU routes
router.get('/getSKUs/:productId', productController.getProductSKUs);

export default router;
