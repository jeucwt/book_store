import { Router } from 'express';
import {
  dangKy,
  dangNhap,
  dangNhapNhanVien,
  me,
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/dang-ky', dangKy);
router.post('/dang-nhap', dangNhap);
router.post('/nhan-vien/dang-nhap', dangNhapNhanVien);
router.get('/me', verifyToken, me);

export default router;