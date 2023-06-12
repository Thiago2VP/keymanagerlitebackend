import { Router } from 'express';
import apiKeyController from'../controllers/ApiKey.js';

const router = new Router();

export default router.post('/', apiKeyController.validate);
