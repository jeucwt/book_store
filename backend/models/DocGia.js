import mongoose from 'mongoose';

export default mongoose.model('DocGia', new mongoose.Schema({
  HoLot:     { type: String, required: true },
  Ten:       { type: String, required: true },
  NgaySinh:  Date,
  Phai:      { type: String, enum: ['Nam', 'Nữ', 'Khác'] },
  DiaChi:    String,
  DienThoai: String,
  Email:     { type: String, required: true, unique: true, lowercase: true },
  MatKhau:   { type: String, required: true }   // đã băm bằng bcrypt
}, { timestamps: true }));
