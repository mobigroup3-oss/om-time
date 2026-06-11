/* AnnounceBar.jsx — премиальная выплывающая строка-анонс над шапкой.
   Показывает «Ближайшие события» (программы с галочкой showInHero из
   /api/programs): бейдж, название, дата, живой обратный отсчёт, цена, CTA.
   Если событий несколько — анонсы плавно сменяют друг друга по кругу
   (каждые 8 секунд; пауза при наведении; точки-индикаторы кликабельны).
   Крестик прячет строку на 3 дня (или до изменения состава событий —
   что наступит раньше). Самодостаточный компонент: все хелперы локальные,
   т.к. Babel-standalone исполняет каждый .jsx в своей области видимости. */

// Месяцы в родительном падеже — для парсинга свободной строки дат программы.
const ANNOUNCE_MONTHS_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

const ANNOUNCE_DISMISS_MS = 3 * 24 * 60 * 60 * 1000; // возврат через 3 дня
const ANNOUNCE_ROTATE_MS = 8000;                     // смена анонса при нескольких событиях

// Из свободной строки дат («10-11 Июля 2026, 18:00», «старт 12 ноября»)
// вытаскиваем день, месяц, год, время и собираем timestamp старта.
// Года нет — берём ближайший будущий. Не распарсилось — ts = null.
function announceParseDate(dates) {
  const out = { day: '', month: '', ts: null };
  if (!dates) return out;
  const str = String(dates);
  const dayM = str.match(/\d+/);
  if (dayM) out.day = dayM[0];
  const low = str.toLowerCase();
  let monthIdx = -1;
  for (let i = 0; i < ANNOUNCE_MONTHS_RU.length; i++) {
    if (low.includes(ANNOUNCE_MONTHS_RU[i].slice(0, 3))) { monthIdx = i; break; }
  }
  if (monthIdx >= 0) out.month = ANNOUNCE_MONTHS_RU[monthIdx];
  if (!out.day || monthIdx < 0) return out;

  const yearM = str.match(/\b(20\d{2})\b/);
  const timeM = str.match(/(\d{1,2}):(\d{2})/);
  const hh = timeM ? Number(timeM[1]) : 0;
  const mm = timeM ? Number(timeM[2]) : 0;
  let year = yearM ? Number(yearM[1]) : new Date().getFullYear();
  let d = new Date(year, monthIdx, Number(out.day), hh, mm);
  // Год не указан и дата уже прошла (больше суток назад) — значит, следующий год.
  if (!yearM && d.getTime() < Date.now() - 36 * 60 * 60 * 1000) {
    d = new Date(year + 1, monthIdx, Number(out.day), hh, mm);
  }
  out.ts = d.getTime();
  return out;
}

// Цена программы (число тенге + опц. префикс «от») → строка вида «от 80 000₸».
function announceFormatPrice(prefix, price) {
  if (price == null || price === '') return '';
  const num = Number(price).toLocaleString('ru-RU') + '₸';
  return [prefix, num].filter(Boolean).join(' ');
}

// Каноничная программа из /api/programs → данные анонса.
function announceEvent(c) {
  if (!c) return null;
  const d = announceParseDate(c.dates);
  return {
    id: c.id || c.title || '',
    day: d.day,
    month: d.month,
    ts: d.ts,
    title: c.title || '',
    trainer: [c.trainer, c.formatLabel].filter(Boolean).join(' · '),
    price: announceFormatPrice(c.pricePrefix, c.price),
  };
}

// Список программ → события строки-анонса: все с галочкой showInHero
// (fallback — флагман featured), ближайшие по дате старта первыми.
function announceCollect(list) {
  if (!Array.isArray(list)) return [];
  let picked = list.filter(p => p && p.showInHero);
  if (!picked.length) picked = list.filter(p => p && p.featured).slice(0, 1);
  const events = picked.map(announceEvent).filter(ev => ev && ev.title);
  events.sort((a, b) => (a.ts || Infinity) - (b.ts || Infinity));
  return events;
}

// Последний успешно полученный список кэшируется, чтобы строка появлялась
// мгновенно и не «пропадала» при холодном старте /api/programs.
// Старый формат кэша (одно событие-объект) оборачиваем в массив.
function announceLoadCache() {
  try {
    const raw = JSON.parse(localStorage.getItem('om-hero-featured') || 'null');
    if (!raw) return null;
    const list = Array.isArray(raw) ? raw : [raw];
    return list.filter(ev => ev && ev.title).length ? list : null;
  }
  catch (e) { return null; }
}

// Кабинет администратора хранит каталог программ в localStorage
// ('omtime.programs.v1') — это и оптимистичный кэш при работе с сервером,
// и единственное хранилище в локальном предпросмотре без /api.
// Читаем его, чтобы галочки из кабинета сразу попадали в строку.
function announceLoadAdminCache() {
  try {
    const list = JSON.parse(localStorage.getItem('omtime.programs.v1') || 'null');
    if (!Array.isArray(list)) return null;
    const events = announceCollect(list.filter(p => p && p.active !== false));
    return events.length ? events : null;
  } catch (e) { return null; }
}

// Сигнатура состава событий для ключа закрытия: меняется — строка снова видна.
function announceSig(events) {
  if (!events || !events.length) return '';
  return events.map(ev => [ev.title, ev.day, ev.month, ev.price].join('|')).join('~');
}

// Запись о закрытии: { sig, ts }. Старый формат (голая строка-сигнатура)
// считаем просроченным, чтобы строка вернулась.
function announceLoadDismiss() {
  try {
    const raw = localStorage.getItem('om-announce-dismissed');
    if (!raw) return null;
    if (raw.charAt(0) === '{') return JSON.parse(raw);
    return { sig: raw, ts: 0 };
  } catch (e) { return null; }
}

// Остаток до старта → короткая строка «29 дн 13 ч» / «5 ч 12 мин» / «40 мин».
function announceCountdown(ts, now) {
  if (!ts) return '';
  const left = ts - now;
  if (left <= 0) return '';
  const m = Math.floor(left / 60000) % 60;
  const h = Math.floor(left / 3600000) % 24;
  const d = Math.floor(left / 86400000);
  if (d > 0) return d + ' дн ' + h + ' ч';
  if (h > 0) return h + ' ч ' + m + ' мин';
  return m + ' мин';
}

// Локальный предпросмотр без /api — демо-события, чтобы строку (и ротацию)
// было видно. На боевом домене не срабатывает: только реальные данные.
function announceIsLocal() {
  const h = typeof location !== 'undefined' ? location.hostname : '';
  return h === 'localhost' || h === '127.0.0.1' || h === '' || h === '0.0.0.0';
}
function announceDemo() {
  return announceCollect([
    {
      id: 'demo-1',
      title: 'Интенсив «Вес идеальности»',
      formatLabel: 'Офлайн · Алматы',
      dates: '10–11 июля, 18:00',
      pricePrefix: 'от',
      price: 80000,
      showInHero: true,
    },
    {
      id: 'demo-2',
      title: 'Клубный день для выпускников',
      formatLabel: 'Офлайн · Алматы',
      dates: '18 июля, 19:00',
      pricePrefix: '',
      price: 12000,
      showInHero: true,
    },
  ]);
}

function AnnounceBar() {
  const [events, setEvents] = React.useState(() => {
    return announceLoadAdminCache() || announceLoadCache() ||
      (announceIsLocal() ? announceDemo() : []);
  });
  const [idx, setIdx] = React.useState(0);
  const [dismiss, setDismiss] = React.useState(announceLoadDismiss);
  const [now, setNow] = React.useState(Date.now);
  const [paused, setPaused] = React.useState(false);

  // Источник правды — /api/programs (галочки «Ближайшее событие» в кабинете).
  React.useEffect(() => {
    let alive = true;
    fetch('/api/programs')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(j => {
        if (!alive || !j || !j.ok || !Array.isArray(j.data)) return;
        const list = announceCollect(j.data);
        if (list.length) {
          setEvents(list);
          try { localStorage.setItem('om-hero-featured', JSON.stringify(list)); } catch (e) {}
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // Кабинет открыт в соседней вкладке и админ поменял галочки —
  // событие 'storage' прилетает сюда, обновляем строку без перезагрузки.
  React.useEffect(() => {
    function onStorage(e) {
      if (e.key !== 'omtime.programs.v1') return;
      const list = announceLoadAdminCache();
      if (list) setEvents(list);
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Состав событий изменился — не выходим за границы списка.
  React.useEffect(() => {
    setIdx(i => (events.length ? i % events.length : 0));
  }, [events.length]);

  const sig = announceSig(events);
  const dismissed = !!(dismiss && dismiss.sig === sig &&
    now - dismiss.ts < ANNOUNCE_DISMISS_MS);
  const visible = events.length > 0 && !dismissed;
  const active = visible ? events[idx % events.length] : null;

  // Ротация анонсов по кругу; пауза, пока курсор над строкой.
  React.useEffect(() => {
    if (!visible || events.length < 2 || paused) return;
    const t = setInterval(() => setIdx(i => (i + 1) % events.length), ANNOUNCE_ROTATE_MS);
    return () => clearInterval(t);
  }, [visible, events.length, paused]);

  // Тикаем раз в 30 секунд, пока виден отсчёт.
  React.useEffect(() => {
    if (!visible || !active || !active.ts) return;
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, [visible, active && active.ts]);

  // Перерисовать иконки lucide, когда строка появилась/сменился анонс.
  React.useEffect(() => {
    if (visible && window.lucide) window.lucide.createIcons();
  }, [visible, events, idx]);

  function onDismiss(e) {
    e.preventDefault();
    e.stopPropagation();
    const rec = { sig, ts: Date.now() };
    try { localStorage.setItem('om-announce-dismissed', JSON.stringify(rec)); } catch (err) {}
    setDismiss(rec);
  }

  if (!visible || !active) return null;

  const dateStr = [active.day, active.month].filter(Boolean).join(' ');
  const countdown = announceCountdown(active.ts, now);

  return (
    <div
      className="om-announce"
      role="region"
      aria-label="Анонс ближайших событий"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className="om-announce-aurora" aria-hidden="true"></span>
      <span className="om-announce-sheen" aria-hidden="true"></span>
      <a className="om-announce-main" href="programs.html">
        <span className="om-announce-badge">
          <span className="om-announce-badge-dot" aria-hidden="true"></span>
          Ближайшее событие
        </span>
        {/* key=idx: при смене анонса контент перемонтируется с анимацией появления */}
        <span className="om-announce-swap" key={active.id + '|' + idx}>
          <span className="om-announce-name">{active.title}</span>
          {dateStr && (
            <span className="om-announce-date">
              <i data-lucide="calendar-days" aria-hidden="true"></i>
              <span>{dateStr}</span>
            </span>
          )}
          {countdown && (
            <span className="om-announce-count" title="До старта программы">
              <i data-lucide="timer" aria-hidden="true"></i>
              <span className="om-announce-count-pre">старт через</span>
              <span className="om-announce-count-num">{countdown}</span>
            </span>
          )}
          {active.price && <span className="om-announce-price">{active.price}</span>}
        </span>
        <span className="om-announce-cta">
          Подробнее
          <span className="om-announce-cta-ic" aria-hidden="true">
            <i data-lucide="arrow-up-right"></i>
          </span>
        </span>
      </a>
      {events.length > 1 && (
        <span className="om-announce-dots" role="tablist" aria-label="Анонсы событий">
          {events.map((ev, i) => (
            <button
              key={ev.id + i}
              type="button"
              role="tab"
              aria-selected={i === idx % events.length}
              className={'om-announce-dot' + (i === idx % events.length ? ' is-active' : '')}
              aria-label={'Событие ' + (i + 1) + ': ' + ev.title}
              onClick={() => setIdx(i)}
            />
          ))}
        </span>
      )}
      <button
        type="button"
        className="om-announce-close"
        aria-label="Скрыть анонс на 3 дня"
        onClick={onDismiss}
      >
        <i data-lucide="x"></i>
      </button>
    </div>
  );
}

window.AnnounceBar = AnnounceBar;
