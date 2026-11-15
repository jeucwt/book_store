import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import DocGia from '../models/DocGia.js';
import NhanVien from '../models/NhanVien.js';

const SAI_TAI_KHOAN = 'Tài khoản hoặc mật khẩu không đúng';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const taoToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Loại bỏ mật khẩu trước khi trả về client
const docGiaPublic = (dg) => {
  const obj = dg.toObject ? dg.toObject() : { ...dg };
  delete obj.MatKhau;
  delete obj.__v;
  return obj;
};

const nhanVienPublic = (nv) => {
  const obj = nv.toObject ? nv.toObject() : { ...nv };
  delete obj.Password;
  delete obj.__v;
  return obj;
};

// POST /api/auth/dang-ky
export const dangKy = async (req, res) => {
  try {
    const { HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai, Email, MatKhau } = req.body;

    if (!HoLot || !Ten || !Email || !MatKhau) {
      return res.status(400).json({ message: 'Vui lòng nhập đủ Họ lót, Tên, Email và Mật khẩu' });
    }
    if (typeof Email !== 'string' || !EMAIL_REGEX.test(Email.trim())) {
      return res.status(400).json({ message: 'Email không hợp lệ' });
    }
    if (typeof MatKhau !== 'string' || MatKhau.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const email = Email.trim().toLowerCase();
    const daTonTai = await DocGia.findOne({ Email: email });
    if (daTonTai) {
      return res.status(409).json({ message: 'Email này đã được đăng ký' });
    }

    const hash = await bcrypt.hash(MatKhau, 10);
    const docGia = await DocGia.create({
      HoLot: HoLot.trim(),
      Ten: Ten.trim(),
      NgaySinh,
      Phai,
      DiaChi,
      DienThoai,
      Email: email,
      MatKhau: hash,
    });

    const token = taoToken(docGia._id, 'docgia');
    return res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: docGiaPublic(docGia),
    });
  } catch (err) {
    // Phòng trường hợp 2 request đăng ký trùng email cùng lúc (lỗi unique của MongoDB)
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email này đã được đăng ký' });
    }
    console.error('dangKy error:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// POST /api/auth/dang-nhap  (độc giả)
export const dangNhap = async (req, res) => {
  try {
    const { Email, MatKhau } = req.body;
    if (!Email || !MatKhau) {
      return res.status(400).json({ message: 'Vui lòng nhập Email và Mật khẩu' });
    }

    const docGia = await DocGia.findOne({ Email: String(Email).trim().toLowerCase() });
    // Sai email hoặc sai mật khẩu: dùng chung một thông báo
    if (!docGia) {
      return res.status(401).json({ message: SAI_TAI_KHOAN });
    }
    const dung = await bcrypt.compare(String(MatKhau), docGia.MatKhau);
    if (!dung) {
      return res.status(401).json({ message: SAI_TAI_KHOAN });
    }

    const token = taoToken(docGia._id, 'docgia');
    return res.json({
      message: 'Đăng nhập thành công',
      token,
      user: docGiaPublic(docGia),
    });
  } catch (err) {
    console.error('dangNhap error:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// POST /api/auth/nhan-vien/dang-nhap
export const dangNhapNhanVien = async (req, res) => {
  try {
    const { MSNV, Password } = req.body;
    if (!MSNV || !Password) {
      return res.status(400).json({ message: 'Vui lòng nhập MSNV và Mật khẩu' });
    }

    const nhanVien = await NhanVien.findOne({ MSNV: String(MSNV).trim() });
    if (!nhanVien) {
      return res.status(401).json({ message: SAI_TAI_KHOAN });
    }
    const dung = await bcrypt.compare(String(Password), nhanVien.Password);
    if (!dung) {
      return res.status(401).json({ message: SAI_TAI_KHOAN });
    }

    // ChucVu 'admin' -> role 'admin'; còn lại -> 'nhanvien'
    const role = nhanVien.ChucVu === 'admin' ? 'admin' : 'nhanvien';
    const token = taoToken(nhanVien._id, role);
    return res.json({
      message: 'Đăng nhập thành công',
      token,
      user: { ...nhanVienPublic(nhanVien), role },
    });
  } catch (err) {
    console.error('dangNhapNhanVien error:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// GET /api/auth/me  (cần token)
export const me = async (req, res) => {
  try {
    const { id, role } = req.user;

    if (role === 'docgia') {
      const docGia = await DocGia.findById(id).select('-MatKhau -__v');
      if (!docGia) {
        return res.status(401).json({ message: 'Tài khoản không còn tồn tại' });
      }
      return res.json({ role, user: docGia });
    }

    const nhanVien = await NhanVien.findById(id).select('-Password -__v');
    if (!nhanVien) {
      return res.status(401).json({ message: 'Tài khoản không còn tồn tại' });
    }
    return res.json({ role, user: nhanVien });
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};