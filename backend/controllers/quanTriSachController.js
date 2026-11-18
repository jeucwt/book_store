import mongoose from 'mongoose';
import Sach from '../models/Sach.js';
import NoiDungSach from '../models/NoiDungSach.js';
import TheoDoiMuonSach from '../models/TheoDoiMuonSach.js';
import { escapeRegex, layPhanTrang } from '../utils/query.js';

const chuoi = (v) => (typeof v === 'string' ? v.trim() : '');

// Đọc và kiểm tra dữ liệu form sách. Trả { data } hoặc { loi }
const docDuLieuSach = (body = {}) => {
  const TenSach = chuoi(body.TenSach);
  const TacGia = chuoi(body.TacGia);
  if (!TenSach) return { loi: 'Tên sách không được để trống' };
  if (!TacGia) return { loi: 'Tác giả không được để trống' };

  const AnhBia = chuoi(body.AnhBia);
  if (AnhBia && !/^https?:\/\//i.test(AnhBia)) {
    return { loi: 'Ảnh bìa phải là đường dẫn bắt đầu bằng http:// hoặc https://' };
  }

  let NamXuatBan = null;
  if (body.NamXuatBan !== undefined && body.NamXuatBan !== null && body.NamXuatBan !== '') {
    NamXuatBan = Number(body.NamXuatBan);
    if (!Number.isInteger(NamXuatBan) || NamXuatBan < 1 || NamXuatBan > 3000) {
      return { loi: 'Năm xuất bản không hợp lệ' };
    }
  }

  return {
    data: {
      TenSach,
      TacGia,
      TheLoai: chuoi(body.TheLoai),
      NamXuatBan,
      AnhBia,
      TomTat: chuoi(body.TomTat)
    }
  };
};

// GET /api/quan-tri/sach?q=&theLoai=&page=&limit=
export const layDanhSachSach = async (req, res) => {
  try {
    const { q, theLoai } = req.query;
    const { page, limit, skip } = layPhanTrang(req.query, 10, 50);

    const filter = {};
    if (theLoai) filter.TheLoai = String(theLoai);
    if (q && String(q).trim()) {
      const regex = new RegExp(escapeRegex(String(q).trim()), 'i');
      filter.$or = [{ TenSach: regex }, { TacGia: regex }];
    }

    const [ds, total] = await Promise.all([
      Sach.find(filter)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Sach.countDocuments(filter)
    ]);

    // Đếm số chương của các sách trong trang này (không tải nội dung)
    const dem = await NoiDungSach.aggregate([
      { $match: { MaSach: { $in: ds.map((s) => s._id) } } },
      { $group: { _id: '$MaSach', n: { $sum: 1 } } }
    ]);
    const mapDem = new Map(dem.map((d) => [String(d._id), d.n]));
    const data = ds.map((s) => ({ ...s, SoChuong: mapDem.get(String(s._id)) || 0 }));

    res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// GET /api/quan-tri/sach/:id
export const layChiTietSach = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID sách không hợp lệ' });
    }
    const sach = await Sach.findById(id).select('-__v').lean();
    if (!sach) return res.status(404).json({ message: 'Không tìm thấy sách' });
    res.json(sach);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// POST /api/quan-tri/sach (admin)
export const taoSach = async (req, res) => {
  try {
    const { data, loi } = docDuLieuSach(req.body);
    if (loi) return res.status(400).json({ message: loi });
    const sach = await Sach.create(data);
    res.status(201).json(sach);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// PUT /api/quan-tri/sach/:id (admin)
export const capNhatSach = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID sách không hợp lệ' });
    }
    const { data, loi } = docDuLieuSach(req.body);
    if (loi) return res.status(400).json({ message: loi });

    const sach = await Sach.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();
    if (!sach) return res.status(404).json({ message: 'Không tìm thấy sách' });
    res.json(sach);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// DELETE /api/quan-tri/sach/:id (admin)
export const xoaSach = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID sách không hợp lệ' });
    }
    const sach = await Sach.findById(id).select('_id').lean();
    if (!sach) return res.status(404).json({ message: 'Không tìm thấy sách' });

    const conHan = await TheoDoiMuonSach.exists({ MaSach: id, NgayTra: { $gt: new Date() } });
    if (conHan) {
      return res.status(409).json({ message: 'Sách đang có độc giả thuê còn hạn, chưa thể xóa' });
    }

    // Xóa chương và các lượt thuê đã hết hạn của sách này để không còn tham chiếu mồ côi
    await Promise.all([
      NoiDungSach.deleteMany({ MaSach: id }),
      TheoDoiMuonSach.deleteMany({ MaSach: id })
    ]);
    await Sach.deleteOne({ _id: id });

    res.json({ message: 'Đã xóa sách' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};