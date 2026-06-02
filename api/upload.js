// api/upload.js — загрузка картинки в Vercel Blob.
//   POST /api/upload   → принять картинку, положить в Blob, вернуть публичный URL.
// Тело (JSON): { filename, dataUrl }
//   dataUrl — data:image/webp;base64,… (клиент уже сжал в WebP ≤960px).
// Ответ: { ok:true, data:{ url, pathname, size } } | { ok:false, error }
//
// Почему base64-JSON, а не multipart: сайт без сборки (Babel из CDN), тащить
// клиентский SDK неудобно; сжатая WebP-картинка весит десятки–сотни КБ и
// спокойно влезает в лимит тела serverless-функции. Источник правды по слайдам —
// по-прежнему Postgres (api/hero); сюда уходит только сам файл.
import { handlePreflight, readJson, requireAdmin } from './_lib.js';

const MAX_BYTES = 4 * 1024 * 1024; // 4 МБ на распакованный файл — потолок безопасности
const ALLOWED = { 'image/webp': '.webp', 'image/jpeg': '.jpg', 'image/png': '.png' };

// "файл с пробелами.png" → "fail-s-probelami.png": латиница/цифры/дефис, без сюрпризов в URL.
function safeName(name, ext) {
  const base = String(name || 'image')
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'image';
  return base + ext;
}

export default async function handler(req, res) {
  if (handlePreflight(req, res, ['POST'])) return;
  if (!requireAdmin(req, res)) return;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ ok: false, error: 'Хранилище не настроено (BLOB_READ_WRITE_TOKEN). Создайте Blob Store в Vercel → Storage.' });
  }

  const b = readJson(req);
  const dataUrl = typeof b.dataUrl === 'string' ? b.dataUrl : '';
  const m = dataUrl.match(/^data:([a-z/+.-]+);base64,(.+)$/i);
  if (!m) return res.status(400).json({ ok: false, error: 'Ожидается dataUrl вида data:image/...;base64,...' });

  const mime = m[1].toLowerCase();
  const ext = ALLOWED[mime];
  if (!ext) return res.status(415).json({ ok: false, error: 'Допустимы только WebP, JPEG или PNG' });

  const buffer = Buffer.from(m[2], 'base64');
  if (buffer.length === 0) return res.status(400).json({ ok: false, error: 'Пустой файл' });
  if (buffer.length > MAX_BYTES) return res.status(413).json({ ok: false, error: 'Файл больше 4 МБ — сожмите сильнее' });

  try {
    const { put } = await import('@vercel/blob');
    const result = await put('карусель/' + safeName(b.filename, ext), buffer, {
      access: 'public',
      contentType: mime,
      addRandomSuffix: true, // не затирать существующие, дать уникальный URL
    });
    return res.status(200).json({ ok: true, data: { url: result.url, pathname: result.pathname, size: buffer.length } });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Не удалось сохранить файл: ' + (e && e.message ? e.message : 'ошибка хранилища') });
  }
}
