import express from 'express';
import {
  getIncidents,
  getIncidentById,
  updateIncidentStatus,
  upvoteIncident
} from '../controllers/incidentController.js';
import { serverCache } from '../config/cache.js';

const router = express.Router();

// 15-second cache for public and admin incident queues
router.get('/', serverCache.middleware(15000), getIncidents);
router.get('/:id', getIncidentById);

// Status updates and upvotes invalidate cache immediately
router.put('/:id/status', (req, res, next) => {
  serverCache.invalidateAll();
  updateIncidentStatus(req, res, next);
});
router.post('/:id/upvote', (req, res, next) => {
  serverCache.invalidateAll();
  upvoteIncident(req, res, next);
});
router.put('/:id/upvote', (req, res, next) => {
  serverCache.invalidateAll();
  upvoteIncident(req, res, next);
});

export default router;
