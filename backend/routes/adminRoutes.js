import express from 'express';
import {
  getPlatformStats,
  getAllUsers,
  updateUserRole,
  moderateKavita,
  sendBrevoTest,
  toggleBlockUser,
  toggleRestrictUser,
  deleteUserAdmin,
  deleteKavitaAdmin,
  editKavitaAdmin,
  getManagedPoets,
  getHeritagePresets,
  createManagedPoet,
  updateManagedPoet,
  deleteManagedPoet,
  feedPoemForPoet,
  getSecurityTelemetry,
  getSecurityTelemetryStats,
  exportSecurityTelemetry,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply auth to all admin routes
router.use(protect);

// Admin & Super Admin routes
router.get('/stats', authorize('admin', 'superadmin'), getPlatformStats);
router.get('/users', authorize('admin', 'superadmin'), getAllUsers);
router.put('/kavitas/:id/status', authorize('admin', 'superadmin'), moderateKavita);
router.delete('/kavitas/:id', authorize('admin', 'superadmin'), deleteKavitaAdmin);
router.post('/brevo/test-email', authorize('admin', 'superadmin'), sendBrevoTest);

// 🛡️ Security Telemetry & Audit Logs (Admin & Super Admin)
router.get('/telemetry', authorize('admin', 'superadmin'), getSecurityTelemetry);
router.get('/telemetry/stats', authorize('admin', 'superadmin'), getSecurityTelemetryStats);
router.get('/telemetry/export', authorize('admin', 'superadmin'), exportSecurityTelemetry);

// 🏛️ Heritage Classical Poets Vault
router.get('/managed-poets/presets', authorize('admin', 'superadmin'), getHeritagePresets);
router.get('/managed-poets', authorize('admin', 'superadmin'), getManagedPoets);
router.post('/managed-poets', authorize('superadmin'), createManagedPoet);
router.put('/managed-poets/:id', authorize('superadmin'), updateManagedPoet);
router.delete('/managed-poets/:id', authorize('superadmin'), deleteManagedPoet);
router.post('/managed-poets/:id/feed-poem', authorize('superadmin'), feedPoemForPoet);

// Super Admin Only governance routes
router.put('/users/:id/role', authorize('superadmin'), updateUserRole);
router.put('/users/:id/block', authorize('superadmin'), toggleBlockUser);
router.put('/users/:id/restrict', authorize('superadmin'), toggleRestrictUser);
router.delete('/users/:id', authorize('superadmin'), deleteUserAdmin);
router.put('/kavitas/:id', authorize('superadmin'), editKavitaAdmin);

export default router;
