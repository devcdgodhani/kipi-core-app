import express from 'express';
import { ShipmentController } from '../../controllers/shipmentController';
import ShipmentValidator from '../../validators/shipmentValidators';

const router = express.Router();
const shipmentController = new ShipmentController();
const shipmentValidator = new ShipmentValidator();

// Serviceability
router.post(
  '/check-serviceability',
  shipmentValidator.checkServiceability,
  shipmentController.checkServiceability
);

// CRUD
router.post(
  '/create',
  shipmentValidator.create,
  shipmentController.create
);

router.post(
  '/getWithPagination',
  shipmentValidator.getAll,
  shipmentController.getAll
);

router.get(
  '/:id',
  shipmentController.getOne
);

// Tracking
router.get(
  '/track/:awb',
  shipmentValidator.track,
  shipmentController.track
);

// Cancellation
router.post(
  '/cancel/:id',
  shipmentValidator.cancel,
  shipmentController.cancel
);

export default router;
