import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import { getAppVersion } from './config/appVersion';
import healthRouter from './routes/health';
import usersRouter from './routes/users';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

export const createApp = () => {
  const app = express();

  app.use(helmet());

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/health', healthRouter);
  app.use('/api/users', usersRouter);

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Welcome to the CI/CD Pipeline Demo API',
      version: getAppVersion(),
      endpoints: {
        health: '/health',
        users: '/api/users',
      },
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export const app = createApp();
