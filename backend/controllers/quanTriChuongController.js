import mongoose from 'mongoose';
import Sach from '../models/Sach.js';
import NoiDungSach from '../models/NoiDungSach.js';

const chuoi = (v) => (typeof v === 'string' ? v.trim() : '');

// Kiểm tra :id hợp lệ và sách tồn tại. Trả true nếu ổn, ngược lại đã gửi response
const kiemTraSach = async (id, res) => {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ message: 'ID sách không hợp lệ' });
    return false;
  }
  const co = await Sach.exists({ _id: id });
  if (!co) {
    res.status(404).json({ message: 'Không tìm thấy sách' });
    return false;
  }
  return true;
};

const laSoChuong = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 ? n : null;
};

// GET /api/quan-tri/sach/:id/chuong  (không trả NoiDung)
export const layDanhSachChuong = async (req, res) => {
  try {
    const { id } = req.params;
    if (!(await kiemTraSach(id, res))) return;

    const data = await NoiDungSach.aggregate([
      { $match: { MaSach: new mongoose.Types.ObjectId(id) } },
      { $sort: { SoChuong: 1 } },
      { $project: { _id: 0, SoChuong: 1, TieuDe: 1, DoDai: { $strLenCP: '$NoiDung' } } }
    ]);
    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// GET /api/quan-tri/sach/:id/chuong/:so  (có NoiDung)
export const layChuong = async (req, res) => {
  try {
    const { id } = req.params;
    const so = laSoChuong(req.params.so);
    if (!so) return res.status(400).json({ message: 'Số chương không hợp lệ' });
    if (!(await kiemTraSach(id, res))) return;

    const chuong = await NoiDungSach.findOne({ MaSach: id, SoChuong: so })
      .select('-__v')
      .lean();
    if (!chuong) return res.status(404).json({ message: 'Không tìm thấy chương' });
    res.json(chuong);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// POST /api/quan-tri/sach/:id/chuong  body { TieuDe?, NoiDung }
export const taoChuong = async (req, res) => {
  try {
    const { id } = req.params;
    if (!(await kiemTraSach(id, res))) return;

    const NoiDung = typeof req.body?.NoiDung === 'string' ? req.body.NoiDung : '';
    if (!NoiDung.trim()) return res.status(400).json({ message: 'Nội dung chương không được để trống' });

    const cuoi = await NoiDungSach.findOne({ MaSach: id }).sort({ SoChuong: -1 }).select('SoChuong').lean();
    const SoChuong = (cuoi?.SoChuong || 0) + 1;
    const TieuDe = chuoi(req.body?.TieuDe) || `Chương ${SoChuong}`;

    const chuong = await NoiDungSach.create({ MaSach: id, SoChuong, TieuDe, NoiDung });
    res.status(201).json(chuong);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Số chương bị trùng, hãy thử lại' });
    }
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// PUT /api/quan-tri/sach/:id/chuong/:so  body { TieuDe, NoiDung }
export const capNhatChuong = async (req, res) => {
  try {
    const { id } = req.params;
    const so = laSoChuong(req.params.so);
    if (!so) return res.status(400).json({ message: 'Số chương không hợp lệ' });
    if (!(await kiemTraSach(id, res))) return;

    const NoiDung = typeof req.body?.NoiDung === 'string' ? req.body.NoiDung : '';
    if (!NoiDung.trim()) return res.status(400).json({ message: 'Nội dung chương không được để trống' });
    const TieuDe = chuoi(req.body?.TieuDe) || `Chương ${so}`;

    const chuong = await NoiDungSach.findOneAndUpdate(
      { MaSach: id, SoChuong: so },
      { $set: { TieuDe, NoiDung } },
      { new: true, runValidators: true }
    ).lean();
    if (!chuong) return res.status(404).json({ message: 'Không tìm thấy chương' });
    res.json(chuong);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// DELETE /api/quan-tri/sach/:id/chuong/:so  (đánh số lại các chương sau)
export const xoaChuong = async (req, res) => {
  try {
    const { id } = req.params;
    const so = laSoChuong(req.params.so);
    if (!so) return res.status(400).json({ message: 'Số chương không hợp lệ' });
    if (!(await kiemTraSach(id, res))) return;

    const kq = await NoiDungSach.deleteOne({ MaSach: id, SoChuong: so });
    if (kq.deletedCount === 0) return res.status(404).json({ message: 'Không tìm thấy chương' });

    // Dồn số chương theo thứ tự tăng dần để không vướng unique index
    const sau = await NoiDungSach.find({ MaSach: id, SoChuong: { $gt: so } })
      .sort({ SoChuong: 1 })
      .select('_id SoChuong')
      .lean();
    for (const c of sau) {
      await NoiDungSach.updateOne({ _id: c._id }, { $set: { SoChuong: c.SoChuong - 1 } });
    }

    res.json({ message: 'Đã xóa chương' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// PATCH /api/quan-tri/sach/:id/chuong/doi-cho  body { soChuong, huong: 'len' | 'xuong' }
export const doiChoChuong = async (req, res) => {
  try {
    const { id } = req.params;
    const so = laSoChuong(req.body?.soChuong);
    const huong = req.body?.huong;
    if (!so) return res.status(400).json({ message: 'Số chương không hợp lệ' });
    if (huong !== 'len' && huong !== 'xuong') {
      return res.status(400).json({ message: "Hướng phải là 'len' hoặc 'xuong'" });
    }
    if (!(await kiemTraSach(id, res))) return;

    const dich = huong === 'len' ? so - 1 : so + 1;
    const [a, b] = await Promise.all([
      NoiDungSach.findOne({ MaSach: id, SoChuong: so }).select('_id').lean(),
      NoiDungSach.findOne({ MaSach: id, SoChuong: dich }).select('_id').lean()
    ]);
    if (!a) return res.status(404).json({ message: 'Không tìm thấy chương' });
    if (!b) {
      return res.status(400).json({
        message: huong === 'len' ? 'Chương đã ở đầu danh sách' : 'Chương đã ở cuối danh sách'
      });
    }

    // Hoán đổi qua số 0 tạm thời (số chương thật bắt đầu từ 1) để không vướng unique index
    await NoiDungSach.updateOne({ _id: a._id }, { $set: { SoChuong: 0 } });
    await NoiDungSach.updateOne({ _id: b._id }, { $set: { SoChuong: so } });
    await NoiDungSach.updateOne({ _id: a._id }, { $set: { SoChuong: dich } });

    res.json({ message: 'Đã đổi vị trí chương' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};