import { Router } from 'express';
import homeController from '../controllers/Home.js';

const router = new Router();

export default router.get('/', homeController.index);
