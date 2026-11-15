import mongoose from 'mongoose';

export default mongoose.model('Sach', new mongoose.Schema({
  TenSach:    { type: String, required: true },
  TacGia:     { type: String, required: true },
  MaNXB:      { type: mongoose.Schema.Types.ObjectId, ref: 'NhaXuatBan' },
  NamXuatBan: Number,
  TheLoai:    String,
  AnhBia:     String,
  TomTat:     String,
  DonGia:     { type: Number, default: 0 },
  SoQuyen:    { type: Number, default: 0 }
}, { timestamps: true }));