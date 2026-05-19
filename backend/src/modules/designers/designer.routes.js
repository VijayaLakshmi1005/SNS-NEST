import { Router } from 'express';
import { getDesigners, getDesignerById, getDesignerAvailability } from './designer.controller.js';
import { verifyJWT } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/', getDesigners);
router.get('/:id', getDesignerById);
router.get('/:id/availability', getDesignerAvailability);

export default router;
