import mongoose from 'mongoose';

export default mongoose.model('GoiThue', new mongoose.Schema({
  TenGoi: { type: String, required: true },
  SoNgay: { type: Number, required: true, unique: true },
  Gia:    { type: Number, required: true }
}));
