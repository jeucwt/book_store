import http, { layMang } from './http'
import type {
  ChiTietLuotThueQT,
  DocGiaQT,
  GoiThue,
  LuotThueQT,
  PhanTrang,
  SachQuanTri,
} from '../types'

export interface LocSachQT {
  q?: string
  theLoai?: string
  page?: number
  limit?: number
}

export interface DuLieuSach {
  TenSach: string
  TacGia: string
  TheLoai: string
  NamXuatBan: number | null
  AnhBia: string
  TomTat: string
}

export type ChiTietSachQT = Omit<SachQuanTri, 'SoChuong'>

export async function layDanhSachSachQT(loc: LocSachQT): Promise<PhanTrang<SachQuanTri>> {
  const res = await http.get<PhanTrang<SachQuanTri>>('/quan-tri/sach', { params: loc })
  return res.data
}

export async function layChiTietSachQT(id: string): Promise<ChiTietSachQT> {
  const res = await http.get<ChiTietSachQT>(`/quan-tri/sach/${id}`)
  return res.data
}

export async function taoSachQT(data: DuLieuSach): Promise<ChiTietSachQT> {
  const res = await http.post<ChiTietSachQT>('/quan-tri/sach', data)
  return res.data
}

export async function capNhatSachQT(id: string, data: DuLieuSach): Promise<ChiTietSachQT> {
  const res = await http.put<ChiTietSachQT>(`/quan-tri/sach/${id}`, data)
  return res.data
}

export async function xoaSachQT(id: string): Promise<void> {
  await http.delete(`/quan-tri/sach/${id}`)
}

// Gợi ý thể loại, dùng endpoint công khai đã có
export async function layTheLoaiQT(): Promise<string[]> {
  const res = await http.get('/sach/the-loai')
  return layMang(res.data) as string[]
}
/* ---------- Gói thuê ---------- */

export async function layDanhSachGoiThueQT(): Promise<GoiThue[]> {
  const res = await http.get<{ data: GoiThue[] }>('/quan-tri/goi-thue')
  return res.data.data
}

export async function capNhatGoiThueQT(id: string, data: { TenGoi: string; Gia: number }): Promise<GoiThue> {
  const res = await http.put<GoiThue>(`/quan-tri/goi-thue/${id}`, data)
  return res.data
}

/* ---------- Độc giả ---------- */

export interface LocDocGiaQT {
  q?: string
  page?: number
  limit?: number
}

export async function layDanhSachDocGiaQT(loc: LocDocGiaQT): Promise<PhanTrang<DocGiaQT>> {
  const res = await http.get<PhanTrang<DocGiaQT>>('/quan-tri/doc-gia', { params: loc })
  return res.data
}

/* ---------- Lượt thuê ---------- */

export interface LocLuotThueQT {
  trangThai?: 'conhan' | 'hethan'
  docGia?: string
  sach?: string
  q?: string
  page?: number
  limit?: number
}

export async function layDanhSachLuotThueQT(loc: LocLuotThueQT): Promise<PhanTrang<LuotThueQT>> {
  const res = await http.get<PhanTrang<LuotThueQT>>('/quan-tri/thue', { params: loc })
  return res.data
}

export async function layChiTietLuotThueQT(id: string): Promise<ChiTietLuotThueQT> {
  const res = await http.get<ChiTietLuotThueQT>(`/quan-tri/thue/${id}`)
  return res.data
}