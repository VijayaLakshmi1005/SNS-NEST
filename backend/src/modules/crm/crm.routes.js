import express from 'express';
import * as crmController from './crm.controller.js';
import { verifyJWT as protect, restrictTo as authorize } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();

// All CRM routes are restricted to ADMIN and potentially SUPERADMIN
router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.SUPERADMIN));

router.get('/analytics', crmController.getAnalytics);
router.get('/clients', crmController.getClients);
router.post('/clients', crmController.createClient);
router.get('/clients/:id', crmController.getClientDetails);
router.patch('/clients/:id', crmController.updateClient);
router.delete('/clients/:id', crmController.deleteClient);

router.patch('/clients/:id/status', crmController.updateClientStatus);
router.post('/clients/:id/assign-designer', crmController.assignDesigner);
router.post('/clients/:id/note', crmController.addNote);

export default router;
