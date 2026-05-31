// api/_lib.js — общие хелперы для serverless-функций OM-Time (Vercel, Node).
// Стиль — как в api/booking.js: без фреймворков, @vercel/postgres через await import.
//
// Контракт ответа всюду одинаковый: { ok: true, data } | { ok: false, error|errors }.
// GET-чтения открыты; write-операции (POST/PUT/PATCH/DELETE) проходят requireAdmin().

// CORS — на случай вызова с поддомена/локально. Разрешаем admin-токен в заголовках.
export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
}

// Разбор тела: Vercel иногда отдаёт строку, иногда уже объект.
export function readJson(req) {
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  return body || {};
}

// Проверка прав на запись. true — токен совпал; иначе функция сама шлёт 401 и
// возвращает false (вызывающий делает `if (!requireAdmin(req,res)) return;`).
//
// Если ADMIN_TOKEN не задан в окружении — write-операции запрещены полностью
// (безопасный дефолт: не открываем БД миру из-за забытой переменной).
export function requireAdmin(req, res) {
  const expected = process.env.ADMIN_TOKEN;
  const got = req.headers['x-admin-token'];
  if (!expected) {
    res.status(503).json({ ok: false, error: 'ADMIN_TOKEN не настроен на сервере' });
    return false;
  }
  if (got !== expected) {
    res.status(401).json({ ok: false, error: 'Нужна авторизация администратора' });
    return false;
  }
  return true;
}

// Ленивое подключение к Postgres. null — БД не настроена (нет POSTGRES_URL):
// функции в этом случае отдают пустые данные, а витрины рисуют встроенный seed.
export async function getSql() {
  if (!process.env.POSTGRES_URL) return null;
  const { sql } = await import('@vercel/postgres');
  return sql;
}

// Унифицированная обработка OPTIONS + не-разрешённых методов.
// Возвращает true, если запрос уже обработан (вызывающий делает return).
export function handlePreflight(req, res, allowed) {
  cors(res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return true; }
  if (!allowed.includes(req.method)) {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return true;
  }
  return false;
}

// БД не настроена → отдать пустой список (витрина упадёт на seed).
export function emptyList(res) {
  return res.status(200).json({ ok: true, data: [] });
}
