import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';

import NhaXuatBan from '../models/NhaXuatBan.js';
import Sach from '../models/Sach.js';
import DocGia from '../models/DocGia.js';
import NhanVien from '../models/NhanVien.js';
import NoiDungSach from '../models/NoiDungSach.js';

const run = async () => {
    await connectDB();

    await Promise.all([
        NhaXuatBan.deleteMany(), Sach.deleteMany(), DocGia.deleteMany(),
        NhanVien.deleteMany(), NoiDungSach.deleteMany()
    ]);

    const nxb = await NhaXuatBan.create({ TenNXB: 'NXB Trẻ', DiaChi: 'TP.HCM' });

    const sach1 = await Sach.create({
        TenSach: 'Nhà Giả Kim', DonGia: 80000, SoQuyen: 3,
        NamXuatBan: 2020, MaNXB: nxb._id, NguonGocTacGia: 'Paulo Coelho',
        TheLoai: 'Tiểu thuyết'
    });

    await NoiDungSach.create([
        { MaSach: sach1._id, SoChuong: 1, TieuDe: 'Chương 1', NoiDung: 'Nội dung chương 1...' },
        { MaSach: sach1._id, SoChuong: 2, TieuDe: 'Chương 2', NoiDung: 'Nội dung chương 2...' }
    ]);

    const matKhauHash = await bcrypt.hash('123456', 10);
    await DocGia.create({
        HoLot: 'Nguyễn Văn', Ten: 'A', Email: 'docgia@test.com', MatKhau: matKhauHash
    });

    await NhanVien.create({
        HoTenNV: 'Admin', Password: await bcrypt.hash('admin123', 10), ChucVu: 'Quản trị viên'
    });

    console.log('Seed dữ liệu thành công');
    process.exit();
};

run();