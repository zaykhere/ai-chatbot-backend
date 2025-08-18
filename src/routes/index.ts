import { Router } from 'express';
import { authRouter } from './authRoutes';
import { chatbotRouter } from './chatbotRoutes';

const router = Router();

// API routes
router.use('/auth', authRouter);
router.use('/chatbots', chatbotRouter);
// router.use('/products', productRouter);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK' });
});

export { router };