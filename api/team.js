// api/team.js — команда центра (CRUD). См. api/programs.js — тот же контракт.
//   GET /api/team        → активные (active=true)
//   GET /api/team?all=1   → все (admin)
//   POST/PUT/DELETE       → admin
import { handlePreflight, readJson, requireAdmin, getSql, emptyList } from './_lib.js';

function toCanonical(r) {
  return {
    id: r.id,
    name: r.name,
    roleCat: r.role_cat || '',
    roleLabel: r.role_label || '',
    tag: r.tag || '',
    tone: r.tone || 'lilac',
    spec: r.spec || [],
    credentials: r.credentials || [],
    bio: r.bio || '',
    years: r.years || '',
    yearsLabel: r.years_label || '',
    sessions: r.sessions || '',
    sessionsLabel: r.sessions_label || '',
    featured: !!r.featured,
    active: r.active !== false,
    sortOrder: r.sort_order || 0,
  };
}

const genId = () => 't' + Date.now();

export default async function handler(req, res) {
  if (handlePreflight(req, res, ['GET', 'POST', 'PUT', 'DELETE'])) return;
  const sql = await getSql();

  if (req.method === 'GET') {
    if (!sql) return emptyList(res);
    const wantAll = req.query && (req.query.all === '1' || req.query.all === 'true');
    const isAdmin = wantAll && req.headers['x-admin-token'] === process.env.ADMIN_TOKEN;
    const rows = isAdmin
      ? await sql`SELECT * FROM team_members ORDER BY sort_order, name`
      : await sql`SELECT * FROM team_members WHERE active = true ORDER BY sort_order, name`;
    return res.status(200).json({ ok: true, data: rows.rows.map(toCanonical) });
  }

  if (!requireAdmin(req, res)) return;
  if (!sql) return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });

  if (req.method === 'DELETE') {
    const id = req.query && req.query.id;
    if (!id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    await sql`DELETE FROM team_members WHERE id = ${id}`;
    return res.status(200).json({ ok: true });
  }

  const b = readJson(req);
  const v = {
    name: String(b.name || '').trim(),
    roleCat: b.roleCat || '',
    roleLabel: b.roleLabel || '',
    tag: b.tag || '',
    tone: b.tone || 'lilac',
    spec: Array.isArray(b.spec) ? b.spec : [],
    credentials: Array.isArray(b.credentials) ? b.credentials : [],
    bio: b.bio || '',
    years: b.years == null ? '' : String(b.years),
    yearsLabel: b.yearsLabel || '',
    sessions: b.sessions == null ? '' : String(b.sessions),
    sessionsLabel: b.sessionsLabel || '',
    featured: !!b.featured,
    active: b.active !== false,
    sortOrder: b.sortOrder == null ? 0 : Number(b.sortOrder),
  };
  if (!v.name) return res.status(422).json({ ok: false, errors: { name: 'Укажите имя' } });

  if (req.method === 'POST') {
    const id = b.id || genId();
    const ins = await sql`
      INSERT INTO team_members
        (id, name, role_cat, role_label, tag, tone, spec, credentials, bio,
         years, years_label, sessions, sessions_label, featured, active, sort_order)
      VALUES
        (${id}, ${v.name}, ${v.roleCat}, ${v.roleLabel}, ${v.tag}, ${v.tone}, ${v.spec}, ${v.credentials}, ${v.bio},
         ${v.years}, ${v.yearsLabel}, ${v.sessions}, ${v.sessionsLabel}, ${v.featured}, ${v.active}, ${v.sortOrder})
      RETURNING *`;
    return res.status(200).json({ ok: true, data: toCanonical(ins.rows[0]) });
  }

  if (req.method === 'PUT') {
    if (!b.id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    const upd = await sql`
      UPDATE team_members SET
        name = ${v.name}, role_cat = ${v.roleCat}, role_label = ${v.roleLabel}, tag = ${v.tag}, tone = ${v.tone},
        spec = ${v.spec}, credentials = ${v.credentials}, bio = ${v.bio},
        years = ${v.years}, years_label = ${v.yearsLabel}, sessions = ${v.sessions}, sessions_label = ${v.sessionsLabel},
        featured = ${v.featured}, active = ${v.active}, sort_order = ${v.sortOrder}
      WHERE id = ${b.id}
      RETURNING *`;
    if (!upd.rows.length) return res.status(404).json({ ok: false, error: 'Специалист не найден' });
    return res.status(200).json({ ok: true, data: toCanonical(upd.rows[0]) });
  }
}
