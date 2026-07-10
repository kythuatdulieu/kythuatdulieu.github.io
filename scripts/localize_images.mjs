// Tải ảnh external trong bài về public/images/ rồi đổi link markdown sang local.
// Chạy Ở MÁY BẠN (mạng không bị chặn):  node scripts/localize_images.mjs
// Tùy chọn:  node scripts/localize_images.mjs --dry   (chỉ liệt kê, không tải/không sửa)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'src', 'content', 'docs');
const OUT_BASE = path.join(ROOT, 'public', 'images');
const DRY = process.argv.includes('--dry');

const EXT_IMG = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+?)(?:\s+"[^"]*")?\)/g;

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.mdx?$/.test(f)) out.push(p);
  }
  return out;
}

function extFromUrl(u) {
  const clean = u.split('?')[0];
  const e = path.extname(clean).toLowerCase();
  return /\.(svg|png|jpg|jpeg|gif|webp|avif)$/.test(e) ? e : '.png';
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (localize-images)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return buf.length;
}

const files = walk(DOCS);
let found = 0, done = 0, failed = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(DOCS, file).replace(/\.mdx?$/, '');
  const slugDir = rel.replace(/\\/g, '/'); // vd concepts/2-.../idempotency
  let changed = false;
  const matches = [...src.matchAll(EXT_IMG)];

  for (const m of matches) {
    const [full, alt, url] = m;
    found++;
    const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 8);
    const fname = `${hash}${extFromUrl(url)}`;
    const destAbs = path.join(OUT_BASE, slugDir, fname);
    const publicPath = `/images/${slugDir}/${fname}`.replace(/\/+/g, '/');

    if (DRY) { console.log(`[dry] ${url}\n      -> ${publicPath}`); continue; }
    try {
      if (!fs.existsSync(destAbs)) {
        const bytes = await download(url, destAbs);
        console.log(`[ok] ${path.basename(file)}  ${(bytes/1024).toFixed(0)}KB  ${publicPath}`);
      } else {
        console.log(`[skip-exists] ${publicPath}`);
      }
      src = src.replace(full, `![${alt}](${publicPath})`);
      changed = true; done++;
    } catch (e) {
      console.warn(`[FAIL] ${url}  (${e.message}) — giữ nguyên link ngoài`);
      failed++;
    }
  }
  if (changed && !DRY) fs.writeFileSync(file, src, 'utf8');
}

console.log(`\nTổng: thấy ${found} ảnh ngoài, tải ${done}, lỗi ${failed}.` + (DRY ? ' (dry-run)' : ''));
