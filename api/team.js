// api/team.js — команда центра (CRUD). См. api/programs.js — тот же контракт.
//   GET /api/team        → активные (active=true)
//   GET /api/team?all=1   → все (admin; в выдачу добавляется hasCode)
//   POST/PUT/DELETE       → admin (поле code задаёт/меняет/закрывает вход специалиста)
//
// Вход специалиста (участник команды с заданным кодом — см. db/schema.sql code_hash):
//   POST /api/team?action=login  → { code } → { id, name, roleLabel } или 401
//   GET  /api/team?action=me     → по заголовку x-specialist-token → { id, name, roleLabel } или 401
//
// Код входа в БД не хранится — только SHA-256 (code_hash). Наружу код не отдаём.
import { handlePreflight, readJson, requireAdmin, getSql, emptyList, hashCode, getSpecialist } from './_lib.js';

// Публичная канон-форма витрины — без секретов (hasCode добавляется только админу).
function toCanonical(r) {
  return {
    id: r.id,
    name: r.name,
    roleCat: r.role_cat || '',
    roleLabel: r.role_label || '',
    tag: r.tag || '',
    tone: r.tone || 'lilac',
    photo: r.photo || '',
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
    supportAvailable: !!r.support_available,   // принимает обращения клиентов в «Поддержку»
  };
}

const genId = () => 't' + Date.now();

export default async function handler(req, res) {
  if (handlePreflight(req, res, ['GET', 'POST', 'PUT', 'DELETE'])) return;
  const sql = await getSql();
  const action = req.query && req.query.action;

  // ── Вход специалиста по личному коду ──────────────────────
  if (action === 'login') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    if (!sql) return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });
    const b = readJson(req);
    const code = String(b.code || '').trim();
    if (!code) return res.status(422).json({ ok: false, errors: { code: 'Введите код входа' } });
    const rows = await sql`
      SELECT id, name, role_label FROM team_members
      WHERE code_hash = ${hashCode(code)}
      LIMIT 1`;
    if (!rows.rows.length) return res.status(401).json({ ok: false, error: 'Неверный код или доступ закрыт' });
    const r = rows.rows[0];
    return res.status(200).json({ ok: true, data: { id: r.id, name: r.name, roleLabel: r.role_label || '' } });
  }

  // ── Кто я (по токену специалиста) ─────────────────────────
  if (action === 'me') {
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    const sp = await getSpecialist(req);
    if (!sp) return res.status(401).json({ ok: false, error: 'Нужна авторизация специалиста' });
    return res.status(200).json({ ok: true, data: { id: sp.id, name: sp.name, roleLabel: sp.role_label || '' } });
  }

  if (req.method === 'GET') {
    if (!sql) return emptyList(res);
    const wantAll = req.query && (req.query.all === '1' || req.query.all === 'true');
    const isAdmin = wantAll && req.headers['x-admin-token'] === process.env.ADMIN_TOKEN;
    const rows = isAdmin
      ? await sql`SELECT * FROM team_members ORDER BY sort_order, name`
      : await sql`SELECT * FROM team_members WHERE active = true ORDER BY sort_order, name`;
    // Админу показываем, у кого задан код входа (для раздела «Команда»); на витрину не светим.
    const data = rows.rows.map(r => isAdmin ? { ...toCanonical(r), hasCode: !!r.code_hash } : toCanonical(r));
    return res.status(200).json({ ok: true, data });
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
    photo: b.photo || '',
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
    supportAvailable: !!b.supportAvailable,
  };
  if (!v.name) return res.status(422).json({ ok: false, errors: { name: 'Укажите имя' } });

  if (req.method === 'POST') {
    const id = b.id || genId();
    // code при создании опционален: пусто → участник заведён, вход специалиста закрыт.
    const codeHash = b.code ? hashCode(String(b.code).trim()) : null;
    const ins = await sql`
      INSERT INTO team_members
        (id, name, role_cat, role_label, tag, tone, photo, spec, credentials, bio,
         years, years_label, sessions, sessions_label, featured, active, sort_order, code_hash, support_available)
      VALUES
        (${id}, ${v.name}, ${v.roleCat}, ${v.roleLabel}, ${v.tag}, ${v.tone}, ${v.photo}, ${v.spec}, ${v.credentials}, ${v.bio},
         ${v.years}, ${v.yearsLabel}, ${v.sessions}, ${v.sessionsLabel}, ${v.featured}, ${v.active}, ${v.sortOrder}, ${codeHash}, ${v.supportAvailable})
      RETURNING *`;
    return res.status(200).json({ ok: true, data: { ...toCanonical(ins.rows[0]), hasCode: !!ins.rows[0].code_hash } });
  }

  if (req.method === 'PUT') {
    if (!b.id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    // Логика поля code (как в sellers.js):
    //   undefined / '' → код не трогаем; непустая строка → задать/сменить; null → закрыть вход.
    let codeHash; // undefined = не менять
    if (b.code === null) codeHash = null;
    else if (typeof b.code === 'string' && b.code.trim()) codeHash = hashCode(b.code.trim());

    const upd = codeHash === undefined
      ? await sql`
          UPDATE team_members SET
            name = ${v.name}, role_cat = ${v.roleCat}, role_label = ${v.roleLabel}, tag = ${v.tag}, tone = ${v.tone}, photo = ${v.photo},
            spec = ${v.spec}, credentials = ${v.credentials}, bio = ${v.bio},
            years = ${v.years}, years_label = ${v.yearsLabel}, sessions = ${v.sessions}, sessions_label = ${v.sessionsLabel},
            featured = ${v.featured}, active = ${v.active}, sort_order = ${v.sortOrder}, support_available = ${v.supportAvailable}
          WHERE id = ${b.id} RETURNING *`
      : await sql`
          UPDATE team_members SET
            name = ${v.name}, role_cat = ${v.roleCat}, role_label = ${v.roleLabel}, tag = ${v.tag}, tone = ${v.tone}, photo = ${v.photo},
            spec = ${v.spec}, credentials = ${v.credentials}, bio = ${v.bio},
            years = ${v.years}, years_label = ${v.yearsLabel}, sessions = ${v.sessions}, sessions_label = ${v.sessionsLabel},
            featured = ${v.featured}, active = ${v.active}, sort_order = ${v.sortOrder}, support_available = ${v.supportAvailable}, code_hash = ${codeHash}
          WHERE id = ${b.id} RETURNING *`;
    if (!upd.rows.length) return res.status(404).json({ ok: false, error: 'Специалист не найден' });
    return res.status(200).json({ ok: true, data: { ...toCanonical(upd.rows[0]), hasCode: !!upd.rows[0].code_hash } });
  }
}
