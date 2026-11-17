export type Role = 'docgia' | 'nhanvien' | 'admin'

export interface NguoiDung {
  _id: string
  HoLot?: string
  Ten?: string
  Phai?: string
  Email?: string
  MSNV?: string
  HoTenNV?: string
  ChucVu?: string
}

export interface NhaXuatBan {
  _id: string
  TenNXB: string
  DiaChi?: string
}

export interface Sach {
  _id: string
  TenSach: string
  TacGia: string
  MaNXB: NhaXuatBan | string | null
  NamXuatBan: number
  TheLoai: string
  AnhBia: string
  TomTat: string
  DonGia: number
  SoQuyen: number
}

export interface GoiThue {
  _id: string
  TenGoi: string
  SoNgay: number
  Gia: number
}

export interface PhanTrang<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface SachRutGon {
  _id: string
  TenSach: string
  TacGia: string
  AnhBia: string
  TheLoai: string
}

export interface BanGhiThue {
  _id: string
  MaSach: SachRutGon | string
  NgayTra: string
  TrangCuoiDoc?: number
  conHan: boolean
  soNgayConLai: number
  soLanGiaHan: number
}

export interface DangKyPayload {
  HoLot: string
  Ten: string
  Email: string
  MatKhau: string
  NgaySinh?: string
  Phai?: string
  DiaChi?: string
  DienThoai?: string
}