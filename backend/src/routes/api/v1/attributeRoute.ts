import { Router } from 'express';
import { attributeController } from '../../../controllers';
import { createAttributeSchema, updateAttributeSchema } from '../../../validators/productValidators';
import { validateRequest } from '../../../middlewares';
import { jwtAuth } from '../../../middlewares';

const attributeRouter = Router();

attributeRouter.use(jwtAuth()); // Protect all attribute routes for now

/**
 * @swagger
 * tags:
 *   name: Admin/Attribute
 *   description: Product attribute management APIs
 */

/**
 * @swagger
 * /admin/attribute/getOne:
 *   post:
 *     summary: Get one attribute by filter
 *     tags: [Admin/Attribute]
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
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attribute details retrieved successfully
 */
attributeRouter.get('/getOne', attributeController.getOne);
attributeRouter.post('/getOne', attributeController.getOne);

/**
 * @swagger
 * /admin/attribute/getAll:
 *   post:
 *     summary: Get all attributes by filter
 *     tags: [Admin/Attribute]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Attributes retrieved successfully
 */
attributeRouter.get('/getAll', attributeController.getAll);
attributeRouter.post('/getAll', attributeController.getAll);

/**
 * @swagger
 * /admin/attribute/getWithPagination:
 *   post:
 *     summary: Get attributes with pagination
 *     tags: [Admin/Attribute]
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
 *         description: Attributes retrieved successfully with pagination
 */
attributeRouter.get('/getWithPagination', attributeController.getWithPagination);
attributeRouter.post('/getWithPagination', attributeController.getWithPagination);

/**
 * @swagger
 * /admin/attribute/bulkUpdate:
 *   put:
 *     summary: Bulk update attributes
 *     tags: [Admin/Attribute]
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
 *         description: Attributes updated successfully
 */
attributeRouter.put('/bulkUpdate', attributeController.updateManyByFilter);

/**
 * @swagger
 * /admin/attribute/updateOneByFilter:
 *   put:
 *     summary: Update one attribute by filter
 *     tags: [Admin/Attribute]
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
 *         description: Attribute updated successfully
 */
attributeRouter.put('/updateOneByFilter', attributeController.updateOneByFilter);

/**
 * @swagger
 * /admin/attribute/updateManyByFilter:
 *   put:
 *     summary: Update many attributes by filter
 *     tags: [Admin/Attribute]
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
 *         description: Attributes updated successfully
 */
attributeRouter.put('/updateManyByFilter', attributeController.updateManyByFilter);

/**
 * @swagger
 * /admin/attribute/bulkCreate:
 *   post:
 *     summary: Create multiple attributes
 *     tags: [Admin/Attribute]
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
 *         description: Attributes created successfully
 */
attributeRouter.post('/bulkCreate', attributeController.bulkCreate);

/**
 * @swagger
 * /admin/attribute/deleteByFilter:
 *   delete:
 *     summary: Delete attributes by filter
 *     tags: [Admin/Attribute]
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
 *         description: Attributes deleted successfully
 */
attributeRouter.delete('/deleteByFilter', attributeController.deleteByFilter);

/**
 * @swagger
 * /admin/attribute:
 *   post:
 *     summary: Create an attribute
 *     tags: [Admin/Attribute]
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
 *         description: Attribute created successfully
 */
attributeRouter.post('/', validateRequest(createAttributeSchema), attributeController.create);

export default attributeRouter;
