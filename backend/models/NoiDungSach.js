import mongoose from 'mongoose';

const noiDungSachSchema = new mongoose.Schema({
    MaSach: { type: mongoose.Schema.Types.ObjectId, ref: 'Sach', required: true },
    SoChuong: { type: Number, required: true },
    TieuDe: { type: String, required: true },
    NoiDung: { type: String, required: true }
});

export default mongoose.model('NoiDungSach', noiDungSachSchema);
