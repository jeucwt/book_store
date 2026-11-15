import mongoose from 'mongoose';

export default mongoose.model('ThanhToan', new mongoose.Schema({
  MaDocGia:   { type: mongoose.Schema.Types.ObjectId, ref: 'DocGia', required: true },
  SoTien:     { type: Number, required: true },
  PhuongThuc: { type: String, default: 'GiaLap' },   // sau này: VNPay / MoMo / PayOS
  TrangThai:  { type: String, enum: ['ChoXuLy', 'ThanhCong', 'ThatBai'], default: 'ChoXuLy' }
}, { timestamps: true }));   // createdAt = NgayTao
