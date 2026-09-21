import mongoose from 'mongoose';

const docGiaSchema = new mongoose.Schema({
    HoLot: { type: String, required: true },
    Ten: { type: String, required: true },
    NgaySinh: { type: Date },
    Phai: { type: String },
    DiaChi: { type: String },
    DienThoai: { type: String },
    Email: { type: String, required: true, unique: true },   // field thêm
    MatKhau: { type: String, required: true }                // field thêm, lưu bản hash
});

export default mongoose.model('DocGia', docGiaSchema);
