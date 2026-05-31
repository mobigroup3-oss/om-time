// api/booking.js — приём заявок с формы записи (booking.html).
// Serverless-функция Vercel (Node). Адрес после деплоя: POST /api/booking
//
// Работает сразу: валидирует заявку и возвращает код брони (OM-XXXXX).
// Доп. возможности включаются переменными окружения (Vercel → Project →
// Settings → Environment Variables) — без них функция НЕ падает:
//   POSTGRES_URL        — сохранять заявки в БД (нужен пакет @vercel/postgres, см. DEPLOY.md)
//   RESEND_API_KEY      — письмо-уведомление (вместе с NOTIFY_EMAIL, опц. FROM_EMAIL)
//   TELEGRAM_BOT_TOKEN  — уведомление в Telegram (вместе с TELEGRAM_CHAT_ID)

// Допустимые программы — синхронно с BOOKING_PROGRAMS (booking.html).
const PROGRAMS = ['flagship-offline', 'flagship-online', 'club', 'teen', 'detox', 'consult'];

function validate(b) {
  const errors = {};
  if (!b.name || !String(b.name).trim()) errors.name = 'Укажите имя';
  const digits = String(b.phone || '').replace(/\D/g, '');
  if (digits.length < 10) errors.phone = 'Некорректный телефон';
  if (b.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) errors.email = 'Некорректный e-mail';
  if (b.programId && !PROGRAMS.includes(b.programId)) errors.programId = 'Неизвестная программа';
  if (b.agree === false) errors.agree = 'Нужно согласие на обработку данных';
  return errors;
}

const makeCode = () => 'OM-' + Math.random().toString(36).slice(2, 7).toUpperCase();

export default async function handler(req, res) {
  // CORS — на случай вызова с другого поддомена или локально.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};

  const errors = validate(body);
  if (Object.keys(errors).length) return res.status(422).json({ ok: false, errors });

  const record = {
    name:       String(body.name).trim(),
    phone:      String(body.phone).trim(),
    email:      body.email   ? String(body.email).trim()   : null,
    city:       body.city    ? String(body.city).trim()    : null,
    format:     body.format  || null,
    comment:    body.comment ? String(body.comment).trim() : null,
    program_id: body.programId || null,
    event_id:   body.eventId   || null,
    channel:    'form',
    status:     'new',
    code:       makeCode(),
    created_at: new Date().toISOString(),
  };

  // 1) Сохранение в БД (опционально).
  await persist(record).catch(err => console.error('[booking] persist failed:', err));
  // 2) Уведомления (опционально, параллельно, ошибки не валят ответ).
  await Promise.allSettled([notifyEmail(record), notifyTelegram(record)]);

  return res.status(200).json({ ok: true, code: record.code });
}

// Vercel Postgres. Включается, когда задан POSTGRES_URL и установлен @vercel/postgres.
async function persist(r) {
  if (!process.env.POSTGRES_URL) return;
  const { sql } = await import('@vercel/postgres');
  await sql`
    INSERT INTO requests
      (name, phone, email, city, format, comment, program_id, event_id, channel, status, code, created_at)
    VALUES
      (${r.name}, ${r.phone}, ${r.email}, ${r.city}, ${r.format}, ${r.comment},
       ${r.program_id}, ${r.event_id}, ${r.channel}, ${r.status}, ${r.code}, ${r.created_at})
  `;
}

// Письмо через Resend (REST, без зависимостей).
async function notifyEmail(r) {
  const key = process.env.RESEND_API_KEY;
  const to  = process.env.NOTIFY_EMAIL;
  if (!key || !to) return;
  const from = process.env.FROM_EMAIL || 'OM-Time <onboarding@resend.dev>';
  const text = [
    `Новая заявка ${r.code}`,
    `Имя: ${r.name}`,
    `Телефон: ${r.phone}`,
    r.email      ? `E-mail: ${r.email}` : null,
    r.city       ? `Город: ${r.city}` : null,
    r.program_id ? `Программа: ${r.program_id}` : null,
    r.format     ? `Формат: ${r.format}` : null,
    r.comment    ? `Комментарий: ${r.comment}` : null,
  ].filter(Boolean).join('\n');
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject: `Новая заявка ${r.code} — ${r.name}`, text }),
  });
}

// Уведомление в Telegram (Bot API, без зависимостей).
async function notifyTelegram(r) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat  = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  const text = `🆕 Заявка ${r.code}\n👤 ${r.name}\n📞 ${r.phone}` +
    (r.program_id ? `\n📋 ${r.program_id}` : '') +
    (r.comment ? `\n💬 ${r.comment}` : '');
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text }),
  });
}
