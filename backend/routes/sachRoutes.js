import { Router } from 'express';
import {
  layDanhSachSach,
  layChiTietSach,
  layDanhSachTheLoai,
  layDanhSachNam
} from '../controllers/sachController.js';

const router = Router();

router.get('/', layDanhSachSach);
router.get('/the-loai', layDanhSachTheLoai); // phải trước /:id
router.get('/nam', layDanhSachNam);          // phải trước /:id
router.get('/:id', layChiTietSach);

export default router;