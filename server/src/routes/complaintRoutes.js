import express from 'express';
import {
  createComplaint,
  getComplaintByTrackingId,
  getAllComplaints,
  getMyComplaints,
  resolveComplaint,
  updateComplaintStatus,
  processVoiceComplaint,
  reopenComplaint,
  verifyComplaintResolution,
  checkDuplicateComplaints,
  verifyResolutionAI
} from '../controllers/complaintController.js';
import { serverCache } from '../config/cache.js';

const router = express.Router();

// Helper middleware to clear speed tier cache on any mutation
const invalidateCache = (req, res, next) => {
  serverCache.invalidateAll();
  next();
};

router.post('/', invalidateCache, createComplaint);
router.post('/voice-process', processVoiceComplaint);
router.get('/nearby-duplicates', checkDuplicateComplaints);
router.get('/', getAllComplaints);
router.get('/my', getMyComplaints);
router.get('/:trackingId', getComplaintByTrackingId);
router.put('/:id/resolve', invalidateCache, resolveComplaint);
router.post('/:id/resolve', invalidateCache, resolveComplaint);
router.put('/:id/status', invalidateCache, updateComplaintStatus);
router.post('/:id/reopen', invalidateCache, reopenComplaint);
router.post('/:id/verify-resolution', invalidateCache, verifyComplaintResolution);
router.post('/:id/verify-resolution-ai', invalidateCache, verifyResolutionAI);

export default router;

