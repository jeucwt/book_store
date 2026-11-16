import mongoose from 'mongoose';
import Sach from '../models/Sach.js';
import '../models/NhaXuatBan.js' 

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Ép kiểu số nguyên dương, có trần
const toPositiveInt = (value, fallback, max = Infinity) => {
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < 1) return fallback;
  return Math.min(n, max);
};

const SORT_MAP = {
  moinhat: { createdAt: -1 },
  cunhat: { createdAt: 1 },
  ten_az: { TenSach: 1 },
  ten_za: { TenSach: -1 },
  nam_giam: { NamXuatBan: -1 },
  nam_tang: { NamXuatBan: 1 }
};

// GET /api/sach
export const layDanhSachSach = async (req, res) => {
  try {
    const { theLoai, nam, nhaXuatBan, q, sapXep } = req.query;
    const page = toPositiveInt(req.query.page, 1);
    const limit = toPositiveInt(req.query.limit, 12, 50);

    const filter = {};

    if (theLoai) filter.TheLoai = String(theLoai);

    if (nam !== undefined && nam !== '') {
      const namNum = Number(nam);
      if (!Number.isInteger(namNum)) {
        return res.status(400).json({ message: 'Tham số nam không hợp lệ' });
      }
      filter.NamXuatBan = namNum;
    }

    if (nhaXuatBan) {
      if (!mongoose.isValidObjectId(nhaXuatBan)) {
        return res.status(400).json({ message: 'Tham số nhaXuatBan không hợp lệ' });
      }
      filter.MaNXB = nhaXuatBan;
    }

    if (q && String(q).trim()) {
      const regex = new RegExp(escapeRegex(String(q).trim()), 'i');
      filter.$or = [{ TenSach: regex }, { TacGia: regex }];
    }

    const sort = SORT_MAP[sapXep] || SORT_MAP.moinhat;

    const [data, total] = await Promise.all([
      Sach.find(filter)
        .select('-__v')
        .populate('MaNXB', 'TenNXB')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Sach.countDocuments(filter)
    ]);

    res.json({
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// GET /api/sach/:id
export const layChiTietSach = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID sách không hợp lệ' });
    }

    const sach = await Sach.findById(id)
      .select('-__v')
      .populate('MaNXB', 'TenNXB DiaChi')
      .lean();

    if (!sach) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }
    res.json(sach);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// GET /api/sach/the-loai
export const layDanhSachTheLoai = async (req, res) => {
  try {
    const ds = await Sach.distinct('TheLoai', { TheLoai: { $nin: [null, ''] } });
    ds.sort((a, b) => a.localeCompare(b, 'vi'));
    res.json(ds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// GET /api/sach/nam
export const layDanhSachNam = async (req, res) => {
  try {
    const ds = await Sach.distinct('NamXuatBan', { NamXuatBan: { $ne: null } });
    ds.sort((a, b) => b - a); // năm mới trước
    res.json(ds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};