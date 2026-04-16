import { Router } from 'express';
import { protect, admin } from '../middleware/auth.middleware';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  updateProductStock
} from '../controllers/product.controller';
import {
  getOrders,
  updateOrderStatus
} from '../controllers/order.controller';
import {
  getAdminMetrics,
  createAdminUser
} from '../controllers/admin.controller';
import { validate } from '../middleware/validate.middleware';
import { createProductSchema, updateProductSchema, updateStockSchema } from '@ecommerce/shared';
import { updateOrderStatusSchema, registerSchema } from '@ecommerce/shared';

const router = Router();

/**
 * Admin Routes
 * Strictly protected by both 'protect' (JWT) and 'admin' (RBAC) middleware.
 */
router.use(protect, admin);

// --- Product Management ---
router.post('/products', validate(createProductSchema), createProduct);
router.put('/products/:id', validate(updateProductSchema), updateProduct);
router.delete('/products/:id', deleteProduct); // Soft Delete
router.patch('/products/:id/stock', validate(updateStockSchema), updateProductStock);

// --- Global Order Management ---
router.get('/orders', getOrders);
router.patch('/orders/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);

// --- Systems & Metrics ---
router.get('/metrics', getAdminMetrics);
router.post('/users', validate(registerSchema), createAdminUser);

export default router;
