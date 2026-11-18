// frontend/src/utils/phanTrang.ts
// Chia chương thành trang bằng cách đo DOM ẩn + dựng phần tử trang cho StPageFlip.
// Mọi nội dung được gắn bằng textContent (không innerHTML) nên không có nguy cơ XSS.

export const TY_LE = 0.72 // rộng / cao của một trang
export const KHUNG_PAD_X = 22 // padding ngang của khung bìa gỗ (khớp CSS .dr-khung)
export const KHUNG_PAD_Y = 18

const CAO_DAU = 16
const CAO_CHAN = 16
const KHOANG = 14

export interface BoCuc {
  rong: boolean // true = 2 trang, false = 1 trang
  pageW: number
  pageH: number
  fontSize: number
  padX: number
  padTop: number
  padBottom: number
  bodyTop: number
  bodyW: number
  bodyH: number
  khoa: string // khóa bố cục: đổi khóa => phải chia lại trang
}

export interface Khoi {
  loai: 'tieude' | 'p'
  soChuong?: number
  tieuDe?: string
  text?: string
  tiep?: boolean // đoạn tiếp theo từ trang trước (không thụt dòng)
}

export interface Trang {
  khoi: Khoi[]
  batDau: number // vị trí ký tự (trong NoiDung đã chuẩn hóa) của trang
  trong?: boolean // trang trắng đệm cho đủ cặp
}

/** availW/availH: vùng còn lại cho 2 trang (đã trừ padding khung). */
export function tinhBoCuc(availW: number, availH: number): BoCuc {
  const rong = availW >= 760 && availH >= 420
  const toiDaW = rong ? availW / 2 : availW
  const pageW = Math.max(220, Math.floor(Math.min(toiDaW, availH * TY_LE, 540)))
  const pageH = Math.floor(pageW / TY_LE)
  const fontSize = pageW < 300 ? 15 : pageW < 400 ? 16 : 17
  const padX = Math.round(pageW * 0.1)
  const padTop = Math.round(pageH * 0.07)
  const padBottom = Math.round(pageH * 0.06)
  const bodyTop = padTop + CAO_DAU + KHOANG
  const bodyW = pageW - padX * 2
  const bodyH = pageH - bodyTop - (padBottom + CAO_CHAN + KHOANG)
  return {
    rong,
    pageW,
    pageH,
    fontSize,
    padX,
    padTop,
    padBottom,
    bodyTop,
    bodyW,
    bodyH,
    khoa: `${rong ? 2 : 1}-${pageW}x${pageH}-${fontSize}`,
  }
}

/** Tách NoiDung (text thuần) thành các đoạn. Tự nhận: có dòng trống => đoạn cách nhau bằng dòng trống,
 *  ngược lại => mỗi dòng là một đoạn. */
export function tachDoan(text: string): string[] {
  const s = text.replace(/\r\n?/g, '\n').trim()
  if (!s) return []
  const ds = /\n\s*\n/.test(s) ? s.split(/\n\s*\n/) : s.split('\n')
  return ds.map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean)
}

function tao<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag)
  e.className = cls
  if (text !== undefined) e.textContent = text
  return e
}

function veKhoi(k: Khoi): HTMLElement {
  if (k.loai === 'tieude') {
    const w = tao('div', 'dr-chuong-dau')
    w.appendChild(tao('div', 'dr-chuong-nhan', `Chương ${k.soChuong ?? ''}`))
    w.appendChild(tao('h2', 'dr-chuong-ten', k.tieuDe ?? ''))
    return w
  }
  return tao('p', k.tiep ? 'dr-p dr-p--tiep' : 'dr-p', k.text ?? '')
}

/** Chia một chương thành các trang vừa khung. Số trang luôn chẵn (thêm trang trắng nếu lẻ). */
export function chiaTrang(
  ch: { SoChuong: number; TieuDe: string; NoiDung: string },
  bc: BoCuc,
): Trang[] {
  const khungDo = tao('div', 'dr-do')
  const hop = tao('div', 'dr-than')
  hop.style.cssText = `position:absolute;left:0;top:0;width:${bc.bodyW}px;height:${bc.bodyH}px;font-size:${bc.fontSize}px`
  khungDo.appendChild(hop)
  document.body.appendChild(khungDo)
  try {
    return chiaTrangTrongHop(ch, bc, hop)
  } finally {
    khungDo.remove() // không để DOM đo lại trong trang
  }
}

function chiaTrangTrongHop(
  ch: { SoChuong: number; TieuDe: string; NoiDung: string },
  _bc: BoCuc,
  hop: HTMLElement,
): Trang[] {
  const doan = tachDoan(ch.NoiDung)
  const batDauDoan: number[] = []
  let tong = 0
  for (const d of doan) {
    batDauDoan.push(tong)
    tong += d.length + 1
  }

  const trangs: Trang[] = []
  let khoi: Khoi[] = []
  let batDau = 0
  let coChu = false

  const vua = () => hop.scrollHeight <= hop.clientHeight + 1
  const dong = () => {
    trangs.push({ khoi, batDau })
    hop.replaceChildren()
    khoi = []
    batDau = 0
    coChu = false
  }

  const tieuDe: Khoi = { loai: 'tieude', soChuong: ch.SoChuong, tieuDe: ch.TieuDe }
  khoi.push(tieuDe)
  hop.appendChild(veKhoi(tieuDe))

  for (let i = 0; i < doan.length; i++) {
    const tu = doan[i].split(' ')
    let da = 0
    while (da < tu.length) {
      const conLai = tu.slice(da)
      const tiep = da > 0
      const off = batDauDoan[i] + (da === 0 ? 0 : tu.slice(0, da).join(' ').length + 1)
      const el = veKhoi({ loai: 'p', text: conLai.join(' '), tiep })
      hop.appendChild(el)

      if (vua()) {
        khoi.push({ loai: 'p', text: conLai.join(' '), tiep })
        if (!coChu) {
          batDau = off
          coChu = true
        }
        break
      }

      // Tìm số từ lớn nhất còn vừa trang (tìm nhị phân)
      let lo = 0
      let hi = conLai.length - 1
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2)
        el.textContent = conLai.slice(0, mid).join(' ')
        if (vua()) lo = mid
        else hi = mid - 1
      }
      if (lo === 0) {
        if (khoi.length > 0) {
          el.remove()
          dong() // trang hiện tại đầy: sang trang mới rồi thử lại
          continue
        }
        lo = 1 // trang trống mà vẫn không vừa 1 từ: ép đặt để không lặp vô hạn
      }
      const text = conLai.slice(0, lo).join(' ')
      el.textContent = text
      khoi.push({ loai: 'p', text, tiep })
      if (!coChu) {
        batDau = off
        coChu = true
      }
      da += lo
      dong()
    }
  }
  if (khoi.length > 0) dong()
  if (trangs.length % 2 === 1) {
    trangs.push({ khoi: [], batDau: Number.MAX_SAFE_INTEGER, trong: true })
  }
  return trangs
}

function nen(email: string, cls = ''): HTMLElement {
  const root = tao('div', `dr-trang ${cls}`.trim())
  if (email) root.appendChild(tao('div', 'dr-wm', email))
  return root
}

/** Trang nội dung (có đầu trang, thân trang, số trang, watermark). */
export function taoTrang(
  bc: BoCuc,
  t: Trang,
  nhan: { tieuDe: string; soTrang: number; tong: number },
  email: string,
): HTMLElement {
  const root = nen(email)
  if (t.trong) return root
  const dau = tao('div', 'dr-dau', nhan.tieuDe)
  dau.style.cssText = `left:${bc.padX}px;right:${bc.padX}px;top:${bc.padTop}px`
  const than = tao('div', 'dr-than')
  than.style.cssText = `left:${bc.padX}px;top:${bc.bodyTop}px;width:${bc.bodyW}px;height:${bc.bodyH}px;font-size:${bc.fontSize}px`
  for (const k of t.khoi) than.appendChild(veKhoi(k))
  const chan = tao('div', 'dr-chan', `${nhan.soTrang} / ${nhan.tong}`)
  chan.style.cssText = `left:${bc.padX}px;right:${bc.padX}px;bottom:${bc.padBottom}px`
  root.prepend(dau, than, chan)
  return root
}

export function taoBia(_bc: BoCuc, ten: string, tacGia: string, email: string): HTMLElement {
  const root = nen(email, 'dr-bia')
  root.dataset.density = 'hard'
  const hop = tao('div', 'dr-bia-hop')
  hop.appendChild(tao('div', 'dr-bia-ten', ten || 'Sách'))
  hop.appendChild(tao('div', 'dr-bia-ke'))
  if (tacGia) hop.appendChild(tao('div', 'dr-bia-tg', tacGia))
  root.prepend(hop)
  return root
}

export function taoCho(_bc: BoCuc, email: string): HTMLElement {
  const root = nen(email, 'dr-cho')
  root.prepend(tao('div', 'dr-cho-chu', 'Đang tải chương…'))
  return root
}