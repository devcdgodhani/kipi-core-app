import { Router } from 'express';
import { inventoryController } from '../../../controllers/inventoryController';
import { jwtAuth } from '../../../middlewares/jwtAuth';
const authMiddleware = jwtAuth();

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Admin/Inventory
 *   description: Inventory management APIs (Admin only)
 */

/**
 * @swagger
 * /admin/inventory/getOne:
 *   post:
 *     summary: Get one inventory record
 *     tags: [Admin/Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sku:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inventory record retrieved successfully
 */
router.get('/getOne', inventoryController.getOne);
router.post('/getOne', inventoryController.getOne);

/**
 * @swagger
 * /admin/inventory/getAll:
 *   post:
 *     summary: Get all inventory records
 *     tags: [Admin/Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Inventory records retrieved successfully
 */
router.get('/getAll', inventoryController.getAll);
router.post('/getAll', inventoryController.getAll);

/**
 * @swagger
 * /admin/inventory/getWithPagination:
 *   post:
 *     summary: Get inventory with pagination
 *     tags: [Admin/Inventory]
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
 *         description: Inventory records retrieved successfully with pagination
 */
router.get('/getWithPagination', inventoryController.getWithPagination);
router.post('/getWithPagination', inventoryController.getWithPagination);

/**
 * @swagger
 * /admin/inventory/bulkUpdate:
 *   put:
 *     summary: Bulk update inventory
 *     tags: [Admin/Inventory]
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
 *         description: Inventory records updated successfully
 */
router.put('/bulkUpdate', inventoryController.updateManyByFilter);

/**
 * @swagger
 * /admin/inventory/updateOneByFilter:
 *   put:
 *     summary: Update one inventory record by filter
 *     tags: [Admin/Inventory]
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
 *         description: Inventory record updated successfully
 */
router.put('/updateOneByFilter', inventoryController.updateOneByFilter);

/**
 * @swagger
 * /admin/inventory/updateManyByFilter:
 *   put:
 *     summary: Update many inventory records by filter
 *     tags: [Admin/Inventory]
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
 *         description: Inventory records updated successfully
 */
router.put('/updateManyByFilter', inventoryController.updateManyByFilter);

/**
 * @swagger
 * /admin/inventory/bulkCreate:
 *   post:
 *     summary: Create multiple inventory records
 *     tags: [Admin/Inventory]
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
 *                 sku:
 *                   type: string
 *                 totalAvailableStock:
 *                   type: number
 *     responses:
 *       201:
 *         description: Inventory records created successfully
 */
router.post('/bulkCreate', inventoryController.bulkCreate);

/**
 * @swagger
 * /admin/inventory/deleteByFilter:
 *   delete:
 *     summary: Delete inventory records by filter
 *     tags: [Admin/Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sku:
 *                  type: string
 *     responses:
 *       200:
 *         description: Inventory records deleted successfully
 */
router.delete('/deleteByFilter', inventoryController.deleteByFilter);

/**
 * @swagger
 * /admin/inventory:
 *   post:
 *     summary: Create an inventory record
 *     tags: [Admin/Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sku:
 *                 type: string
 *               totalAvailableStock:
 *                 type: number
 *     responses:
 *       201:
 *         description: Inventory record created successfully
 */
router.post('/', inventoryController.create);

// Specialized methods

/**
 * @swagger
 * /admin/inventory/sku/{skuId}:
 *   get:
 *     summary: Get stock for a specific SKU
 *     tags: [Admin/Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skuId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock details
 */
router.get('/sku/:skuId', inventoryController.getStock);

/**
 * @swagger
 * /admin/inventory/adjust:
 *   post:
 *     summary: Adjust inventory stock
 *     tags: [Admin/Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skuId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [ADD, SUBTRACT]
 *     responses:
 *       200:
 *         description: Stock adjusted successfully
 */
router.post('/adjust', inventoryController.adjustStock);

/**
 * @swagger
 * /admin/inventory/reserve:
 *   post:
 *     summary: Reserve inventory stock
 *     tags: [Admin/Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skuId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Stock reserved successfully
 */
router.post('/reserve', inventoryController.reserveStock);

/**
 * @swagger
 * /admin/inventory/release:
 *   post:
 *     summary: Release reserved inventory stock
 *     tags: [Admin/Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skuId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Stock released successfully
 */
router.post('/release', inventoryController.releaseStock);

/**
 * @swagger
 * /admin/inventory/low-stock:
 *   get:
 *     summary: Get low stock items
 *     tags: [Admin/Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of low stock items
 */
router.get('/low-stock', inventoryController.getLowStockItems);

/**
 * @swagger
 * /admin/inventory/threshold:
 *   post:
 *     summary: Update low stock threshold
 *     tags: [Admin/Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skuId:
 *                 type: string
 *               threshold:
 *                 type: number
 *     responses:
 *       200:
 *         description: Threshold updated successfully
 */
router.post('/threshold', inventoryController.updateThreshold);

/**
 * @swagger
 * /admin/inventory/value:
 *   get:
 *     summary: Get total stock value
 *     tags: [Admin/Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total stock value
 */
router.get('/value', inventoryController.getStockValue);

export default router;
