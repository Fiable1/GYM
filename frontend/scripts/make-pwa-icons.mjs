import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const payload = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(payload));
  return Buffer.concat([len, payload, crc]);
}

function png(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const radius = Math.floor(size * 0.18);
  const inset = Math.floor(size * 0.06);
  const inCircle = (x, y, cx, cy, r) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
  const insideRoundRect = (x, y, pad, r) => {
    const min = pad;
    const max = size - 1 - pad;
    if (x < min || y < min || x > max || y > max) return false;
    if (x < min + r && y < min + r) return inCircle(x, y, min + r, min + r, r);
    if (x > max - r && y < min + r) return inCircle(x, y, max - r, min + r, r);
    if (x < min + r && y > max - r) return inCircle(x, y, min + r, max - r, r);
    if (x > max - r && y > max - r) return inCircle(x, y, max - r, max - r, r);
    return true;
  };

  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x += 1) {
      let r = 10;
      let g = 10;
      let b = 10;
      let a = 255;
      if (!insideRoundRect(x, y, 0, radius)) {
        a = 0;
      } else if (!insideRoundRect(x, y, inset, Math.max(4, radius - inset))) {
        r = 255;
        g = 77;
        b = 28;
      }
      const i = row + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

writeFileSync(join(dir, 'pwa-192.png'), png(192));
writeFileSync(join(dir, 'pwa-512.png'), png(512));
console.log('wrote pwa icons');
