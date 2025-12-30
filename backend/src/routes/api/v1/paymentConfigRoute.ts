import { Router } from 'express';
import { paymentConfigController } from '../../../controllers/paymentConfigController';
import { jwtAuth } from '../../../middlewares/jwtAuth';
const authMiddleware = jwtAuth();

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Admin/PaymentConfig
 *   description: Payment configuration APIs
 */

/**
 * @swagger
 * /admin/paymentConfig/getOne:
 *   post:
 *     summary: Get one payment config by filter
 *     tags: [Admin/PaymentConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               entityType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment config retrieved successfully
 */
router.get('/getOne', paymentConfigController.getOne);
router.post('/getOne', paymentConfigController.getOne);

/**
 * @swagger
 * /admin/paymentConfig/getAll:
 *   post:
 *     summary: Get all payment configs by filter
 *     tags: [Admin/PaymentConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Payment configs retrieved successfully
 */
router.get('/getAll', paymentConfigController.getAll);
router.post('/getAll', paymentConfigController.getAll);

/**
 * @swagger
 * /admin/paymentConfig/getWithPagination:
 *   post:
 *     summary: Get payment configs with pagination
 *     tags: [Admin/PaymentConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *               limit:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Payment configs retrieved successfully with pagination
 */
router.get('/getWithPagination', paymentConfigController.getWithPagination);
router.post('/getWithPagination', paymentConfigController.getWithPagination);

/**
 * @swagger
 * /admin/paymentConfig/bulkUpdate:
 *   put:
 *     summary: Bulk update payment configs
 *     tags: [Admin/PaymentConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 filter:
 *                   type: object
 *                 update:
 *                   type: object
 *     responses:
 *       200:
 *         description: Payment configs updated successfully
 */
router.put('/bulkUpdate', paymentConfigController.updateManyByFilter);

/**
 * @swagger
 * /admin/paymentConfig/updateOneByFilter:
 *   put:
 *     summary: Update one payment config by filter
 *     tags: [Admin/PaymentConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filter:
 *                 type: object
 *               update:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment config updated successfully
 */
router.put('/updateOneByFilter', paymentConfigController.updateOneByFilter);

/**
 * @swagger
 * /admin/paymentConfig/updateManyByFilter:
 *   put:
 *     summary: Update many payment configs by filter
 *     tags: [Admin/PaymentConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 filter:
 *                   type: object
 *                 update:
 *                   type: object
 *     responses:
 *       200:
 *         description: Payment configs updated successfully
 */
router.put('/updateManyByFilter', paymentConfigController.updateManyByFilter);

/**
 * @swagger
 * /admin/paymentConfig/bulkCreate:
 *   post:
 *     summary: Create multiple payment configs
 *     tags: [Admin/PaymentConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 entityType:
 *                   type: string
 *     responses:
 *       201:
 *         description: Payment configs created successfully
 */
router.post('/bulkCreate', paymentConfigController.bulkCreate);

/**
 * @swagger
 * /admin/paymentConfig/deleteByFilter:
 *   delete:
 *     summary: Delete payment configs by filter
 *     tags: [Admin/PaymentConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                  type: string
 *     responses:
 *       200:
 *         description: Payment configs deleted successfully
 */
router.delete('/deleteByFilter', paymentConfigController.deleteByFilter);

/**
 * @swagger
 * /admin/paymentConfig:
 *   post:
 *     summary: Set payment config (create/update)
 *     tags: [Admin/PaymentConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entityType:
 *                 type: string
 *               entityId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment config set successfully
 */
router.post('/', paymentConfigController.setConfig);

/**
 * @swagger
 * /admin/paymentConfig:
 *   get:
 *     summary: Get payment config by entity
 *     tags: [Admin/PaymentConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment config retrieved successfully
 */
router.get('/', paymentConfigController.getConfig);

/**
 * @swagger
 * /admin/paymentConfig/product/{productId}:
 *   get:
 *     summary: Get effective payment config for a product
 *     tags: [Admin/PaymentConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Effective payment config retrieved successfully
 */
router.get('/product/:productId', paymentConfigController.getEffectiveConfig);

export default router;
