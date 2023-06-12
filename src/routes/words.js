import { Router } from 'express';
import wordsController from '../controllers/Words.js';

import loginRequired from '../middlewares/loginRequired.js';

const router = new Router();

router.get('/', loginRequired, wordsController.index);
router.get('/:id', loginRequired, wordsController.show);
router.post('/', loginRequired, wordsController.store);
router.put('/:id', loginRequired, wordsController.update);
router.delete('/:id', loginRequired, wordsController.delete);

export default router;
