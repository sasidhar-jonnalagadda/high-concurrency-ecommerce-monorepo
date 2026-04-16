import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getTopProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} from '../controllers/product.controller';
import { protect, admin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createProductSchema, updateProductSchema, createReviewSchema } from '@ecommerce/shared';
const router = express.Router();
router.get('/', getProducts);
router.get('/top', getTopProducts);
router.post('/', protect, admin, validate(createProductSchema), createProduct);
router
  .route('/manage/:id')
  .put(protect, admin, validate(updateProductSchema), updateProduct)
  .delete(protect, admin, deleteProduct);
router.post('/:id/reviews', protect, validate(createReviewSchema), createProductReview);
router.get('/:slug', getProductBySlug);
export default router;
