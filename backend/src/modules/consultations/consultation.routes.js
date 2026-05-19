import { Router } from 'express';
import { 
  bookConsultation, 
  getUpcomingConsultations, 
  getConsultationHistory, 
  rescheduleConsultation 
} from './consultation.controller.js';
import { verifyJWT } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.post('/book', bookConsultation);
router.get('/upcoming', getUpcomingConsultations);
router.get('/history', getConsultationHistory);
router.patch('/reschedule', rescheduleConsultation);

export default router;
