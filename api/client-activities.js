// api/client-activities.js — лента кабинета клиента (комментарии вокруг клиента).
// Специалист проверяет данные клиента и пишет заметки; клиент может отвечать;
// администратор видит всё. Копия контракта api/activities.js, но для clients.
//
//   GET    /api/client-activities?clientId=…  → лента по возрастанию времени
//   POST   /api/client-activities             → добавить запись { clientId, type, text }
//                                                Автор (id, имя, роль) ставит сервер из токена.
//   DELETE /api/client-activities?id=…          → удалить (только админ)
//
// Доступ: админ ИЛИ специалист этого клиента ИЛИ сам клиент.
import { handlePreflight, readJson, getSql, isAdmin, getSpecialist, getClient } from './_lib.js';

const TYPES = ['note', 'review'];

function toCanonical(r) {
  return {
    id: r.id,
    clientId: r.client_id,
    authorId: r.author_id || '',
    authorName: r.author_name || '',
    authorRole: r.author_role || '',
    type: r.type || 'note',
    text: r.text || '',
    createdAt: r.created_at,
  };
}

// Кто обращается и к каким клиентам у него доступ. Возвращает
// { role, id, name } и функцию can(clientId) → Promise<bool>, либо null (401).
async function resolveActor(req, sql) {
  if (isAdmin(req)) {
    return { actor: { role: 'admin', id: 'admin', name: 'Администратор' }, can: async () => true };
  }
  const sp = await getSpecialist(req);
  if (sp) {
    return {
      actor: { role: 'specialist', id: sp.id, name: sp.name },
      can: async (clientId) => {
        const r = await sql`SELECT 1 FROM clients WHERE id = ${clientId} AND specialist_id = ${sp.id} LIMIT 1`;
        return r.rows.length > 0;
      },
    };
  }
  const cl = await getClient(req);
  if (cl) {
    return {
      actor: { role: 'client', id: cl.id, name: cl.name },
      can: async (clientId) => clientId === cl.id,
    };
  }
  return null;
}

export default async function handler(req, res) {
  if (handlePreflight(req, res, ['GET', 'POST', 'DELETE'])) return;

  const sql = await getSql();
  if (!sql) {
    if (req.method === 'GET') return res.status(200).json({ ok: true, data: [] });
    return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });
  }

  const who = await resolveActor(req, sql);
  if (!who) return res.status(401).json({ ok: false, error: 'Нужна авторизация' });

  if (req.method === 'GET') {
    const clientId = req.query && req.query.clientId;
    if (!clientId) return res.status(400).json({ ok: false, error: 'Нужен clientId' });
    if (!(await who.can(clientId))) return res.status(403).json({ ok: false, error: 'Нет доступа к этому клиенту' });
    const rows = await sql`
      SELECT * FROM client_activities
      WHERE client_id = ${clientId}
      ORDER BY created_at ASC`;
    return res.status(200).json({ ok: true, data: rows.rows.map(toCanonical) });
  }

  if (req.method === 'DELETE') {
    if (who.actor.role !== 'admin') return res.status(403).json({ ok: false, error: 'Удалять записи может только администратор' });
    const id = req.query && req.query.id;
    if (!id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    await sql`DELETE FROM client_activities WHERE id = ${id}`;
    return res.status(200).json({ ok: true });
  }

  // POST
  const b = readJson(req);
  const clientId = b.clientId;
  if (!clientId) return res.status(422).json({ ok: false, errors: { clientId: 'Нужен clientId' } });
  if (!(await who.can(clientId))) return res.status(403).json({ ok: false, error: 'Нет доступа к этому клиенту' });
  const type = TYPES.includes(b.type) ? b.type : 'note';
  const text = String(b.text || '').trim();
  if (!text) return res.status(422).json({ ok: false, errors: { text: 'Пустая запись' } });

  const ins = await sql`
    INSERT INTO client_activities (client_id, author_id, author_name, author_role, type, text)
    VALUES (${clientId}, ${who.actor.id}, ${who.actor.name}, ${who.actor.role}, ${type}, ${text})
    RETURNING *`;
  return res.status(200).json({ ok: true, data: toCanonical(ins.rows[0]) });
}
