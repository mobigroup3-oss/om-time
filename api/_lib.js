// api/_lib.js — общие хелперы для serverless-функций OM-Time (Vercel, Node).
// Стиль — как в api/booking.js: без фреймворков, @vercel/postgres через await import.
//
// Контракт ответа всюду одинаковый: { ok: true, data } | { ok: false, error|errors }.
// GET-чтения открыты; write-операции (POST/PUT/PATCH/DELETE) проходят requireAdmin().

// CORS — на случай вызова с поддомена/локально. Разрешаем admin- и seller-токены.
export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token, x-seller-token');
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

// Является ли запрос админским (по заголовку x-admin-token). Без побочных эффектов.
export function isAdmin(req) {
  const expected = process.env.ADMIN_TOKEN;
  return !!expected && req.headers['x-admin-token'] === expected;
}

// SHA-256 hex — для хранения кода входа продажника (сам код в БД не храним).
export function hashCode(code) {
  const crypto = require('node:crypto');
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}

// Резолв продажника по личному коду (заголовок x-seller-token) через БД.
// Возвращает { id, name } активного продажника или null. Серверный источник
// истины: seller_id для сделок/лога берём отсюда, а не из тела запроса.
export async function getSeller(req) {
  const code = req.headers['x-seller-token'];
  if (!code) return null;
  const sql = await getSql();
  if (!sql) return null;
  const rows = await sql`
    SELECT id, name, monthly_goal FROM sellers
    WHERE code_hash = ${hashCode(code)} AND active = true
    LIMIT 1`;
  return rows.rows[0] || null;
}

// Доступ персонала: админ ИЛИ авторизованный продажник. Возвращает
// { role, id, name } либо сам шлёт 401 и возвращает null.
// Вызывающий: `const who = await requireStaff(req,res); if (!who) return;`
export async function requireStaff(req, res) {
  if (isAdmin(req)) return { role: 'admin', id: 'admin', name: 'Администратор' };
  const seller = await getSeller(req);
  if (seller) return { role: 'seller', id: seller.id, name: seller.name };
  res.status(401).json({ ok: false, error: 'Нужна авторизация сотрудника' });
  return null;
}

// Строка подключения к Postgres. Разные интеграции называют переменную
// по-разному (Vercel Postgres → POSTGRES_URL, Neon → DATABASE_URL и т.п.).
export function pgConnString() {
  return process.env.POSTGRES_URL
    || process.env.POSTGRES_PRISMA_URL
    || process.env.DATABASE_URL
    || process.env.POSTGRES_URL_NON_POOLING
    || process.env.DATABASE_URL_UNPOOLED
    || '';
}

// Ленивое подключение к Postgres. null — БД не настроена: функции отдают пустые
// данные, а витрины рисуют встроенный seed. @vercel/postgres читает POSTGRES_URL —
// если интеграция задала только DATABASE_URL, подставляем её туда.
export async function getSql() {
  const conn = pgConnString();
  if (!conn) return null;
  if (!process.env.POSTGRES_URL) process.env.POSTGRES_URL = conn;
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
