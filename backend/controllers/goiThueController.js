import GoiThue from '../models/GoiThue.js';

// GET /api/goi-thue
export const layDanhSachGoiThue = async (req, res) => {
  try {
    const ds = await GoiThue.find().select('-__v').sort({ SoNgay: 1 }).lean();
    res.json(ds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};