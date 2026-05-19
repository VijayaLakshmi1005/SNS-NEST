import { Router } from 'express';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { sendMessageSchema, editMessageSchema, reactMessageSchema } from './chat.validation.js';
import * as chatController from './chat.controller.js';

const router = Router();

// Gated routes under authentication verification
router.use(verifyJWT);

// 1. Get recent conversations
router.get('/conversations', chatController.getConversations);

// 2. Fetch message history
router.get('/:conversationId/messages', chatController.getMessages);

// 3. Send message
router.post('/send', validate(sendMessageSchema), chatController.sendMessage);

// 4. Edit message
router.patch('/message/:id/edit', validate(editMessageSchema), chatController.editMessage);

// 5. Delete for me
router.delete('/message/:id/delete-for-me', chatController.deleteMessageForMe);

// 6. Delete for everyone
router.delete('/message/:id/delete-for-everyone', chatController.deleteMessageForEveryone);

// 7. React to message
router.post('/message/:id/react', validate(reactMessageSchema), chatController.reactToMessage);

// 8. Upload attachment
router.post('/upload', chatController.uploadChatAttachment);

export default router;
