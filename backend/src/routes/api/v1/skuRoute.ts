import { Router } from 'express';
import { skuController } from '../../../controllers/skuController';
import { jwtAuth } from '../../../middlewares';

const skuRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Admin/SKU
 *   description: SKU management APIs (Admin only)
 */

/**
 * @swagger
 * /admin/sku/getOne:
 *   post:
 *     summary: Get one SKU by filter
 *     tags: [Admin/SKU]
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
 *         description: SKU details retrieved successfully
 */
skuRouter.get('/getOne', skuController.getOne);
skuRouter.post('/getOne', skuController.getOne);

/**
 * @swagger
 * /admin/sku/getAll:
 *   post:
 *     summary: Get all SKUs by filter
 *     tags: [Admin/SKU]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: SKUs retrieved successfully
 */
skuRouter.get('/getAll', skuController.getAll);
skuRouter.post('/getAll', skuController.getAll);

/**
 * @swagger
 * /admin/sku/getWithPagination:
 *   post:
 *     summary: Get SKUs with pagination
 *     tags: [Admin/SKU]
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
 *         description: SKUs retrieved successfully with pagination
 */
skuRouter.get('/getWithPagination', skuController.getWithPagination);
skuRouter.post('/getWithPagination', skuController.getWithPagination);

/**
 * @swagger
 * /admin/sku/bulkUpdate:
 *   put:
 *     summary: Bulk update SKUs
 *     tags: [Admin/SKU]
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
 *         description: SKUs updated successfully
 */
skuRouter.put('/bulkUpdate', jwtAuth(), skuController.updateManyByFilter);

/**
 * @swagger
 * /admin/sku/updateOneByFilter:
 *   put:
 *     summary: Update one SKU by filter
 *     tags: [Admin/SKU]
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
 *         description: SKU updated successfully
 */
skuRouter.put('/updateOneByFilter', jwtAuth(), skuController.updateOneByFilter);

/**
 * @swagger
 * /admin/sku/updateManyByFilter:
 *   put:
 *     summary: Update many SKUs by filter
 *     tags: [Admin/SKU]
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
 *         description: SKUs updated successfully
 */
skuRouter.put('/updateManyByFilter', jwtAuth(), skuController.updateManyByFilter);

/**
 * @swagger
 * /admin/sku/bulkCreate:
 *   post:
 *     summary: Create multiple SKUs
 *     tags: [Admin/SKU]
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
 *         description: SKUs created successfully
 */
skuRouter.post('/bulkCreate', jwtAuth(), skuController.bulkCreate);

/**
 * @swagger
 * /admin/sku/deleteByFilter:
 *   delete:
 *     summary: Delete SKUs by filter
 *     tags: [Admin/SKU]
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
 *         description: SKUs deleted successfully
 */
skuRouter.delete('/deleteByFilter', jwtAuth(), skuController.deleteByFilter);

/**
 * @swagger
 * /admin/sku:
 *   post:
 *     summary: Create a SKU
 *     tags: [Admin/SKU]
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
 *         description: SKU created successfully
 */
skuRouter.post('/', jwtAuth(), skuController.create);

export default skuRouter;
