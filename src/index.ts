import { app } from './app';

const DEFAULT_PORT = 3000;
const port = Number(process.env.PORT) || DEFAULT_PORT;

export const startServer = (serverPort = port) => {
  return app.listen(serverPort, () => {
    console.info(`Server running on port ${serverPort}`);
    console.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

export const server = process.env.NODE_ENV === 'test' ? undefined : startServer();
