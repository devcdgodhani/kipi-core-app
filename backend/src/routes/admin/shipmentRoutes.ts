import express from 'express';
import { ShipmentController } from '../../controllers/shipmentController';
import ShipmentValidator from '../../validators/shipmentValidators';
import { jwtAuth } from '../../middlewares';

const router = express.Router();
const shipmentController = new ShipmentController();
const shipmentValidator = new ShipmentValidator();

router.use(jwtAuth);

/***************** base crud structure*******************/
router.route('/getOne')
  .get(shipmentController.getOne)
  .post(shipmentController.getOne);

router.route('/getAll')
  .get(shipmentController.getAll)
  .post(shipmentController.getAll);

router.route('/getWithPagination')
  .get(shipmentValidator.getAll, shipmentController.getWithPagination)
  .post(shipmentValidator.getAll, shipmentController.getWithPagination);

router.put('/:id', shipmentController.updateById);
router.post('/', shipmentValidator.create, shipmentController.create);
router.delete('/deleteByFilter', shipmentController.deleteByFilter);

/***************** specialized routes *******************/
router.post('/check-serviceability', shipmentValidator.checkServiceability, shipmentController.checkServiceability);
router.get('/track/:awb', shipmentValidator.track, shipmentController.track);
router.post('/cancel/:id', shipmentValidator.cancel, shipmentController.cancel);
router.get('/:id', shipmentController.getOne); // Alias for convenience

export default router;
