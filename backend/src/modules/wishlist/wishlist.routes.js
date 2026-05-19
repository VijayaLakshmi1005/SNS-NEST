import { Router } from 'express';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import {
  saveWishlistItemSchema,
  createCollectionSchema,
  updateCollectionSchema,
  addDesignToCollectionSchema,
  updateNotesSchema
} from './wishlist.validation.js';
import * as wishlistController from './wishlist.controller.js';

const router = Router();

// Gated routes under client/designer token auth
router.use(verifyJWT);

// Core Wishlist queries
router.get('/', wishlistController.getWishlist);
router.post('/save', validate(saveWishlistItemSchema), wishlistController.saveWishlistItem);
router.delete('/:id', wishlistController.removeWishlistItem);

// Collections management
router.post('/collections', validate(createCollectionSchema), wishlistController.createCollection);
router.patch('/collections/:id', validate(updateCollectionSchema), wishlistController.updateCollection);
router.delete('/collections/:id', wishlistController.deleteCollection);
router.post('/collections/:id/add', validate(addDesignToCollectionSchema), wishlistController.addDesignToCollection);

// Extras: recent saves and shared recommendations
router.get('/recent', wishlistController.getRecentSaves);
router.get('/shared', wishlistController.getSharedInspirations);

// Syncing notes on specific saved inspirations
router.patch('/:id/notes', validate(updateNotesSchema), wishlistController.updateNotes);

export default router;
