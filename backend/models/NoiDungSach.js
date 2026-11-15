import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  MaSach:   { type: mongoose.Schema.Types.ObjectId, ref: 'Sach', required: true },
  SoChuong: { type: Number, required: true },
  TieuDe:   String,
  NoiDung:  { type: String, required: true }
});
schema.index({ MaSach: 1, SoChuong: 1 }, { unique: true });

export default mongoose.model('NoiDungSach', schema);
