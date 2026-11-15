import mongoose from 'mongoose';

export default mongoose.model('NhaXuatBan', new mongoose.Schema({
  TenNXB: { type: String, required: true },
  DiaChi: String
}));
