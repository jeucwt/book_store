import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import NhaXuatBan from '../models/NhaXuatBan.js';
import Sach from '../models/Sach.js';
import NoiDungSach from '../models/NoiDungSach.js';
import NhanVien from '../models/NhanVien.js';
import GoiThue from '../models/GoiThue.js';
import DocGia from '../models/DocGia.js';

await mongoose.connect(process.env.MONGODB_URI);
console.log('Đang nạp vào database:', mongoose.connection.name);

await Promise.all([
  NhaXuatBan.deleteMany(), Sach.deleteMany(), NoiDungSach.deleteMany(),
  NhanVien.deleteMany(), GoiThue.deleteMany(), DocGia.deleteMany()
]);

await GoiThue.insertMany([
  { TenGoi: 'Gói 3 ngày',  SoNgay: 3,  Gia: 5000 },
  { TenGoi: 'Gói 7 ngày',  SoNgay: 7,  Gia: 10000 },
  { TenGoi: 'Gói 30 ngày', SoNgay: 30, Gia: 30000 }
]);

await NhanVien.create({
  MSNV: 'NV001', HoTenNV: 'Quản trị viên',
  Password: await bcrypt.hash('admin123', 10), ChucVu: 'admin'
});

await DocGia.create({
  HoLot: 'Nguyễn Văn', Ten: 'A', Phai: 'Nam',
  Email: 'doc.gia@test.com', MatKhau: await bcrypt.hash('123456', 10)
});

const dir = path.join(import.meta.dirname, '..', 'data', 'books');
for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const { chuong, NXB, ...info } = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  const nxb = await NhaXuatBan.findOneAndUpdate({ TenNXB: NXB.TenNXB }, NXB, { upsert: true, new: true });
  const sach = await Sach.create({ ...info, MaNXB: nxb._id });
  await NoiDungSach.insertMany(chuong.map(c => ({ ...c, MaSach: sach._id })));
  console.log('Đã nạp:', sach.TenSach, `(${chuong.length} chương)`);
}

console.log('Seed xong');
await mongoose.disconnect();