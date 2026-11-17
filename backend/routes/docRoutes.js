import express from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { kiemTraThue } from '../middleware/kiemTraThue.js';
import { layMucLuc, docChuong } from '../controllers/docSachController.js';

const router = express.Router();

router.use(verifyToken, requireRole('docgia'));

router.get('/:maSach/muc-luc', kiemTraThue, layMucLuc);
router.get('/:maSach/chuong/:soChuong', kiemTraThue, docChuong);

export default router;