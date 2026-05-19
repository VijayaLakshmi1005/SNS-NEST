import { Router } from 'express';
import { createTicket, getTickets, getFaqs } from '../controllers/support.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/faq', getFaqs);
router.post('/tickets', verifyJWT, createTicket);
router.get('/tickets', verifyJWT, getTickets);

export default router;
