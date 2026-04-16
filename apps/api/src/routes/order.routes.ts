import express from 'express';
import {
  getMyOrders,
  getOrderById,
  updateOrderToDelivered,
  getOrders,
} from '../controllers/order.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

router.route('/').get(protect, admin, getOrders);
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);

export default router;
