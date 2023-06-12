import { Router } from 'express';
import userController from '../controllers/User.js';

import loginRequired from '../middlewares/loginRequired.js';

const router = new Router();

router.post('/', userController.store);
router.put("/", loginRequired, userController.update);
router.delete("/", loginRequired, userController.delete);

export default router;
