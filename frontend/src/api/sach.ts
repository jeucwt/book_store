import http, { layMang } from './http'
import type { GoiThue, PhanTrang, Sach } from '../types'

export interface BoLoc {
  q?: string
  theLoai?: string
  nam?: string
  sapXep?: string
  page?: number
  limit?: number
}

export async function layDanhSachSach(params: BoLoc): Promise<PhanTrang<Sach>> {
  const res = await http.get('/sach', { params })
  return res.data
}

export async function laySach(id: string): Promise<Sach> {
  const res = await http.get(`/sach/${id}`)
  return res.data?.data ?? res.data
}

function chuoiHoa(x: unknown): string {
  if (x && typeof x === 'object') {
    const o = x as Record<string, unknown>
    return String(o.TheLoai ?? o.NamXuatBan ?? o._id ?? '')
  }
  return String(x ?? '')
}

export async function layTheLoai(): Promise<string[]> {
  const res = await http.get('/sach/the-loai')
  return layMang(res.data).map(chuoiHoa).filter(Boolean)
}

export async function layNam(): Promise<string[]> {
  const res = await http.get('/sach/nam')
  return layMang(res.data).map(chuoiHoa).filter(Boolean).sort((a, b) => Number(b) - Number(a))
}

export async function layGoiThue(): Promise<GoiThue[]> {
  const res = await http.get('/goi-thue')
  return (layMang(res.data) as GoiThue[]).slice().sort((a, b) => a.SoNgay - b.SoNgay)
}