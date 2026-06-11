/* AdminScheduleEditor.jsx — управление расписанием событий (admin).
   CRUD с источником правды на сервере (/api/schedule + /api/schedule-months)
   и локальным кэшем/fallback (localStorage SCHEDULE_KEY/MONTHS_KEY) на случай
   отсутствия сервера. Пустые месяцы хранятся отдельной таблицей. */

const SEED_EVENTS = [
  {
    id: 'evt-1', month: '2025-11', monthLabel: 'Ноябрь 2025',
    category: 'flagship', format: 'offline',
    title: 'Вес идеальности с модификацией фигуры',
    dates: '4–7 ноября', time: '17:00–20:00', duration: '4 дня по 3 часа',
    trainer: 'Татьяна Педас', location: 'Алматы',
    price: '160 000', priceNote: '−15 000 ₸ при предоплате',
    capacity: 3, capacityTotal: 12,
    status: 'published',
  },
  {
    id: 'evt-2', month: '2025-11', monthLabel: 'Ноябрь 2025',
    category: 'detox', format: 'online',
    title: 'ONLINE DETOX',
    dates: 'старт 12 ноября', time: 'гибкое расписание', duration: '10 дней практик',
    trainer: 'Марина Енгерова', location: '',
    price: '30 000', priceNote: '',
    capacity: null, capacityTotal: null,
    status: 'published',
  },
  {
    id: 'evt-3', month: '2025-11', monthLabel: 'Ноябрь 2025',
    category: 'club', format: 'offline',
    title: 'Клубный день — активация программы',
    dates: '10 ноября', time: '19:00–21:00', duration: '2 часа',
    trainer: 'Илья Брежнев', location: 'Алматы',
    price: '12 000', priceNote: '',
    capacity: null, capacityTotal: null,
    status: 'published',
  },
  {
    id: 'evt-4', month: '2025-12', monthLabel: 'Декабрь 2025',
    category: 'flagship', format: 'offline',
    title: 'Вес идеальности с модификацией фигуры',
    dates: '2–5 декабря', time: '17:00–20:00', duration: '4 дня по 3 часа',
    trainer: 'Татьяна Педас', location: 'Алматы',
    price: '160 000', priceNote: '−15 000 ₸ при предоплате',
    capacity: 8, capacityTotal: 12,
    status: 'published',
  },
  {
    id: 'evt-5', month: '2026-01', monthLabel: 'Январь 2026',
    category: 'flagship', format: 'offline',
    title: 'Вес идеальности с модификацией фигуры',
    dates: '13–16 января', time: '17:00–20:00', duration: '4 дня по 3 часа',
    trainer: 'Татьяна Педас', location: 'Алматы',
    price: '170 000', priceNote: 'Ранняя запись до 1 января: −20 000 ₸',
    capacity: 12, capacityTotal: 12,
    status: 'draft',
  },
  {
    id: 'evt-6', month: '2026-01', monthLabel: 'Январь 2026',
    category: 'detox', format: 'online',
    title: 'ONLINE DETOX — новогодний старт',
    dates: 'старт 5 января', time: 'гибкое расписание', duration: '10 дней практик',
    trainer: 'Марина Енгерова', location: '',
    price: '30 000', priceNote: '',
    capacity: null, capacityTotal: null,
    status: 'draft',
  },
];

const CATEGORIES = [
  { id: 'flagship', label: 'Вес идеальности', tagClass: 'om-tag-mini--gold'  },
  { id: 'club',     label: 'Клубный день',    tagClass: 'om-tag-mini--sage'  },
  { id: 'detox',    label: 'Детокс',          tagClass: 'om-tag-mini--lilac' },
  { id: 'teen',     label: 'Подростки',       tagClass: 'om-tag-mini--coral' },
];
const FORMATS = [
  { id: 'offline', label: 'Офлайн' },
  { id: 'online',  label: 'Онлайн' },
];
const STATUSES = [
  { id: 'published', label: 'Опубликовано', dot: 'var(--om-sage-deep)' },
  { id: 'draft',     label: 'Черновик',     dot: 'var(--om-warning)'  },
  { id: 'archived',  label: 'Архив',        dot: 'var(--om-faint)'    },
];

const RU_MONTHS = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
];

function monthIdToLabel(id) {
  const [y, m] = id.split('-');
  return `${RU_MONTHS[parseInt(m, 10) - 1]} ${y}`;
}

function ymString(date) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
}

function categoryMeta(id) {
  return CATEGORIES.find(c => c.id === id) || { label: id, tagClass: '' };
}

function statusMeta(id) {
  return STATUSES.find(s => s.id === id) || STATUSES[0];
}

/* ── Backend (Vercel + Postgres) с локальным кэшем/fallback ───────────── */

const API = '/api/schedule';
const MONTHS_API = '/api/schedule-months';
const SCHEDULE_KEY = 'omtime.schedule.v1';
const MONTHS_KEY = 'omtime.schedule.months.v1';
const adminToken = () => { try { return sessionStorage.getItem('omtime.admin.token') || ''; } catch (e) { return ''; } };
const cacheSchedule = (list) => { try { localStorage.setItem(SCHEDULE_KEY, JSON.stringify(list)); } catch (e) {} };
const cacheMonths = (list) => { try { localStorage.setItem(MONTHS_KEY, JSON.stringify(list)); } catch (e) {} };
function apiSend(url, method, body, query) {
  return fetch(url + (query || ''), {
    method,
    headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
    body: body ? JSON.stringify(body) : undefined,
  }).then(r => r.json()).catch(() => null);
}
const apiWrite      = (method, body, query) => apiSend(API, method, body, query);
const apiWriteMonth = (method, body, query) => apiSend(MONTHS_API, method, body, query);

// Витринные поля (tag / tagClass / formatLabel) выводятся из категории и формата —
// так публичная страница расписания (SchedulePage) выглядит как прежде.
const TAG_BY = {
  flagship: { offline: { tag: '4-дневный интенсив', tagClass: 'om-tag--gold' },
              online:  { tag: 'Онлайн-интенсив',    tagClass: 'om-tag--lilac' } },
  club:     { tag: 'Клубный день',     tagClass: 'om-tag--sage'  },
  detox:    { tag: 'Онлайн · 10 дней', tagClass: 'om-tag--lilac' },
  teen:     { tag: 'Подростки 12–17',  tagClass: 'om-tag--coral' },
};
function deriveDisplay(ev) {
  let tag = '', tagClass = '';
  const c = TAG_BY[ev.category];
  if (c) {
    if (c.offline || c.online) { const f = c[ev.format] || c.offline; tag = f.tag; tagClass = f.tagClass; }
    else { tag = c.tag; tagClass = c.tagClass; }
  }
  const formatLabel = ev.format === 'online' ? 'Онлайн' : ('Офлайн' + (ev.location ? ', ' + ev.location : ''));
  return { tag, tagClass, formatLabel };
}

/* ── Presentational cells (modern table) ──────────────────────────────── */

// Метр заполнения мест: тонкая дорожка + табличная подпись «занято / всего».
// Цвет шкалы смещается по заполненности: sage → жёлтый → коралл.
function CapacityMeter({ free, total }) {
  const f = Number(free) || 0;
  const t = Number(total) || 0;
  const taken = Math.max(0, t - f);
  const pct = t > 0 ? Math.max(4, Math.min(100, Math.round((taken / t) * 100))) : 0;
  const level = f <= 0 ? 'full' : (f <= Math.max(2, Math.round(t * 0.25)) ? 'low' : 'ok');
  return (
    <div className="om-cap" data-level={level} title={`Занято ${taken} из ${t}`}>
      <div className="om-cap-bar"><span style={{ width: pct + '%' }}></span></div>
      <span className="om-cap-label">{taken} / {t}</span>
    </div>
  );
}

// Цена: крупная моноширинная цифра в одну строку (tabular-nums, без переноса),
// приглушённый знак валюты и мягкий коралловый чип примечания к цене.
function PriceCell({ price, note }) {
  if (!price) return <span style={{ color: 'var(--om-faint)' }}>—</span>;
  return (
    <div className="om-price-wrap">
      <span className="om-price">
        <span className="om-price-num">{price}</span>
        <span className="om-price-cur">₸</span>
      </span>
      {note ? <span className="om-price-note">{note}</span> : null}
    </div>
  );
}

// Статус как мягкая тонированная пилюля с цветной точкой.
function StatusPill({ status }) {
  const st = statusMeta(status);
  return (
    <span className="om-status-pill" data-status={status}>
      <span className="om-status-dot" style={{ background: st.dot }}></span>
      {st.label}
    </span>
  );
}

/* ── Editor ───────────────────────────────────────────────────────────── */

function AdminScheduleEditor() {
  const [events, setEvents]   = React.useState(() => {
    try { const raw = localStorage.getItem(SCHEDULE_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
    return SEED_EVENTS;
  });
  // Пустые месяцы — хранятся отдельно от событий, чтобы месяц мог
  // существовать в расписании ещё до того, как в него добавлено событие.
  const [extraMonths, setExtraMonths] = React.useState(() => {
    try { const raw = localStorage.getItem(MONTHS_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
    return [];
  });
  const [search, setSearch]   = React.useState('');
  const [fCat, setFCat]       = React.useState('all');
  const [fMonth, setFMonth]   = React.useState('all');
  const [fStatus, setFStatus] = React.useState('all');

  const [editing, setEditing] = React.useState(null); // объект события или null
  const [toast, setToast]     = React.useState(null);

  const currentYM = ymString(new Date());

  // Первичная загрузка с сервера (источник правды). Нет сервера → кэш / SEED.
  React.useEffect(() => {
    let alive = true;
    fetch(API + '?all=1', { headers: { 'x-admin-token': adminToken() } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(j => { if (alive && j && j.ok && j.data && j.data.length) { setEvents(j.data); cacheSchedule(j.data); } })
      .catch(() => {});
    // Пустые месяцы — отдельная таблица на сервере (источник правды).
    fetch(MONTHS_API, { headers: { 'x-admin-token': adminToken() } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(j => { if (alive && j && j.ok && Array.isArray(j.data)) { setExtraMonths(j.data); cacheMonths(j.data); } })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // Список месяцев — события + явно добавленные пустые месяцы
  const months = React.useMemo(() => {
    const set = new Set(events.map(e => e.month));
    extraMonths.forEach(m => set.add(m));
    return [...set].sort().map(m => ({
      id: m,
      label: monthIdToLabel(m),
      count: events.filter(e => e.month === m).length,
      isPast: m < currentYM,
    }));
  }, [events, extraMonths, currentYM]);

  // Прокидываем общий счётчик в боковое меню
  React.useEffect(() => {
    if (window.__omSetEventsCount) window.__omSetEventsCount(events.length);
  }, [events.length]);

  const filtered = events.filter(ev => {
    if (fCat    !== 'all' && ev.category !== fCat)    return false;
    if (fMonth  !== 'all' && ev.month    !== fMonth)  return false;
    if (fStatus !== 'all' && ev.status   !== fStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!ev.title.toLowerCase().includes(q) &&
          !ev.trainer.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const grouped = React.useMemo(() => {
    const map = new Map();
    filtered.forEach(ev => {
      if (!map.has(ev.month)) map.set(ev.month, []);
      map.get(ev.month).push(ev);
    });
    // Пустые месяцы показываем как отдельные секции (без событий),
    // но только когда не заданы фильтры по программе/статусу/поиску.
    if (fCat === 'all' && fStatus === 'all' && !search) {
      months.forEach(m => {
        if (m.count === 0 && (fMonth === 'all' || fMonth === m.id) && !map.has(m.id)) {
          map.set(m.id, []);
        }
      });
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered, months, fCat, fStatus, fMonth, search]);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => setToast(null), 2400);
  }

  function blankEvent(monthId) {
    return {
      id: 'new',
      month: monthId,
      monthLabel: monthIdToLabel(monthId),
      category: 'flagship', format: 'offline',
      title: '', dates: '', time: '', duration: '',
      trainer: '', location: '',
      price: '', priceNote: '',
      capacity: '', capacityTotal: '',
      featured: false, isNew: false,
      status: 'draft',
    };
  }

  function newEvent() {
    setEditing(blankEvent(months[0] ? months[0].id : currentYM));
  }

  function newEventInMonth(monthId) {
    setEditing(blankEvent(monthId));
  }

  function saveEvent(data) {
    if (!data.title.trim()) { showToast('Укажите название программы'); return; }
    if (!data.dates.trim()) { showToast('Укажите даты'); return; }

    const normalized = {
      ...data,
      monthLabel: monthIdToLabel(data.month),
      capacity:      data.capacity      === '' ? null : Number(data.capacity),
      capacityTotal: data.capacityTotal === '' ? null : Number(data.capacityTotal),
      featured: !!data.featured,
      isNew: !!data.isNew,
      ...deriveDisplay(data), // tag / tagClass / formatLabel для витрины
    };

    if (data.id === 'new') {
      normalized.id = 'evt-' + Date.now();
      setEvents(prev => { const n = [...prev, normalized]; cacheSchedule(n); return n; });
      apiWrite('POST', normalized);
      showToast('Событие добавлено');
    } else {
      setEvents(prev => { const n = prev.map(e => e.id === data.id ? normalized : e); cacheSchedule(n); return n; });
      apiWrite('PUT', normalized);
      showToast('Изменения сохранены');
    }
    setEditing(null);
  }

  function deleteEvent(id) {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    if (!window.confirm(`Удалить событие\n«${ev.title}» (${ev.dates})?`)) return;
    setEvents(prev => { const n = prev.filter(e => e.id !== id); cacheSchedule(n); return n; });
    apiWrite('DELETE', null, '?id=' + encodeURIComponent(id));
    showToast('Событие удалено');
  }

  function deleteMonth(monthId) {
    const list = events.filter(e => e.month === monthId);
    const isEmpty = list.length === 0;
    const msg = isEmpty
      ? `Удалить месяц «${monthIdToLabel(monthId)}» из расписания?`
      : `Удалить ${list.length} ${pluralRu(list.length, 'событие', 'события', 'событий')} в месяце «${monthIdToLabel(monthId)}»?`;
    if (!window.confirm(msg)) return;
    list.forEach(e => apiWrite('DELETE', null, '?id=' + encodeURIComponent(e.id)));
    setEvents(prev => { const n = prev.filter(e => e.month !== monthId); cacheSchedule(n); return n; });
    setExtraMonths(prev => { const n = prev.filter(m => m !== monthId); cacheMonths(n); return n; });
    apiWriteMonth('DELETE', null, '?month=' + encodeURIComponent(monthId));
    if (fMonth === monthId) setFMonth('all');
    showToast(isEmpty ? 'Месяц удалён' : 'Месяц очищен');
  }

  function addMonth() {
    const today = new Date();
    const last = months[months.length - 1];
    let baseY, baseM;
    if (last) {
      const [y, m] = last.id.split('-').map(Number);
      baseY = y; baseM = m;
    } else {
      baseY = today.getFullYear(); baseM = today.getMonth();
    }
    baseM += 1;
    if (baseM > 12) { baseM = 1; baseY += 1; }
    const nextId = `${baseY}-${String(baseM).padStart(2, '0')}`;
    if (months.some(mn => mn.id === nextId)) {
      showToast('Этот месяц уже есть');
      return;
    }
    // Добавляем пустой месяц в расписание. Событие в него можно
    // создать позже — кнопкой «Добавить событие» в строке месяца.
    setExtraMonths(prev => { const n = [...prev, nextId]; cacheMonths(n); return n; });
    apiWriteMonth('POST', { month: nextId });
    showToast('Месяц добавлен');
  }

  return (
    <React.Fragment>
      {/* Header */}
      <div className="om-acc-head">
        <div>
          <div className="om-acc-eyebrow">Управление</div>
          <h1 className="om-acc-title">Расписание</h1>
          <p className="om-acc-sub">
            События отображаются на публичной странице расписания. Черновики и архив не показываются посетителям.
          </p>
        </div>
        <button className="om-btn om-btn--primary" onClick={newEvent}>
          <LucideIcon name="plus" size={16} style={{ marginRight: 6 }} />
          Добавить событие
        </button>
      </div>

      {/* Months panel */}
      <div className="om-adm-months">
        <div className="om-adm-months-head">
          <span className="om-adm-months-title">Месяцы в расписании</span>
          <span style={{ fontSize: 12, color: 'var(--om-muted)' }}>
            {months.length} {pluralRu(months.length, 'месяц', 'месяца', 'месяцев')} · {events.length} {pluralRu(events.length, 'событие', 'события', 'событий')}
          </span>
        </div>
        <div className="om-adm-months-list">
          {months.map(m => (
            <span key={m.id} className="om-adm-month-chip" data-past={m.isPast}>
              {m.isPast && <LucideIcon name="history" size={11} style={{ opacity: 0.6 }} />}
              {m.label}
              <span className="om-adm-month-count">{m.count}</span>
              <button
                className="om-adm-month-x"
                title="Удалить все события месяца"
                onClick={() => deleteMonth(m.id)}
              >
                <LucideIcon name="x" size={12} />
              </button>
            </span>
          ))}
          <button className="om-adm-month-add" onClick={addMonth}>
            <LucideIcon name="plus" size={13} />
            Новый месяц
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="om-adm-toolbar">
        <div className="om-adm-search">
          <LucideIcon name="search" size={14} style={{ color: 'var(--om-muted)' }} />
          <input
            type="search"
            placeholder="Поиск по названию или тренеру"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="om-adm-icon-btn" style={{ width: 22, height: 22 }} onClick={() => setSearch('')}>
              <LucideIcon name="x" size={12} />
            </button>
          )}
        </div>

        <select className="om-adm-select" value={fCat} onChange={e => setFCat(e.target.value)}>
          <option value="all">Все программы</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>

        <select className="om-adm-select" value={fMonth} onChange={e => setFMonth(e.target.value)}>
          <option value="all">Все месяцы</option>
          {months.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>

        <select className="om-adm-select" value={fStatus} onChange={e => setFStatus(e.target.value)}>
          <option value="all">Любой статус</option>
          {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>

        <div className="om-adm-spacer"></div>
        <span style={{ fontSize: 12, color: 'var(--om-muted)' }}>
          Показано {filtered.length} из {events.length}
        </span>
      </div>

      {/* Table */}
      <div className="om-adm-table-wrap">
        {grouped.length === 0 ? (
          <div className="om-adm-empty">
            <LucideIcon name="calendar-x" size={36} style={{ marginBottom: 12, opacity: 0.45 }} />
            <div style={{ fontSize: 15, color: 'var(--om-ink)', fontWeight: 500, marginBottom: 4 }}>
              Ничего не найдено
            </div>
            <div style={{ fontSize: 13 }}>Измените фильтры или добавьте новое событие.</div>
          </div>
        ) : (
          <table className="om-adm-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Программа</th>
                <th>Даты · время</th>
                <th>Тренер · формат</th>
                <th>Места</th>
                <th style={{ textAlign: 'right' }}>Цена</th>
                <th>Статус</th>
                <th style={{ width: 80, textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(([monthId, list]) => (
                <React.Fragment key={monthId}>
                  <tr style={{ background: 'var(--om-canvas)' }}>
                    <td colSpan={7} style={{
                      padding: '12px 20px',
                      fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: 'var(--om-muted)', fontWeight: 500,
                    }}>
                      {monthIdToLabel(monthId)} · {list.length} {pluralRu(list.length, 'событие', 'события', 'событий')}
                    </td>
                  </tr>
                  {list.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: 13, color: 'var(--om-muted)', marginRight: 12 }}>
                          В этом месяце пока нет событий.
                        </span>
                        <button
                          className="om-adm-month-add"
                          onClick={() => newEventInMonth(monthId)}
                        >
                          <LucideIcon name="plus" size={13} />
                          Добавить событие
                        </button>
                      </td>
                    </tr>
                  )}
                  {list.map(ev => {
                    const cat = categoryMeta(ev.category);
                    return (
                      <tr key={ev.id} data-cat={ev.category}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span className={`om-tag-mini ${cat.tagClass}`}>{cat.label}</span>
                          </div>
                          <div className="om-adm-cell-title">{ev.title || <span style={{ color: 'var(--om-faint)' }}>(без названия)</span>}</div>
                        </td>
                        <td data-label="Даты · время">
                          <div>{ev.dates}</div>
                          <div className="om-adm-cell-meta">{ev.time}{ev.duration ? ` · ${ev.duration}` : ''}</div>
                        </td>
                        <td data-label="Тренер · формат">
                          <div>{ev.trainer || <span style={{ color: 'var(--om-faint)' }}>—</span>}</div>
                          <div className="om-adm-cell-meta">
                            {ev.format === 'online' ? 'Онлайн' : `Офлайн${ev.location ? ', ' + ev.location : ''}`}
                          </div>
                        </td>
                        <td data-label="Места">
                          {ev.capacityTotal
                            ? <CapacityMeter free={ev.capacity} total={ev.capacityTotal} />
                            : <span style={{ color: 'var(--om-faint)' }}>—</span>}
                        </td>
                        <td className="om-adm-price-cell" data-label="Цена">
                          <PriceCell price={ev.price} note={ev.priceNote} />
                        </td>
                        <td data-label="Статус">
                          <StatusPill status={ev.status} />
                        </td>
                        <td>
                          <div className="om-adm-actions">
                            <button className="om-adm-icon-btn" title="Редактировать" onClick={() => setEditing(ev)}>
                              <LucideIcon name="pencil" size={14} />
                            </button>
                            <button className="om-adm-icon-btn" data-danger="true" title="Удалить" onClick={() => deleteEvent(ev.id)}>
                              <LucideIcon name="trash-2" size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <EventEditorModal
          initial={editing}
          existingMonths={months}
          onSave={saveEvent}
          onClose={() => setEditing(null)}
        />
      )}

      {toast && (
        <div className="om-toast">
          <LucideIcon name="check-circle-2" size={16} />
          {toast}
        </div>
      )}
    </React.Fragment>
  );
}

/* ── Modal: форма события ─────────────────────────────────────────────── */

function EventEditorModal({ initial, existingMonths, onSave, onClose }) {
  const [draft, setDraft] = React.useState(initial);
  const isNew = initial.id === 'new';

  React.useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function set(key, value) {
    setDraft(prev => ({ ...prev, [key]: value }));
  }

  // Список доступных месяцев — существующие + следующие 12 от сегодня
  const monthOptions = React.useMemo(() => {
    const set = new Set(existingMonths.map(m => m.id));
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      set.add(ymString(d));
    }
    if (draft.month) set.add(draft.month);
    return [...set].sort();
  }, [existingMonths, draft.month]);

  return (
    <div className="om-modal-backdrop" onClick={onClose}>
      <div className="om-modal" onClick={e => e.stopPropagation()}>
        <div className="om-modal-head">
          <h2 className="om-modal-title">
            {isNew ? 'Новое событие' : 'Редактировать событие'}
          </h2>
          <button className="om-modal-close" onClick={onClose}>
            <LucideIcon name="x" size={18} />
          </button>
        </div>

        <div className="om-modal-body">
          <div className="om-form-grid">
            <div className="om-form-field om-form-field--full">
              <label className="om-form-label">Название программы</label>
              <input
                className="om-form-input"
                value={draft.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Вес идеальности с модификацией фигуры"
                autoFocus
              />
            </div>

            <div className="om-form-field">
              <label className="om-form-label">Программа</label>
              <select
                className="om-form-select"
                value={draft.category}
                onChange={e => set('category', e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>

            <div className="om-form-field">
              <label className="om-form-label">Формат</label>
              <select
                className="om-form-select"
                value={draft.format}
                onChange={e => set('format', e.target.value)}
              >
                {FORMATS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </div>

            <div className="om-form-field">
              <label className="om-form-label">Месяц</label>
              <select
                className="om-form-select"
                value={draft.month}
                onChange={e => set('month', e.target.value)}
              >
                {monthOptions.map(m => <option key={m} value={m}>{monthIdToLabel(m)}</option>)}
              </select>
            </div>

            <div className="om-form-field">
              <label className="om-form-label">Даты</label>
              <input
                className="om-form-input"
                value={draft.dates}
                onChange={e => set('dates', e.target.value)}
                placeholder="4–7 ноября"
              />
            </div>

            <div className="om-form-field">
              <label className="om-form-label">Время</label>
              <input
                className="om-form-input"
                value={draft.time}
                onChange={e => set('time', e.target.value)}
                placeholder="17:00–20:00"
              />
            </div>

            <div className="om-form-field">
              <label className="om-form-label">Длительность</label>
              <input
                className="om-form-input"
                value={draft.duration}
                onChange={e => set('duration', e.target.value)}
                placeholder="4 дня по 3 часа"
              />
            </div>

            <div className="om-form-field">
              <label className="om-form-label">Тренер</label>
              <input
                className="om-form-input"
                value={draft.trainer}
                onChange={e => set('trainer', e.target.value)}
                placeholder="Татьяна Педас"
              />
            </div>

            <div className="om-form-field">
              <label className="om-form-label">Город / точка</label>
              <input
                className="om-form-input"
                value={draft.location}
                onChange={e => set('location', e.target.value)}
                placeholder={draft.format === 'online' ? '— (не нужно для онлайн)' : 'Алматы'}
                disabled={draft.format === 'online'}
              />
            </div>

            <div className="om-form-field">
              <label className="om-form-label">Цена, ₸</label>
              <input
                className="om-form-input"
                value={draft.price}
                onChange={e => set('price', e.target.value)}
                placeholder="160 000"
              />
            </div>

            <div className="om-form-field">
              <label className="om-form-label">Примечание к цене</label>
              <input
                className="om-form-input"
                value={draft.priceNote}
                onChange={e => set('priceNote', e.target.value)}
                placeholder="−15 000 ₸ при предоплате"
              />
            </div>

            <div className="om-form-field">
              <label className="om-form-label">Свободно мест</label>
              <input
                className="om-form-input"
                type="number" min="0"
                value={draft.capacity === null ? '' : draft.capacity}
                onChange={e => set('capacity', e.target.value)}
                placeholder="пусто = без лимита"
              />
            </div>

            <div className="om-form-field">
              <label className="om-form-label">Всего мест</label>
              <input
                className="om-form-input"
                type="number" min="0"
                value={draft.capacityTotal === null ? '' : draft.capacityTotal}
                onChange={e => set('capacityTotal', e.target.value)}
                placeholder="пусто = без лимита"
              />
            </div>

            <div className="om-form-field om-form-field--full">
              <label className="om-form-label">Статус</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {STATUSES.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => set('status', s.id)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 'var(--om-radius-sm)',
                      border: '1px solid ' + (draft.status === s.id ? 'var(--om-ink)' : 'var(--om-hairline)'),
                      background: draft.status === s.id ? 'var(--om-ink)' : 'var(--om-canvas-white)',
                      color: draft.status === s.id ? '#fff' : 'var(--om-body)',
                      cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 160ms ease',
                    }}
                  >
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', background: s.dot,
                      opacity: draft.status === s.id ? 1 : 0.7,
                    }}></span>
                    {s.label}
                  </button>
                ))}
              </div>
              <span className="om-form-help">
                Только «опубликовано» отображается на публичной странице расписания.
              </span>
            </div>

            <div className="om-form-field om-form-field--full">
              <label className="om-form-label">Оформление на витрине</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!draft.featured} onChange={e => set('featured', e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--om-ink)' }} />
                  <span>Выделить крупной карточкой-баннером</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!draft.isNew} onChange={e => set('isNew', e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--om-ink)' }} />
                  <span>Бейдж «новое»</span>
                </label>
              </div>
              <span className="om-form-help">
                Бейдж формата и цвет тега подбираются автоматически по категории и формату.
              </span>
            </div>
          </div>
        </div>

        <div className="om-modal-foot">
          <button className="om-btn om-btn--secondary" onClick={onClose}>Отмена</button>
          <button className="om-btn om-btn--primary" onClick={() => onSave(draft)}>
            {isNew ? 'Создать' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── helpers ──────────────────────────────────────────────────────────── */

function pluralRu(n, one, few, many) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

window.AdminScheduleEditor = AdminScheduleEditor;
