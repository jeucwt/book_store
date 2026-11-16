import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  TenSach:    { type: String, required: true },
  TacGia:     { type: String, required: true },
  MaNXB:      { type: mongoose.Schema.Types.ObjectId, ref: 'NhaXuatBan' },
  NamXuatBan: Number,
  TheLoai:    String,
  AnhBia:     String,
  TomTat:     String,
  DonGia:     { type: Number, default: 0 },
  SoQuyen:    { type: Number, default: 0 }
}, { timestamps: true });

schema.index({ TheLoai: 1 });
schema.index({ NamXuatBan: 1 });
schema.index({ MaNXB: 1 });

export default mongoose.model('Sach', schema);