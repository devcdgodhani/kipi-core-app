import { Router } from 'express';
import UserController from '../../../controllers/userController';
import UserValidator from '../../../validators/userValidators';

const router = Router();
const userController = new UserController();
const userValidator = new UserValidator();

/**
 * @swagger
 * tags:
 *   name: Admin/User
 *   description: User management APIs (Admin only)
 */

/**
 * @swagger
 * /admin/user/getOne:
 *   get:
 *     summary: Get one user
 *     tags: [Admin/User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: _id
 *         schema:
 *           type: string
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 */
router.get('/getOne', userValidator.getOne, userController.getOne);

/**
 * @swagger
 * /admin/user/getAll:
 *   get:
 *     summary: Get all users
 *     tags: [Admin/User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/getAll', userValidator.getAll, userController.getAll);

/**
 * @swagger
 * /admin/user/getWithPagination:
 *   get:
 *     summary: Get users with pagination
 *     tags: [Admin/User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Users retrieved successfully with pagination
 */
router.get('/getWithPagination', userValidator.getWithPagination, userController.getWithPagination);

router.post('/getOne', userValidator.getOne, userController.getOne);
router.post('/getAll', userValidator.getAll, userController.getAll);
router.post(
  '/getWithPagination',
  userValidator.getWithPagination,
  userController.getWithPagination
);

/**
 * @swagger
 * /admin/user/bulkUpdate:
 *   put:
 *     summary: Bulk update users
 *     tags: [Admin/User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 $ref: '#/components/schemas/UserStatus'
 *     responses:
 *       200:
 *         description: Users updated successfully
 */
router.put('/bulkUpdate', userValidator.updateByFilter, userController.updateManyByFilter);

/**
 * @swagger
 * /admin/user/updateOneByFilter:
 *   put:
 *     summary: Update one user by filter
 *     tags: [Admin/User]
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
 *                 properties:
 *                   _id:
 *                     type: string
 *               update:
 *                 type: object
 *                 properties:
 *                   status:
 *                     $ref: '#/components/schemas/UserStatus'
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/updateOneByFilter', userValidator.updateByFilter, userController.updateOneByFilter);

/**
 * @swagger
 * /admin/user/updateManyByFilter:
 *   put:
 *     summary: Update many users by filter
 *     tags: [Admin/User]
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
 *                   properties:
 *                     _id:
 *                       type: string
 *                 update:
 *                   type: object
 *                   properties:
 *                     status:
 *                       $ref: '#/components/schemas/UserStatus'
 *     responses:
 *       200:
 *         description: Users updated successfully
 */
router.put(
  '/updateManyByFilter',
  userValidator.updateManyByFilter,
  userController.updateManyByFilter
);

/**
 * @swagger
 * /admin/user/bulkCreate:
 *   post:
 *     summary: Bulk create users
 *     tags: [Admin/User]
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
 *                 type:
 *                   $ref: '#/components/schemas/UserType'
 *                 status:
 *                   $ref: '#/components/schemas/UserStatus'
 *     responses:
 *       201:
 *         description: Users created successfully
 */
router.post('/bulkCreate', userValidator.bulkCreate, userController.create);

/**
 * @swagger
 * /admin/user:
 *   post:
 *     summary: Create a user
 *     tags: [Admin/User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 $ref: '#/components/schemas/UserType'
 *               status:
 *                 $ref: '#/components/schemas/UserStatus'
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/', userValidator.create, userController.create);

/**
 * @swagger
 * /admin/user/deleteByFilter:
 *   delete:
 *     summary: Delete user by filter
 *     tags: [Admin/User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/deleteByFilter', userValidator.deleteByFilter, userController.deleteByFilter);

export default router;
