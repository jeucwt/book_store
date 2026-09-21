import mongoose from 'mongoose';

const sachSchema = new mongoose.Schema({
    TenSach: { type: String, required: true },
    DonGia: { type: Number, default: 0 },
    SoQuyen: { type: Number, default: 1 },       // tổng số bản có thể mượn cùng lúc
    NamXuatBan: { type: Number },
    MaNXB: { type: mongoose.Schema.Types.ObjectId, ref: 'NhaXuatBan' },
    NguonGocTacGia: { type: String },
    TheLoai: { type: String },
    AnhBia: { type: String }
});

export default mongoose.model('Sach', sachSchema);
