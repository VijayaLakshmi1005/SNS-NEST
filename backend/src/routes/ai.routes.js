import { Router } from 'express';
import { generateAiDesign } from '../controllers/ai.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(verifyJWT);

router.post('/generate', upload.single('image'), generateAiDesign);

export default router;
