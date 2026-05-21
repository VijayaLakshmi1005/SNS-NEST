import express from 'express';
import { restrictTo, verifyJWT } from '../../middleware/auth.middleware.js';
import * as userController from './user.controller.js';

const router = express.Router();

// CRM routes are highly sensitive; restrict to Admin level
router.use(verifyJWT, restrictTo('admin', 'super_admin'));

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserProfile);
router.patch('/:id/block', userController.toggleBlockUser);
router.post('/:id/notes', userController.addInternalNote);

export default router;
