import express from 'express';
import { getMyNotifications, markAsRead, markAllAsRead } from './notification.controller.js';
import { verifyJWT, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyJWT);
router.use(restrictTo('admin', 'super_admin'));

router.get('/', getMyNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
