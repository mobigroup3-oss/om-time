// ClientCabinet.jsx — раздел «Мой кабинет» (роль client).
// Личный кабинет клиента: приветствие, прикреплённый специалист, будущие
// таблицы/графики (пока заглушка — контент заказчик добавит позже) и лента
// комментариев со специалистом. Данные — /api/clients?action=me, лента —
// window.ClientActivityThread (определена в SpecialistClients.jsx).

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

  function ClientCabinet() {
    const [me, setMe] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const ClientActivityThread = window.ClientActivityThread;

    useEffect(() => {
      fetch('/api/clients?action=me', { headers: auth().headers() })
        .then(r => r.ok ? r.json() : null)
        .then(j => { if (j && j.ok && j.data) setMe(j.data); setLoaded(true); })
        .catch(() => setLoaded(true));
    }, []);

    const name = (me && me.name) || auth().clientName() || 'Клиент';
    const specialist = me && me.specialist;
    const program = me && programTitle(me.programId);

    return (
      <React.Fragment>
        <div className="om-acc-head">
          <div>
            <div className="om-acc-eyebrow">Кабинет</div>
            <h1 className="om-acc-title">Здравствуйте, {name.split(/\s+/)[0]}</h1>
            <p className="om-acc-sub">
              {program ? ('Ваша программа: ' + program + '. ') : ''}
              Здесь вы ведёте свои таблицы и графики, а специалист их проверяет.
            </p>
          </div>
        </div>

        <div style={ST.cols}>
          <div style={ST.colMain}>
            {/* Заглушка под таблицы/графики клиента — контент добавим позже. */}
            <div style={ST.placeholder}>
              <LucideIcon name="bar-chart-3" size={32} style={{ marginBottom: 12, opacity: 0.55 }} />
              <div style={{ fontSize: 15, color: 'var(--om-ink)', fontWeight: 500, marginBottom: 4 }}>
                Мои таблицы и графики
              </div>
              <div style={{ fontSize: 13, color: 'var(--om-muted)', maxWidth: 440 }}>
                Раздел готовится. Скоро здесь появятся таблицы и графики, которые вы будете
                вести самостоятельно, а ваш специалист — просматривать и комментировать.
              </div>
            </div>

            <div style={{ marginTop: 22 }}>
              <div style={ST.blockLabel}>
                <LucideIcon name="messages-square" size={15} /> Комментарии специалиста
              </div>
              {ClientActivityThread && me
                ? <ClientActivityThread clientId={me.id} canDelete={false} />
                : <div style={{ fontSize: 13, color: 'var(--om-faint)' }}>Загрузка…</div>}
            </div>
          </div>

          <aside style={ST.colSide}>
            <div style={ST.card}>
              <div style={ST.cardLabel}>Ваш специалист</div>
              {specialist ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={ST.avatar}>{initials(specialist.name)}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--om-ink)' }}>{specialist.name}</div>
                    {specialist.roleLabel && <div style={{ fontSize: 12.5, color: 'var(--om-muted)' }}>{specialist.roleLabel}</div>}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--om-faint)' }}>
                  {loaded ? 'Специалист пока не назначен. Администратор скоро его прикрепит.' : 'Загрузка…'}
                </div>
              )}
            </div>
          </aside>
        </div>
      </React.Fragment>
    );
  }

  const ST = {
    cols: { display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'flex-start' },
    colMain: { flex: '1 1 420px', minWidth: 300 },
    colSide: { flex: '0 0 260px', minWidth: 240 },
    placeholder: {
      background: 'var(--om-canvas-white)', border: '1px dashed var(--om-hairline)',
      borderRadius: 'var(--om-radius-lg, 16px)', padding: '48px 28px',
      textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
    },
    blockLabel: { display: 'flex', alignItems: 'center', gap: 7, margin: '6px 0 10px', fontSize: 13, fontWeight: 600, color: 'var(--om-ink)' },
    card: { background: 'var(--om-canvas-white)', border: '1px solid var(--om-hairline)', borderRadius: 'var(--om-radius-lg, 16px)', padding: '18px 18px' },
    cardLabel: { fontSize: 12, fontWeight: 600, color: 'var(--om-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 },
    avatar: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', flexShrink: 0, background: 'var(--om-lilac)', color: 'var(--om-indigo-deep)', fontSize: 15, fontWeight: 600 },
  };

  window.ClientCabinet = ClientCabinet;
})();
