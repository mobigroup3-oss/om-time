// ClientSupport.jsx — раздел «Поддержка» (роль client).
// Клиент пишет не только своему куратору, но и любому дежурному специалисту.
// Список собеседников приходит из /api/clients?resource=roster (куратор + дежурные
// с флагом support_available). Выбор собеседника открывает приватный диалог —
// переиспользуем window.ClientActivityThread (peerSpecialistId = id специалиста;
// для куратора пусто = основная лента кабинета). Непрочитанные — бейджем.

(function () {
  const { useState, useEffect } = React;
  const LucideIcon = window.LucideIcon;
  const auth = () => window.omAuth;

  const initials = (name) => {
    const p = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return '—';
    return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
  };

  function PeerRow({ peer, onOpen }) {
    return (
      <button style={S.row} onClick={() => onOpen(peer)}>
        {peer.photo
          ? <img src={peer.photo} alt="" style={S.avatarImg} />
          : <span style={S.avatar}>{initials(peer.name)}</span>}
        <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, color: 'var(--om-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{peer.name}</span>
            {peer.isCurator && <span className="om-tag-mini om-tag-mini--lilac">Ваш специалист</span>}
          </div>
          {peer.roleLabel && <div style={{ fontSize: 12.5, color: 'var(--om-muted)', marginTop: 1 }}>{peer.roleLabel}</div>}
        </div>
        {peer.unread > 0 && <span style={S.badge}>{peer.unread}</span>}
        <LucideIcon name="chevron-right" size={18} style={{ color: 'var(--om-faint)', flexShrink: 0 }} />
      </button>
    );
  }

  function ClientSupport() {
    const [roster, setRoster] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [open, setOpen] = useState(null);   // выбранный собеседник
    const ClientActivityThread = window.ClientActivityThread;
    const myId = auth().clientId();

    const loadRoster = () => {
      fetch('/api/clients?resource=roster', { headers: auth().headers() })
        .then(r => r.ok ? r.json() : null)
        .then(j => { if (j && j.ok && Array.isArray(j.data)) setRoster(j.data); setLoaded(true); })
        .catch(() => setLoaded(true));
    };
    useEffect(() => { loadRoster(); }, []);

    // ── Открытый диалог ──
    if (open) {
      return (
        <React.Fragment>
          <div className="om-acc-head" style={{ alignItems: 'flex-start' }}>
            <div style={{ minWidth: 0 }}>
              <button onClick={() => { setOpen(null); loadRoster(); }} style={S.back}>
                <LucideIcon name="arrow-left" size={15} style={{ marginRight: 6 }} /> Все специалисты
              </button>
              <h1 className="om-acc-title" style={{ marginTop: 8 }}>{open.name}</h1>
              <p className="om-acc-sub" style={{ marginBottom: 0 }}>
                {open.roleLabel}{open.isCurator ? ' · ваш специалист' : ''}
              </p>
            </div>
          </div>
          <div style={{ maxWidth: 760 }}>
            {ClientActivityThread && myId
              ? <ClientActivityThread
                  clientId={myId}
                  peerSpecialistId={open.specialistId || ''}
                  canDelete={false}
                  placeholder="Напишите специалисту… (Ctrl+Enter — отправить)" />
              : <div style={{ fontSize: 13, color: 'var(--om-faint)' }}>Загрузка…</div>}
          </div>
        </React.Fragment>
      );
    }

    // ── Список собеседников ──
    return (
      <React.Fragment>
        <div className="om-acc-head">
          <div>
            <div className="om-acc-eyebrow">Кабинет</div>
            <h1 className="om-acc-title">Поддержка</h1>
            <p className="om-acc-sub">
              Напишите своему специалисту или дежурному психологу — задайте вопрос,
              расскажите о самочувствии, попросите совет.
            </p>
          </div>
        </div>

        <div style={S.notice}>
          <LucideIcon name="info" size={16} style={{ flexShrink: 0, marginTop: 1, color: 'var(--om-indigo-deep, #3a2f6b)' }} />
          <span>
            Специалисты отвечают в рабочее время — это не экстренная линия.
            Если вам нужна срочная помощь, позвоните на горячую линию психологической поддержки <strong>112</strong>.
          </span>
        </div>

        {loaded && roster.length === 0 ? (
          <div className="om-adm-table-wrap">
            <div className="om-adm-empty">
              <LucideIcon name="messages-square" size={36} style={{ marginBottom: 12, opacity: 0.45 }} />
              <div style={{ fontSize: 15, color: 'var(--om-ink)', fontWeight: 500, marginBottom: 4 }}>
                Пока некому написать
              </div>
              <div style={{ fontSize: 13 }}>Специалист появится здесь, как только вас прикрепят.</div>
            </div>
          </div>
        ) : (
          <div style={S.list}>
            {roster.map(p => (
              <PeerRow key={p.specialistId || 'curator'} peer={p} onOpen={setOpen} />
            ))}
          </div>
        )}
      </React.Fragment>
    );
  }

  const S = {
    notice: {
      display: 'flex', gap: 9, alignItems: 'flex-start',
      background: 'var(--om-lilac-soft, rgba(231,224,245,0.5))',
      border: '1px solid var(--om-glass-line, rgba(255,255,255,0.7))',
      borderRadius: 'var(--om-radius-lg, 16px)', padding: '12px 16px',
      fontSize: 12.5, color: 'var(--om-muted)', lineHeight: 1.5, maxWidth: 760, marginBottom: 18,
    },
    list: { display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 760 },
    row: {
      display: 'flex', alignItems: 'center', gap: 13, width: '100%',
      padding: '13px 16px', cursor: 'pointer', fontFamily: 'inherit',
      background: 'var(--om-glass, rgba(255,255,255,0.66))',
      backdropFilter: 'blur(14px) saturate(1.1)', WebkitBackdropFilter: 'blur(14px) saturate(1.1)',
      border: '1px solid var(--om-glass-line, rgba(255,255,255,0.7))',
      borderRadius: 'var(--om-radius-lg, 16px)', boxShadow: 'var(--om-shadow-aurora, 0 12px 32px rgba(27,24,64,0.08))',
    },
    avatar: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(140deg, var(--om-indigo), #5b3fb0 55%, var(--om-coral))', color: '#fff', fontSize: 14, fontWeight: 600 },
    avatarImg: { width: 42, height: 42, borderRadius: '50%', flexShrink: 0, objectFit: 'cover', display: 'block' },
    badge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, padding: '0 6px', borderRadius: 999, background: 'var(--om-coral)', color: '#fff', fontSize: 11.5, fontWeight: 600, flexShrink: 0 },
    back: { display: 'inline-flex', alignItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, color: 'var(--om-muted)', padding: 0 },
  };

  window.ClientSupport = ClientSupport;
})();
