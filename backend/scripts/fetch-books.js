#!/usr/bin/env node
/**
 * fetch-books.js — tải sách public domain (Project Gutenberg qua Gutendex API),
 * tách chương, xuất ra books.json theo field của project book_store.
 *
 * Yêu cầu: Node 18+ (có fetch sẵn), không cần cài thêm package.
 *
 * Cách dùng (đặt file trong backend/scripts/):
 *   node scripts/fetch-books.js                       # 10 sách tiếng Anh phổ biến
 *   node scripts/fetch-books.js --limit 20
 *   node scripts/fetch-books.js --topic "science fiction" --limit 5
 *   node scripts/fetch-books.js --lang fr --limit 5
 *   node scripts/fetch-books.js --out ./seed/books.json
 *
 * Kết quả: mảng JSON, mỗi phần tử:
 *   { sach: {TenSach, TacGia, TheLoai, AnhBia, TomTat, DonGia, SoQuyen},
 *     chuong: [{SoChuong, TieuDe, NoiDung}] }
 * (chưa có MaNXB, NamXuatBan, MaSach — gắn ở bước seed vào MongoDB)
 */
import fs from 'node:fs';
import path from 'node:path';

// ---------- tham số dòng lệnh ----------
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const LIMIT = parseInt(opt('limit', '10'), 10);
const LANG = opt('lang', 'en');
const TOPIC = opt('topic', '');
const OUT = path.resolve(opt('out', './books.json'));
const MAX_CHAPTERS = parseInt(opt('max-chapters', '60'), 10);
const MIN_BODY = 1500; // chương ngắn hơn số ký tự này coi là mục lục -> bỏ
const FALLBACK_SIZE = 8000; // cỡ đoạn khi sách không có tiêu đề chương
const MAX_RETRIES = 3;
const RETRY_DELAY = 3000; // ms giữa các lần retry

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// User-Agent giống trình duyệt để tránh bị Gutenberg chặn
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

/**
 * Tải nội dung text, thử nhiều URL mirror nếu URL gốc bị 503.
 * Gutenberg có nhiều URL cho cùng 1 sách:
 *   - https://www.gutenberg.org/cache/epub/{id}/pg{id}.txt
 *   - https://www.gutenberg.org/files/{id}/{id}-0.txt
 *   - URL gốc từ API (thường bị chặn bot)
 */
function buildMirrorUrls(originalUrl, gutenbergId) {
  const mirrors = [
    `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.txt`,
    `https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}-0.txt`,
    originalUrl,
  ];
  // Loại bỏ trùng lặp
  return [...new Set(mirrors)];
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.ok) return res.text();
      if (res.status === 503 && attempt < retries) {
        console.log(`   retry ${attempt}/${retries} (503)... đợi ${RETRY_DELAY / 1000}s`);
        await sleep(RETRY_DELAY * attempt); // back-off tăng dần
        continue;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      if (attempt === retries) throw e;
      await sleep(RETRY_DELAY * attempt);
    }
  }
}

async function getText(originalUrl, gutenbergId) {
  const urls = buildMirrorUrls(originalUrl, gutenbergId);
  for (const url of urls) {
    try {
      const text = await fetchWithRetry(url, MAX_RETRIES);
      if (text) return text;
    } catch {
      // thử URL tiếp theo
    }
  }
  throw new Error(`Tất cả mirror đều thất bại cho sách #${gutenbergId}`);
}

// ---------- xử lý văn bản ----------
function stripGutenbergBoilerplate(raw) {
  let t = raw.replace(/\r\n/g, '\n');
  const start = t.search(/\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG[^\n]*\n/i);
  if (start >= 0) t = t.slice(t.indexOf('\n', start) + 1);
  const end = t.search(/\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG/i);
  if (end >= 0) t = t.slice(0, end);
  return t.trim();
}

// Gutenberg ngắt dòng cứng ~70 ký tự: nối lại thành đoạn văn
function reflow(text) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n');
}

function splitChapters(text) {
  const re = /^[ \t]*((?:CHAPTER|Chapter|CHAP\.|BOOK|Book|PART|Part|LETTER|Letter|STAVE|Stave)\s+[IVXLCDM\d]+[^\n]*)$/gm;
  const marks = [];
  let m;
  while ((m = re.exec(text))) marks.push({ title: m[1].trim(), index: m.index, end: re.lastIndex });

  let chapters = [];
  for (let i = 0; i < marks.length; i++) {
    const body = text.slice(marks[i].end, i + 1 < marks.length ? marks[i + 1].index : text.length);
    const clean = reflow(body);
    if (clean.length >= MIN_BODY) chapters.push({ TieuDe: marks[i].title, NoiDung: clean });
  }

  // Không tìm được tiêu đề chương -> cắt theo độ dài tại ranh giới đoạn văn
  if (chapters.length < 3) {
    chapters = [];
    let buf = '';
    for (const p of reflow(text).split('\n\n')) {
      if (buf.length + p.length > FALLBACK_SIZE && buf) {
        chapters.push({ TieuDe: '', NoiDung: buf.trim() });
        buf = '';
      }
      buf += p + '\n\n';
    }
    if (buf.trim()) chapters.push({ TieuDe: '', NoiDung: buf.trim() });
  }

  return chapters.slice(0, MAX_CHAPTERS).map((c, i) => ({
    SoChuong: i + 1,
    TieuDe: c.TieuDe || `Phần ${i + 1}`,
    NoiDung: c.NoiDung,
  }));
}

// ---------- chuyển dữ liệu Gutendex -> field của project ----------
function authorName(a) {
  // Gutenberg ghi "Last, First" -> "First Last"
  const n = a.name || '';
  const parts = n.split(',').map((s) => s.trim());
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : n;
}

function pickTheLoai(b) {
  const shelf = (b.bookshelves || [])[0];
  if (shelf) return shelf.replace(/^Category:\s*/i, '');
  const subj = (b.subjects || [])[0];
  return subj ? subj.split(' -- ')[0] : 'Khác';
}

function toSach(b) {
  const f = b.formats || {};
  const summary = (b.summaries || [])[0] || (b.subjects || []).join('; ');
  return {
    TenSach: b.title,
    TacGia: (b.authors || []).map(authorName).join(', ') || 'Khuyết danh',
    TheLoai: pickTheLoai(b),
    AnhBia: f['image/jpeg'] || '',
    TomTat: summary.slice(0, 1000),
    DonGia: 30000, // giá trị mẫu, đổi tùy ý
    SoQuyen: 5, // giá trị mẫu
  };
}

// ---------- chạy ----------
(async () => {
  const q = new URLSearchParams({ languages: LANG, copyright: 'false', sort: 'popular' });
  if (TOPIC) q.set('topic', TOPIC);
  let url = `https://gutendex.com/books/?${q}`;

  const result = [];
  while (url && result.length < LIMIT) {
    const page = await getJson(url);
    for (const b of page.results) {
      if (result.length >= LIMIT) break;
      const fmtKey = Object.keys(b.formats || {}).find((k) => k.startsWith('text/plain'));
      if (!fmtKey) continue;
      try {
        console.log(`[${result.length + 1}/${LIMIT}] ${b.title}`);
        const raw = await getText(b.formats[fmtKey], b.id);
        const chuong = splitChapters(stripGutenbergBoilerplate(raw));
        if (chuong.length === 0) {
          console.log('   bỏ qua: không có nội dung');
          continue;
        }
        result.push({ gutenbergId: b.id, sach: toSach(b), chuong });
        console.log(`   ✓ ${chuong.length} chương`);
      } catch (e) {
        console.log(`   ✗ lỗi: ${e.message}`);
      }
      await sleep(2000); // nghỉ 2s giữa mỗi sách — lịch sự với server
    }
    url = page.next;
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\nXong: ${result.length} sách -> ${OUT}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
