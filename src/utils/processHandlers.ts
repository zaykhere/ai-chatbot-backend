import { logger } from './logger';

const registerProcessHandlers = () => {
  process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    // Optional: crash the process
    // process.exit(1);
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
    // Optional: crash the process after logging
    // process.exit(1);
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully');
    // Clean up resources here
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received. Shutting down gracefully');
    // Clean up resources here
    process.exit(0);
  });
};

export { registerProcessHandlers };