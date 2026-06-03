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

  const initials = (name) => {
    const p = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return '—';
    return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
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
    const [items, setItems] = useState([]);
    const [text, setText] = useState('');
    const [loaded, setLoaded] = useState(false);
    const [busy, setBusy] = useState(false);
    const endRef = useRef(null);

    const api = (method, body, query) => fetch('/api/client-activities' + (query || ''), {
      method,
      headers: auth().headers({ 'Content-Type': 'application/json' }),
      body: body ? JSON.stringify(body) : undefined,
    }).then(r => r.json()).catch(() => null);

    const load = () => {
      api('GET', null, '?clientId=' + encodeURIComponent(clientId)).then(j => {
        if (j && j.ok && Array.isArray(j.data)) setItems(j.data);
        setLoaded(true);
      });
    };
    useEffect(() => { if (clientId) load(); }, [clientId]);
    useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ block: 'nearest' }); }, [items.length]);

    const send = () => {
      const t = text.trim();
      if (!t || busy) return;
      setBusy(true);
      api('POST', { clientId, type: 'note', text: t }).then(j => {
        setBusy(false);
        if (j && j.ok && j.data) { setItems(cur => [...cur, j.data]); setText(''); }
      });
    };
    const remove = (id) => {
      setItems(cur => cur.filter(a => a.id !== id));
      api('DELETE', null, '?id=' + encodeURIComponent(id));
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
        <div className="om-acc-head">
          <div>
            <button onClick={onBack} style={DT.back}>
              <LucideIcon name="arrow-left" size={15} style={{ marginRight: 6 }} /> Все клиенты
            </button>
            <h1 className="om-acc-title" style={{ marginTop: 8 }}>{client.name}</h1>
            <p className="om-acc-sub">Персональные данные, материалы и комментарии.</p>
          </div>
        </div>

        <div style={DT.cols}>
          <div style={DT.colMain}>
            <TablesPlaceholder />
            <div style={{ marginTop: 22 }}>
              <div style={DT.blockLabel}><LucideIcon name="messages-square" size={15} /> Комментарии</div>
              <ClientActivityThread clientId={client.id} canDelete={false} />
            </div>
          </div>

          <aside style={DT.colSide}>
            <div style={DT.card}>
              <div style={DT.cardLabel}>Персональные данные</div>
              {fields.length === 0 && <div style={{ fontSize: 13, color: 'var(--om-faint)' }}>Данные не заполнены.</div>}
              {fields.map(f => (
                <div key={f.label} style={DT.field}>
                  <div style={DT.fieldLabel}>{f.label}</div>
                  <div style={DT.fieldValue}>{f.value}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </React.Fragment>
    );
  }

  function SpecialistClients() {
    const [items, setItems] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [openId, setOpenId] = useState(null);

    useEffect(() => {
      fetch('/api/clients', { headers: auth().headers() })
        .then(r => r.ok ? r.json() : null)
        .then(j => { if (j && j.ok && Array.isArray(j.data)) setItems(j.data); setLoaded(true); })
        .catch(() => setLoaded(true));
    }, []);

    const open = openId && items.find(c => c.id === openId);
    if (open) return <ClientDetail client={open} onBack={() => setOpenId(null)} />;

    return (
      <React.Fragment>
        <div className="om-acc-head">
          <div>
            <div className="om-acc-eyebrow">Работа</div>
            <h1 className="om-acc-title">Мои клиенты</h1>
            <p className="om-acc-sub">Клиенты, которых вы ведёте: их данные, таблицы и комментарии.</p>
          </div>
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
          <div className="om-adm-table-wrap">
            <table className="om-adm-table">
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th>Программа</th>
                  <th style={{ width: 48 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map(c => (
                  <tr key={c.id} onClick={() => setOpenId(c.id)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={DT.avatar}>{initials(c.name)}</span>
                        <span style={{ fontWeight: 500, color: 'var(--om-ink)' }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--om-muted)' }}>{programTitle(c.programId)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--om-faint)' }}>
                      <LucideIcon name="chevron-right" size={18} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
  const DT = {
    back: { display: 'inline-flex', alignItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, color: 'var(--om-muted)', padding: 0 },
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
