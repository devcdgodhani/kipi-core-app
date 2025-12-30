import { Router } from 'express';
import { categoryController } from '../../../controllers';
import { createCategorySchema, updateCategorySchema } from '../../../validators/productValidators';
import { validateRequest } from '../../../middlewares';
import { jwtAuth } from '../../../middlewares';

const categoryRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Admin/Category
 *   description: Category management APIs
 */

/**
 * @swagger
 * /admin/category/tree:
 *   get:
 *     summary: Get category tree
 *     tags: [Admin/Category]
 *     responses:
 *       200:
 *         description: Category tree retrieved successfully
 */
categoryRouter.get('/tree', categoryController.getTree);

/**
 * @swagger
 * /admin/category/getOne:
 *   post:
 *     summary: Get one category by filter
 *     tags: [Admin/Category]
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
 *         description: Category details retrieved successfully
 */
categoryRouter.get('/getOne', categoryController.getOne);
categoryRouter.post('/getOne', categoryController.getOne);

/**
 * @swagger
 * /admin/category/getAll:
 *   post:
 *     summary: Get all categories by filter
 *     tags: [Admin/Category]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
categoryRouter.get('/getAll', categoryController.getAll);
categoryRouter.post('/getAll', categoryController.getAll);

/**
 * @swagger
 * /admin/category/getWithPagination:
 *   post:
 *     summary: Get categories with pagination
 *     tags: [Admin/Category]
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
 *         description: Categories retrieved successfully with pagination
 */
categoryRouter.get('/getWithPagination', categoryController.getWithPagination);
categoryRouter.post('/getWithPagination', categoryController.getWithPagination);

/**
 * @swagger
 * /admin/category/bulkUpdate:
 *   put:
 *     summary: Bulk update categories
 *     tags: [Admin/Category]
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
 *         description: Categories updated successfully
 */
categoryRouter.put('/bulkUpdate', jwtAuth(), categoryController.updateManyByFilter);

/**
 * @swagger
 * /admin/category/updateOneByFilter:
 *   put:
 *     summary: Update one category by filter
 *     tags: [Admin/Category]
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
 *         description: Category updated successfully
 */
categoryRouter.put('/updateOneByFilter', jwtAuth(), categoryController.updateOneByFilter);

/**
 * @swagger
 * /admin/category/updateManyByFilter:
 *   put:
 *     summary: Update many categories by filter
 *     tags: [Admin/Category]
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
 *         description: Categories updated successfully
 */
categoryRouter.put('/updateManyByFilter', jwtAuth(), categoryController.updateManyByFilter);

/**
 * @swagger
 * /admin/category/bulkCreate:
 *   post:
 *     summary: Create multiple categories
 *     tags: [Admin/Category]
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
 *         description: Categories created successfully
 */
categoryRouter.post('/bulkCreate', jwtAuth(), categoryController.bulkCreate);

/**
 * @swagger
 * /admin/category/deleteByFilter:
 *   delete:
 *     summary: Delete categories by filter
 *     tags: [Admin/Category]
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
 *         description: Categories deleted successfully
 */
categoryRouter.delete('/deleteByFilter', jwtAuth(), categoryController.deleteByFilter);

/**
 * @swagger
 * /admin/category:
 *   post:
 *     summary: Create a category
 *     tags: [Admin/Category]
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
 *         description: Category created successfully
 */
categoryRouter.post('/', jwtAuth(), validateRequest(createCategorySchema), categoryController.create);

export default categoryRouter;
