import express from 'express';
import { verifyJWT, restrictTo } from '../../middleware/auth.middleware.js';
import * as searchController from './search.controller.js';

const router = express.Router();

router.use(verifyJWT, restrictTo('admin', 'designer'));
router.get('/', searchController.globalSearch);

export default router;
