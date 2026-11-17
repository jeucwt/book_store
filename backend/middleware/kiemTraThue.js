import TheoDoiMuonSach from '../models/TheoDoiMuonSach.js';

const laIdHopLe = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));

// Cho phép đi tiếp nếu độc giả đang có lần thuê còn hạn của sách :maSach
export const kiemTraThue = async (req, res, next) => {
  try {
    const { maSach } = req.params;
    if (!laIdHopLe(maSach)) {
      return res.status(400).json({ message: 'maSach không hợp lệ' });
    }

    // Lấy lần thuê mới nhất của độc giả với sách này
    const luotThue = await TheoDoiMuonSach.findOne({
      MaDocGia: req.user.id,
      MaSach: maSach,
    }).sort({ NgayTra: -1 });

    if (!luotThue) {
      return res.status(403).json({ message: 'Bạn chưa thuê sách này' });
    }
    if (luotThue.NgayTra <= new Date()) {
      return res.status(403).json({ message: 'Sách đã hết hạn thuê, vui lòng thuê lại' });
    }

    req.luotThue = luotThue;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};