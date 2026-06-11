// api/hero.js — слайды Hero-карусели.
//   GET  /api/hero   → массив слайдов [{id,url,label}, …] по порядку
//   POST /api/hero   → заменить весь список (admin). Тело: { slides: [...] }
// Слайд хранится как JSONB целиком — гибко под текущий редактор карусели.
import { handlePreflight, readJson, requireAdmin, getSql, emptyList } from './_lib.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res, ['GET', 'POST'])) return;
  const sql = await getSql();

  if (req.method === 'GET') {
    if (!sql) return emptyList(res);
    const rows = await sql`SELECT data FROM hero_slides ORDER BY sort_order, id`;
    return res.status(200).json({ ok: true, data: rows.rows.map(r => r.data) });
  }

  // POST — только admin. Полная замена списка (delete all + insert).
  if (!requireAdmin(req, res)) return;
  if (!sql) return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });

  const b = readJson(req);
  const slides = Array.isArray(b.slides) ? b.slides : [];
  // DELETE + INSERT в одной транзакции: оборвавшаяся вставка не оставит карусель пустой.
  const { db } = await import('@vercel/postgres');
  const client = await db.connect();
  try {
    await client.sql`BEGIN`;
    await client.sql`DELETE FROM hero_slides`;
    for (let i = 0; i < slides.length; i++) {
      await client.sql`INSERT INTO hero_slides (sort_order, data) VALUES (${i + 1}, ${JSON.stringify(slides[i])}::jsonb)`;
    }
    await client.sql`COMMIT`;
  } catch (e) {
    try { await client.sql`ROLLBACK`; } catch (re) {}
    throw e;
  } finally {
    client.release();
  }
  return res.status(200).json({ ok: true, data: slides });
}
