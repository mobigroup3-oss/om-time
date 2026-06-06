// SpecialistInbox.jsx — раздел «Обращения» (роль specialist).
// Входящие диалоги поддержки: клиенты, написавшие этому специалисту (необязательно
// прикреплённые к нему). Список — /api/clients?resource=inbox; открытие диалога
// переиспользует window.ClientActivityThread (peerSpecialistId = id самого специалиста).
// Непрочитанные — бейджем.

(function () {
  const { useState, useEffect } = React;
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
  const programTitle = (id) => PROGRAMS[id] || '';

  const initials = (name) => {
    const p = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return '—';
    return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
  };
  const fmtDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso); if (isNaN(d)) return '';
    return d.toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  function InboxRow({ item, onOpen }) {
    return (
      <button style={S.row} onClick={() => onOpen(item)}>
        <span style={S.avatar}>{initials(item.clientName)}</span>
        <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontWeight: 600, color: 'var(--om-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.clientName || 'Клиент'}</span>
            {item.lastAt && <span style={{ fontSize: 11, color: 'var(--om-faint)', marginLeft: 'auto', flexShrink: 0 }}>{fmtDateTime(item.lastAt)}</span>}
          </div>
          <div style={S.preview}>
            {programTitle(item.programId) && <span style={{ color: 'var(--om-muted)' }}>{programTitle(item.programId)} · </span>}
            {item.lastText || 'Без сообщений'}
          </div>
        </div>
        {item.unread > 0 && <span style={S.badge}>{item.unread}</span>}
        <LucideIcon name="chevron-right" size={18} style={{ color: 'var(--om-faint)', flexShrink: 0 }} />
      </button>
    );
  }

  function SpecialistInbox() {
    const [items, setItems] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [open, setOpen] = useState(null);
    const ClientActivityThread = window.ClientActivityThread;
    const myId = auth().specialistId();

    const load = () => {
      fetch('/api/clients?resource=inbox', { headers: auth().headers() })
        .then(r => r.ok ? r.json() : null)
        .then(j => { if (j && j.ok && Array.isArray(j.data)) setItems(j.data); setLoaded(true); })
        .catch(() => setLoaded(true));
    };
    useEffect(() => { load(); }, []);

    // ── Открытый диалог ──
    if (open) {
      return (
        <React.Fragment>
          <div className="om-acc-head" style={{ alignItems: 'flex-start' }}>
            <div style={{ minWidth: 0 }}>
              <button onClick={() => { setOpen(null); load(); }} style={S.back}>
                <LucideIcon name="arrow-left" size={15} style={{ marginRight: 6 }} /> Все обращения
              </button>
              <h1 className="om-acc-title" style={{ marginTop: 8 }}>{open.clientName || 'Клиент'}</h1>
              <p className="om-acc-sub" style={{ marginBottom: 0 }}>
                {programTitle(open.programId) || 'Обращение в поддержку'}
              </p>
            </div>
          </div>
          <div style={{ maxWidth: 760 }}>
            {ClientActivityThread && myId
              ? <ClientActivityThread
                  clientId={open.clientId}
                  peerSpecialistId={myId}
                  canDelete={false}
                  placeholder="Ответьте клиенту… (Ctrl+Enter — отправить)" />
              : <div style={{ fontSize: 13, color: 'var(--om-faint)' }}>Загрузка…</div>}
          </div>
        </React.Fragment>
      );
    }

    // ── Список обращений ──
    return (
      <React.Fragment>
        <div className="om-acc-head">
          <div>
            <div className="om-acc-eyebrow">Работа</div>
            <h1 className="om-acc-title">Обращения</h1>
            <p className="om-acc-sub">Сообщения от клиентов, которые написали вам в поддержку. Открывайте диалог и отвечайте.</p>
          </div>
        </div>

        {loaded && items.length === 0 ? (
          <div className="om-adm-table-wrap">
            <div className="om-adm-empty">
              <LucideIcon name="inbox" size={36} style={{ marginBottom: 12, opacity: 0.45 }} />
              <div style={{ fontSize: 15, color: 'var(--om-ink)', fontWeight: 500, marginBottom: 4 }}>
                Пока нет обращений
              </div>
              <div style={{ fontSize: 13 }}>Здесь появятся диалоги, когда клиент напишет вам в разделе «Поддержка».</div>
            </div>
          </div>
        ) : (
          <div style={S.list}>
            {items.map(it => (
              <InboxRow key={it.clientId} item={it} onOpen={setOpen} />
            ))}
          </div>
        )}
      </React.Fragment>
    );
  }

  const S = {
    list: { display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 760 },
    row: {
      display: 'flex', alignItems: 'center', gap: 13, width: '100%',
      padding: '13px 16px', cursor: 'pointer', fontFamily: 'inherit',
      background: 'var(--om-glass, rgba(255,255,255,0.66))',
      backdropFilter: 'blur(14px) saturate(1.1)', WebkitBackdropFilter: 'blur(14px) saturate(1.1)',
      border: '1px solid var(--om-glass-line, rgba(255,255,255,0.7))',
      borderRadius: 'var(--om-radius-lg, 16px)', boxShadow: 'var(--om-shadow-aurora, 0 12px 32px rgba(27,24,64,0.08))',
    },
    avatar: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: '50%', flexShrink: 0, background: 'var(--om-sage)', color: 'var(--om-sage-deep)', fontSize: 14, fontWeight: 600 },
    preview: { fontSize: 12.5, color: 'var(--om-ink)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    badge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, padding: '0 6px', borderRadius: 999, background: 'var(--om-coral)', color: '#fff', fontSize: 11.5, fontWeight: 600, flexShrink: 0 },
    back: { display: 'inline-flex', alignItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, color: 'var(--om-muted)', padding: 0 },
  };

  window.SpecialistInbox = SpecialistInbox;
})();
