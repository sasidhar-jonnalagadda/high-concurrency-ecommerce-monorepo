import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import { env } from './config/env';
import { prisma } from './config/db';
import { redis } from './config/redis';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import checkoutRoutes from './routes/checkout.routes';
import webhookRoutes from './routes/webhook.routes';
import adminRoutes from './routes/admin.routes';
import { notFound, errorHandler } from './middleware/error.middleware';
import { startInventoryCleanupWorker } from './workers/inventory-cleanup';

const app = express();

app.use(helmet());
app.use(hpp());

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', (req, res, next) => {
  if (req.path.startsWith('/v1/webhooks')) return next();
  globalLimiter(req, res, next);
});

app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(compression());
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/checkout', checkoutRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV
  });
});

app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  startInventoryCleanupWorker();
});

const gracefulShutdown = async (signal: string) => {

  server.close(async () => {

    try {
      await prisma.$disconnect();

      await redis.quit();

      process.exit(0);
    } catch (err) {
      console.error('Error during graceful shutdown:', err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled Rejection at:', reason.stack || reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

export default app;
