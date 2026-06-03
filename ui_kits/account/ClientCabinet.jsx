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
    const WeightChart = window.WeightChart;

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
        {/* Рабочая шапка: слева — программа клиента, справа — компактная карточка
            прикреплённого специалиста (всегда на виду, не уезжает за край). */}
        <div className="om-acc-head" style={ST.head}>
          <div style={{ minWidth: 0 }}>
            <div className="om-acc-eyebrow">Личный кабинет{name ? ' · ' + name.split(/\s+/)[0] : ''}</div>
            <h1 className="om-acc-title">{program || 'Моя программа'}</h1>
            <p className="om-acc-sub" style={{ marginBottom: 0 }}>
              Ведите график веса, замеры и дневник питания — специалист их проверяет и комментирует.
            </p>
          </div>

          <div style={ST.specCard}>
            <div style={ST.specCap}>Ваш специалист</div>
            {specialist ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                {specialist.photo
                  ? <img src={specialist.photo} alt="" style={ST.avatarImg} />
                  : <span style={ST.avatar}>{initials(specialist.name)}</span>}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--om-ink)', fontSize: 14 }}>{specialist.name}</div>
                  {specialist.roleLabel && <div style={{ fontSize: 12, color: 'var(--om-muted)' }}>{specialist.roleLabel}</div>}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12.5, color: 'var(--om-faint)' }}>
                {loaded ? 'Пока не назначен' : 'Загрузка…'}
              </div>
            )}
          </div>
        </div>

        {/* Контент на всю ширину — графику и таблицам нужно место. */}
        <div style={ST.content}>
          <section>
            <div style={ST.blockLabel}><LucideIcon name="line-chart" size={15} /> Мой график снижения веса</div>
            {WeightChart && me
              ? <WeightChart clientId={me.id} />
              : <div style={ST.loadingTxt}>Загрузка…</div>}
          </section>

          <section style={{ marginTop: 28 }}>
            <div style={ST.blockLabel}><LucideIcon name="messages-square" size={15} /> Комментарии специалиста</div>
            {ClientActivityThread && me
              ? <ClientActivityThread clientId={me.id} canDelete={false} />
              : <div style={ST.loadingTxt}>Загрузка…</div>}
          </section>
        </div>
      </React.Fragment>
    );
  }

  const ST = {
    head: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' },
    content: { maxWidth: 1000 },
    blockLabel: { display: 'flex', alignItems: 'center', gap: 7, margin: '2px 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--om-ink)' },
    loadingTxt: { fontSize: 13, color: 'var(--om-faint)' },
    specCard: {
      flex: '0 0 auto', minWidth: 210, background: 'var(--om-canvas-white)',
      border: '1px solid var(--om-hairline)', borderRadius: 'var(--om-radius-lg, 16px)',
      padding: '12px 16px', boxShadow: 'var(--om-shadow-card)',
    },
    specCap: { fontSize: 10.5, fontWeight: 600, color: 'var(--om-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 9 },
    avatar: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'var(--om-lilac)', color: 'var(--om-indigo-deep)', fontSize: 14, fontWeight: 600 },
    avatarImg: { width: 40, height: 40, borderRadius: '50%', flexShrink: 0, objectFit: 'cover', display: 'block' },
  };

  window.ClientCabinet = ClientCabinet;
})();
