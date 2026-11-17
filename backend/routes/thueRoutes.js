import express from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import {
  thueSach,
  giaHanSach,
  layDanhSachThueCuaToi,
} from '../controllers/thueController.js';

const router = express.Router();

router.use(verifyToken, requireRole('docgia'));

router.post('/', thueSach);
router.post('/gia-han', giaHanSach);
router.get('/cua-toi', layDanhSachThueCuaToi);

export default router;