import { Express, Router, RequestHandler } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import serviceRoutes from './service.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import reviewRoutes from './review.routes';
import messageRoutes from './message.routes';
import uploadRoutes from './upload.routes';
import paymentRoutes from './payment.routes';
import groupRoutes from './group.routes';
import followRoutes from './follow.routes';
import adminRoutes from './admin.routes';
import postRoutes from './post.routes';
import newsRoutes from './news.routes';

// Wrap every handler on a router so that errors thrown inside async
// handlers are forwarded to Express' error handling middleware instead of
// becoming unhandled promise rejections that crash the process.
const wrapRouterAsync = (router: Router): Router => {
  (router.stack || []).forEach((layer: any) => {
    const route = layer.route;
    if (!route) return;
    route.stack.forEach((routeLayer: any) => {
      const handler = routeLayer.handle as RequestHandler;
      if (typeof handler !== 'function' || handler.length >= 4) return;
      routeLayer.handle = function (req: any, res: any, next: any) {
        return Promise.resolve(handler(req, res, next)).catch(next);
      };
    });
  });
  return router;
};

export const initializeRoutes = (app: Express) => {
  // API prefix
  const apiPrefix = '/api';

  [
    authRoutes,
    userRoutes,
    serviceRoutes,
    productRoutes,
    orderRoutes,
    reviewRoutes,
    messageRoutes,
    uploadRoutes,
    paymentRoutes,
    groupRoutes,
    followRoutes,
    adminRoutes,
    postRoutes,
  ].forEach((r) => wrapRouterAsync(r as Router));

  // Auth routes
  app.use(`${apiPrefix}/auth`, authRoutes);

  // User routes
  app.use(`${apiPrefix}/users`, userRoutes);

  // Service routes
  app.use(`${apiPrefix}/services`, serviceRoutes);

  // Product routes
  app.use(`${apiPrefix}/products`, productRoutes);

  // Order routes
  app.use(`${apiPrefix}/orders`, orderRoutes);

  // Review routes
  app.use(`${apiPrefix}/reviews`, reviewRoutes);

  // Message routes
  app.use(`${apiPrefix}/messages`, messageRoutes);

  // Upload routes
  app.use(`${apiPrefix}/upload`, uploadRoutes);

  // Payment routes
  app.use(`${apiPrefix}/payments`, paymentRoutes);

  // Group routes
  app.use(`${apiPrefix}/groups`, groupRoutes);

  // Follow routes
  app.use(`${apiPrefix}/follows`, followRoutes);

  // Admin routes (protected by authenticate + authorize middleware inside admin.routes.ts)
  app.use(`${apiPrefix}/admin`, adminRoutes);

  // Post routes (social wall)
  app.use(`${apiPrefix}/posts`, postRoutes);

  // News feed
  app.use(`${apiPrefix}/news`, newsRoutes);

  // 404 handler
  app.use(`${apiPrefix}/*`, (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
};
