import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * High-order middleware to validate the request body against a Zod schema.
 * If validation fails, it passes the ZodError to the central error handler.
 * 
 * @param schema - The Zod schema to validate req.body against
 */
export const validate =
  (schema: ZodSchema) =>
    (req: Request, res: Response, next: NextFunction): void => {
      try {
        schema.parse(req.body);
        next();
      } catch (error) {
        next(error);
      }
    };
