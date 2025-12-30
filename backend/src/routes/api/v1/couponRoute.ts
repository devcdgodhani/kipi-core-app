import { Router } from 'express';
import { couponController } from '../../../controllers/couponController';
import { jwtAuth } from '../../../middlewares/jwtAuth';
const authMiddleware = jwtAuth();

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Admin/Coupon
 *   description: Coupon management APIs
 */

/**
 * @swagger
 * /admin/coupon/getOne:
 *   post:
 *     summary: Get one coupon by filter
 *     tags: [Admin/Coupon]
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
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coupon retrieved successfully
 */
router.get('/getOne', couponController.getOne);
router.post('/getOne', couponController.getOne);

/**
 * @swagger
 * /admin/coupon/getAll:
 *   post:
 *     summary: Get all coupons by filter
 *     tags: [Admin/Coupon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Coupons retrieved successfully
 */
router.get('/getAll', couponController.getAll);
router.post('/getAll', couponController.getAll);

/**
 * @swagger
 * /admin/coupon/getWithPagination:
 *   post:
 *     summary: Get coupons with pagination
 *     tags: [Admin/Coupon]
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
 *         description: Coupons retrieved successfully with pagination
 */
router.get('/getWithPagination', couponController.getWithPagination);
router.post('/getWithPagination', couponController.getWithPagination);

/**
 * @swagger
 * /admin/coupon/bulkUpdate:
 *   put:
 *     summary: Bulk update coupons
 *     tags: [Admin/Coupon]
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
 *         description: Coupons updated successfully
 */
router.put('/bulkUpdate', couponController.updateManyByFilter);

/**
 * @swagger
 * /admin/coupon/updateOneByFilter:
 *   put:
 *     summary: Update one coupon by filter
 *     tags: [Admin/Coupon]
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
 *         description: Coupon updated successfully
 */
router.put('/updateOneByFilter', couponController.updateOneByFilter);

/**
 * @swagger
 * /admin/coupon/updateManyByFilter:
 *   put:
 *     summary: Update many coupons by filter
 *     tags: [Admin/Coupon]
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
 *         description: Coupons updated successfully
 */
router.put('/updateManyByFilter', couponController.updateManyByFilter);

/**
 * @swagger
 * /admin/coupon/bulkCreate:
 *   post:
 *     summary: Create multiple coupons
 *     tags: [Admin/Coupon]
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
 *                 code:
 *                   type: string
 *     responses:
 *       201:
 *         description: Coupons created successfully
 */
router.post('/bulkCreate', couponController.bulkCreate);

/**
 * @swagger
 * /admin/coupon/deleteByFilter:
 *   delete:
 *     summary: Delete coupons by filter
 *     tags: [Admin/Coupon]
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
 *         description: Coupons deleted successfully
 */
router.delete('/deleteByFilter', couponController.deleteByFilter);

/**
 * @swagger
 * /admin/coupon:
 *   post:
 *     summary: Create a coupon
 *     tags: [Admin/Coupon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       201:
 *         description: Coupon created successfully
 */
router.post('/', couponController.create);
router.get('/', couponController.getWithPagination); // Fallback for list
// Removed legacy :id routes
// router.get('/:id', couponController.getOne); // Use getOne with filter
// router.put('/:id', couponController.updateById); // Use updateOneByFilter
// router.delete('/:id', couponController.deleteById); // Use deleteByFilter

// Specialized methods
router.post('/validate', couponController.validateCoupon);
router.post('/apply', couponController.applyCoupon);
router.post('/applicable', couponController.getApplicableCoupons);
router.get('/active', couponController.getActiveCoupons);
router.post('/:id/schedule', couponController.scheduleCoupon);

export default router;
