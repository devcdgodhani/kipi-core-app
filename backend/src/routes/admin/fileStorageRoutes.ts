import { Router } from 'express';
import { fileStorageController } from '../../controllers/fileStorageController';
import { fileStorageValidator } from '../../validators/fileStorageValidators';
import { uploadMiddleware } from '../../middlewares/uploadMiddleware';

const router = Router();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(fileStorageValidator.getOne, fileStorageController.getOne)
  .post(fileStorageValidator.getOne, fileStorageController.getOne);

router.route('/getAll')
  .get(fileStorageValidator.getAll, fileStorageController.getAll)
  .post(fileStorageValidator.getAll, fileStorageController.getAll);

router.route('/getWithPagination')
  .get(fileStorageValidator.getWithPagination, fileStorageController.getWithPagination)
  .post(fileStorageValidator.getWithPagination, fileStorageController.getWithPagination);

router.put('/:id', fileStorageValidator.updateById, fileStorageController.updateById);

// Upload route - allows multiple files
router.post(
  '/', 
  uploadMiddleware.array('files'), 
  fileStorageValidator.upload, 
  fileStorageController.upload
);

router.post('/create-folder', fileStorageValidator.createFolder, fileStorageController.createFolder);
router.post('/move-file', fileStorageValidator.moveFile, fileStorageController.moveFile);

router.delete('/deleteByFilter', fileStorageValidator.deleteByFilter, fileStorageController.deleteByFilter);

/****************************************************** */

export default router;
