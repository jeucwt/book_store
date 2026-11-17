import http, { layMang } from './http'
import type { BanGhiThue } from '../types'

export async function layCuaToi(conHan?: boolean): Promise<BanGhiThue[]> {
  const res = await http.get('/thue/cua-toi', { params: conHan ? { conHan: true } : undefined })
  return layMang(res.data) as BanGhiThue[]
}

export async function thueSach(maSach: string, maGoi: string): Promise<{ message?: string }> {
  const res = await http.post('/thue', { maSach, maGoi })
  return res.data
}

export async function giaHanSach(maSach: string, maGoi: string): Promise<{ message?: string }> {
  const res = await http.post('/thue/gia-han', { maSach, maGoi })
  return res.data
}

export function idSachCuaBanGhi(b: BanGhiThue): string {
  return typeof b.MaSach === 'string' ? b.MaSach : b.MaSach._id
}