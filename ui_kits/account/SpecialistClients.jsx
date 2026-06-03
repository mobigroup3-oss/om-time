// SpecialistClients.jsx — раздел «Мои клиенты» (роль specialist).
// Специалист (участник «Команды» с кодом входа) видит только прикреплённых к нему
// клиентов: открывает карточку, смотрит персональные данные (только чтение),
// будущие таблицы/графики (пока заглушка) и ведёт ленту комментариев.
// Источник: /api/clients (сервер сам фильтрует по specialist_id) и
// /api/client-activities. Лента вынесена в window.ClientActivityThread —
// её переиспользует кабинет клиента (ClientCabinet.jsx).

(function () {
  const { useState, useEffect, useRef } = React;
  const LucideIcon = window.LucideIcon;
  const auth = () => window.omAuth;

  const PROGRAMS = {
    'flagship-offline': 'Вес идеальности',
    'flagship-online':  'Вес идеальности ONLINE',
    'club':             'Клубный день',
    'teen':             'Подростковый клуб',
    'detox':            'ONLINE DETOX',
    'consult':          'Первая консультация',
  };
  const programTitle = (id) => PROGRAMS[id] || '—';
  const PROGRAM_LIST = Object.keys(PROGRAMS).map(id => ({ id, title: PROGRAMS[id] }));

  // Дата потока: YYYY-MM-DD → «15 июня 2026» (без сюрпризов часовых поясов).
  const fmtGroupDate = (s) => {
    if (!s) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return s;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (isNaN(d)) return s;
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  // Заголовок папки: своё название, иначе «Программа · дата».
  const groupLabel = (g) => {
    if (g.title) return g.title;
    const parts = [];
    if (g.programId) parts.push(programTitle(g.programId));
    if (g.date) parts.push(fmtGroupDate(g.date));
    return parts.join(' · ') || 'Папка без названия';
  };

  const initials = (name) => {
    const p = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return '—';
    return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
  };
  // Склонение: 1 клиент, 2 клиента, 5 клиентов.
  const clientWord = (n) => {
    const a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return 'клиентов';
    if (b > 1 && b < 5) return 'клиента';
    if (b === 1) return 'клиент';
    return 'клиентов';
  };
  const fmtDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso); if (isNaN(d)) return iso;
    return d.toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };
  const roleLabel = (r) => ({ admin: 'Администратор', specialist: 'Специалист', client: 'Клиент' }[r] || r || '');

  // ── Переиспользуемая лента комментариев вокруг клиента ──
  // Props: { clientId, canDelete } — canDelete доступен только администратору.
  function ClientActivityThread({ clientId, canDelete }) {
    const CK = 'omtime.activities.' + (clientId || 'self');
    const [items, setItems] = useState(() => {
      try { const raw = localStorage.getItem(CK); if (raw) return JSON.parse(raw); } catch (e) {}
      return [];
    });
    const [text, setText] = useState('');
    const [loaded, setLoaded] = useState(false);
    const [busy, setBusy] = useState(false);
    const endRef = useRef(null);
    const scrollPending = useRef(false);   // скроллим к концу ленты только после своей отправки

    // Лента живёт в /api/clients?resource=activities (слита в clients.js ради
    // лимита Serverless-функций Vercel Hobby = 12). params — доп. query-параметры.
    const api = (method, body, params) => {
      const q = new URLSearchParams(Object.assign({ resource: 'activities' }, params || {})).toString();
      return fetch('/api/clients?' + q, {
        method,
        headers: auth().headers({ 'Content-Type': 'application/json' }),
        body: body ? JSON.stringify(body) : undefined,
      }).then(r => r.json()).catch(() => null);
    };

    const load = () => {
      api('GET', null, { clientId }).then(j => {
        if (j && j.ok && Array.isArray(j.data)) setItems(j.data);
        setLoaded(true);
      });
    };
    useEffect(() => { if (clientId) load(); }, [clientId]);
    // Кэш ленты — чтобы сообщения рисовались мгновенно, а не всплывали после запроса.
    useEffect(() => { if (loaded) { try { localStorage.setItem(CK, JSON.stringify(items)); } catch (e) {} } }, [items, loaded]);
    // Авто-скролл к последнему сообщению — ТОЛЬКО после отправки самим пользователем,
    // не при загрузке/обновлении (иначе страница «прыгает» вниз к ленте при открытии).
    useEffect(() => {
      if (scrollPending.current && endRef.current) { scrollPending.current = false; endRef.current.scrollIntoView({ block: 'nearest' }); }
    }, [items.length]);

    const send = () => {
      const t = text.trim();
      if (!t || busy) return;
      setBusy(true);
      api('POST', { clientId, type: 'note', text: t }).then(j => {
        setBusy(false);
        if (j && j.ok && j.data) { scrollPending.current = true; setItems(cur => [...cur, j.data]); setText(''); }
      });
    };
    const remove = (id) => {
      setItems(cur => cur.filter(a => a.id !== id));
      api('DELETE', null, { id });
    };

    const myRole = auth().role();

    return (
      <div style={TH.wrap}>
        <div style={TH.list}>
          {loaded && items.length === 0 && (
            <div style={TH.empty}>Пока нет записей. Оставьте первый комментарий по клиенту.</div>
          )}
          {items.map(a => {
            const mine = a.authorRole === myRole;
            return (
              <div key={a.id} style={{ ...TH.msg, alignItems: mine ? 'flex-end' : 'flex-start' }}>
                <div style={{ ...TH.bubble, ...(mine ? TH.bubbleMine : null) }}>
                  <div style={TH.msgHead}>
                    <span style={{ fontWeight: 600 }}>{a.authorName || roleLabel(a.authorRole)}</span>
                    <span style={TH.msgRole}>{roleLabel(a.authorRole)}</span>
                    <span style={TH.msgTime}>{fmtDateTime(a.createdAt)}</span>
                    {canDelete && (
                      <button style={TH.del} title="Удалить" onClick={() => remove(a.id)}>
                        <LucideIcon name="x" size={12} />
                      </button>
                    )}
                  </div>
                  <div style={TH.msgText}>{a.text}</div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <div style={TH.composer}>
          <textarea className="om-form-textarea" value={text} rows={2}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }}
            placeholder="Комментарий по клиенту… (Ctrl+Enter — отправить)"
            style={{ flex: 1, minHeight: 0 }} />
          <button className="om-btn om-btn--primary" onClick={send} disabled={!text.trim() || busy}
            style={{ opacity: text.trim() && !busy ? 1 : 0.5 }}>
            <LucideIcon name="send" size={16} />
          </button>
        </div>
      </div>
    );
  }
  window.ClientActivityThread = ClientActivityThread;

  // ── Заглушка под таблицы/графики клиента (контент заказчик добавит позже) ──
  function TablesPlaceholder() {
    return (
      <div style={PH.box}>
        <LucideIcon name="bar-chart-3" size={30} style={{ marginBottom: 10, opacity: 0.55 }} />
        <div style={{ fontSize: 14, color: 'var(--om-ink)', fontWeight: 500, marginBottom: 4 }}>
          Таблицы и графики
        </div>
        <div style={{ fontSize: 13, color: 'var(--om-muted)', maxWidth: 420 }}>
          Здесь появятся таблицы и графики, которые ведёт клиент в своём кабинете.
          Вы сможете их просматривать и комментировать.
        </div>
      </div>
    );
  }

  function ClientDetail({ client, onBack }) {
    const fields = [
      { label: 'Телефон',  value: client.phone },
      { label: 'Эл. почта', value: client.email },
      { label: 'Город',    value: client.city },
      { label: 'Программа', value: programTitle(client.programId) },
    ].filter(f => f.value);

    return (
      <React.Fragment>
        <div className="om-acc-head" style={DT.head}>
          <div style={{ minWidth: 0 }}>
            <button onClick={onBack} style={DT.back}>
              <LucideIcon name="arrow-left" size={15} style={{ marginRight: 6 }} /> Все клиенты
            </button>
            <h1 className="om-acc-title" style={{ marginTop: 8 }}>{client.name}</h1>
            <p className="om-acc-sub" style={{ marginBottom: 0 }}>График, замеры и дневник клиента — просмотр и комментарии.</p>
          </div>
          {fields.length > 0 && (
            <div style={DT.sideCard}>
              <div style={DT.cardLabel}>Данные клиента</div>
              {fields.map(f => (
                <div key={f.label} style={DT.field}>
                  <div style={DT.fieldLabel}>{f.label}</div>
                  <div style={DT.fieldValue}>{f.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={DT.content}>
          <div style={DT.blockLabel}><LucideIcon name="line-chart" size={15} /> График снижения веса</div>
          {window.WeightChart
            ? <window.WeightChart clientId={client.id} readOnly />
            : <TablesPlaceholder />}
          <div style={{ marginTop: 26 }}>
            <div style={DT.blockLabel}><LucideIcon name="messages-square" size={15} /> Комментарии</div>
            <ClientActivityThread clientId={client.id} canDelete={false} />
          </div>
        </div>
      </React.Fragment>
    );
  }

  // ── Модалка создания/редактирования папки потока ──
  // Props: { group, onClose, onSaved(savedGroup) }
  function GroupModal({ group, onClose, onSaved }) {
    const isEdit = !!group;
    const [form, setForm] = useState({
      title:     group ? (group.title || '')     : '',
      programId: group ? (group.programId || '') : '',
      date:      group ? (group.date || '')      : '',
    });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');

    // Папка осмысленна, если задано хоть что-то: название, программа или дата.
    const valid = !!(form.title.trim() || form.programId || form.date);

    const submit = () => {
      if (!valid || busy) return;
      setBusy(true); setErr('');
      const payload = { title: form.title.trim(), programId: form.programId || null, date: form.date || null };
      const method = isEdit ? 'PUT' : 'POST';
      if (isEdit) payload.id = group.id;
      fetch('/api/clients?resource=groups', {
        method,
        headers: auth().headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      }).then(r => r.json()).then(j => {
        setBusy(false);
        if (j && j.ok && j.data) { onSaved && onSaved(j.data); onClose(); }
        else setErr((j && j.error) || 'Не удалось сохранить');
      }).catch(() => { setBusy(false); setErr('Не удалось сохранить'); });
    };

    return (
      <div className="om-modal-backdrop" onClick={onClose}>
        <div className="om-modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
          <div className="om-modal-head">
            <h2 className="om-modal-title">{isEdit ? 'Папка потока' : 'Новая папка'}</h2>
            <button className="om-modal-close" onClick={onClose}><LucideIcon name="x" size={18} /></button>
          </div>
          <div className="om-modal-body">
            <div className="om-form-grid">
              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Программа</span>
                <select className="om-form-select" value={form.programId} onChange={e => set('programId', e.target.value)}>
                  <option value="">— не выбрана —</option>
                  {PROGRAM_LIST.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </label>
              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Дата потока</span>
                <input className="om-form-input" type="date" value={form.date}
                  onChange={e => set('date', e.target.value)} />
                <span className="om-form-help">Дата начала потока — по ней папки сортируются.</span>
              </label>
              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Название (необязательно)</span>
                <input className="om-form-input" type="text" value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="Напр. «Поток июнь, утренняя группа»" />
                <span className="om-form-help">Если пусто — папка называется «Программа · дата».</span>
              </label>
            </div>
            {err && <p style={{ color: 'var(--om-danger)', fontSize: 13, margin: '10px 0 0' }}>{err}</p>}
          </div>
          <div className="om-modal-foot">
            <button className="om-btn om-btn--secondary" onClick={onClose}>Отмена</button>
            <button className="om-btn om-btn--primary" disabled={!valid || busy}
              style={{ opacity: (valid && !busy) ? 1 : 0.5, pointerEvents: (valid && !busy) ? 'auto' : 'none' }}
              onClick={submit}>
              {isEdit ? 'Сохранить' : 'Создать папку'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Строка клиента в списке (внутри папки или в «Без папки»). Селект справа
  // перемещает клиента между папками, не открывая карточку.
  function ClientRow({ client, groups, onOpen, onMove, onRemove }) {
    return (
      <div style={GR.row} onClick={() => onOpen(client.id)}>
        <span style={DT.avatar}>{initials(client.name)}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 500, color: 'var(--om-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</div>
          <div style={{ fontSize: 12, color: 'var(--om-muted)' }}>{programTitle(client.programId)}</div>
        </div>
        {onRemove ? (
          <button onClick={e => { e.stopPropagation(); onRemove(); }}
            style={GR.rowBtn} title="Убрать из папки">
            <LucideIcon name="folder-minus" size={15} style={{ marginRight: 6 }} /> Убрать
          </button>
        ) : (
          <select
            className="om-form-select" value={client.groupId || ''}
            onClick={e => e.stopPropagation()}
            onChange={e => onMove(client.id, e.target.value)}
            style={GR.moveSel} title="Поместить в папку">
            <option value="">{groups.length ? '↳ выбрать папку' : 'Без папки'}</option>
            {groups.map(g => <option key={g.id} value={g.id}>{groupLabel(g)}</option>)}
          </select>
        )}
        <LucideIcon name="chevron-right" size={18} style={{ color: 'var(--om-faint)', flexShrink: 0 }} />
      </div>
    );
  }

  // ── Пикер: добавить клиентов в папку (множественный выбор галочками) ──
  // Показывает клиентов специалиста, которых ещё нет в этой папке.
  function AddClientsPicker({ group, clients, onAdd, onClose }) {
    const candidates = clients.filter(c => c.groupId !== group.id);
    const [sel, setSel] = useState({});                    // { [clientId]: true }
    const selCount = Object.values(sel).filter(Boolean).length;

    const toggleSel = (id) => setSel(s => ({ ...s, [id]: !s[id] }));
    const allChecked = candidates.length > 0 && candidates.every(c => sel[c.id]);
    const toggleAll = () => {
      if (allChecked) return setSel({});
      const next = {};
      candidates.forEach(c => { next[c.id] = true; });
      setSel(next);
    };

    const submit = () => {
      const ids = candidates.filter(c => sel[c.id]).map(c => c.id);
      if (!ids.length) return;
      onAdd(ids);
      onClose();
    };

    return (
      <div className="om-modal-backdrop" onClick={onClose}>
        <div className="om-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
          <div className="om-modal-head">
            <h2 className="om-modal-title">В папку «{groupLabel(group)}»</h2>
            <button className="om-modal-close" onClick={onClose}><LucideIcon name="x" size={18} /></button>
          </div>
          <div className="om-modal-body" style={{ padding: 0 }}>
            {candidates.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--om-faint)', fontSize: 13 }}>
                Все ваши клиенты уже в этой папке.
              </div>
            ) : (
              <React.Fragment>
                <label style={{ ...GR.pickRow, cursor: 'pointer', background: 'var(--om-canvas-soft, #faf8f3)' }}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll}
                    style={{ width: 17, height: 17, accentColor: 'var(--om-ink)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--om-muted)' }}>Выбрать всех</span>
                </label>
                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                  {candidates.map(c => (
                    <label key={c.id} style={{ ...GR.pickRow, cursor: 'pointer' }}>
                      <input type="checkbox" checked={!!sel[c.id]} onChange={() => toggleSel(c.id)}
                        style={{ width: 17, height: 17, accentColor: 'var(--om-ink)', flexShrink: 0 }} />
                      <span style={DT.avatar}>{initials(c.name)}</span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 500, color: 'var(--om-ink)' }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--om-muted)' }}>
                          {programTitle(c.programId)}{c.groupId ? ' · сейчас в другой папке' : ''}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </React.Fragment>
            )}
          </div>
          <div className="om-modal-foot">
            <button className="om-btn om-btn--secondary" onClick={onClose}>Отмена</button>
            <button className="om-btn om-btn--primary" disabled={selCount === 0}
              style={{ opacity: selCount ? 1 : 0.5, pointerEvents: selCount ? 'auto' : 'none' }}
              onClick={submit}>
              Добавить{selCount ? ' (' + selCount + ')' : ''}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function SpecialistClients() {
    const [items, setItems] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [openId, setOpenId] = useState(null);
    const [groupModal, setGroupModal] = useState(null);   // 'new' | group | null
    const [pickerGroup, setPickerGroup] = useState(null); // папка, в которую добавляем клиентов
    const [collapsed, setCollapsed] = useState({});       // { [groupId]: true } — свёрнутые папки
    const [toast, setToast] = useState(null);

    const toggle = (id) => setCollapsed(c => ({ ...c, [id]: !c[id] }));

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

    useEffect(() => {
      fetch('/api/clients', { headers: auth().headers() })
        .then(r => r.ok ? r.json() : null)
        .then(j => { if (j && j.ok && Array.isArray(j.data)) setItems(j.data); setLoaded(true); })
        .catch(() => setLoaded(true));
      fetch('/api/clients?resource=groups', { headers: auth().headers() })
        .then(r => r.ok ? r.json() : null)
        .then(j => {
          if (j && j.ok && Array.isArray(j.data)) {
            setGroups(j.data);
            // При загрузке все папки свёрнуты. «Без папки» сворачиваем только
            // когда папки есть — иначе единственный список окажется скрыт.
            const init = {};
            j.data.forEach(g => { init[g.id] = true; });
            if (j.data.length) init.__ungrouped = true;
            setCollapsed(init);
          }
        })
        .catch(() => {});
    }, []);

    const move = (clientId, groupId) => {
      setItems(cur => cur.map(c => c.id === clientId ? { ...c, groupId } : c));
      fetch('/api/clients?resource=groups&action=assign', {
        method: 'POST',
        headers: auth().headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ clientId, groupId: groupId || null }),
      }).catch(() => {});
    };

    const onGroupSaved = (g) => {
      setGroups(cur => {
        const exists = cur.some(x => x.id === g.id);
        return exists ? cur.map(x => x.id === g.id ? g : x) : [g, ...cur];
      });
      showToast(groupModal === 'new' ? 'Папка создана' : 'Папка обновлена');
    };

    const deleteGroup = (g) => {
      setGroups(cur => cur.filter(x => x.id !== g.id));
      setItems(cur => cur.map(c => c.groupId === g.id ? { ...c, groupId: '' } : c));
      fetch('/api/clients?resource=groups&id=' + encodeURIComponent(g.id), {
        method: 'DELETE', headers: auth().headers(),
      }).catch(() => {});
      showToast('Папка удалена');
    };

    const open = openId && items.find(c => c.id === openId);
    if (open) return <ClientDetail client={open} onBack={() => setOpenId(null)} />;

    const ungrouped = items.filter(c => !c.groupId);

    return (
      <React.Fragment>
        <div className="om-acc-head">
          <div>
            <div className="om-acc-eyebrow">Работа</div>
            <h1 className="om-acc-title">Мои клиенты</h1>
            <p className="om-acc-sub">Раскладывайте клиентов по папкам потоков (программа + дата), открывайте карточку для данных и комментариев.</p>
          </div>
          {items.length > 0 && (
            <button className="om-btn om-btn--primary" onClick={() => setGroupModal('new')}>
              <LucideIcon name="folder-plus" size={18} style={{ marginRight: 8 }} />
              Создать папку
            </button>
          )}
        </div>

        {loaded && items.length === 0 ? (
          <div className="om-adm-table-wrap">
            <div className="om-adm-empty">
              <LucideIcon name="clipboard-list" size={36} style={{ marginBottom: 12, opacity: 0.45 }} />
              <div style={{ fontSize: 15, color: 'var(--om-ink)', fontWeight: 500, marginBottom: 4 }}>
                К вам пока никто не прикреплён
              </div>
              <div style={{ fontSize: 13 }}>Администратор прикрепит клиентов к вам в разделе «Клиенты».</div>
            </div>
          </div>
        ) : (
          <div style={GR.stack}>
            {groups.map(g => {
              const inGroup = items.filter(c => c.groupId === g.id);
              const isOpen = !collapsed[g.id];
              return (
                <div key={g.id} style={GR.folder}>
                  <div style={GR.folderHead} onClick={() => toggle(g.id)}>
                    <div style={GR.folderTitleWrap}>
                      <LucideIcon name="chevron-right" size={16}
                        style={{ color: 'var(--om-muted)', flexShrink: 0, transition: 'transform 0.18s', transform: isOpen ? 'rotate(90deg)' : 'none' }} />
                      <LucideIcon name={isOpen ? 'folder-open' : 'folder'} size={18} style={{ color: 'var(--om-gold-deep, #b8860b)', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={GR.folderTitle}>{groupLabel(g)}</div>
                        <div style={GR.folderMeta}>
                          {g.programId ? programTitle(g.programId) : 'Без программы'}
                          {g.date ? ' · ' + fmtGroupDate(g.date) : ''}
                          {' · '}{inGroup.length} {clientWord(inGroup.length)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                      <button className="om-adm-icon-btn" title="Изменить папку" onClick={() => setGroupModal(g)}>
                        <LucideIcon name="pencil" size={15} />
                      </button>
                      <button className="om-adm-icon-btn" data-danger="true" title="Удалить папку" onClick={() => deleteGroup(g)}>
                        <LucideIcon name="trash-2" size={15} />
                      </button>
                    </div>
                  </div>
                  {isOpen && (
                    <div>
                      {inGroup.length === 0
                        ? <div style={GR.folderEmpty}>В папке пока нет клиентов.</div>
                        : inGroup.map(c => (
                            <ClientRow key={c.id} client={c} groups={groups} onOpen={setOpenId} onMove={move} onRemove={() => move(c.id, '')} />
                          ))}
                      <button style={GR.addBtn} onClick={() => setPickerGroup(g)}>
                        <LucideIcon name="user-plus" size={15} style={{ marginRight: 7 }} />
                        Добавить клиента в папку
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <div style={GR.folder}>
              <div style={GR.folderHead} onClick={() => toggle('__ungrouped')}>
                <div style={GR.folderTitleWrap}>
                  <LucideIcon name="chevron-right" size={16}
                    style={{ color: 'var(--om-muted)', flexShrink: 0, transition: 'transform 0.18s', transform: !collapsed.__ungrouped ? 'rotate(90deg)' : 'none' }} />
                  <LucideIcon name="users" size={18} style={{ color: 'var(--om-muted)', flexShrink: 0 }} />
                  <div>
                    <div style={GR.folderTitle}>{groups.length ? 'Без папки' : 'Все клиенты'}</div>
                    <div style={GR.folderMeta}>{ungrouped.length} {clientWord(ungrouped.length)}</div>
                  </div>
                </div>
              </div>
              {!collapsed.__ungrouped && (
                <div>
                  {ungrouped.length === 0
                    ? <div style={GR.folderEmpty}>Все клиенты разложены по папкам.</div>
                    : ungrouped.map(c => (
                        <ClientRow key={c.id} client={c} groups={groups} onOpen={setOpenId} onMove={move} />
                      ))}
                </div>
              )}
            </div>
          </div>
        )}

        {groupModal && (
          <GroupModal
            key={groupModal === 'new' ? 'new' : groupModal.id}
            group={groupModal === 'new' ? null : groupModal}
            onClose={() => setGroupModal(null)}
            onSaved={onGroupSaved}
          />
        )}

        {pickerGroup && (
          <AddClientsPicker
            group={pickerGroup}
            clients={items}
            onAdd={(ids) => ids.forEach(id => move(id, pickerGroup.id))}
            onClose={() => setPickerGroup(null)}
          />
        )}

        {toast && <div className="om-toast"><LucideIcon name="check" size={16} />{toast}</div>}
      </React.Fragment>
    );
  }

  const TH = {
    wrap: { border: '1px solid var(--om-hairline)', borderRadius: 'var(--om-radius-lg, 16px)', background: 'var(--om-canvas-white)', overflow: 'hidden' },
    list: { padding: 16, maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 },
    empty: { fontSize: 13, color: 'var(--om-faint)', textAlign: 'center', padding: '24px 0' },
    msg: { display: 'flex', flexDirection: 'column' },
    bubble: { maxWidth: '82%', background: 'var(--om-canvas-strong, #efe9dd)', borderRadius: 12, padding: '8px 12px' },
    bubbleMine: { background: 'var(--om-lilac, #e7e0f5)' },
    msgHead: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: 'var(--om-muted)', marginBottom: 3 },
    msgRole: { fontSize: 10.5, color: 'var(--om-faint)', textTransform: 'lowercase' },
    msgTime: { fontSize: 10.5, color: 'var(--om-faint)', marginLeft: 'auto' },
    del: { border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--om-faint)', padding: 0, display: 'inline-flex' },
    msgText: { fontSize: 13.5, color: 'var(--om-ink)', whiteSpace: 'pre-wrap', lineHeight: 1.45 },
    composer: { display: 'flex', gap: 8, alignItems: 'flex-end', padding: 12, borderTop: '1px solid var(--om-hairline)' },
  };
  const PH = {
    box: {
      background: 'var(--om-canvas-white)', border: '1px dashed var(--om-hairline)',
      borderRadius: 'var(--om-radius-lg, 16px)', padding: '40px 28px',
      textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
    },
  };
  const GR = {
    stack: { display: 'flex', flexDirection: 'column', gap: 16 },
    folder: { background: 'var(--om-canvas-white)', border: '1px solid var(--om-hairline)', borderRadius: 'var(--om-radius-lg, 16px)', overflow: 'hidden' },
    folderHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--om-hairline-soft, #eee)', background: 'var(--om-canvas-soft, #faf8f3)', cursor: 'pointer' },
    folderTitleWrap: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
    folderTitle: { fontSize: 14.5, fontWeight: 600, color: 'var(--om-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    folderMeta: { fontSize: 12, color: 'var(--om-muted)', marginTop: 1 },
    folderEmpty: { fontSize: 13, color: 'var(--om-faint)', padding: '16px' },
    row: { display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: '1px solid var(--om-hairline-soft, #f0ece4)', cursor: 'pointer' },
    moveSel: { flexShrink: 0, maxWidth: 200, fontSize: 12.5, padding: '5px 8px', height: 'auto' },
    rowBtn: { flexShrink: 0, fontSize: 12.5, padding: '5px 10px', display: 'inline-flex', alignItems: 'center', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--om-muted)', background: 'var(--om-canvas-strong, #efe9dd)', border: '1px solid var(--om-hairline)', borderRadius: 'var(--om-radius-pill, 999px)' },
    addBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '11px 16px', border: 'none', borderTop: '1px dashed var(--om-hairline)', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, color: 'var(--om-indigo-deep, #3a2f6b)' },
    pickRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderBottom: '1px solid var(--om-hairline-soft, #f0ece4)', cursor: 'pointer' },
    pickAdd: { display: 'inline-flex', alignItems: 'center', flexShrink: 0, fontSize: 12.5, fontWeight: 500, color: 'var(--om-indigo-deep, #3a2f6b)' },
  };
  const DT = {
    back: { display: 'inline-flex', alignItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, color: 'var(--om-muted)', padding: 0 },
    head: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' },
    content: { maxWidth: 1000 },
    sideCard: {
      flex: '0 0 auto', minWidth: 200, maxWidth: 280, background: 'var(--om-canvas-white)',
      border: '1px solid var(--om-hairline)', borderRadius: 'var(--om-radius-lg, 16px)',
      padding: '14px 16px 4px', boxShadow: 'var(--om-shadow-card)',
    },
    cols: { display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'flex-start' },
    colMain: { flex: '1 1 420px', minWidth: 300 },
    colSide: { flex: '0 0 260px', minWidth: 240 },
    card: { background: 'var(--om-canvas-white)', border: '1px solid var(--om-hairline)', borderRadius: 'var(--om-radius-lg, 16px)', padding: '18px 18px' },
    cardLabel: { fontSize: 12, fontWeight: 600, color: 'var(--om-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 },
    field: { marginBottom: 12 },
    fieldLabel: { fontSize: 11.5, color: 'var(--om-faint)' },
    fieldValue: { fontSize: 14, color: 'var(--om-ink)', marginTop: 1 },
    blockLabel: { display: 'flex', alignItems: 'center', gap: 7, margin: '6px 0 10px', fontSize: 13, fontWeight: 600, color: 'var(--om-ink)' },
    avatar: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: 'var(--om-sage)', color: 'var(--om-sage-deep)', fontSize: 12, fontWeight: 600 },
  };

  window.SpecialistClients = SpecialistClients;
})();
