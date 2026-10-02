import express from 'express';
import {
  getKavitas,
  getKavitaById,
  getDailyKavita,
  createKavita,
  updateKavita,
  deleteKavita,
  getMyKavitas,
  exportAllMyKavitas,
  toggleLike,
  addComment,
  toggleVisibility,
  getPoetComments,
  trackKavitaView,
} from '../controllers/kavitaController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getKavitas);
router.get('/daily/featured', getDailyKavita);

// Poet specific routes (must be defined before /:id)
router.get('/my/all', protect, authorize('writer', 'admin', 'superadmin'), getMyKavitas);
router.get('/my/export-all', protect, authorize('writer', 'admin', 'superadmin'), exportAllMyKavitas);
router.get('/my/comments', protect, authorize('writer', 'admin', 'superadmin'), getPoetComments);

// Single poem & view tracking
router.get('/:id', getKavitaById);
router.post('/:id/track-view', trackKavitaView);

// Protected actions
router.post('/', protect, authorize('writer', 'admin', 'superadmin'), createKavita);
router.put('/:id', protect, updateKavita);
router.delete('/:id', protect, deleteKavita);

// Show / Hide poem on website visibility toggle
router.put('/:id/visibility', protect, toggleVisibility);

// Reader engagement
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, addComment);

export default router;
