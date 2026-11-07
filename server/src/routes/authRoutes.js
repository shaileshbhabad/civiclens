import express from 'express';
import {
  login,
  getAuthorities,
  createAuthority,
  updateAuthority,
  deleteAuthority
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.get('/authorities', getAuthorities);
router.post('/authorities', createAuthority);
router.put('/authorities/:id', updateAuthority);
router.delete('/authorities/:id', deleteAuthority);

export default router;
