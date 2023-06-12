import { Router } from 'express';
import tokenController from'../controllers/Token.js';

const router = new Router();

export default router.post('/', tokenController.store);
