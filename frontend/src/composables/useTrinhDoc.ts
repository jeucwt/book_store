// frontend/src/composables/useTrinhDoc.ts
// Điều khiển trình đọc: tải mục lục/chương theo nhu cầu, chia trang, dựng StPageFlip,
// đồng hồ hết hạn, phím tắt, dọn DOM. Cửa sổ chương trong DOM: chương trước, chương đang đọc, chương kế.
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { PageFlip } from 'page-flip'
import { layChuong, layMucLuc, laySachThue, type Chuong, type MucLuc, type SachThue } from '../api/doc'
import { layThongBaoLoi } from '../api/http'
import {
  KHUNG_PAD_X,
  KHUNG_PAD_Y,
  chiaTrang,
  taoBia,
  taoCho,
  taoTrang,
  tinhBoCuc,
  type BoCuc,
  type Trang,
} from '../utils/phanTrang'

type TrangThai = 'tai' | 'san' | 'rong' | 'loi' | 'khoa'

interface Meta {
  loai: 'bia' | 'cho' | 'chuong'
  huong?: 'truoc' | 'sau'
  ci?: number // chỉ số chương trong mục lục
  chiSo?: number // chỉ số trang trong chương
  batDau?: number
  trong?: boolean
  tong?: number // số trang thật của chương (không tính trang trắng)
}

type Dich = { kieu: 'bia' } | { kieu: 'chuong'; ci: number; vitri: 'dau' | 'cuoi' | number }

const MSG_HET_HAN = 'Sách đã hết hạn thuê, vui lòng thuê lại'

function maLoi(e: unknown): number | undefined {
  return (e as { response?: { status?: number } } | null)?.response?.status
}

export function useTrinhDoc(
  maSach: string,
  layEmail: () => string,
  stageRef: Ref<HTMLElement | null>,
  khungRef: Ref<HTMLElement | null>,
) {
  // ---- state hiển thị ----
  const trangThai = ref<TrangThai>('tai')
  const loiMsg = ref('')
  const khoaMsg = ref('')
  const loiTaiThem = ref('')
  const dangTaiThem = ref(false)
  const sach = ref<SachThue | null>(null)
  const muc = ref<MucLuc[]>([])
  const ciHienTai = ref(0)
  const trangTrongChuong = ref(0)
  const tongTrangChuong = ref(0)
  const dangOBia = ref(true)
  const tienDo = ref(0)
  const conHan = ref('')
  const mucLucMo = ref(false)

  // ---- state nội bộ (không cần reactive) ----
  let lat: PageFlip | null = null
  let host: HTMLElement | null = null
  let meta: Meta[] = []
  const chuongMap = new Map<number, Chuong>() // key: SoChuong
  const trangCache = new Map<number, Trang[]>() // key: SoChuong, theo bố cục hiện tại
  let cuaSo = { lo: 0, hi: 0 } // chỉ số chương đang nằm trong DOM
  let boCuc: BoCuc | null = null
  let viTriCuoi: Dich = { kieu: 'bia' }
  let thuTu = 0
  let trangThaiLat = 'read'
  let chuaXong: (() => void) | null = null
  let viecThuLai: (() => void) | null = null
  let daHuy = false
  let tDongHo: ReturnType<typeof setInterval> | undefined
  let tResize: ReturnType<typeof setTimeout> | undefined
  let ro: ResizeObserver | null = null

  // ---------------------------------------------------------------- tiện ích
  function doBoCuc(): BoCuc | null {
    const st = stageRef.value
    if (!st) return null
    const cs = getComputedStyle(st)
    const w = st.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - KHUNG_PAD_X * 2
    const h = st.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - KHUNG_PAD_Y * 2
    if (w <= 0 || h <= 0) return null
    return tinhBoCuc(w, h)
  }

  function laTrangChuong(ci: number): Trang[] {
    const sc = muc.value[ci]?.SoChuong
    if (sc === undefined || !boCuc) return []
    const c = chuongMap.get(sc)
    if (!c) return []
    let t = trangCache.get(sc)
    if (!t) {
      t = chiaTrang(c, boCuc)
      trangCache.set(sc, t)
    }
    return t
  }

  function khiRanh(): Promise<void> {
    if (trangThaiLat === 'read' || trangThaiLat === 'fold_corner') return Promise.resolve()
    return new Promise((res) => {
      chuaXong = res
    })
  }

  // ---------------------------------------------------------------- dọn dẹp
  function huyLat() {
    if (chuaXong) {
      const f = chuaXong
      chuaXong = null
      f()
    }
    if (lat) {
      try {
        lat.destroy()
      } catch {
        /* bỏ qua */
      }
      lat = null
    }
    if (host) {
      host.remove()
      host = null
    }
    trangThaiLat = 'read'
  }

  function xoaDuLieu() {
    huyLat()
    chuongMap.clear()
    trangCache.clear()
    meta = []
    khungRef.value?.replaceChildren()
    document.querySelectorAll('.dr-do').forEach((e) => e.remove())
  }

  function khoa(msg: string) {
    thuTu++ // hủy mọi yêu cầu đang chờ
    xoaDuLieu()
    mucLucMo.value = false
    khoaMsg.value = msg
    trangThai.value = 'khoa'
    clearInterval(tDongHo)
  }

  function xuLyLoi(e: unknown, khiDangDoc: boolean, thuLai?: () => void) {
    if (maLoi(e) === 403) {
      khoa(layThongBaoLoi(e) || 'Bạn không thể đọc sách này')
      return
    }
    const msg = layThongBaoLoi(e) || 'Không tải được nội dung sách'
    if (khiDangDoc) {
      loiTaiThem.value = msg
      viecThuLai = thuLai ?? null
    } else {
      loiMsg.value = msg
      trangThai.value = 'loi'
    }
  }

  // ---------------------------------------------------------------- dựng danh sách trang
  function dungDanhSach() {
    const bc = boCuc as BoCuc
    const email = layEmail()
    const els: HTMLElement[] = []
    const m: Meta[] = []

    els.push(taoBia(bc, sach.value?.tenSach ?? '', sach.value?.tacGia ?? '', email))
    m.push({ loai: 'bia' })

    if (cuaSo.lo > 0) {
      for (let i = 0; i < 2; i++) {
        els.push(taoCho(bc, email))
        m.push({ loai: 'cho', huong: 'truoc' })
      }
    }
    for (let ci = cuaSo.lo; ci <= cuaSo.hi; ci++) {
      const trangs = laTrangChuong(ci)
      const tong = trangs.filter((t) => !t.trong).length
      const tieuDe = chuongMap.get(muc.value[ci].SoChuong)?.TieuDe || muc.value[ci].TieuDe
      trangs.forEach((t, i) => {
        els.push(taoTrang(bc, t, { tieuDe, soTrang: i + 1, tong }, email))
        m.push({ loai: 'chuong', ci, chiSo: i, batDau: t.batDau, trong: t.trong, tong })
      })
    }
    if (cuaSo.hi < muc.value.length - 1) {
      for (let i = 0; i < 2; i++) {
        els.push(taoCho(bc, email))
        m.push({ loai: 'cho', huong: 'sau' })
      }
    }
    meta = m
    return els
  }

  function tinhChiSo(d: Dich): number {
    if (d.kieu === 'bia') return 0
    const ds = meta
      .map((m, i) => ({ m, i }))
      .filter((x) => x.m.loai === 'chuong' && x.m.ci === d.ci && !x.m.trong)
    if (!ds.length) {
      const dau = meta.findIndex((m) => m.loai === 'chuong')
      return dau < 0 ? 0 : dau
    }
    if (d.vitri === 'dau') return ds[0].i
    if (d.vitri === 'cuoi') return ds[ds.length - 1].i
    let kq = ds[0].i
    for (const x of ds) if ((x.m.batDau ?? 0) <= d.vitri) kq = x.i
    return kq
  }

  function veLai(dich: Dich) {
    if (!boCuc) return
    const els = dungDanhSach()
    huyLat()
    const start = tinhChiSo(dich)
    khoiTaoLat(els, start)
    capNhatHienThi(start)
  }

  function khoiTaoLat(els: HTMLElement[], start: number) {
    const bc = boCuc as BoCuc
    const khung = khungRef.value
    if (!khung) return
    // Mỗi lần dựng lại dùng một host mới: destroy() của thư viện có thể gỡ cả phần tử host.
    host = document.createElement('div')
    host.className = 'dr-lat'
    host.style.width = `${bc.rong ? bc.pageW * 2 : bc.pageW}px`
    khung.appendChild(host)

    const cfg = {
      width: bc.pageW,
      height: bc.pageH,
      size: 'fixed',
      minWidth: bc.pageW,
      maxWidth: bc.pageW,
      minHeight: bc.pageH,
      maxHeight: bc.pageH,
      showCover: true,
      usePortrait: !bc.rong,
      startPage: start,
      drawShadow: true,
      maxShadowOpacity: 0.35,
      flippingTime: 700,
      useMouseEvents: true,
      showPageCorners: true,
      mobileScrollSupport: false,
      swipeDistance: 30,
      clickEventForward: false,
      autoSize: false,
    } as unknown as ConstructorParameters<typeof PageFlip>[1]

    const pf = new PageFlip(host, cfg)
    pf.loadFromHTML(els)
    pf.on('flip', (e) => khiLat(Number(e.data)))
    pf.on('changeState', (e) => {
      trangThaiLat = String(e.data)
      if ((trangThaiLat === 'read' || trangThaiLat === 'fold_corner') && chuaXong) {
        const f = chuaXong
        chuaXong = null
        f()
      }
    })
    lat = pf
  }

  // ---------------------------------------------------------------- hiển thị tiến độ
  function capNhatHienThi(idx: number) {
    const m = meta[idx]
    if (!m) return
    if (m.loai === 'bia') {
      dangOBia.value = true
      ciHienTai.value = 0
      trangTrongChuong.value = 0
      tongTrangChuong.value = 0
      tienDo.value = 0
      viTriCuoi = { kieu: 'bia' }
    } else if (m.loai === 'chuong' && m.ci !== undefined) {
      const tong = m.tong ?? 1
      const t = m.trong ? tong : Math.min((m.chiSo ?? 0) + 1, tong)
      dangOBia.value = false
      ciHienTai.value = m.ci
      trangTrongChuong.value = t
      tongTrangChuong.value = tong
      tienDo.value = Math.round(((m.ci + t / tong) / Math.max(1, muc.value.length)) * 100)
      // (chương, vị trí ký tự) — đây là cặp sẽ lưu khi làm tính năng nhớ tiến độ
      viTriCuoi = { kieu: 'chuong', ci: m.ci, vitri: m.batDau ?? 0 }
    }
  }

  // ---------------------------------------------------------------- tải chương theo nhu cầu
  async function taiChuong(lo: number, hi: number) {
    const can: number[] = []
    for (let i = lo; i <= hi; i++) {
      const sc = muc.value[i].SoChuong
      if (!chuongMap.has(sc)) can.push(sc)
    }
    const kq = await Promise.all(can.map((sc) => layChuong(maSach, sc)))
    can.forEach((sc, i) => chuongMap.set(sc, kq[i]))
  }

  async function dichCuaSo(ci: number, dich: Dich | null) {
    const tid = ++thuTu
    loiTaiThem.value = ''
    viecThuLai = null
    dangTaiThem.value = true
    try {
      const lo = Math.max(0, ci - 1)
      const hi = Math.min(muc.value.length - 1, ci + 1)
      await taiChuong(lo, hi)
      if (daHuy || tid !== thuTu) return
      const giu = new Set<number>()
      for (let i = lo; i <= hi; i++) giu.add(muc.value[i].SoChuong)
      for (const k of [...chuongMap.keys()]) {
        if (!giu.has(k)) {
          chuongMap.delete(k)
          trangCache.delete(k)
        }
      }
      cuaSo = { lo, hi }
      await khiRanh()
      if (daHuy || tid !== thuTu) return
      veLai(dich ?? viTriCuoi)
    } catch (e) {
      if (!daHuy && tid === thuTu) xuLyLoi(e, true, () => void dichCuaSo(ci, dich))
    } finally {
      if (tid === thuTu) dangTaiThem.value = false
    }
  }

  function khiLat(idx: number) {
    const m = meta[idx]
    if (!m) return
    capNhatHienThi(idx)
    if (m.loai === 'cho') {
      const ci = m.huong === 'truoc' ? cuaSo.lo - 1 : cuaSo.hi + 1
      void dichCuaSo(ci, { kieu: 'chuong', ci, vitri: m.huong === 'truoc' ? 'cuoi' : 'dau' })
      return
    }
    if (m.loai === 'chuong' && m.ci !== undefined) {
      const lo = Math.max(0, m.ci - 1)
      const hi = Math.min(muc.value.length - 1, m.ci + 1)
      if (cuaSo.lo > lo || cuaSo.hi < hi) void dichCuaSo(m.ci, null)
    }
  }

  // ---------------------------------------------------------------- hành động
  function latTruoc() {
    lat?.flipPrev()
  }
  function latSau() {
    lat?.flipNext()
  }
  function nhayToi(ci: number) {
    mucLucMo.value = false
    if (!lat) return
    const dich: Dich = { kieu: 'chuong', ci, vitri: 'dau' }
    if (ci >= cuaSo.lo && ci <= cuaSo.hi) lat.flip(tinhChiSo(dich))
    else void dichCuaSo(ci, dich)
  }
  function thuLaiTaiThem() {
    viecThuLai?.()
  }

  // ---------------------------------------------------------------- mở sách
  async function moSach() {
    trangThai.value = 'tai'
    loiMsg.value = ''
    try {
      const [m, thue] = await Promise.all([layMucLuc(maSach), laySachThue(maSach).catch(() => null)])
      if (daHuy) return
      muc.value = m
      sach.value = thue
      if (!m.length) {
        trangThai.value = 'rong'
        return
      }
      if (document.fonts?.ready) await document.fonts.ready
      boCuc = doBoCuc()
      if (!boCuc) throw new Error('Không đo được khung đọc')
      cuaSo = { lo: 0, hi: Math.min(1, m.length - 1) }
      await taiChuong(cuaSo.lo, cuaSo.hi)
      if (daHuy) return
      veLai({ kieu: 'bia' })
      trangThai.value = 'san'
      capNhatConHan()
      clearInterval(tDongHo)
      tDongHo = setInterval(capNhatConHan, 20_000)
    } catch (e) {
      if (!daHuy) xuLyLoi(e, false)
    }
  }

  // ---------------------------------------------------------------- hết hạn
  function capNhatConHan() {
    const s = sach.value
    if (!s?.ngayTra) {
      conHan.value = ''
      return
    }
    const ms = new Date(s.ngayTra).getTime() - Date.now()
    if (Number.isNaN(ms)) return
    if (ms <= 0) {
      khoa(MSG_HET_HAN)
      return
    }
    if (ms >= 86_400_000) conHan.value = `Còn ${Math.ceil(ms / 86_400_000)} ngày`
    else if (ms >= 3_600_000) conHan.value = `Còn ${Math.ceil(ms / 3_600_000)} giờ`
    else conHan.value = `Còn ${Math.max(1, Math.ceil(ms / 60_000))} phút`
  }

  // ---------------------------------------------------------------- đổi kích thước & phím
  async function khiDoiKichThuoc() {
    if (daHuy || trangThai.value !== 'san') return
    const bc = doBoCuc()
    if (!bc || bc.khoa === boCuc?.khoa) return
    boCuc = bc
    trangCache.clear() // số trang phụ thuộc kích thước: chia lại, giữ vị trí theo (chương, ký tự)
    await khiRanh()
    if (daHuy || trangThai.value !== 'san') return
    veLai(viTriCuoi)
  }

  function khiNhanPhim(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      mucLucMo.value = false
      return
    }
    if (trangThai.value !== 'san' || mucLucMo.value) return
    if (e.key === 'ArrowRight' || e.key === 'PageDown') latSau()
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') latTruoc()
  }

  onMounted(() => {
    window.addEventListener('keydown', khiNhanPhim)
    if (stageRef.value) {
      ro = new ResizeObserver(() => {
        clearTimeout(tResize)
        tResize = setTimeout(() => void khiDoiKichThuoc(), 250)
      })
      ro.observe(stageRef.value)
    }
    void moSach()
  })

  onBeforeUnmount(() => {
    daHuy = true
    thuTu++
    window.removeEventListener('keydown', khiNhanPhim)
    clearInterval(tDongHo)
    clearTimeout(tResize)
    ro?.disconnect()
    ro = null
    xoaDuLieu() // gỡ StPageFlip, host, DOM đo và toàn bộ nội dung chương khỏi bộ nhớ
  })

  return {
    trangThai,
    loiMsg,
    khoaMsg,
    loiTaiThem,
    dangTaiThem,
    sach,
    muc,
    ciHienTai,
    trangTrongChuong,
    tongTrangChuong,
    dangOBia,
    tienDo,
    conHan,
    mucLucMo,
    latTruoc,
    latSau,
    nhayToi,
    thuLai: moSach,
    thuLaiTaiThem,
  }
}