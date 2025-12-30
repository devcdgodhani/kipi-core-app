import { Router } from 'express';
import { lotController } from '../../../controllers/lotController';
import { jwtAuth } from '../../../middlewares/jwtAuth';

const authMiddleware = jwtAuth();
const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Admin/Lot
 *   description: Lot management APIs (Admin only)
 */

/**
 * @swagger
 * /admin/lot/getOne:
 *   post:
 *     summary: Get one lot by filter
 *     tags: [Admin/Lot]
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
 *               lotNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lot details retrieved successfully
 */
router.post('/getOne', lotController.getOne);
router.get('/getOne', lotController.getOne);

/**
 * @swagger
 * /admin/lot/getAll:
 *   post:
 *     summary: Get all lots with filter
 *     tags: [Admin/Lot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               supplierId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lots retrieved successfully
 */
router.post('/getAll', lotController.getAll);
router.get('/getAll', lotController.getAll);

/**
 * @swagger
 * /admin/lot/getWithPagination:
 *   post:
 *     summary: Get lots with pagination and filter
 *     tags: [Admin/Lot]
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
 *               filter:
 *                 type: object
 *     responses:
 *       200:
 *         description: Lots retrieved successfully with pagination
 */
router.post('/getWithPagination', lotController.getWithPagination);
router.get('/getWithPagination', lotController.getWithPagination);

/**
 * @swagger
 * /admin/lot/bulkUpdate:
 *   put:
 *     summary: Bulk update lots
 *     tags: [Admin/Lot]
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
 *         description: Lots updated successfully
 */
router.put('/bulkUpdate', lotController.updateManyByFilter);

/**
 * @swagger
 * /admin/lot/updateOneByFilter:
 *   put:
 *     summary: Update one lot by filter
 *     tags: [Admin/Lot]
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
 *         description: Lot updated successfully
 */
router.put('/updateOneByFilter', lotController.updateOneByFilter);

/**
 * @swagger
 * /admin/lot/updateManyByFilter:
 *   put:
 *     summary: Update many lots by filter
 *     tags: [Admin/Lot]
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
 *         description: Lots updated successfully
 */
router.put('/updateManyByFilter', lotController.updateManyByFilter);

/**
 * @swagger
 * /admin/lot/bulkCreate:
 *   post:
 *     summary: Create multiple lots
 *     tags: [Admin/Lot]
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
 *                 lotNumber:
 *                   type: string
 *                 sourceType:
 *                   $ref: '#/components/schemas/SourceType'
 *                 costPerUnit:
 *                   type: number
 *                 initialQuantity:
 *                   type: number
 *                 currentQuantity:
 *                   type: number
 *     responses:
 *       201:
 *         description: Lots created successfully
 */
router.post('/bulkCreate', lotController.bulkCreate);

/**
 * @swagger
 * /admin/lot/deleteByFilter:
 *   delete:
 *     summary: Delete lots by filter
 *     tags: [Admin/Lot]
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
 *         description: Lots deleted successfully
 */
router.delete('/deleteByFilter', lotController.deleteByFilter);

/**
 * @swagger
 * /admin/lot:
 *   post:
 *     summary: Create a lot
 *     tags: [Admin/Lot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lotNumber:
 *                 type: string
 *               sourceType:
 *                 $ref: '#/components/schemas/SourceType'
 *               costPerUnit:
 *                 type: number
 *               initialQuantity:
 *                 type: number
 *               currentQuantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Lot created successfully
 */
router.post('/', lotController.create);

// Custom Methods

/**
 * @swagger
 * /admin/lot/{_id}/allocate:
 *   post:
 *     summary: Allocate stock from a lot
 *     tags: [Admin/Lot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Stock allocated successfully
 */
router.post('/:_id/allocate', lotController.allocateFromLot);

/**
 * @swagger
 * /admin/lot/{_id}/adjust:
 *   post:
 *     summary: Adjust stock manually
 *     tags: [Admin/Lot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock adjusted successfully
 */
router.post('/:_id/adjust', lotController.adjustStock);

/**
 * @swagger
 * /admin/lot/expiring:
 *   get:
 *     summary: Get expiring lots
 *     tags: [Admin/Lot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *           default: 30
 *     responses:
 *       200:
 *         description: List of expiring lots
 */
router.get('/expiring', lotController.getExpiringLots);

/**
 * @swagger
 * /admin/lot/{_id}/history:
 *   get:
 *     summary: Get lot history
 *     tags: [Admin/Lot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lot history retrieved successfully
 */
router.get('/:_id/history', lotController.getLotHistory);

export default router;

