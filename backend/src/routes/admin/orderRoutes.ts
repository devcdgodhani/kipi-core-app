import { Router } from 'express';
import OrderController from '../../controllers/orderController';

const router = Router();
const orderController = new OrderController();

// Paginated list of all orders for Admin
router.post('/getAll', orderController.getAllOrders);

// Get details of a specific order
router.post('/getOne/:id', orderController.getOne);

// Update order status
router.put('/updateStatus/:id', orderController.updateStatus);

export default router;
