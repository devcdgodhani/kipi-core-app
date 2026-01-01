import { Router } from 'express';
// import { jwtAuth } from '../../middlewares/jwtAuth'; // Assuming auth is needed, usually yes
import FileStorageController from '../../controllers/fileStorageController';
import FileStorageValidator from '../../validators/fileStorageValidators';
import { uploadMiddleware } from '../../middlewares/uploadMiddleware';

const router = Router();
const fileStorageController = new FileStorageController();
const fileStorageValidator = new FileStorageValidator();

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

router.delete('/deleteByFilter', fileStorageValidator.deleteByFilter, fileStorageController.deleteByFilter);

/****************************************************** */

export default router;
