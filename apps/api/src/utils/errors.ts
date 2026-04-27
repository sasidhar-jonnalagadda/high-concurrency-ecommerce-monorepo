export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Not authorized, please login') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Not authorized to access this resource') {
    super(message, 403);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class ResourceNotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    super(message, 404);
  }
}

export class InsufficientStockError extends AppError {
  constructor(productName: string, requested: number, available: number) {
    super(
      `Insufficient stock for "${productName}". Requested: ${requested}, Available: ${available}`,
      400
    );
  }
}

export class LockAcquisitionError extends AppError {
  constructor(resource: string) {
    super(
      `Could not acquire lock for ${resource}. High traffic, please try again shortly.`,
      429
    );
  }
}

export class ConcurrencyConflictError extends AppError {
  constructor(resource: string) {
    super(
      `Concurrency conflict detected for ${resource}. Please try again.`,
      409
    );
  }
}
