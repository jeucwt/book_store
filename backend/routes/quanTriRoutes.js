import express from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js'; // sửa đường dẫn nếu khác
import {
  layDanhSachSach, layChiTietSach, taoSach, capNhatSach, xoaSach
} from '../controllers/quanTriSachController.js';
import {
  layDanhSachChuong, layChuong, taoChuong, capNhatChuong, xoaChuong, doiChoChuong
} from '../controllers/quanTriChuongController.js';
import {
  layDanhSachGoiThue, capNhatGoiThue,
  layDanhSachDocGia, layDanhSachLuotThue, layChiTietLuotThue
} from '../controllers/quanTriThueController.js';

const router = express.Router();

// Toàn bộ khu quản trị: phải là nhân viên hoặc admin
router.use(verifyToken, requireRole('nhanvien', 'admin'));
const chiAdmin = requireRole('admin');

// Sách (xem: cả hai vai trò; ghi: admin)
router.get('/sach', layDanhSachSach);
router.get('/sach/:id', layChiTietSach);
router.post('/sach', chiAdmin, taoSach);
router.put('/sach/:id', chiAdmin, capNhatSach);
router.delete('/sach/:id', chiAdmin, xoaSach);

// Chương (admin)
router.get('/sach/:id/chuong', chiAdmin, layDanhSachChuong);
router.post('/sach/:id/chuong', chiAdmin, taoChuong);
router.patch('/sach/:id/chuong/doi-cho', chiAdmin, doiChoChuong);
router.get('/sach/:id/chuong/:so', chiAdmin, layChuong);
router.put('/sach/:id/chuong/:so', chiAdmin, capNhatChuong);
router.delete('/sach/:id/chuong/:so', chiAdmin, xoaChuong);

// Gói thuê (xem: cả hai; sửa: admin)
router.get('/goi-thue', layDanhSachGoiThue);
router.put('/goi-thue/:id', chiAdmin, capNhatGoiThue);

// Độc giả và lượt thuê (cả hai vai trò, chỉ xem)
router.get('/doc-gia', layDanhSachDocGia);
router.get('/thue', layDanhSachLuotThue);
router.get('/thue/:id', layChiTietLuotThue);

export default router;