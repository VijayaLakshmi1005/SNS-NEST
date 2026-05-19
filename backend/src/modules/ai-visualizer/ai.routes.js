import { Router } from 'express';
import { 
  uploadOriginalImage, 
  generateAiDesign, 
  getGenerationHistory, 
  getGenerationById, 
  deleteGeneration 
} from './ai.controller.js';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';

const router = Router();

router.use(verifyJWT);

router.post('/upload', upload.single('image'), uploadOriginalImage);
router.post('/generate', upload.single('image'), generateAiDesign);
router.get('/history', getGenerationHistory);
router.get('/:id', getGenerationById);
router.delete('/:id', deleteGeneration);

export default router;
