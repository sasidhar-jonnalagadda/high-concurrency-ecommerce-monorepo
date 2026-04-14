/**
 * @ecommerce/shared
 * 
 * This package serves as the single source of truth for all shared
 * TypeScript types, interfaces, enums, and Zod validation schemas.
 * 
 * It is consumed by both the Backend (apps/api) and Frontend (apps/web)
 * to ensure full type safety and consistent data validation.
 * 
 * @module
 */

// --- Common Utilities & Base Types ---
export * from './types/common';

// --- Domain Models & Entities ---
export * from './types/user';
export * from './types/product';
export * from './types/order';

// --- Validation Schemas & API Request Types ---
export * from './validators/user.schema';
export * from './validators/product.schema';
export * from './validators/order.schema';
