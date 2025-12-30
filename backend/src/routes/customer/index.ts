import { Router } from 'express';

const router = Router();

import authRoute from '../common/authRoute';

router.use('/auth', authRoute);


export default router;
