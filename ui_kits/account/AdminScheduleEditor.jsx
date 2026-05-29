/* AdminScheduleEditor.jsx — макет управления расписанием.
   In-memory CRUD. Данные не сохраняются после перезагрузки —
   это design mockup для бэкенд-разработчика. */

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

/* ── Editor ───────────────────────────────────────────────────────────── */

function AdminScheduleEditor() {
  const [events, setEvents]   = React.useState(SEED_EVENTS);
  const [search, setSearch]   = React.useState('');
  const [fCat, setFCat]       = React.useState('all');
  const [fMonth, setFMonth]   = React.useState('all');
  const [fStatus, setFStatus] = React.useState('all');

  const [editing, setEditing] = React.useState(null); // объект события или null
  const [toast, setToast]     = React.useState(null);

  const currentYM = ymString(new Date());

  // Список месяцев — выводится из самих событий
  const months = React.useMemo(() => {
    const set = new Set(events.map(e => e.month));
    return [...set].sort().map(m => ({
      id: m,
      label: monthIdToLabel(m),
      count: events.filter(e => e.month === m).length,
      isPast: m < currentYM,
    }));
  }, [events, currentYM]);

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
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => setToast(null), 2400);
  }

  function newEvent() {
    setEditing({
      id: 'new',
      month: months[0] ? months[0].id : currentYM,
      monthLabel: months[0] ? months[0].label : monthIdToLabel(currentYM),
      category: 'flagship', format: 'offline',
      title: '', dates: '', time: '', duration: '',
      trainer: '', location: '',
      price: '', priceNote: '',
      capacity: '', capacityTotal: '',
      status: 'draft',
    });
  }

  function saveEvent(data) {
    if (!data.title.trim()) { showToast('Укажите название программы'); return; }
    if (!data.dates.trim()) { showToast('Укажите даты'); return; }

    const normalized = {
      ...data,
      monthLabel: monthIdToLabel(data.month),
      capacity:      data.capacity      === '' ? null : Number(data.capacity),
      capacityTotal: data.capacityTotal === '' ? null : Number(data.capacityTotal),
    };

    if (data.id === 'new') {
      normalized.id = 'evt-' + Date.now();
      setEvents(prev => [...prev, normalized]);
      showToast('Событие добавлено');
    } else {
      setEvents(prev => prev.map(e => e.id === data.id ? normalized : e));
      showToast('Изменения сохранены');
    }
    setEditing(null);
  }

  function deleteEvent(id) {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    if (!window.confirm(`Удалить событие\n«${ev.title}» (${ev.dates})?`)) return;
    setEvents(prev => prev.filter(e => e.id !== id));
    showToast('Событие удалено');
  }

  function deleteMonth(monthId) {
    const list = events.filter(e => e.month === monthId);
    if (!window.confirm(`Удалить ${list.length} ${pluralRu(list.length, 'событие', 'события', 'событий')} в месяце «${monthIdToLabel(monthId)}»?`)) return;
    setEvents(prev => prev.filter(e => e.month !== monthId));
    if (fMonth === monthId) setFMonth('all');
    showToast('Месяц очищен');
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
    // Создаём черновое событие в новом месяце, чтобы он появился в списке
    setEditing({
      id: 'new',
      month: nextId,
      monthLabel: monthIdToLabel(nextId),
      category: 'flagship', format: 'offline',
      title: '', dates: '', time: '', duration: '',
      trainer: '', location: '',
      price: '', priceNote: '',
      capacity: '', capacityTotal: '',
      status: 'draft',
    });
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
        {filtered.length === 0 ? (
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
                  {list.map(ev => {
                    const cat = categoryMeta(ev.category);
                    const st  = statusMeta(ev.status);
                    return (
                      <tr key={ev.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span className={`om-tag-mini ${cat.tagClass}`}>{cat.label}</span>
                          </div>
                          <div className="om-adm-cell-title">{ev.title || <span style={{ color: 'var(--om-faint)' }}>(без названия)</span>}</div>
                        </td>
                        <td>
                          <div>{ev.dates}</div>
                          <div className="om-adm-cell-meta">{ev.time}{ev.duration ? ` · ${ev.duration}` : ''}</div>
                        </td>
                        <td>
                          <div>{ev.trainer || <span style={{ color: 'var(--om-faint)' }}>—</span>}</div>
                          <div className="om-adm-cell-meta">
                            {ev.format === 'online' ? 'Онлайн' : `Офлайн${ev.location ? ', ' + ev.location : ''}`}
                          </div>
                        </td>
                        <td>
                          {ev.capacityTotal
                            ? <span className="om-adm-cell-mono">{ev.capacityTotal - ev.capacity} / {ev.capacityTotal}</span>
                            : <span style={{ color: 'var(--om-faint)' }}>—</span>}
                        </td>
                        <td className="om-adm-cell-mono" style={{ textAlign: 'right' }}>
                          {ev.price ? ev.price + ' ₸' : <span style={{ color: 'var(--om-faint)' }}>—</span>}
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                            <span style={{
                              width: 7, height: 7, borderRadius: '50%', background: st.dot,
                            }}></span>
                            {st.label}
                          </span>
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
