import NoiDungSach from '../models/NoiDungSach.js';

// GET /api/doc/:maSach/muc-luc
export const layMucLuc = async (req, res) => {
  try {
    const data = await NoiDungSach.find({ MaSach: req.params.maSach })
      .select('SoChuong TieuDe -_id')
      .sort({ SoChuong: 1 });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// GET /api/doc/:maSach/chuong/:soChuong
export const docChuong = async (req, res) => {
  try {
    const { maSach, soChuong } = req.params;
    if (!/^\d+$/.test(soChuong) || Number(soChuong) < 1) {
      return res.status(400).json({ message: 'soChuong không hợp lệ' });
    }

    const chuong = await NoiDungSach.findOne({
      MaSach: maSach,
      SoChuong: Number(soChuong),
    }).select('SoChuong TieuDe NoiDung -_id');

    if (!chuong) {
      return res.status(404).json({ message: 'Không tìm thấy chương' });
    }

    res.set('Cache-Control', 'no-store');
    res.json({ data: chuong });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};