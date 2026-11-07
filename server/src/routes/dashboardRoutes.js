import express from 'express';
import { getDashboardStats, getHotspots } from '../controllers/dashboardController.js';
import { serverCache } from '../config/cache.js';

const router = express.Router();

// 30-second server cache for public metrics, sub-2ms response
router.get('/stats', serverCache.middleware(30000), getDashboardStats);
router.get('/hotspots', serverCache.middleware(30000), getHotspots);

export default router;
