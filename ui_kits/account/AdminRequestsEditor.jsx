// AdminRequestsEditor.jsx — заявки на запись и обратные звонки (admin)
// Хранение: localStorage('omtime.requests.v1'). Просмотр, смена статуса,
// добавление вручную, удаление. Таблица — общие классы om-adm-table*.
// Стили — общая дизайн-система кабинета. Обёрнут в IIFE.

(function () {
  const { useState, useEffect } = React;
  const LucideIcon = window.LucideIcon;

  const REQ_KEY = 'omtime.requests.v1'; // кэш для аналитики / fallback без сервера
  const API = '/api/requests';
  // Заголовки берём из omAuth — работает и для админа (x-admin-token),
  // и для продажника (x-seller-token). Сервер (requireStaff) выберет роль.
  const auth = () => window.omAuth;
  function apiWrite(method, body, query) {
    return fetch(API + (query || ''), {
      method,
      headers: auth().headers({ 'Content-Type': 'application/json' }),
      body: body ? JSON.stringify(body) : undefined,
    }).then(r => r.json()).catch(() => null);
  }
  // Доп. эндпоинты CRM (лента активности, сделки) — те же ролевые заголовки.
  function apiCall(url, method, body) {
    return fetch(url, {
      method: method || 'GET',
      headers: auth().headers({ 'Content-Type': 'application/json' }),
      body: body ? JSON.stringify(body) : undefined,
    }).then(r => r.json()).catch(() => null);
  }
  // Лид сохранён в БД (числовой id) — только тогда доступны лента и закрытие сделки.
  const isPersisted = (id) => /^\d+$/.test(String(id));

  // Типы записей в истории работы с лидом (синхронно с api/activities.js).
  const ACT_TYPES = [
    { id: 'call',     label: 'Звонок',   icon: 'phone-call' },
    { id: 'whatsapp', label: 'WhatsApp', icon: 'message-circle' },
    { id: 'meeting',  label: 'Встреча',  icon: 'users' },
    { id: 'note',     label: 'Заметка',  icon: 'sticky-note' },
    { id: 'status',   label: 'Статус',   icon: 'flag' },
  ];
  const actType = (id) => ACT_TYPES.find(t => t.id === id) || ACT_TYPES[3];

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
  const fmtDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };
  const fmtMoney = (n) => (Number(n) || 0).toLocaleString('ru-RU') + ' ₸';

  // Программы → дефолтная сумма сделки (₸). Подставляется в форму закрытия.
  const PROGRAM_PRICE = {
    'flagship-offline': 350000, 'flagship-online': 250000,
    club: 60000, teen: 180000, detox: 90000, consult: 0,
  };

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
    // Перезагрузка списка с сервера (источник правды). Вызывается при монтировании
    // и после закрытия карточки — чтобы свежие записи истории/назначения попали в список.
    const reload = React.useCallback(() => {
      return fetch(API, { headers: auth().headers() })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(j => { if (j && j.ok && Array.isArray(j.data)) setItems(j.data); })
        .catch(() => {}); // нет сервера → остаёмся на кэше / DEFAULT
    }, []);
    useEffect(() => { reload(); }, [reload]);
    // Кэш в localStorage — отсюда же аналитика берёт число новых заявок.
    useEffect(() => {
      try { localStorage.setItem(REQ_KEY, JSON.stringify(items)); } catch (e) {}
    }, [items]);
    return [items, setItems, reload];
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
    const isAdmin = auth().isAdmin();
    const myId = auth().sellerId();
    const [items, setItems, reload] = useRequests();
    const closeModal = () => { setEditing(null); reload(); };
    const [sellers, setSellers] = useState([]);   // для назначения (только админ)
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [editing, setEditing] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
      setToast(msg);
      setTimeout(() => setToast(null), 2200);
    };

    // Список продажников нужен админу: фильтр и назначение ответственного.
    useEffect(() => {
      if (!isAdmin) return;
      apiCall('/api/sellers', 'GET').then(j => {
        if (j && j.ok && Array.isArray(j.data)) setSellers(j.data);
      });
    }, [isAdmin]);

    // Назначить/снять ответственного. Админ — любого; продажник — взять на себя.
    const handleAssign = (id, sellerId) => {
      const cur = items.find(i => i.id === id);
      if (!cur) return;
      const sName = sellerId
        ? (sellerId === myId ? auth().sellerName() : ((sellers.find(s => s.id === sellerId) || {}).name || ''))
        : '';
      const updated = { ...cur, assignedSellerId: sellerId || '', sellerName: sName };
      setItems(items.map(i => (i.id === id ? updated : i)));
      apiWrite('PUT', updated).then(j => {
        if (j && j.ok && j.data) setItems(c => c.map(i => (i.id === id ? j.data : i)));
      });
      showToast(sellerId ? 'Лид назначен' : 'Назначение снято');
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
        // Назначение продажника живёт в карточке (AssignControl) и могло
        // измениться уже после открытия формы — берём его из актуального item,
        // а не из формы, чтобы сохранение не затёрло свежее назначение.
        const live = items.find(i => i.id === editing) || {};
        const updated = {
          ...live, ...data, id: editing,
          assignedSellerId: live.assignedSellerId || '',
          sellerName: live.sellerName || '',
        };
        setItems(items.map(i => (i.id === editing ? updated : i)));
        apiWrite('PUT', updated);
        showToast('Изменения сохранены');
      }
      setEditing(null);
      reload();   // подтянуть свежие записи истории/назначения в список
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
                      <span className="om-req-meta-item" style={{ color: r.sellerName ? 'var(--om-indigo)' : 'var(--om-faint)' }}>
                        <LucideIcon name={r.sellerName ? 'user-round-check' : 'user-round'} size={14} />
                        {r.sellerName || 'свободный'}
                      </span>
                    </div>

                    {note && (
                      <div className="om-req-note">
                        <LucideIcon name="message-square" size={14} />
                        <span>{note}</span>
                      </div>
                    )}

                    {r.lastActivityText && (
                      <div className="om-req-note" style={S.lastAct} title="Последняя запись истории работы">
                        <LucideIcon name={actType(r.lastActivityType).icon} size={14} />
                        <span style={S.lastActText}>{r.lastActivityText}</span>
                        <span style={S.lastActMeta}>
                          {fmtDateTime(r.lastActivityAt)}
                          {r.activityCount > 1 ? ' · ' + r.activityCount + ' кас.' : ''}
                        </span>
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
            isAdmin={isAdmin}
            sellers={sellers}
            currentSellerId={myId}
            onClose={closeModal}
            onSave={handleSave}
            onDelete={handleDelete}
            onAssign={handleAssign}
            showToast={showToast}
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

  function RequestModal({ item, isNew, isAdmin, sellers, currentSellerId, onClose, onSave, onDelete, onAssign, showToast }) {
    const [form, setForm] = useState(item);
    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
    const valid = form.name.trim().length > 0;
    const submit = () => { if (valid) onSave(form); };
    const persisted = !isNew && isPersisted(item.id);

    return (
      <div className="om-modal-backdrop" onClick={onClose}>
        <div className="om-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
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

            {!isNew && (
              <AssignControl
                item={item} isAdmin={isAdmin} sellers={sellers}
                currentSellerId={currentSellerId} onAssign={onAssign}
              />
            )}

            {persisted ? (
              <React.Fragment>
                <CloseDealForm form={form} onSave={onSave} showToast={showToast} />
                <ActivityLog requestId={item.id} showToast={showToast} />
              </React.Fragment>
            ) : !isNew && (
              <p style={S.sectionHint}>
                История работы и закрытие сделки станут доступны после синхронизации заявки с сервером.
              </p>
            )}
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

  // ── Назначение ответственного продажника ──────────────────
  function AssignControl({ item, isAdmin, sellers, currentSellerId, onAssign }) {
    const assigned = item.assignedSellerId || '';
    if (isAdmin) {
      return (
        <div style={S.section}>
          <div style={S.sectionLabel}>
            <LucideIcon name="user-round-cog" size={15} /> Ответственный продажник
          </div>
          <select className="om-form-select" value={assigned} onChange={e => onAssign(item.id, e.target.value)}>
            <option value="">— свободный лид —</option>
            {sellers.map(s => (
              <option key={s.id} value={s.id}>{s.name}{s.active ? '' : ' (отключён)'}</option>
            ))}
          </select>
        </div>
      );
    }
    // Продажник
    const mine = assigned && assigned === currentSellerId;
    return (
      <div style={S.section}>
        <div style={S.sectionLabel}><LucideIcon name="user-round" size={15} /> Ведение лида</div>
        {mine ? (
          <div style={S.okNote}><LucideIcon name="check" size={15} /> Вы ведёте этот лид</div>
        ) : assigned ? (
          <div style={S.mutedNote}><LucideIcon name="lock" size={15} /> Лид уже ведёт другой продажник</div>
        ) : (
          <button className="om-btn om-btn--secondary" onClick={() => onAssign(item.id, currentSellerId)}>
            <LucideIcon name="hand" size={15} style={{ marginRight: 6 }} /> Взять в работу
          </button>
        )}
      </div>
    );
  }

  // ── Закрытие сделки прямо из лида ──────────────────────────
  function CloseDealForm({ form, onSave, showToast }) {
    const [open, setOpen] = useState(false);
    const [programId, setProgramId] = useState(form.programId || 'consult');
    const [amount, setAmount] = useState(String(PROGRAM_PRICE[form.programId] || ''));
    const [busy, setBusy] = useState(false);

    const submit = () => {
      setBusy(true);
      apiCall('/api/deals', 'POST', {
        requestId: form.id,
        clientName: form.name,
        clientPhone: form.phone,
        programId,
        amount: Number(amount) || 0,
        status: 'won',
      }).then(j => {
        setBusy(false);
        if (j && j.ok) {
          showToast('Сделка создана — ' + fmtMoney(amount));
          onSave({ ...form, status: 'done' });  // закрываем лид как завершённый
        } else {
          showToast((j && j.error) || 'Не удалось создать сделку');
        }
      });
    };

    return (
      <div style={S.section}>
        <div style={S.sectionLabel}><LucideIcon name="handshake" size={15} /> Сделка</div>
        {!open ? (
          <button className="om-btn om-btn--secondary" onClick={() => setOpen(true)}>
            <LucideIcon name="badge-check" size={15} style={{ marginRight: 6 }} /> Закрыть сделку
          </button>
        ) : (
          <div style={S.dealBox}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <label className="om-form-field" style={{ flex: '1 1 220px' }}>
                <span className="om-form-label">Программа</span>
                <select className="om-form-select" value={programId}
                  onChange={e => { setProgramId(e.target.value); setAmount(String(PROGRAM_PRICE[e.target.value] || '')); }}>
                  {PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </label>
              <label className="om-form-field" style={{ flex: '1 1 140px' }}>
                <span className="om-form-label">Сумма, ₸</span>
                <input className="om-form-input" type="number" min="0" value={amount}
                  onChange={e => setAmount(e.target.value)} placeholder="0" />
              </label>
            </div>
            <p style={S.sectionHint}>Заявка будет отмечена завершённой, а сделка попадёт в раздел «Сделки».</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="om-btn om-btn--secondary" onClick={() => setOpen(false)}>Отмена</button>
              <button className="om-btn om-btn--primary" disabled={busy}
                style={{ opacity: busy ? 0.6 : 1 }} onClick={submit}>
                {busy ? 'Сохранение…' : 'Подтвердить сделку'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── История работы с лидом (лента активности) ──────────────
  function ActivityLog({ requestId, showToast }) {
    const [items, setItems] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [type, setType] = useState('call');
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
      let alive = true;
      apiCall('/api/activities?requestId=' + encodeURIComponent(requestId)).then(j => {
        if (!alive) return;
        if (j && j.ok && Array.isArray(j.data)) setItems(j.data);
        setLoaded(true);
      });
      return () => { alive = false; };
    }, [requestId]);

    const add = () => {
      if (!text.trim() || busy) return;
      setBusy(true);
      apiCall('/api/activities', 'POST', { requestId, type, text: text.trim() }).then(j => {
        setBusy(false);
        if (j && j.ok && j.data) { setItems(cur => [...cur, j.data]); setText(''); }
        else showToast((j && j.error) || 'Не удалось добавить запись');
      });
    };

    return (
      <div style={S.section}>
        <div style={S.sectionLabel}><LucideIcon name="history" size={15} /> История работы</div>

        <div style={S.actComposer}>
          <select className="om-form-select" value={type} onChange={e => setType(e.target.value)}
            style={{ flex: '0 0 140px' }}>
            {ACT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <input className="om-form-input" type="text" value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') add(); }}
            placeholder="Что произошло? (например: дозвонился, ждёт счёт)" style={{ flex: 1 }} />
          <button className="om-btn om-btn--primary" onClick={add} disabled={!text.trim() || busy}
            style={{ opacity: (!text.trim() || busy) ? 0.5 : 1 }}>
            <LucideIcon name="send" size={15} />
          </button>
        </div>

        {loaded && items.length === 0 ? (
          <p style={S.sectionHint}>Записей пока нет. Отметьте первый контакт с клиентом.</p>
        ) : (
          <ul style={S.timeline}>
            {items.slice().reverse().map(a => {
              const t = actType(a.type);
              return (
                <li key={a.id} style={S.actItem}>
                  <span style={S.actIcon}><LucideIcon name={t.icon} size={14} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={S.actText}>{a.text}</div>
                    <div style={S.actMeta}>
                      {t.label}
                      {a.sellerName ? ' · ' + a.sellerName : ''}
                      {a.createdAt ? ' · ' + fmtDateTime(a.createdAt) : ''}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
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
    section: {
      marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--om-hairline)',
    },
    sectionLabel: {
      display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10,
      fontSize: 13, fontWeight: 600, color: 'var(--om-ink)',
    },
    sectionHint: { margin: '8px 0 0', fontSize: 12, color: 'var(--om-muted)', lineHeight: 1.5 },
    okNote: {
      display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13,
      color: 'var(--om-sage-deep)', fontWeight: 500,
    },
    mutedNote: {
      display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--om-muted)',
    },
    dealBox: {
      display: 'flex', flexDirection: 'column', gap: 10,
      padding: 14, borderRadius: 'var(--om-radius-md, 12px)', background: 'var(--om-canvas)',
    },
    actComposer: { display: 'flex', gap: 8, alignItems: 'stretch', marginBottom: 12 },
    timeline: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 },
    actItem: { display: 'flex', gap: 10, alignItems: 'flex-start' },
    actIcon: {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      width: 28, height: 28, borderRadius: '50%',
      background: 'var(--om-lilac)', color: 'var(--om-indigo-deep)',
    },
    actText: { fontSize: 13.5, color: 'var(--om-ink)', lineHeight: 1.45, wordBreak: 'break-word' },
    actMeta: { marginTop: 2, fontSize: 11.5, color: 'var(--om-faint)' },
    // Строка последней активности на карточке списка
    lastAct: { background: 'var(--om-lilac, #efeafc)', alignItems: 'center' },
    lastActText: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    lastActMeta: { flexShrink: 0, marginLeft: 'auto', paddingLeft: 8, fontSize: 11.5, color: 'var(--om-muted)', whiteSpace: 'nowrap' },
  };

  window.AdminRequestsEditor = AdminRequestsEditor;
})();
