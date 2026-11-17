import mongoose from 'mongoose';

const theoDoiMuonSachSchema = new mongoose.Schema(
  {
    MaDocGia: { type: mongoose.Schema.Types.ObjectId, ref: 'DocGia', required: true },
    MaSach: { type: mongoose.Schema.Types.ObjectId, ref: 'Sach', required: true },
    MaGoi: { type: mongoose.Schema.Types.ObjectId, ref: 'GoiThue' },
    MaThanhToan: { type: mongoose.Schema.Types.ObjectId, ref: 'ThanhToan' },
    NgayThue: { type: Date, default: Date.now },
    NgayTra: { type: Date, required: true },
    TrangCuoiDoc: { type: Number, default: 1 },

    LichSuGiaHan: [
      {
        MaGoi: { type: mongoose.Schema.Types.ObjectId, ref: 'GoiThue' },
        SoNgay: Number,
        MaThanhToan: { type: mongoose.Schema.Types.ObjectId, ref: 'ThanhToan' },
        NgayGiaHan: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// MỚI: phục vụ truy vấn "còn hạn"
theoDoiMuonSachSchema.index({ MaDocGia: 1, MaSach: 1, NgayTra: 1 });

export default mongoose.model('TheoDoiMuonSach', theoDoiMuonSachSchema, 'TheoDoiMuonSach');