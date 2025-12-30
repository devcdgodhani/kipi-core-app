import { Router } from 'express';

const router = Router();

import authRoute from '../common/authRoute';
import userRoutes from './userRoutes';

router.use('/auth', authRoute);

router.use('/user', userRoutes);

export default router;
