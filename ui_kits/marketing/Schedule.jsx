/* Schedule.jsx — upcoming program cards with filter chips. */

const schedStyles = {
  band: { background: 'var(--om-canvas-soft)', padding: '96px 0' },
  inner: {
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
  },
  head: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    flexWrap: 'wrap', gap: 24, marginBottom: 32,
  },
  h2: { fontSize: 36, fontWeight: 500, color: 'var(--om-ink)', margin: '0 0 8px 0', letterSpacing: '-0.01em' },
  sub: { fontSize: 16, color: 'var(--om-muted)', margin: 0, maxWidth: '54ch' },

  filters: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 },
  chip: {
    padding: '8px 16px', borderRadius: 'var(--om-radius-pill)',
    background: 'var(--om-canvas-white)', border: '1px solid var(--om-hairline)',
    fontSize: 13, fontWeight: 500, color: 'var(--om-body)', cursor: 'pointer',
    transition: 'all 180ms ease',
  },
  chipActive: { background: 'var(--om-ink)', color: '#fff', borderColor: 'var(--om-ink)' },

  list: { display: 'grid', gap: 14 },
  card: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-lg)',
    padding: '22px 26px',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 24,
    alignItems: 'center',
  },
  body: { display: 'flex', flexDirection: 'column', gap: 10 },
  rowMeta: { display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 13, color: 'var(--om-muted)' },
  rowMetaItem: { display: 'inline-flex', alignItems: 'center', gap: 6 },
  title: { fontSize: 19, fontWeight: 500, color: 'var(--om-ink)', margin: 0, lineHeight: 1.3 },
  tagRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  right: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 },
  price: { fontFamily: 'var(--om-font-mono)', fontSize: 18, fontWeight: 500, color: 'var(--om-ink)' },
  discount: { fontSize: 12, color: 'var(--om-sage-deep)' },
  warn: { fontSize: 12, color: 'var(--om-warning)', display: 'inline-flex', alignItems: 'center', gap: 5 },
};

const PROGRAMS = [
  {
    bookingId: 'flagship-offline',
    tag: '4-дневный курс', tagClass: 'om-tag--gold',
    title: 'Вес идеальности с модификацией фигуры',
    dates: '4–7 ноября, 17:00',
    trainer: 'Татьяна Педас',
    format: 'Офлайн, Алматы',
    price: '160 000 ₸',
    discount: '−15 000 ₸ при предоплате за 3–4 дня',
    capacity: 'осталось 3 места',
  },
  {
    bookingId: 'club',
    tag: 'Активация программы', tagClass: 'om-tag--sage',
    title: 'Клубный день — 2 часа',
    dates: '10, 18, 21, 24 ноября, 19:00',
    trainer: 'Илья Брежнев',
    format: 'Офлайн',
    price: '12 000 ₸',
  },
  {
    bookingId: 'teen',
    tag: 'Для подростков', tagClass: 'om-tag--coral',
    title: 'Подростковый клуб (12–17 лет)',
    dates: '8 и 22 ноября, 11:00–13:00',
    trainer: 'Наталья Лоскутникова',
    format: 'Офлайн',
    price: '30 000 ₸',
  },
  {
    bookingId: 'detox',
    tag: 'Онлайн', tagClass: 'om-tag--lilac',
    title: 'ONLINE DETOX — 10 дней',
    dates: 'старт 12 ноября',
    trainer: 'Марина Енгерова',
    format: 'Онлайн',
    price: '30 000 ₸',
  },
];

function Schedule() {
  const [filter, setFilter] = React.useState('all');
  const filters = [
    { id: 'all', label: 'Все программы' },
    { id: 'flagship', label: 'Вес идеальности' },
    { id: 'group', label: 'Группа' },
    { id: 'online', label: 'Онлайн' },
    { id: 'november', label: 'Ноябрь 2025' },
  ];

  return (
    <section style={schedStyles.band} id="schedule" data-screen-label="Marketing site / Schedule">
      <div style={schedStyles.inner}>
        <div style={schedStyles.head}>
          <div>
            <h2 style={schedStyles.h2}>Ближайшие программы</h2>
            <p style={schedStyles.sub}>
              Расписание обновляется ежемесячно. Если нет удобной даты — оставьте заявку, сообщим о ближайшей.
            </p>
          </div>
          <a href="schedule.html" className="om-btn om-btn--secondary">Полное расписание →</a>
        </div>

        <div style={schedStyles.filters}>
          {filters.map(f => (
            <button
              key={f.id}
              data-animate="schedule-chip"
              style={{ ...schedStyles.chip, ...(filter === f.id ? schedStyles.chipActive : {}) }}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={schedStyles.list}>
          {PROGRAMS.map((p, i) => (
            <div key={i} style={schedStyles.card} data-animate="schedule-item">
              <div style={schedStyles.body}>
                <div style={schedStyles.tagRow}>
                  <span className={`om-tag ${p.tagClass}`}>{p.tag}</span>
                  {p.capacity && (
                    <span style={schedStyles.warn}>
                      <i data-lucide="alert-circle" style={{ width: 12, height: 12 }}></i>
                      {p.capacity}
                    </span>
                  )}
                </div>
                <h3 style={schedStyles.title}>{p.title}</h3>
                <div style={schedStyles.rowMeta}>
                  <span style={schedStyles.rowMetaItem}>
                    <i data-lucide="calendar-days" style={{ width: 14, height: 14 }}></i>{p.dates}
                  </span>
                  <span style={schedStyles.rowMetaItem}>
                    <i data-lucide="user-round" style={{ width: 14, height: 14 }}></i>{p.trainer}
                  </span>
                  <span style={schedStyles.rowMetaItem}>
                    <i data-lucide={p.format.includes('Онлайн') ? 'monitor' : 'map-pin'} style={{ width: 14, height: 14 }}></i>
                    {p.format}
                  </span>
                </div>
              </div>
              <div style={schedStyles.right}>
                <div style={schedStyles.price}>{p.price}</div>
                {p.discount && <div style={schedStyles.discount}>{p.discount}</div>}
                <a
                  className="om-btn om-btn--primary"
                  href={`booking.html?program=${p.bookingId}`}
                  style={{ fontSize: 13, padding: '10px 18px', textDecoration: 'none' }}
                >
                  Записаться
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

window.Schedule = Schedule;
