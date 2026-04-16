import express from 'express';
import { createCheckoutSession } from '../controllers/checkout.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { checkoutSchema } from '@ecommerce/shared';

const router = express.Router();

router.post('/', protect, validate(checkoutSchema), createCheckoutSession);

export default router;
