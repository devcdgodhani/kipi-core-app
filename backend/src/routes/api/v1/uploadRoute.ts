import { Router } from 'express';
import { UploadController, uploadMiddleware } from '../../../controllers/uploadController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Utility
 *   description: Utility APIs including file upload
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload an image file
 *     tags: [Utility]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     key:
 *                       type: string
 */
router.post('/', uploadMiddleware, UploadController.uploadImage);

/**
 * @swagger
 * /upload/getOne:
 *   post:
 *     summary: Get one upload record by filter
 *     tags: [Utility]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Upload record retrieved successfully
 */
router.get('/getOne', UploadController.getOne);
router.post('/getOne', UploadController.getOne);

/**
 * @swagger
 * /upload/getAll:
 *   post:
 *     summary: Get all upload records
 *     tags: [Utility]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Upload records retrieved successfully
 */
router.get('/getAll', UploadController.getAll);
router.post('/getAll', UploadController.getAll);

/**
 * @swagger
 * /upload/getWithPagination:
 *   post:
 *     summary: Get upload records with pagination
 *     tags: [Utility]
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
 *         description: Upload records retrieved successfully with pagination
 */
router.get('/getWithPagination', UploadController.getWithPagination);
router.post('/getWithPagination', UploadController.getWithPagination);

/**
 * @swagger
 * /upload/updateOneByFilter:
 *   put:
 *     summary: Update one upload record by filter
 *     tags: [Utility]
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
 *         description: Upload record updated successfully
 */
router.put('/updateOneByFilter', UploadController.updateOneByFilter);

/**
 * @swagger
 * /upload/updateManyByFilter:
 *   put:
 *     summary: Update many upload records by filter
 *     tags: [Utility]
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
 *         description: Upload records updated successfully
 */
router.put('/updateManyByFilter', UploadController.updateManyByFilter);

/**
 * @swagger
 * /upload/bulkCreate:
 *   post:
 *     summary: Bulk create upload records
 *     tags: [Utility]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *     responses:
 *       201:
 *         description: Upload records created successfully
 */
router.post('/bulkCreate', UploadController.bulkCreate);

/**
 * @swagger
 * /upload/deleteByFilter:
 *   delete:
 *     summary: Delete upload records by filter
 *     tags: [Utility]
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
 *         description: Upload records deleted successfully
 */
router.delete('/deleteByFilter', UploadController.deleteByFilter);

export default router;

