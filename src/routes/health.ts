import { Router, Request, Response } from 'express';
import { getAppVersion } from '../config/appVersion';
import { HealthCheckResponse } from '../types';

const router = Router();

router.get('/', (_req: Request, res: Response): void => {
  const healthResponse: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: getAppVersion(),
    environment: process.env.NODE_ENV || 'development',
  };

  res.json({
    success: true,
    data: healthResponse,
  });
});

router.get('/ready', (_req: Request, res: Response): void => {
  // Add readiness checks here (database, redis, etc.)
  res.json({
    success: true,
    message: 'Service is ready to accept requests',
  });
});

router.get('/live', (_req: Request, res: Response): void => {
  // Simple liveness check
  res.json({
    success: true,
    message: 'Service is alive',
  });
});

export default router;
