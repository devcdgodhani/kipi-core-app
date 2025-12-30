import { Router } from 'express';
import { productController } from '../../../controllers';
import { createProductSchema, searchProductSchema } from '../../../validators/productValidators';
import { validateRequest } from '../../../middlewares';
import { jwtAuth } from '../../../middlewares';

const productRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Admin/Product
 *   description: Product management APIs
 */

/**
 * @swagger
 * /admin/product/getOne:
 *   post:
 *     summary: Get one product by filter
 *     tags: [Admin/Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 */
productRouter.get('/getOne', productController.getOne);
productRouter.post('/getOne', productController.getOne);

/**
 * @swagger
 * /admin/product/getAll:
 *   post:
 *     summary: Get all products by filter
 *     tags: [Admin/Product]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
productRouter.get('/getAll', productController.getAll);
productRouter.post('/getAll', productController.getAll);

/**
 * @swagger
 * /admin/product/getWithPagination:
 *   post:
 *     summary: Get products with pagination
 *     tags: [Admin/Product]
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
 *         description: Products retrieved successfully with pagination
 */
productRouter.get('/getWithPagination', productController.getWithPagination);
productRouter.post('/getWithPagination', productController.getWithPagination);

/**
 * @swagger
 * /admin/product/bulkUpdate:
 *   put:
 *     summary: Bulk update products
 *     tags: [Admin/Product]
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
 *         description: Products updated successfully
 */
productRouter.put('/bulkUpdate', jwtAuth(), productController.updateManyByFilter);

/**
 * @swagger
 * /admin/product/updateOneByFilter:
 *   put:
 *     summary: Update one product by filter
 *     tags: [Admin/Product]
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
 *         description: Product updated successfully
 */
productRouter.put('/updateOneByFilter', jwtAuth(), productController.updateOneByFilter);

/**
 * @swagger
 * /admin/product/updateManyByFilter:
 *   put:
 *     summary: Update many products by filter
 *     tags: [Admin/Product]
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
 *         description: Products updated successfully
 */
productRouter.put('/updateManyByFilter', jwtAuth(), productController.updateManyByFilter);

/**
 * @swagger
 * /admin/product/bulkCreate:
 *   post:
 *     summary: Create multiple products
 *     tags: [Admin/Product]
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
 *                 name:
 *                   type: string
 *     responses:
 *       201:
 *         description: Products created successfully
 */
productRouter.post('/bulkCreate', jwtAuth(), productController.bulkCreate);

/**
 * @swagger
 * /admin/product/deleteByFilter:
 *   delete:
 *     summary: Delete products by filter
 *     tags: [Admin/Product]
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
 *         description: Products deleted successfully
 */
productRouter.delete('/deleteByFilter', jwtAuth(), productController.deleteByFilter);

/**
 * @swagger
 * /admin/product:
 *   post:
 *     summary: Create a product
 *     tags: [Admin/Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 */
productRouter.post('/', jwtAuth(), validateRequest(createProductSchema), productController.create);

/**
 * @swagger
 * /admin/product/{id}:
 *   put:
 *     summary: Update a product by ID with variants
 *     tags: [Admin/Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               name:
 *                 type: string
 *               variants:
 *                 type: array
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
productRouter.put('/:id', jwtAuth(), productController.update);

export default productRouter;
