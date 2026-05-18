import { Router } from 'express';
import { getConversationsList, getMessagesBetweenUsers } from '../controllers/chat.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/conversations', getConversationsList);
router.get('/messages/:id', getMessagesBetweenUsers);

export default router;
