import express from 'express';
import { verifyJWT, restrictTo } from '../../middleware/auth.middleware.js';
import * as supportController from './support.controller.js';

const router = express.Router();

router.use(verifyJWT);

router.get('/dashboard', restrictTo('admin'), supportController.getDashboardKPIs);

router.route('/')
  .get(supportController.getTickets)
  .post(supportController.createTicket);

router.route('/:id')
  .get(supportController.getTicketById)
  .patch(restrictTo('admin', 'designer'), supportController.updateTicket);

router.route('/:id/messages')
  .get(supportController.getTicketMessages)
  .post(supportController.sendMessage);

export default router;
