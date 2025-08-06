import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { router } from './routes';
import { registerProcessHandlers } from './utils/processHandlers';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';
import { testDbConnection } from './db';

dotenv.config();
const app = express();

registerProcessHandlers();

app.use(express.json());

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  testDbConnection();
});

// Handle unhandled promise rejections in the server
server.on('error', (error) => {
  logger.error(`Server error: ${error.message}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});