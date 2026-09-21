import mongoose from 'mongoose';

const theoDoiMuonSachSchema = new mongoose.Schema({
    MaDocGia: { type: mongoose.Schema.Types.ObjectId, ref: 'DocGia', required: true },
    MaSach: { type: mongoose.Schema.Types.ObjectId, ref: 'Sach', required: true },
    NgayMuon: { type: Date, required: true, default: Date.now },
    NgayTra: { type: Date, required: true }   // dùng làm "ngày hẹn trả" — so với hôm nay để khóa/mở
});

export default mongoose.model('TheoDoiMuonSach', theoDoiMuonSachSchema);
