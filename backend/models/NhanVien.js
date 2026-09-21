import mongoose from 'mongoose';

const nhanVienSchema = new mongoose.Schema({
    HoTenNV: { type: String, required: true },
    Password: { type: String, required: true },   // lưu bản hash
    ChucVu: { type: String },
    DiaChi: { type: String },
    SoDienThoai: { type: String }
});

export default mongoose.model('NhanVien', nhanVienSchema);
