import mongoose from 'mongoose';
import GoiThue from '../models/GoiThue.js';
import DocGia from '../models/DocGia.js';
import Sach from '../models/Sach.js';
import TheoDoiMuonSach from '../models/TheoDoiMuonSach.js';
import { escapeRegex, layPhanTrang } from '../utils/query.js';

const MS_NGAY = 24 * 60 * 60 * 1000;

const tinhHan = (ngayTra, now) => {
  const conHan = new Date(ngayTra) > now;
  return { conHan, soNgayConLai: conHan ? Math.ceil((new Date(ngayTra) - now) / MS_NGAY) : 0 };
};

/* ---------- Gói thuê ---------- */

// GET /api/quan-tri/goi-thue
export const layDanhSachGoiThue = async (req, res) => {
  try {
    const data = await GoiThue.find().select('-__v').sort({ SoNgay: 1 }).lean();
    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// PUT /api/quan-tri/goi-thue/:id (admin) body { TenGoi, Gia }
export const capNhatGoiThue = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID gói thuê không hợp lệ' });
    }
    if (req.body?.SoNgay !== undefined) {
      return res.status(400).json({ message: 'Không được sửa số ngày của gói thuê' });
    }

    const TenGoi = typeof req.body?.TenGoi === 'string' ? req.body.TenGoi.trim() : '';
    if (!TenGoi) return res.status(400).json({ message: 'Tên gói không được để trống' });

    const Gia = Number(req.body?.Gia);
    if (req.body?.Gia === '' || req.body?.Gia === null || !Number.isFinite(Gia) || Gia < 0) {
      return res.status(400).json({ message: 'Giá phải là số không âm' });
    }

    const goi = await GoiThue.findByIdAndUpdate(
      id,
      { $set: { TenGoi, Gia } },
      { new: true, runValidators: true }
    ).select('-__v').lean();
    if (!goi) return res.status(404).json({ message: 'Không tìm thấy gói thuê' });
    res.json(goi);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

/* ---------- Độc giả ---------- */

// GET /api/quan-tri/doc-gia?q=&page=&limit=
export const layDanhSachDocGia = async (req, res) => {
  try {
    const { q } = req.query;
    const { page, limit, skip } = layPhanTrang(req.query, 10, 50);

    const filter = {};
    if (q && String(q).trim()) {
      const chuoiTim = escapeRegex(String(q).trim());
      const regex = new RegExp(chuoiTim, 'i');
      filter.$or = [
        { HoLot: regex },
        { Ten: regex },
        { Email: regex },
        { DienThoai: regex },
        { $expr: { $regexMatch: { input: { $concat: ['$HoLot', ' ', '$Ten'] }, regex: chuoiTim, options: 'i' } } }
      ];
    }

    const [ds, total] = await Promise.all([
      DocGia.find(filter)
        .select('-MatKhau -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DocGia.countDocuments(filter)
    ]);

    const now = new Date();
    const dem = await TheoDoiMuonSach.aggregate([
      { $match: { MaDocGia: { $in: ds.map((d) => d._id) } } },
      {
        $group: {
          _id: '$MaDocGia',
          tong: { $sum: 1 },
          conHan: { $sum: { $cond: [{ $gt: ['$NgayTra', now] }, 1, 0] } }
        }
      }
    ]);
    const mapDem = new Map(dem.map((d) => [String(d._id), d]));
    const data = ds.map((d) => {
      const x = mapDem.get(String(d._id));
      return { ...d, TongLuotThue: x?.tong || 0, SoLuotConHan: x?.conHan || 0 };
    });

    res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

/* ---------- Lượt thuê ---------- */

const populateLuotThue = (query) =>
  query
    .populate('MaDocGia', 'HoLot Ten Email')
    .populate('MaSach', 'TenSach TacGia AnhBia')
    .populate('MaGoi', 'TenGoi SoNgay');

// GET /api/quan-tri/thue?trangThai=conhan|hethan&docGia=&sach=&q=&page=&limit=
export const layDanhSachLuotThue = async (req, res) => {
  try {
    const { trangThai, docGia, sach, q } = req.query;
    const { page, limit, skip } = layPhanTrang(req.query, 10, 50);
    const now = new Date();
    const filter = {};

    if (trangThai) {
      if (trangThai === 'conhan') filter.NgayTra = { $gt: now };
      else if (trangThai === 'hethan') filter.NgayTra = { $lte: now };
      else return res.status(400).json({ message: "trangThai phải là 'conhan' hoặc 'hethan'" });
    }
    if (docGia) {
      if (!mongoose.isValidObjectId(docGia)) {
        return res.status(400).json({ message: 'Tham số docGia không hợp lệ' });
      }
      filter.MaDocGia = docGia;
    }
    if (sach) {
      if (!mongoose.isValidObjectId(sach)) {
        return res.status(400).json({ message: 'Tham số sach không hợp lệ' });
      }
      filter.MaSach = sach;
    }
    if (q && String(q).trim()) {
      const regex = new RegExp(escapeRegex(String(q).trim()), 'i');
      const [dg, sc] = await Promise.all([
        DocGia.find({ $or: [{ HoLot: regex }, { Ten: regex }, { Email: regex }, { DienThoai: regex }] })
          .select('_id').limit(200).lean(),
        Sach.find({ $or: [{ TenSach: regex }, { TacGia: regex }] })
          .select('_id').limit(200).lean()
      ]);
      filter.$or = [
        { MaDocGia: { $in: dg.map((x) => x._id) } },
        { MaSach: { $in: sc.map((x) => x._id) } }
      ];
    }

    const [ds, total] = await Promise.all([
      populateLuotThue(
        TheoDoiMuonSach.find(filter).select('-__v').sort({ NgayThue: -1 }).skip(skip).limit(limit)
      ).lean(),
      TheoDoiMuonSach.countDocuments(filter)
    ]);

    const data = ds.map(({ LichSuGiaHan, ...b }) => ({
      ...b,
      ...tinhHan(b.NgayTra, now),
      soLanGiaHan: (LichSuGiaHan || []).length
    }));

    res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// GET /api/quan-tri/thue/:id  (kèm lịch sử gia hạn)
export const layChiTietLuotThue = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID lượt thuê không hợp lệ' });
    }
    const b = await populateLuotThue(TheoDoiMuonSach.findById(id).select('-__v'))
      .populate('LichSuGiaHan.MaGoi', 'TenGoi SoNgay')
      .lean();
    if (!b) return res.status(404).json({ message: 'Không tìm thấy lượt thuê' });

    res.json({
      ...b,
      ...tinhHan(b.NgayTra, new Date()),
      soLanGiaHan: (b.LichSuGiaHan || []).length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};