/* SchedulePage.jsx — полное расписание OM Time */

// Данные тянутся из /api/schedule. Нет сервера / пустая БД → SEED_SCHEDULE.
const SEED_SCHEDULE = [
  // ── Ноябрь 2025 ──────────────────────────────────────────────────────────
  {
    id: 'nov-flagship-offline',
    month: '2025-11',
    monthLabel: 'Ноябрь 2025',
    category: 'flagship',
    format: 'offline',
    tag: '4-дневный интенсив',
    tagClass: 'om-tag--gold',
    title: 'Вес идеальности с модификацией фигуры',
    dates: '4–7 ноября',
    time: '17:00–20:00',
    duration: '4 дня по 3 часа',
    trainer: 'Татьяна Педас',
    formatLabel: 'Офлайн, Алматы',
    price: '160 000 ₸',
    priceNote: '−15 000 ₸ при предоплате',
    capacity: 3,
    capacityTotal: 12,
    featured: true,
  },
  {
    id: 'nov-teen-1',
    month: '2025-11',
    monthLabel: 'Ноябрь 2025',
    category: 'teen',
    format: 'offline',
    tag: 'Подростки 12–17',
    tagClass: 'om-tag--coral',
    title: 'Подростковый клуб',
    dates: '8 ноября',
    time: '11:00–13:00',
    duration: '2 часа',
    trainer: 'Наталья Лоскутникова',
    formatLabel: 'Офлайн, Алматы',
    price: '30 000 ₸',
    capacity: 7,
    capacityTotal: 15,
  },
  {
    id: 'nov-club-1',
    month: '2025-11',
    monthLabel: 'Ноябрь 2025',
    category: 'club',
    format: 'offline',
    tag: 'Клубный день',
    tagClass: 'om-tag--sage',
    title: 'Клубный день — активация программы',
    dates: '10 ноября',
    time: '19:00–21:00',
    duration: '2 часа',
    trainer: 'Илья Брежнев',
    formatLabel: 'Офлайн',
    price: '12 000 ₸',
    capacity: null,
    capacityTotal: null,
  },
  {
    id: 'nov-detox',
    month: '2025-11',
    monthLabel: 'Ноябрь 2025',
    category: 'detox',
    format: 'online',
    tag: 'Онлайн · 10 дней',
    tagClass: 'om-tag--lilac',
    title: 'ONLINE DETOX',
    dates: 'старт 12 ноября',
    time: 'гибкое расписание',
    duration: '10 дней практик',
    trainer: 'Марина Енгерова',
    formatLabel: 'Онлайн',
    price: '30 000 ₸',
    capacity: null,
    capacityTotal: null,
  },
  {
    id: 'nov-club-2',
    month: '2025-11',
    monthLabel: 'Ноябрь 2025',
    category: 'club',
    format: 'offline',
    tag: 'Клубный день',
    tagClass: 'om-tag--sage',
    title: 'Клубный день — групповая сессия',
    dates: '18 ноября',
    time: '19:00–21:00',
    duration: '2 часа',
    trainer: 'Илья Брежнев',
    formatLabel: 'Офлайн',
    price: '12 000 ₸',
    capacity: null,
    capacityTotal: null,
  },
  {
    id: 'nov-flagship-online',
    month: '2025-11',
    monthLabel: 'Ноябрь 2025',
    category: 'flagship',
    format: 'online',
    tag: 'Онлайн-интенсив',
    tagClass: 'om-tag--lilac',
    title: 'Вес идеальности ONLINE',
    dates: 'старт 19 ноября',
    time: '19:00–21:30',
    duration: '4 прямых эфира',
    trainer: 'Татьяна Педас',
    formatLabel: 'Онлайн',
    price: '90 000 ₸',
    capacity: null,
    capacityTotal: null,
  },
  {
    id: 'nov-teen-2',
    month: '2025-11',
    monthLabel: 'Ноябрь 2025',
    category: 'teen',
    format: 'offline',
    tag: 'Подростки 12–17',
    tagClass: 'om-tag--coral',
    title: 'Подростковый клуб',
    dates: '22 ноября',
    time: '11:00–13:00',
    duration: '2 часа',
    trainer: 'Наталья Лоскутникова',
    formatLabel: 'Офлайн, Алматы',
    price: '30 000 ₸',
    capacity: 11,
    capacityTotal: 15,
  },
  {
    id: 'nov-club-3',
    month: '2025-11',
    monthLabel: 'Ноябрь 2025',
    category: 'club',
    format: 'offline',
    tag: 'Клубный день',
    tagClass: 'om-tag--sage',
    title: 'Клубный день — разбор практик',
    dates: '24 ноября',
    time: '19:00–21:00',
    duration: '2 часа',
    trainer: 'Илья Брежнев',
    formatLabel: 'Офлайн',
    price: '12 000 ₸',
    capacity: null,
    capacityTotal: null,
  },

  // ── Декабрь 2025 ─────────────────────────────────────────────────────────
  {
    id: 'dec-detox',
    month: '2025-12',
    monthLabel: 'Декабрь 2025',
    category: 'detox',
    format: 'online',
    tag: 'Онлайн · 10 дней',
    tagClass: 'om-tag--lilac',
    title: 'ONLINE DETOX — предновогодний',
    dates: 'старт 1 декабря',
    time: 'гибкое расписание',
    duration: '10 дней практик',
    trainer: 'Марина Енгерова',
    formatLabel: 'Онлайн',
    price: '30 000 ₸',
    capacity: null,
    capacityTotal: null,
  },
  {
    id: 'dec-flagship',
    month: '2025-12',
    monthLabel: 'Декабрь 2025',
    category: 'flagship',
    format: 'offline',
    tag: '4-дневный интенсив',
    tagClass: 'om-tag--gold',
    title: 'Вес идеальности с модификацией фигуры',
    dates: '2–5 декабря',
    time: '17:00–20:00',
    duration: '4 дня по 3 часа',
    trainer: 'Татьяна Педас',
    formatLabel: 'Офлайн, Алматы',
    price: '160 000 ₸',
    priceNote: '−15 000 ₸ при предоплате',
    capacity: 8,
    capacityTotal: 12,
  },
  {
    id: 'dec-club',
    month: '2025-12',
    monthLabel: 'Декабрь 2025',
    category: 'club',
    format: 'offline',
    tag: 'Клубный день',
    tagClass: 'om-tag--sage',
    title: 'Клубный день',
    dates: '8 декабря',
    time: '19:00–21:00',
    duration: '2 часа',
    trainer: 'Илья Брежнев',
    formatLabel: 'Офлайн',
    price: '12 000 ₸',
    capacity: null,
    capacityTotal: null,
  },
  {
    id: 'dec-teen',
    month: '2025-12',
    monthLabel: 'Декабрь 2025',
    category: 'teen',
    format: 'offline',
    tag: 'Подростки 12–17',
    tagClass: 'om-tag--coral',
    title: 'Подростковый клуб',
    dates: '13 декабря',
    time: '11:00–13:00',
    duration: '2 часа',
    trainer: 'Наталья Лоскутникова',
    formatLabel: 'Офлайн, Алматы',
    price: '30 000 ₸',
    capacity: 12,
    capacityTotal: 15,
  },

  // ── Январь 2026 ──────────────────────────────────────────────────────────
  {
    id: 'jan-flagship',
    month: '2026-01',
    monthLabel: 'Январь 2026',
    category: 'flagship',
    format: 'offline',
    tag: '4-дневный интенсив',
    tagClass: 'om-tag--gold',
    title: 'Вес идеальности с модификацией фигуры',
    dates: '13–16 января',
    time: '17:00–20:00',
    duration: '4 дня по 3 часа',
    trainer: 'Татьяна Педас',
    formatLabel: 'Офлайн, Алматы',
    price: '170 000 ₸',
    priceNote: 'Ранняя запись до 1 января: −20 000 ₸',
    capacity: 12,
    capacityTotal: 12,
    isNew: true,
  },
  {
    id: 'jan-flagship-online',
    month: '2026-01',
    monthLabel: 'Январь 2026',
    category: 'flagship',
    format: 'online',
    tag: 'Онлайн-интенсив',
    tagClass: 'om-tag--lilac',
    title: 'Вес идеальности ONLINE',
    dates: 'старт 20 января',
    time: '19:00–21:30',
    duration: '4 прямых эфира',
    trainer: 'Татьяна Педас',
    formatLabel: 'Онлайн',
    price: '90 000 ₸',
    capacity: null,
    capacityTotal: null,
    isNew: true,
  },
  {
    id: 'jan-detox',
    month: '2026-01',
    monthLabel: 'Январь 2026',
    category: 'detox',
    format: 'online',
    tag: 'Онлайн · 10 дней',
    tagClass: 'om-tag--lilac',
    title: 'ONLINE DETOX — новогодний старт',
    dates: 'старт 5 января',
    time: 'гибкое расписание',
    duration: '10 дней практик',
    trainer: 'Марина Енгерова',
    formatLabel: 'Онлайн',
    price: '30 000 ₸',
    capacity: null,
    capacityTotal: null,
    isNew: true,
  },
];

function monthsOrderOf(events) { return [...new Set(events.map(e => e.month))].sort(); }

const FILTERS_FORMAT = [
  { id: 'all',     label: 'Все форматы' },
  { id: 'offline', label: 'Офлайн'      },
  { id: 'online',  label: 'Онлайн'      },
];

const FILTERS_CAT = [
  { id: 'all',      label: 'Все программы'   },
  { id: 'flagship', label: 'Вес идеальности' },
  { id: 'club',     label: 'Клубный день'    },
  { id: 'detox',    label: 'Детокс'          },
  { id: 'teen',     label: 'Подростки'       },
];

function getSmartDefaultMonth(events) {
  var today = new Date();
  var currentYM = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
  return monthsOrderOf(events).find(function(m) { return m >= currentYM; }) || 'all';
}

function buildFiltersMonth(events) {
  var today = new Date();
  var currentYM = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
  var list = [{ id: 'all', label: 'Все месяцы', count: null, isPast: false, isCurrent: false }];
  monthsOrderOf(events).forEach(function(m) {
    var label = (events.find(function(e) { return e.month === m; }) || {}).monthLabel || m;
    var count = events.filter(function(e) { return e.month === m; }).length;
    list.push({ id: m, label: label, count: count, isPast: m < currentYM, isCurrent: m === currentYM });
  });
  return list;
}

/* ── styles ──────────────────────────────────────────────────────────────── */

const sp = {
  hero: {
    padding: '120px 0 72px',
    background: 'var(--om-canvas)',
    borderBottom: '1px solid var(--om-hairline)',
    position: 'relative',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'radial-gradient(80% 60% at 15% 60%, rgba(27,24,64,0.04) 0%, transparent 60%), radial-gradient(60% 50% at 90% 20%, rgba(242,193,46,0.06) 0%, transparent 60%)',
  },
  heroInner: {
    maxWidth: 'var(--om-container-max)', margin: '0 auto',
    padding: '0 var(--om-container-pad)', position: 'relative',
  },
  heroEyebrow: {
    display: 'inline-flex', alignItems: 'center', gap: 12,
    fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
    fontWeight: 500, color: 'var(--om-muted)', marginBottom: 20,
  },
  heroEyebrowLine: { width: 28, height: 1, background: 'currentColor', opacity: 0.5 },
  heroH1: {
    fontSize: 'clamp(52px, 8vw, 96px)', fontWeight: 500,
    letterSpacing: '-0.035em', color: 'var(--om-ink)',
    lineHeight: 0.92, margin: '0 0 28px',
  },
  heroSub: {
    fontSize: 18, color: 'var(--om-muted)', maxWidth: '52ch',
    lineHeight: 1.6, margin: '0 0 44px',
  },
  heroStats: {
    display: 'flex', gap: 40, flexWrap: 'wrap',
    paddingTop: 28, borderTop: '1px solid var(--om-hairline)',
  },
  heroStat:    { display: 'flex', flexDirection: 'column', gap: 5 },
  heroStatNum: {
    fontFamily: 'var(--om-font-mono)', fontSize: 28, fontWeight: 500,
    color: 'var(--om-ink)', lineHeight: 1, letterSpacing: '-0.01em',
  },
  heroStatLabel: { fontSize: 12, color: 'var(--om-muted)', letterSpacing: '0.04em' },

  catalog: { padding: '64px 0 96px', background: 'var(--om-canvas-white)' },
  catalogInner: {
    maxWidth: 'var(--om-container-max)', margin: '0 auto',
    padding: '0 var(--om-container-pad)',
  },

  toolbar: {
    background: 'var(--om-canvas-white)',
    borderRadius: 'var(--om-radius-xl)',
    padding: '6px 26px 18px',
    marginBottom: 40,
    boxShadow: 'var(--om-shadow-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  filterRow: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '14px 0',
    borderBottom: '1px solid var(--om-hairline-soft)',
  },
  filterRowLast: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '14px 0 0',
  },
  filterLabel: {
    fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
    textTransform: 'uppercase', color: 'var(--om-faint)',
    minWidth: 84, flexShrink: 0,
  },
  filterGroup: { display: 'flex', gap: 7, flexWrap: 'wrap', flex: 1 },
  toolbarFoot: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 12, paddingTop: 16,
  },
  resultsText: { fontSize: 13, color: 'var(--om-muted)' },
  clearBtn: {
    padding: '7px 15px', borderRadius: 'var(--om-radius-pill)',
    background: 'var(--om-canvas-soft)', border: '1px solid transparent',
    fontSize: 12, fontWeight: 500, color: 'var(--om-muted)',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 180ms ease',
    display: 'inline-flex', alignItems: 'center', gap: 5,
  },
  chip: {
    padding: '8px 16px', borderRadius: 'var(--om-radius-pill)',
    background: 'var(--om-canvas-soft)', border: '1px solid transparent',
    fontSize: 13, fontWeight: 500, color: 'var(--om-body)',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 180ms ease',
  },
  chipActive: { background: 'var(--om-ink)', color: '#fff', borderColor: 'var(--om-ink)' },
  chipMonth: {
    padding: '8px 16px', borderRadius: 'var(--om-radius-pill)',
    background: 'var(--om-canvas-soft)', border: '1px solid transparent',
    fontSize: 13, fontWeight: 500, color: 'var(--om-body)',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 180ms ease',
  },
  chipMonthActive: { background: 'var(--om-indigo)', color: 'var(--om-on-indigo)', borderColor: 'var(--om-indigo)' },

  monthGroup:  { marginBottom: 56 },
  monthHeader: {
    display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18,
    paddingBottom: 14, borderBottom: '1px solid var(--om-hairline)',
  },
  monthLabel: {
    fontSize: 11, fontWeight: 500, letterSpacing: '0.2em',
    textTransform: 'uppercase', color: 'var(--om-muted)',
  },
  monthCount: { fontFamily: 'var(--om-font-mono)', fontSize: 12, color: 'var(--om-muted)', opacity: 0.65 },

  list: {
    display: 'grid', gap: 16, alignItems: 'stretch',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 440px), 1fr))',
  },

  /* ── Event card (сетка карточек 2-в-ряд) ────────────────────────────── */
  card: {
    position: 'relative', overflow: 'hidden', height: '100%',
    display: 'flex', flexDirection: 'column',
    background: 'var(--om-canvas-white)', border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-lg)',
    boxShadow: 'var(--om-shadow-card)',
    transition: 'transform 0.28s cubic-bezier(0,0,0.2,1), box-shadow 0.28s cubic-bezier(0,0,0.2,1)',
  },
  cardFeatured: {
    background: 'linear-gradient(160deg, rgba(250,231,168,0.5) 0%, var(--om-canvas-white) 48%)',
    border: '1px solid var(--om-gold)',
  },

  // Дата-бэнд сверху: крупный день/диапазон в цвете акцента + месяц словом.
  dateBand: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '16px 22px 14px',
  },
  dateBig: {
    fontFamily: 'var(--om-font-mono)', fontWeight: 600, fontSize: 30,
    lineHeight: 1, letterSpacing: '-0.02em', fontStyle: 'normal', flexShrink: 0,
  },
  dateMonthWrap: { display: 'flex', flexDirection: 'column', gap: 3, lineHeight: 1, minWidth: 0 },
  dateMonthName: {
    fontSize: 13, fontWeight: 600, letterSpacing: '0.04em',
    color: 'var(--om-ink)', textTransform: 'lowercase', whiteSpace: 'nowrap',
  },
  dateKicker: {
    fontSize: 10, fontWeight: 600, letterSpacing: '0.16em',
    textTransform: 'uppercase', color: 'var(--om-muted)',
  },

  cardBody:    { display: 'flex', flexDirection: 'column', gap: 9, padding: '4px 22px 16px', flex: 1 },
  cardTags:    { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  cardTitle:   { fontSize: 19, fontWeight: 500, color: 'var(--om-ink)', margin: 0, lineHeight: 1.3, letterSpacing: '-0.01em' },
  cardMeta:    { display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, color: 'var(--om-muted)' },
  cardMetaItem:{ display: 'inline-flex', alignItems: 'center', gap: 8 },
  cardCapacityRow: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 },
  cardCapacityBar: { height: 4, borderRadius: 2, background: 'var(--om-hairline)', overflow: 'hidden', flex: 1, maxWidth: 160 },
  cardCapacityFill: { height: '100%', borderRadius: 2, transition: 'width 0.4s ease' },
  cardCapacityText: { fontSize: 13, color: 'var(--om-muted)', whiteSpace: 'nowrap' },

  cardWarn: { fontSize: 13, color: 'var(--om-warning)', display: 'inline-flex', alignItems: 'center', gap: 4 },
  cardNew:  { fontSize: 13, color: 'var(--om-sage-deep)', display: 'inline-flex', alignItems: 'center', gap: 4 },

  // Нижний action-bar: цена слева, кнопка справа, отделён волоском.
  cardFoot: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 14, padding: '14px 22px', borderTop: '1px solid var(--om-hairline)',
    marginTop: 'auto',
  },
  footPrice:    { display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 },
  cardPrice:    { fontFamily: 'var(--om-font-mono)', fontSize: 22, fontWeight: 600, color: 'var(--om-ink)', whiteSpace: 'nowrap', letterSpacing: '-0.01em', fontStyle: 'normal' },
  cardPriceNote:{ fontSize: 12, color: 'var(--om-sage-deep)', lineHeight: 1.4 },

  waitlistCard: {
    background: 'var(--om-canvas-soft)', border: '1px dashed var(--om-hairline)',
    borderRadius: 'var(--om-radius-lg)', padding: '28px 32px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 24, flexWrap: 'wrap', marginTop: 16,
  },
  waitlistText:  { display: 'flex', flexDirection: 'column', gap: 6 },
  waitlistTitle: { fontSize: 16, fontWeight: 500, color: 'var(--om-ink)' },
  waitlistSub:   { fontSize: 14, color: 'var(--om-muted)', maxWidth: '52ch', lineHeight: 1.55 },

  empty: { padding: '96px 0', textAlign: 'center', color: 'var(--om-muted)' },
  emptyIcon:  { marginBottom: 20, opacity: 0.35 },
  emptyTitle: { fontSize: 18, fontWeight: 500, color: 'var(--om-ink)', margin: '0 0 8px' },
  emptyText:  { fontSize: 15, margin: 0, lineHeight: 1.6 },

  ctaBand: { padding: '96px 0', background: 'var(--om-indigo-deep)', textAlign: 'center' },
  ctaInner: {
    maxWidth: 600, margin: '0 auto', padding: '0 var(--om-container-pad)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
  },
  ctaEyebrow: { fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--om-gold)', fontWeight: 500 },
  ctaH2: { fontSize: 44, fontWeight: 500, letterSpacing: '-0.025em', margin: 0, lineHeight: 1.1, color: 'var(--om-on-indigo)' },
  ctaSub: { fontSize: 17, color: 'rgba(251,248,242,0.7)', lineHeight: 1.6, maxWidth: '44ch', margin: 0 },
};

/* ── helpers ─────────────────────────────────────────────────────────────── */

function pluralRu(n, one, few, many) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

// Дата-якорь для бэнда карточки: число (или диапазон) + месяц словом.
// Устойчив к обоим написаниям диапазона:
//   «4–7 ноября»      → {day:'4',  dayEnd:'7', month:'ноября'}
//   «2 мая – 5 мая»   → {day:'2',  dayEnd:'5', month:'мая'}
//   «старт 12 ноября» → {day:'12',             month:'ноября', isStart:true}
function parseDayAnchor(dates) {
  const s = String(dates || '');
  const isStart = /старт/i.test(s);
  const days = s.match(/\d{1,2}/g) || [];
  const months = s.match(/[а-яё]{3,}/gi) || [];
  const isRange = /[–—-]/.test(s) && days.length >= 2;
  return {
    day: days[0] || null,
    dayEnd: isRange ? (days[1] || null) : null,
    month: months.length ? months[months.length - 1].toLowerCase() : '',
    isStart,
  };
}

// Цвет акцента дата-плашки по тегу программы (тот же язык, что у .om-tag--*).
// tint — мягкая заливка плашки, solid — насыщенный цвет для подписи дня.
const SCHED_ACCENTS = {
  gold:  { solid: 'var(--om-gold-deep)',  tint: 'rgba(242,193,46,0.16)' },
  sage:  { solid: 'var(--om-sage-deep)',  tint: 'rgba(78,107,63,0.12)'  },
  coral: { solid: 'var(--om-coral)',      tint: 'rgba(192,58,59,0.10)'  },
  lilac: { solid: 'var(--om-indigo)',     tint: 'rgba(46,36,112,0.10)'  },
};
function accentOf(ev) {
  const key = String(ev.tagClass || '').replace('om-tag--', '');
  return SCHED_ACCENTS[key] || SCHED_ACCENTS.lilac;
}

/* ── SchedEventCard ──────────────────────────────────────────────────────── */

function SchedEventCard({ event: ev }) {
  const isOnline = ev.format === 'online';
  const fillPct = (ev.capacityTotal && ev.capacity !== null)
    ? Math.round((ev.capacityTotal - ev.capacity) / ev.capacityTotal * 100)
    : null;
  const spotsLow = ev.capacity !== null && ev.capacity <= 3 && ev.capacity > 0;
  const soldOut  = ev.capacity === 0;

  const a = accentOf(ev);
  const anchor = parseDayAnchor(ev.dates);
  const dayText = anchor.day
    ? (anchor.dayEnd ? `${anchor.day}–${anchor.dayEnd}` : anchor.day)
    : '—';

  const cardStyle = {
    ...sp.card,
    ...(ev.featured ? sp.cardFeatured : {}),
  };

  return (
    <div
      className="om-evt-card"
      style={cardStyle}
      data-animate="sched-item"
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = ev.featured
          ? '0 18px 42px rgba(242,193,46,0.20), 0 0 0 1px rgba(242,193,46,0.4)'
          : 'var(--om-shadow-lifted)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = 'var(--om-shadow-card)';
      }}
    >
      {/* Дата-бэнд */}
      <div style={{ ...sp.dateBand, background: a.tint }}>
        <span style={{ ...sp.dateBig, color: a.solid }}>{dayText}</span>
        <span style={sp.dateMonthWrap}>
          <span style={sp.dateMonthName}>{anchor.month}</span>
          {anchor.isStart && <span style={sp.dateKicker}>старт</span>}
        </span>
        <span className={`om-tag ${ev.tagClass}`} style={{ marginLeft: 'auto' }}>{ev.tag}</span>
      </div>

      <div style={sp.cardBody}>
        {(ev.isNew || (spotsLow && !soldOut) || soldOut) && (
          <div style={sp.cardTags}>
            {ev.isNew && (
              <span style={sp.cardNew}>
                <i data-lucide="sparkles" style={{ width: 12, height: 12 }}></i>
                Новые даты
              </span>
            )}
            {spotsLow && !soldOut && (
              <span style={sp.cardWarn}>
                <i data-lucide="alert-circle" style={{ width: 12, height: 12 }}></i>
                {`осталось ${ev.capacity} ${pluralRu(ev.capacity, 'место', 'места', 'мест')}`}
              </span>
            )}
            {soldOut && (
              <span style={{ ...sp.cardWarn, color: 'var(--om-muted)' }}>
                <i data-lucide="lock" style={{ width: 12, height: 12 }}></i>
                набор закрыт
              </span>
            )}
          </div>
        )}

        <h3 style={sp.cardTitle}>{ev.title}</h3>

        <div style={sp.cardMeta}>
          <span style={sp.cardMetaItem}>
            <i data-lucide="clock" style={{ width: 14, height: 14 }}></i>
            {ev.time}{ev.duration ? ` · ${ev.duration}` : ''}
          </span>
          <span style={sp.cardMetaItem}>
            <i data-lucide="user-round" style={{ width: 14, height: 14 }}></i>
            {ev.trainer}
          </span>
          <span style={sp.cardMetaItem}>
            <i data-lucide={isOnline ? 'monitor' : 'map-pin'} style={{ width: 14, height: 14 }}></i>
            {ev.formatLabel}
          </span>
        </div>

        {fillPct !== null && (
          <div style={sp.cardCapacityRow}>
            <div style={sp.cardCapacityBar}>
              <div style={{
                ...sp.cardCapacityFill,
                width: fillPct + '%',
                background: fillPct >= 75 ? 'var(--om-coral-deep)' : 'var(--om-sage-deep)',
              }}></div>
            </div>
            <span style={sp.cardCapacityText}>
              {ev.capacityTotal - ev.capacity} / {ev.capacityTotal} мест занято
            </span>
          </div>
        )}
      </div>

      <div className="om-evt-foot" style={sp.cardFoot}>
        <span style={sp.footPrice}>
          <span style={sp.cardPrice}>{ev.price}</span>
          {ev.priceNote && <span style={sp.cardPriceNote}>{ev.priceNote}</span>}
        </span>
        {soldOut ? (
          <button
            className="om-btn om-btn--secondary"
            style={{ fontSize: 13, padding: '10px 18px', opacity: 0.45, cursor: 'not-allowed' }}
            disabled
          >
            Набор закрыт
          </button>
        ) : (
          <a
            className="om-btn om-btn--primary"
            href={`booking.html?program=${
              ev.category === 'flagship'
                ? (ev.format === 'online' ? 'flagship-online' : 'flagship-offline')
                : ev.category
            }`}
            style={{ fontSize: 13, padding: '10px 18px', textDecoration: 'none', flexShrink: 0 }}
          >
            Записаться
          </a>
        )}
      </div>
    </div>
  );
}

/* ── SchedulePage ────────────────────────────────────────────────────────── */

function SchedulePage() {
  const [filterFormat, setFilterFormat] = React.useState('all');
  const [filterCat,    setFilterCat]    = React.useState('all');
  const [filterMonth,  setFilterMonth]  = React.useState(() => getSmartDefaultMonth(SEED_SCHEDULE));
  const [events,       setEvents]       = React.useState(SEED_SCHEDULE);

  React.useEffect(() => {
    let alive = true;
    fetch('/api/schedule')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(j => { if (alive && j && j.ok && j.data && j.data.length) setEvents(j.data); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const MONTHS_ORDER = React.useMemo(() => monthsOrderOf(events), [events]);
  const FILTERS_MONTH = React.useMemo(() => buildFiltersMonth(events), [events]);
  const defaultMonth = React.useMemo(() => getSmartDefaultMonth(events), [events]);
  const hasActiveFilters = filterFormat !== 'all' || filterCat !== 'all' || filterMonth !== defaultMonth;

  function clearAll() {
    setFilterFormat('all');
    setFilterCat('all');
    setFilterMonth(defaultMonth);
  }

  const filtered = events.filter(ev => {
    if (filterFormat !== 'all' && ev.format   !== filterFormat) return false;
    if (filterCat    !== 'all' && ev.category !== filterCat)    return false;
    if (filterMonth  !== 'all' && ev.month    !== filterMonth)  return false;
    return true;
  });

  const activeMonths = MONTHS_ORDER.filter(m => filtered.some(ev => ev.month === m));
  const today = new Date();
  const currentYM = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
  const upcomingEvents = events.filter(e => e.month >= currentYM);
  const totalEvents  = upcomingEvents.length;
  const totalOnline  = upcomingEvents.filter(e => e.format === 'online').length;
  const totalMonths  = MONTHS_ORDER.filter(m => m >= currentYM).length;

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  return (
    <React.Fragment>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={sp.hero} id="schedule-hero">
        <div style={sp.heroBg}></div>
        <div style={sp.heroInner} data-animate="sched-hero">
          <div style={sp.heroEyebrow}>
            <span style={sp.heroEyebrowLine}></span>
            расписание · 2025–2026
          </div>
          <h1 style={sp.heroH1}>
            Ближайшие<br />программы
          </h1>
          <p style={sp.heroSub}>
            Расписание обновляется ежемесячно. Нашли подходящую дату — записывайтесь сразу, мест немного.
          </p>
          <div style={sp.heroStats}>
            <div style={sp.heroStat}>
              <span style={sp.heroStatNum}>{totalEvents}</span>
              <span style={sp.heroStatLabel}>событий в расписании</span>
            </div>
            <div style={sp.heroStat}>
              <span style={sp.heroStatNum}>{totalOnline}</span>
              <span style={sp.heroStatLabel}>онлайн-форматов</span>
            </div>
            <div style={sp.heroStat}>
              <span style={sp.heroStatNum}>{totalMonths}</span>
              <span style={sp.heroStatLabel}>месяца вперёд</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Catalog ──────────────────────────────────────────────────────── */}
      <section style={sp.catalog}>
        <div style={sp.catalogInner}>

          {/* Filter toolbar */}
          <div style={sp.toolbar} data-animate="sched-filters">

            {/* Row 1: Программа */}
            <div style={sp.filterRow}>
              <span style={sp.filterLabel}>Программа</span>
              <div style={sp.filterGroup}>
                {FILTERS_CAT.map(f => (
                  <button
                    key={f.id}
                    style={{ ...sp.chip, ...(filterCat === f.id ? sp.chipActive : {}) }}
                    onClick={() => setFilterCat(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Формат */}
            <div style={sp.filterRow}>
              <span style={sp.filterLabel}>Формат</span>
              <div style={sp.filterGroup}>
                {FILTERS_FORMAT.map(f => (
                  <button
                    key={f.id}
                    style={{ ...sp.chip, ...(filterFormat === f.id ? sp.chipActive : {}) }}
                    onClick={() => setFilterFormat(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Месяц */}
            <div style={sp.filterRowLast}>
              <span style={sp.filterLabel}>Месяц</span>
              <div style={sp.filterGroup}>
                {FILTERS_MONTH.map(f => {
                  const isActive = filterMonth === f.id;
                  return (
                    <button
                      key={f.id}
                      title={f.isPast ? 'Прошедший месяц' : undefined}
                      style={{
                        ...sp.chipMonth,
                        ...(isActive ? sp.chipMonthActive : {}),
                        ...(f.isPast && !isActive ? { opacity: 0.5 } : {}),
                      }}
                      onClick={() => setFilterMonth(f.id)}
                    >
                      {f.isPast && (
                        <i data-lucide="history" style={{ width: 11, height: 11, marginRight: 4, verticalAlign: 'middle', opacity: 0.7 }}></i>
                      )}
                      {f.label}
                      {f.count !== null && (
                        <span style={{
                          marginLeft: 6,
                          fontSize: 11,
                          fontFamily: 'var(--om-font-mono)',
                          opacity: isActive ? 0.75 : 0.45,
                          fontStyle: 'normal',
                        }}>
                          {f.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer: счётчик + сброс */}
            <div style={sp.toolbarFoot}>
              <span style={sp.resultsText}>
                {hasActiveFilters
                  ? `Показано ${filtered.length} из ${events.length} событий`
                  : `${filtered.length} ${pluralRu(filtered.length, 'событие', 'события', 'событий')} · выберите месяц`}
              </span>
              {hasActiveFilters && (
                <button style={sp.clearBtn} onClick={clearAll}>
                  <i data-lucide="x" style={{ width: 12, height: 12 }}></i>
                  Сбросить
                </button>
              )}
            </div>

          </div>

          {/* Month groups or empty state */}
          {filtered.length === 0 ? (
            <div style={sp.empty}>
              <div style={sp.emptyIcon}>
                <i data-lucide="calendar-x" style={{ width: 48, height: 48, color: 'var(--om-muted)' }}></i>
              </div>
              <h3 style={sp.emptyTitle}>Нет событий по выбранным фильтрам</h3>
              <p style={sp.emptyText}>
                Попробуйте изменить фильтры или оставьте заявку —<br />сообщим о ближайших датах.
              </p>
            </div>
          ) : (
            activeMonths.map(month => {
              const events     = filtered.filter(ev => ev.month === month);
              const monthLabel = events[0].monthLabel;
              const countLabel = `${events.length} ${pluralRu(events.length, 'событие', 'события', 'событий')}`;
              return (
                <div key={month} style={sp.monthGroup}>
                  <div style={sp.monthHeader}>
                    <span style={sp.monthLabel}>{monthLabel}</span>
                    <span style={sp.monthCount}>{countLabel}</span>
                  </div>
                  <div style={sp.list}>
                    {events.map(ev => (
                      <SchedEventCard key={ev.id} event={ev} />
                    ))}
                  </div>
                </div>
              );
            })
          )}

          {/* Waitlist nudge */}
          <div style={sp.waitlistCard} data-animate="sched-waitlist">
            <div style={sp.waitlistText}>
              <div style={sp.waitlistTitle}>Не нашли подходящую дату?</div>
              <div style={sp.waitlistSub}>
                Оставьте заявку — сообщим, когда откроется новое расписание или появятся свободные места.
              </div>
            </div>
            <a
              className="om-btn om-btn--secondary"
              href="booking.html"
              style={{ flexShrink: 0, textDecoration: 'none' }}
            >
              Оставить заявку
            </a>
          </div>

        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={sp.ctaBand}>
        <div style={sp.ctaInner}>
          <div style={sp.ctaEyebrow}>первый шаг</div>
          <h2 style={sp.ctaH2}>Не знаете, с&nbsp;чего начать?</h2>
          <p style={sp.ctaSub}>
            Мы подберём программу под ваш запрос и расскажем о ближайших датах — бесплатно.
          </p>
          <button className="om-btn om-btn--on-dark" style={{ fontSize: 16, padding: '18px 36px' }}>
            Получить консультацию
            <i data-lucide="arrow-up-right" className="om-icon-16"></i>
          </button>
        </div>
      </section>

    </React.Fragment>
  );
}

window.SchedulePage = SchedulePage;
