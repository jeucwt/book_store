import mongoose from 'mongoose';

export default mongoose.model('NhanVien', new mongoose.Schema({
  MSNV:        { type: String, required: true, unique: true },
  HoTenNV:     { type: String, required: true },
  Password:    { type: String, required: true },  // đã băm bằng bcrypt
  ChucVu:      { type: String, enum: ['admin', 'nhanvien'], default: 'nhanvien' },
  DiaChi:      String,
  SoDienThoai: String
}));
