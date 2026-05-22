import express from 'express';
import { getTickets, getTicketMessages, replyToTicket, updateTicketStatus } from './support.controller.js';
import { verifyJWT, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyJWT);
router.use(restrictTo('admin', 'super_admin'));

router.get('/tickets', getTickets);
router.get('/tickets/:id/messages', getTicketMessages);
router.post('/tickets/:id/reply', replyToTicket);
router.patch('/tickets/:id/status', updateTicketStatus);

export default router;
