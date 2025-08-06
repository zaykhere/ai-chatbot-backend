import { Router } from 'express';
import { authRouter } from './authRoutes';

const router = Router();

// API routes
router.use('/auth', authRouter);
// router.use('/users', userRouter);
// router.use('/products', productRouter);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK' });
});

export { router };