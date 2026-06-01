// AdminRequestsEditor.jsx — заявки на запись и обратные звонки (admin)
// Хранение: localStorage('omtime.requests.v1'). Просмотр, смена статуса,
// добавление вручную, удаление. Таблица — общие классы om-adm-table*.
// Стили — общая дизайн-система кабинета. Обёрнут в IIFE.

(function () {
  const { useState, useEffect } = React;
  const LucideIcon = window.LucideIcon;

  const REQ_KEY = 'omtime.requests.v1'; // кэш для аналитики / fallback без сервера
  const API = '/api/requests';
  const adminToken = () => { try { return sessionStorage.getItem('omtime.admin.token') || ''; } catch (e) { return ''; } };
  function apiWrite(method, body, query) {
    return fetch(API + (query || ''), {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
      body: body ? JSON.stringify(body) : undefined,
    }).then(r => r.json()).catch(() => null);
  }

  // Программы синхронны с публичной booking.html (BOOKING_PROGRAMS).
  const PROGRAMS = [
    { id: 'flagship-offline', title: 'Вес идеальности' },
    { id: 'flagship-online',  title: 'Вес идеальности ONLINE' },
    { id: 'club',             title: 'Клубный день' },
    { id: 'teen',             title: 'Подростковый клуб' },
    { id: 'detox',            title: 'ONLINE DETOX' },
    { id: 'consult',          title: 'Первая консультация' },
  ];

  // tone === '' → нейтральный бейдж (om-tag-mini не покрывает серый).
  const STATUSES = [
    { id: 'new',       label: 'Новая',     tone: 'coral' },
    { id: 'contacted', label: 'Связались', tone: 'gold'  },
    { id: 'scheduled', label: 'Записан',   tone: 'lilac' },
    { id: 'done',      label: 'Завершена', tone: 'sage'  },
    { id: 'declined',  label: 'Отказ',     tone: ''      },
  ];

  const CHANNELS = [
    { id: 'form', label: 'Форма на сайте', icon: 'globe' },
    { id: 'call', label: 'Обратный звонок', icon: 'phone-call' },
  ];

  const programTitle = (id) => (PROGRAMS.find(p => p.id === id) || {}).title || '—';
  const statusInfo = (id) => STATUSES.find(s => s.id === id) || STATUSES[0];
  const channelInfo = (id) => CHANNELS.find(c => c.id === id) || CHANNELS[0];

  // Категория программы → цвет акцента карточки (см. .om-req-card[data-cat] в account.css).
  const PROGRAM_CAT = {
    'flagship-offline': 'flagship', 'flagship-online': 'flagship',
    club: 'club', teen: 'teen', detox: 'detox', consult: 'consult',
  };
  const programCat = (id) => PROGRAM_CAT[id] || 'consult';
  const initials = (name) => {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '—';
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  };

  const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const todayISO = () => new Date().toISOString().slice(0, 10);

  const DEFAULT_REQUESTS = [
    { id: 'r1', name: 'Айгерим Сапарова', phone: '+7 701 234 56 78', programId: 'flagship-offline', channel: 'form', createdAt: '2025-10-28', status: 'new', note: 'Спрашивает про рассрочку.' },
    { id: 'r2', name: 'Дмитрий Ким', phone: '+7 705 998 11 02', programId: 'consult', channel: 'call', createdAt: '2025-10-27', status: 'contacted', note: 'Перезвонить после 18:00.' },
    { id: 'r3', name: 'Мария Войтенко', phone: '+7 700 145 67 33', programId: 'flagship-online', channel: 'form', createdAt: '2025-10-26', status: 'scheduled', note: 'Записана на эфир 19 ноября.' },
    { id: 'r4', name: 'Светлана Ли', phone: '+7 708 312 90 45', programId: 'teen', channel: 'form', createdAt: '2025-10-24', status: 'done', note: 'Записан ребёнок, 14 лет.' },
    { id: 'r5', name: 'Нурлан Абенов', phone: '+7 747 600 21 19', programId: 'detox', channel: 'call', createdAt: '2025-10-22', status: 'declined', note: 'Не подошли даты старта.' },
  ];

  function useRequests() {
    const [items, setItems] = useState(() => {
      try {
        const raw = localStorage.getItem(REQ_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return DEFAULT_REQUESTS;
    });
    // Загрузка с сервера (источник правды). Пустой ответ — реальное «заявок нет».
    useEffect(() => {
      let alive = true;
      fetch(API, { headers: { 'x-admin-token': adminToken() } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(j => { if (alive && j && j.ok && Array.isArray(j.data)) setItems(j.data); })
        .catch(() => {}); // нет сервера → остаёмся на кэше / DEFAULT
      return () => { alive = false; };
    }, []);
    // Кэш в localStorage — отсюда же аналитика берёт число новых заявок.
    useEffect(() => {
      try { localStorage.setItem(REQ_KEY, JSON.stringify(items)); } catch (e) {}
    }, [items]);
    return [items, setItems];
  }

  function StatusBadge({ status }) {
    const s = statusInfo(status);
    if (!s.tone) {
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', padding: '3px 9px',
          borderRadius: 'var(--om-radius-pill)', fontSize: 11, fontWeight: 500,
          color: 'var(--om-muted)', background: 'var(--om-canvas-strong)',
        }}>{s.label}</span>
      );
    }
    return <span className={'om-tag-mini om-tag-mini--' + s.tone}>{s.label}</span>;
  }

  function AdminRequestsEditor() {
    const [items, setItems] = useRequests();
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [editing, setEditing] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
      setToast(msg);
      setTimeout(() => setToast(null), 2200);
    };

    const blank = {
      name: '', phone: '', programId: 'consult', channel: 'form',
      createdAt: todayISO(), status: 'new', note: '',
    };
    const editingItem = editing === 'new' ? blank : items.find(i => i.id === editing);

    const newCount = items.filter(i => i.status === 'new').length;

    const filtered = items
      .filter(r => {
        if (filter !== 'all' && r.status !== filter) return false;
        if (query.trim()) {
          const q = query.trim().toLowerCase();
          if (!r.name.toLowerCase().includes(q) && !r.phone.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    const handleSave = (data) => {
      if (editing === 'new') {
        const tmp = { ...data, id: 'r' + Date.now() };
        setItems([tmp, ...items]);
        apiWrite('POST', data).then(j => {
          if (j && j.ok && j.data) setItems(cur => cur.map(i => (i.id === tmp.id ? j.data : i)));
        });
        showToast('Заявка добавлена');
      } else {
        const updated = { ...items.find(i => i.id === editing), ...data, id: editing };
        setItems(items.map(i => (i.id === editing ? updated : i)));
        apiWrite('PUT', updated);
        showToast('Изменения сохранены');
      }
      setEditing(null);
    };

    const handleDelete = (id) => {
      setItems(items.filter(i => i.id !== id));
      apiWrite('DELETE', null, '?id=' + encodeURIComponent(id));
      setEditing(null);
      showToast('Заявка удалена');
    };

    return (
      <React.Fragment>
        <div className="om-acc-head">
          <div>
            <div className="om-acc-eyebrow">Управление</div>
            <h1 className="om-acc-title">Заявки</h1>
            <p className="om-acc-sub">
              Заявки на запись и обратные звонки с сайта.
              {newCount > 0 && ` Новых: ${newCount}.`}
            </p>
          </div>
          <button className="om-btn om-btn--primary" onClick={() => setEditing('new')}>
            <LucideIcon name="plus" size={18} style={{ marginRight: 8 }} />
            Добавить заявку
          </button>
        </div>

        <div className="om-adm-toolbar">
          <div className="om-adm-search">
            <LucideIcon name="search" size={16} style={{ color: 'var(--om-faint)' }} />
            <input
              type="text"
              placeholder="Поиск по имени или телефону"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <select className="om-adm-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">Все статусы</option>
            {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="om-adm-table-wrap">
            <div className="om-adm-empty">
              <LucideIcon name="inbox" size={36} style={{ marginBottom: 12, opacity: 0.45 }} />
              <div style={{ fontSize: 15, color: 'var(--om-ink)', fontWeight: 500, marginBottom: 4 }}>
                {items.length === 0 ? 'Заявок пока нет' : 'Ничего не найдено'}
              </div>
              <div style={{ fontSize: 13 }}>
                {items.length === 0 ? 'Новые заявки с сайта появятся здесь.' : 'Измените поиск или фильтр статуса.'}
              </div>
            </div>
          </div>
        ) : (
          <div className="om-req-list">
            {filtered.map((r, i) => {
              const ch = channelInfo(r.channel);
              const note = (r.note || '').trim();
              return (
                <article
                  key={r.id}
                  className="om-req-card"
                  data-cat={programCat(r.programId)}
                  style={{ animationDelay: (i * 55) + 'ms' }}
                  onClick={() => setEditing(r.id)}
                  title="Открыть заявку"
                >
                  <div className="om-req-avatar" aria-hidden="true">{initials(r.name)}</div>

                  <div className="om-req-main">
                    <div className="om-req-headline">
                      <span className="om-req-name">{r.name}</span>
                      <span className="om-req-phone">{r.phone}</span>
                    </div>

                    <div className="om-req-meta">
                      <span className="om-req-program">{programTitle(r.programId)}</span>
                      <span className="om-req-meta-item">
                        <LucideIcon name={ch.icon} size={14} />
                        {ch.label}
                      </span>
                      <span className="om-req-meta-item">
                        <LucideIcon name="calendar" size={14} />
                        {fmtDate(r.createdAt)}
                      </span>
                    </div>

                    {note && (
                      <div className="om-req-note">
                        <LucideIcon name="message-square" size={14} />
                        <span>{note}</span>
                      </div>
                    )}
                  </div>

                  <div className="om-req-aside" onClick={e => e.stopPropagation()}>
                    <StatusBadge status={r.status} />
                    <div className="om-req-actions">
                      <button className="om-adm-icon-btn" title="Открыть" onClick={() => setEditing(r.id)}>
                        <LucideIcon name="pencil" size={16} />
                      </button>
                      <button
                        className="om-adm-icon-btn" data-danger="true" title="Удалить"
                        onClick={() => handleDelete(r.id)}
                      >
                        <LucideIcon name="trash-2" size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {editingItem && (
          <RequestModal
            key={editing}
            item={editingItem}
            isNew={editing === 'new'}
            onClose={() => setEditing(null)}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        )}

        {toast && (
          <div className="om-toast">
            <LucideIcon name="check" size={16} />
            {toast}
          </div>
        )}
      </React.Fragment>
    );
  }

  function RequestModal({ item, isNew, onClose, onSave, onDelete }) {
    const [form, setForm] = useState(item);
    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
    const valid = form.name.trim().length > 0;
    const submit = () => { if (valid) onSave(form); };

    return (
      <div className="om-modal-backdrop" onClick={onClose}>
        <div className="om-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
          <div className="om-modal-head">
            <h2 className="om-modal-title">{isNew ? 'Новая заявка' : 'Заявка'}</h2>
            <button className="om-modal-close" onClick={onClose}>
              <LucideIcon name="x" size={18} />
            </button>
          </div>

          <div className="om-modal-body">
            <div className="om-form-grid">
              <label className="om-form-field">
                <span className="om-form-label">Имя</span>
                <input className="om-form-input" type="text" value={form.name}
                  onChange={e => set('name', e.target.value)} placeholder="Имя клиента" />
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Телефон</span>
                <input className="om-form-input" type="text" value={form.phone}
                  onChange={e => set('phone', e.target.value)} placeholder="+7 ___ ___ __ __" />
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Программа</span>
                <select className="om-form-select" value={form.programId} onChange={e => set('programId', e.target.value)}>
                  {PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Канал</span>
                <select className="om-form-select" value={form.channel} onChange={e => set('channel', e.target.value)}>
                  {CHANNELS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Дата заявки</span>
                <input className="om-form-input" type="date" value={form.createdAt}
                  onChange={e => set('createdAt', e.target.value)} />
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Статус</span>
                <select className="om-form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </label>

              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Комментарий</span>
                <textarea className="om-form-textarea" value={form.note}
                  onChange={e => set('note', e.target.value)} placeholder="Заметки по заявке" />
              </label>
            </div>
          </div>

          <div className="om-modal-foot">
            {!isNew && (
              <button style={S.deleteBtn} onClick={() => onDelete(form.id)}>
                <LucideIcon name="trash-2" size={15} style={{ marginRight: 6 }} />
                Удалить
              </button>
            )}
            <button className="om-btn om-btn--secondary" onClick={onClose}>Отмена</button>
            <button
              className="om-btn om-btn--primary"
              disabled={!valid}
              style={{ opacity: valid ? 1 : 0.5, pointerEvents: valid ? 'auto' : 'none' }}
              onClick={submit}
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    );
  }

  const S = {
    deleteBtn: {
      marginRight: 'auto',
      display: 'inline-flex', alignItems: 'center',
      padding: '12px 16px', border: 'none', borderRadius: 'var(--om-radius-pill)',
      background: 'transparent', color: 'var(--om-danger)',
      fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
    },
  };

  window.AdminRequestsEditor = AdminRequestsEditor;
})();
