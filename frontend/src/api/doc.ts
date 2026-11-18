
import http from './http'

export interface MucLuc {
  SoChuong: number
  TieuDe: string
}

export interface Chuong {
  SoChuong: number
  TieuDe: string
  NoiDung: string
}

export interface SachThue {
  tenSach: string
  tacGia: string
  ngayTra: string // ISO, lấy từ NgayTra của bản ghi thuê
}

interface BanGhiThue {
  MaSach?: string | { _id?: string; TenSach?: string; TacGia?: string } | null
  NgayTra?: string
}

// GET /api/doc/:maSach/muc-luc -> { data: [{ SoChuong, TieuDe }] }
export async function layMucLuc(maSach: string): Promise<MucLuc[]> {
  const res = await http.get(`/doc/${maSach}/muc-luc`, {
    headers: { 'Cache-Control': 'no-cache' },
  })
  const ds: MucLuc[] = Array.isArray(res.data?.data) ? res.data.data : []
  return [...ds].sort((a, b) => a.SoChuong - b.SoChuong)
}

// GET /api/doc/:maSach/chuong/:soChuong -> { data: { SoChuong, TieuDe, NoiDung } }
export async function layChuong(maSach: string, soChuong: number): Promise<Chuong> {
  const res = await http.get(`/doc/${maSach}/chuong/${soChuong}`, {
    headers: { 'Cache-Control': 'no-cache' },
  })
  const d = res.data?.data ?? {}
  return {
    SoChuong: d.SoChuong ?? soChuong,
    TieuDe: d.TieuDe ?? '',
    NoiDung: typeof d.NoiDung === 'string' ? d.NoiDung : '',
  }
}

// GET /api/thue/cua-toi -> lấy bản ghi thuê mới nhất của sách này (tên sách, tác giả, NgayTra)
export async function laySachThue(maSach: string): Promise<SachThue | null> {
  const res = await http.get('/thue/cua-toi')
  const ds: BanGhiThue[] = Array.isArray(res.data?.data) ? res.data.data : []
  const khop = ds.filter((b) => {
    const id = typeof b.MaSach === 'string' ? b.MaSach : b.MaSach?._id
    return id === maSach
  })
  if (!khop.length) return null
  khop.sort((a, b) => new Date(b.NgayTra ?? 0).getTime() - new Date(a.NgayTra ?? 0).getTime())
  const b = khop[0]
  const s = b.MaSach && typeof b.MaSach === 'object' ? b.MaSach : null
  return { tenSach: s?.TenSach ?? '', tacGia: s?.TacGia ?? '', ngayTra: b.NgayTra ?? '' }
}