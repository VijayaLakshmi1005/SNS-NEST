import { Router } from 'express';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { calculateSchema, downloadPdfSchema } from './estimator.validation.js';
import * as estimatorController from './estimator.controller.js';

const router = Router();

// Package and Material configurations are public or authenticated - let's verifyJWT first to keep it secure
router.use(verifyJWT);

router.post('/calculate', validate(calculateSchema), estimatorController.calculate);
router.get('/packages', estimatorController.getPackages);
router.get('/materials', estimatorController.getMaterials);
router.get('/history', estimatorController.getHistory);
router.post('/download-pdf', validate(downloadPdfSchema), estimatorController.downloadPdf);
router.get('/:id', estimatorController.getById);

export default router;
