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

export interface SachQuanTri {
  _id: string
  TenSach: string
  TacGia: string
  TheLoai?: string
  NamXuatBan?: number | null
  AnhBia?: string
  TomTat?: string
  SoChuong: number
}
/* ---------- Quản trị: thuê sách (7D) ---------- */

export interface DocGiaRutGon {
  _id: string
  HoLot?: string
  Ten?: string
  Email?: string
}

export interface SachThueRutGon {
  _id: string
  TenSach: string
  TacGia?: string
  AnhBia?: string
}

export interface GoiRutGon {
  _id: string
  TenGoi: string
  SoNgay: number
}

// MaDocGia / MaSach / MaGoi có thể là null nếu bản ghi gốc đã bị xóa (dữ liệu mồ côi)
export interface LuotThueQT {
  _id: string
  MaDocGia: DocGiaRutGon | null
  MaSach: SachThueRutGon | null
  MaGoi: GoiRutGon | null
  NgayThue: string
  NgayTra: string
  TrangCuoiDoc?: number
  conHan: boolean
  soNgayConLai: number
  soLanGiaHan: number
}

export interface LanGiaHan {
  MaGoi: GoiRutGon | null
  SoNgay: number
  MaThanhToan?: string | null
  NgayGiaHan: string
}

export interface ChiTietLuotThueQT extends LuotThueQT {
  LichSuGiaHan: LanGiaHan[]
}

export interface DocGiaQT {
  _id: string
  HoLot?: string
  Ten?: string
  NgaySinh?: string
  Phai?: string
  DiaChi?: string
  DienThoai?: string
  Email?: string
  createdAt?: string
  TongLuotThue: number
  SoLuotConHan: number
}