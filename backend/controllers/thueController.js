import Sach from '../models/Sach.js';
import GoiThue from '../models/GoiThue.js';
import ThanhToan from '../models/ThanhToan.js';
import TheoDoiMuonSach from '../models/TheoDoiMuonSach.js';

const MS_MOT_NGAY = 86400000;
const laIdHopLe = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));

// Tạo thanh toán giả lập (luôn thành công). Ngày thanh toán = createdAt (do timestamps).
const taoThanhToanGiaLap = (maDocGia, goi) =>
  ThanhToan.create({
    MaDocGia: maDocGia,
    SoTien: goi.Gia,
    PhuongThuc: 'GiaLap',
    TrangThai: 'ThanhCong',
  });

// Kiểm tra body, trả về { sach, goi } hoặc gửi lỗi và trả về null
const laySachVaGoi = async (req, res) => {
  const { maSach, maGoi } = req.body || {};
  if (!laIdHopLe(maSach) || !laIdHopLe(maGoi)) {
    res.status(400).json({ message: 'maSach hoặc maGoi không hợp lệ' });
    return null;
  }
  const [sach, goi] = await Promise.all([Sach.findById(maSach), GoiThue.findById(maGoi)]);
  if (!sach) {
    res.status(404).json({ message: 'Không tìm thấy sách' });
    return null;
  }
  if (!goi) {
    res.status(404).json({ message: 'Không tìm thấy gói thuê' });
    return null;
  }
  return { sach, goi };
};

// POST /api/thue
export const thueSach = async (req, res) => {
  try {
    const kq = await laySachVaGoi(req, res);
    if (!kq) return;
    const { sach, goi } = kq;

    const now = new Date();
    const dangConHan = await TheoDoiMuonSach.exists({
      MaDocGia: req.user.id,
      MaSach: sach._id,
      NgayTra: { $gt: now },
    });
    if (dangConHan) {
      return res
        .status(409)
        .json({ message: 'Sách đang còn hạn, hãy dùng gia hạn' });
    }

    const thanhToan = await taoThanhToanGiaLap(req.user.id, goi);

    const banGhi = await TheoDoiMuonSach.create({
      MaDocGia: req.user.id,
      MaSach: sach._id,
      MaGoi: goi._id,
      MaThanhToan: thanhToan._id,
      NgayThue: now,
      NgayTra: new Date(now.getTime() + goi.SoNgay * MS_MOT_NGAY),
      TrangCuoiDoc: 1,
    });

    res.status(201).json({ message: 'Thuê sách thành công', data: banGhi });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// POST /api/thue/gia-han
export const giaHanSach = async (req, res) => {
  try {
    const kq = await laySachVaGoi(req, res);
    if (!kq) return;
    const { sach, goi } = kq;

    const now = new Date();

    // Lần thuê còn hạn mới nhất
    const banGhi = await TheoDoiMuonSach.findOne({
      MaDocGia: req.user.id,
      MaSach: sach._id,
      NgayTra: { $gt: now },
    }).sort({ NgayTra: -1 });

    if (!banGhi) {
      return res.status(409).json({
        message: 'Bạn không có lần thuê còn hạn của sách này, hãy thuê mới',
      });
    }

    const thanhToan = await taoThanhToanGiaLap(req.user.id, goi);

    // Cộng từ ngày hết hạn cũ, không cộng từ lúc bấm gia hạn
    const ngayTraCu = banGhi.NgayTra;
    const ngayTraMoi = new Date(ngayTraCu.getTime() + goi.SoNgay * MS_MOT_NGAY);

    // Điều kiện NgayTra === giá trị cũ giúp chặn 2 request gia hạn đồng thời
    const daCapNhat = await TheoDoiMuonSach.findOneAndUpdate(
      { _id: banGhi._id, NgayTra: { $eq: ngayTraCu, $gt: now } },
      {
        $set: { NgayTra: ngayTraMoi },
        $push: {
          LichSuGiaHan: {
            MaGoi: goi._id,
            SoNgay: goi.SoNgay,
            MaThanhToan: thanhToan._id,
            NgayGiaHan: now,
          },
        },
      },
      { new: true }
    );

    if (!daCapNhat) {
      // Có request khác vừa đổi bản ghi (hoặc vừa hết hạn): hoàn tác thanh toán
      await ThanhToan.findByIdAndDelete(thanhToan._id);
      return res
        .status(409)
        .json({ message: 'Bản ghi thuê vừa thay đổi hoặc đã hết hạn, vui lòng thử lại' });
    }

    res.status(200).json({ message: 'Gia hạn thành công', data: daCapNhat });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// GET /api/thue/cua-toi   (?conHan=true để chỉ lấy sách còn hạn)
export const layDanhSachThueCuaToi = async (req, res) => {
  try {
    const now = new Date();
    const dieuKien = { MaDocGia: req.user.id };
    if (req.query.conHan === 'true') {
      dieuKien.NgayTra = { $gt: now };
    }

    const danhSach = await TheoDoiMuonSach.find(dieuKien)
      .populate('MaSach', 'TenSach TacGia AnhBia TheLoai')
      .sort({ NgayTra: -1 })
      .lean();

    const data = danhSach.map((b) => {
      const conHan = b.NgayTra > now;
      return {
        ...b,
        conHan,
        soNgayConLai: conHan ? Math.ceil((b.NgayTra - now) / MS_MOT_NGAY) : 0,
        soLanGiaHan: (b.LichSuGiaHan || []).length,
      };
    });

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};