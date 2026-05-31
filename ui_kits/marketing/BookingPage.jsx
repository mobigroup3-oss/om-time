/* BookingPage.jsx — единая страница записи на программы OM Time.
   Многошаговая форма: программа → дата → личные данные → подтверждение.
   Пре-выбор программы через ?program=<id> в URL (так в неё попадают
   кнопки «Записаться» с других страниц сайта). */

const BOOKING_PROGRAMS = [
  {
    id: 'flagship-offline',
    tag: '4-дневный интенсив',
    tagClass: 'om-tag--gold',
    title: 'Вес идеальности',
    subtitle: 'с модификацией фигуры',
    description:
      'Авторская методика Татьяны Педас. Четыре дня глубокой работы с сознанием и&nbsp;два месяца сопровождения.',
    format: 'Офлайн, Алматы',
    duration: '4 дня по 3 часа + 2 месяца клуба',
    price: '160 000 ₸',
    priceNote: 'минус 15 000 ₸ при предоплате',
    accent: 'var(--om-gold)',
    icon: 'compass',
    featured: true,
  },
  {
    id: 'flagship-online',
    tag: 'Онлайн-интенсив',
    tagClass: 'om-tag--lilac',
    title: 'Вес идеальности ONLINE',
    subtitle: '4 прямых эфира',
    description:
      'Полная программа в&nbsp;онлайн-формате. Записи остаются у&nbsp;вас, чат поддержки на&nbsp;всё время сопровождения.',
    format: 'Онлайн, прямые эфиры',
    duration: '4 эфира по 2,5 часа + клуб',
    price: '90 000 ₸',
    accent: 'var(--om-indigo)',
    icon: 'monitor',
  },
  {
    id: 'club',
    tag: 'Клубный день',
    tagClass: 'om-tag--sage',
    title: 'Клубный день',
    subtitle: 'групповая сессия для участников',
    description:
      'Поддерживающая встреча для тех, кто уже прошёл интенсив. Закрепление навыков и&nbsp;работа с&nbsp;откатами.',
    format: 'Офлайн, Алматы',
    duration: '2 часа',
    price: '12 000 ₸',
    accent: 'var(--om-sage-deep)',
    icon: 'users',
  },
  {
    id: 'teen',
    tag: 'Подростки 12–17',
    tagClass: 'om-tag--coral',
    title: 'Подростковый клуб',
    subtitle: 'отношения с телом и питанием',
    description:
      'Бережная программа для девушек и&nbsp;юношей. Тело, пища, образ себя — без давления и&nbsp;диет.',
    format: 'Офлайн, Алматы',
    duration: '2 часа',
    price: '30 000 ₸',
    accent: 'var(--om-coral)',
    icon: 'sparkles',
  },
  {
    id: 'detox',
    tag: 'Онлайн · 10 дней',
    tagClass: 'om-tag--lilac',
    title: 'ONLINE DETOX',
    subtitle: '10 дней практик',
    description:
      'Короткий онлайн-курс: дыхательные техники, питание, отношения со&nbsp;стрессом. Старт по&nbsp;набору группы.',
    format: 'Онлайн',
    duration: '10 дней',
    price: '30 000 ₸',
    accent: 'var(--om-lilac)',
    icon: 'leaf',
  },
  {
    id: 'consult',
    tag: 'Бесплатно',
    tagClass: 'om-tag--gold',
    title: 'Первая консультация',
    subtitle: '40 минут с психологом',
    description:
      'Понять, подойдёт ли&nbsp;вам методика. Без обязательств — только разговор и&nbsp;подбор программы.',
    format: 'Онлайн или Алматы',
    duration: '40 минут',
    price: '0 ₸',
    priceNote: 'бесплатно, первичная встреча',
    accent: 'var(--om-sage)',
    icon: 'message-circle',
  },
];

const BOOKING_EVENTS = [
  { id: 'ev-1', programId: 'flagship-offline', dateLabel: '4–7 ноября 2025', time: '17:00–20:00', trainer: 'Татьяна Педас', spots: 3, total: 12 },
  { id: 'ev-2', programId: 'flagship-offline', dateLabel: '2–5 декабря 2025', time: '17:00–20:00', trainer: 'Татьяна Педас', spots: 8, total: 12 },
  { id: 'ev-3', programId: 'flagship-online', dateLabel: 'старт 19 ноября 2025', time: '19:00–21:30', trainer: 'Татьяна Педас', spots: 14, total: 30 },
  { id: 'ev-4', programId: 'flagship-online', dateLabel: 'старт 16 декабря 2025', time: '19:00–21:30', trainer: 'Татьяна Педас', spots: 22, total: 30 },
  { id: 'ev-5', programId: 'club', dateLabel: '10 ноября 2025', time: '19:00–21:00', trainer: 'Илья Брежнев', spots: null, total: null },
  { id: 'ev-6', programId: 'club', dateLabel: '18 ноября 2025', time: '19:00–21:00', trainer: 'Илья Брежнев', spots: null, total: null },
  { id: 'ev-7', programId: 'club', dateLabel: '24 ноября 2025', time: '19:00–21:00', trainer: 'Илья Брежнев', spots: null, total: null },
  { id: 'ev-8', programId: 'teen', dateLabel: '8 ноября 2025', time: '11:00–13:00', trainer: 'Наталья Лоскутникова', spots: 7, total: 15 },
  { id: 'ev-9', programId: 'teen', dateLabel: '22 ноября 2025', time: '11:00–13:00', trainer: 'Наталья Лоскутникова', spots: 11, total: 15 },
  { id: 'ev-10', programId: 'detox', dateLabel: 'старт 12 ноября 2025', time: 'гибкое расписание', trainer: 'Марина Енгерова', spots: null, total: null },
  { id: 'ev-11', programId: 'detox', dateLabel: 'старт 9 декабря 2025', time: 'гибкое расписание', trainer: 'Марина Енгерова', spots: null, total: null },
];

const BOOKING_PROMISES = [
  { icon: 'phone-call', text: 'Перезвоним в течение часа в рабочее время' },
  { icon: 'shield', text: 'Не передаём данные третьим лицам' },
  { icon: 'gift', text: 'Первая консультация — бесплатно' },
  { icon: 'refresh-cw', text: 'Можно перенести запись без штрафов до 48 часов' },
];

const BOOKING_FAQ = [
  {
    q: 'Что будет после отправки заявки?',
    a: 'Администратор перезвонит в&nbsp;течение часа в&nbsp;рабочее время (пн–пт 9:00–21:00). Уточнит формат, ответит на вопросы и&nbsp;закрепит за&nbsp;вами место.',
  },
  {
    q: 'Можно ли оплатить позже?',
    a: 'Место закрепляется по&nbsp;предоплате 30%. Полную сумму нужно внести не&nbsp;позднее, чем за&nbsp;48 часов до&nbsp;старта. Доступна рассрочка от&nbsp;банков-партнёров.',
  },
  {
    q: 'А если я не уверен, что мне подходит?',
    a: 'Выберите «Первая консультация» — это бесплатная встреча 40&nbsp;минут с&nbsp;психологом, на&nbsp;которой мы&nbsp;вместе решим, какая программа подходит и&nbsp;нужна&nbsp;ли она вообще.',
  },
];

const bk = {
  /* ── HERO ──────────────────────────────────────── */
  hero: {
    background: 'var(--om-canvas)',
    padding: '120px 0 80px',
    position: 'relative',
    overflow: 'hidden',
    borderBottom: '1px solid var(--om-hairline)',
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(60% 50% at 80% 30%, rgba(242,193,46,0.10) 0%, transparent 65%), radial-gradient(50% 40% at 10% 70%, rgba(192,58,59,0.06) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  heroInner: {
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: 64,
    alignItems: 'end',
  },
  heroEyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 11,
    letterSpacing: '0.24em',
    textTransform: 'uppercase',
    fontWeight: 500,
    color: 'var(--om-muted)',
    marginBottom: 24,
  },
  heroEyebrowLine: { width: 28, height: 1, background: 'currentColor', opacity: 0.5 },
  heroH1: {
    fontFamily: 'var(--om-font-sans)',
    fontSize: 'clamp(44px, 6vw, 84px)',
    fontWeight: 500,
    letterSpacing: '-0.03em',
    color: 'var(--om-ink)',
    lineHeight: 0.96,
    margin: '0 0 28px',
    maxWidth: '16ch',
  },
  heroSub: {
    fontSize: 18,
    lineHeight: 1.6,
    color: 'var(--om-muted)',
    maxWidth: '52ch',
    margin: '0 0 36px',
  },
  heroMeta: {
    display: 'flex',
    gap: 28,
    flexWrap: 'wrap',
    fontSize: 13,
    color: 'var(--om-muted)',
  },
  heroMetaItem: { display: 'inline-flex', alignItems: 'center', gap: 8 },
  heroMetaDot: {
    width: 7, height: 7, borderRadius: '50%',
    background: 'var(--om-coral)', flexShrink: 0,
  },

  heroCard: {
    background: 'var(--om-ink)',
    color: 'var(--om-on-indigo)',
    borderRadius: 'var(--om-radius-xl)',
    padding: '36px 32px',
    boxShadow: '0 40px 80px -20px rgba(27,24,64,0.35)',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  heroCardGlow: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(60% 50% at 100% 0%, rgba(242,193,46,0.22) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  heroCardLabel: {
    fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
    fontWeight: 500, color: 'var(--om-gold)',
  },
  heroCardH: {
    fontSize: 22, fontWeight: 500, lineHeight: 1.25,
    letterSpacing: '-0.01em', color: 'var(--om-on-indigo)',
    margin: 0,
  },
  heroCardList: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 },
  heroCardListItem: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    fontSize: 14, lineHeight: 1.5, color: 'rgba(251,248,242,0.85)',
  },
  heroCardListBullet: {
    width: 22, height: 22, borderRadius: '50%',
    background: 'rgba(242,193,46,0.18)',
    color: 'var(--om-gold)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 1,
  },

  /* ── STEPS BAND ───────────────────────────────── */
  stepsBand: {
    background: 'var(--om-canvas)',
    padding: '64px 0 96px',
    position: 'relative',
  },
  stepsInner: {
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
  },

  stepsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 24,
    marginBottom: 40,
  },
  stepsLabel: {
    fontFamily: 'var(--om-font-mono)',
    fontSize: 12,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--om-muted)',
  },
  stepsTrack: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 13,
    color: 'var(--om-muted)',
  },
  stepDot: {
    width: 26, height: 26,
    borderRadius: '50%',
    background: 'var(--om-canvas-white)',
    border: '1.5px solid var(--om-hairline)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--om-font-mono)',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--om-muted)',
    transition: 'all 220ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  stepDotActive: {
    background: 'var(--om-ink)',
    color: 'var(--om-canvas)',
    borderColor: 'var(--om-ink)',
  },
  stepDotDone: {
    background: 'var(--om-gold)',
    color: 'var(--om-on-gold)',
    borderColor: 'var(--om-gold)',
  },
  stepLine: { width: 36, height: 1, background: 'var(--om-hairline)' },

  stepsLayout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
    gap: 48,
    alignItems: 'start',
  },

  stepCard: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-xl)',
    padding: '40px 40px 36px',
    boxShadow: 'var(--om-shadow-card)',
  },
  stepEyebrow: {
    fontFamily: 'var(--om-font-mono)',
    fontSize: 11,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--om-coral-deep)',
    marginBottom: 12,
  },
  stepH2: {
    fontFamily: 'var(--om-font-sans)',
    fontSize: 'clamp(24px, 2.6vw, 34px)',
    fontWeight: 500,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    color: 'var(--om-ink)',
    margin: '0 0 12px',
    textWrap: 'balance',
  },
  stepSub: {
    fontSize: 15,
    color: 'var(--om-muted)',
    lineHeight: 1.55,
    margin: '0 0 32px',
    maxWidth: '54ch',
  },

  /* programs grid */
  programGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 14,
  },
  programCard: {
    background: 'var(--om-canvas)',
    border: '1.5px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-lg)',
    padding: '22px 22px 20px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    textAlign: 'left',
    fontFamily: 'var(--om-font-sans)',
    transition: 'all 220ms cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  },
  programCardSelected: {
    background: 'var(--om-canvas-white)',
    borderColor: 'var(--om-ink)',
    boxShadow: '0 0 0 4px rgba(27, 24, 64, 0.08), 0 14px 28px rgba(27, 24, 64, 0.10)',
  },
  programCardAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 3,
    transition: 'opacity 220ms',
  },
  programCardHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 4,
  },
  programIcon: {
    width: 36, height: 36, borderRadius: 'var(--om-radius-sm)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    background: 'var(--om-canvas-soft)',
    color: 'var(--om-ink)',
  },
  programTitle: {
    fontSize: 17,
    fontWeight: 500,
    color: 'var(--om-ink)',
    letterSpacing: '-0.01em',
    lineHeight: 1.25,
    margin: 0,
  },
  programSubtitle: {
    fontSize: 13,
    color: 'var(--om-muted)',
    fontFamily: 'var(--om-font-mono)',
    letterSpacing: '0.02em',
    margin: 0,
  },
  programDescription: {
    fontSize: 13,
    color: 'var(--om-body)',
    lineHeight: 1.55,
    margin: '6px 0 10px',
  },
  programMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 14,
    fontSize: 12,
    color: 'var(--om-muted)',
    fontFamily: 'var(--om-font-mono)',
    letterSpacing: '0.02em',
    paddingTop: 12,
    borderTop: '1px solid var(--om-hairline-soft)',
    marginTop: 'auto',
  },
  programMetaItem: { display: 'inline-flex', alignItems: 'center', gap: 6 },
  programPriceRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  programPrice: {
    fontFamily: 'var(--om-font-sans)',
    fontSize: 18,
    fontWeight: 500,
    color: 'var(--om-ink)',
    letterSpacing: '-0.01em',
  },
  programPriceNote: {
    fontSize: 11,
    color: 'var(--om-sage-deep)',
    fontFamily: 'var(--om-font-mono)',
    letterSpacing: '0.02em',
  },
  programChecked: {
    width: 24, height: 24, borderRadius: '50%',
    background: 'var(--om-ink)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  /* events list */
  eventsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  eventCard: {
    background: 'var(--om-canvas)',
    border: '1.5px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-lg)',
    padding: '20px 24px',
    cursor: 'pointer',
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gap: 24,
    alignItems: 'center',
    textAlign: 'left',
    fontFamily: 'var(--om-font-sans)',
    transition: 'all 220ms cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%',
  },
  eventCardSelected: {
    background: 'var(--om-canvas-white)',
    borderColor: 'var(--om-ink)',
    boxShadow: '0 0 0 4px rgba(27, 24, 64, 0.08)',
  },
  eventDate: {
    width: 64,
    background: 'var(--om-coral)',
    color: 'var(--om-on-coral)',
    borderRadius: 'var(--om-radius-md)',
    padding: '10px 8px',
    textAlign: 'center',
    flexShrink: 0,
  },
  eventDateD: {
    fontFamily: 'var(--om-font-sans)',
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '-0.03em',
    lineHeight: 1,
  },
  eventDateM: {
    fontFamily: 'var(--om-font-mono)',
    fontSize: 10,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontWeight: 600,
    marginTop: 3,
    opacity: 0.95,
  },
  eventBody: { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 },
  eventTitle: {
    fontSize: 15,
    fontWeight: 500,
    color: 'var(--om-ink)',
    letterSpacing: '-0.005em',
  },
  eventMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 14,
    fontSize: 12,
    color: 'var(--om-muted)',
    fontFamily: 'var(--om-font-mono)',
    letterSpacing: '0.02em',
  },
  eventMetaItem: { display: 'inline-flex', alignItems: 'center', gap: 6 },
  eventSpots: {
    fontSize: 11,
    fontFamily: 'var(--om-font-mono)',
    letterSpacing: '0.04em',
    color: 'var(--om-warning)',
    textTransform: 'uppercase',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
  },
  eventSpotsOk: { color: 'var(--om-sage-deep)' },
  eventEmpty: {
    background: 'var(--om-canvas-soft)',
    border: '1px dashed var(--om-hairline)',
    borderRadius: 'var(--om-radius-lg)',
    padding: '36px 32px',
    textAlign: 'center',
  },
  eventEmptyH: {
    fontFamily: 'var(--om-font-sans)',
    fontSize: 18,
    fontWeight: 500,
    color: 'var(--om-ink)',
    margin: '0 0 8px',
    letterSpacing: '-0.005em',
  },
  eventEmptyT: {
    fontSize: 14,
    color: 'var(--om-muted)',
    margin: 0,
    lineHeight: 1.55,
  },

  /* form */
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
  },
  formField: { display: 'flex', flexDirection: 'column', gap: 8 },
  formFieldFull: { gridColumn: '1 / -1' },
  formLabel: {
    fontSize: 12,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontWeight: 500,
    color: 'var(--om-ink)',
    fontFamily: 'var(--om-font-mono)',
  },
  formInput: {
    width: '100%',
    height: 50,
    background: 'var(--om-canvas)',
    border: '1.5px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-sm)',
    padding: '0 16px',
    fontSize: 15,
    color: 'var(--om-ink)',
    fontFamily: 'var(--om-font-sans)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  formInputFocused: {
    borderColor: 'var(--om-ink)',
    boxShadow: '0 0 0 4px rgba(27, 24, 64, 0.08)',
  },
  formTextarea: {
    width: '100%',
    minHeight: 110,
    background: 'var(--om-canvas)',
    border: '1.5px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-sm)',
    padding: '14px 16px',
    fontSize: 15,
    color: 'var(--om-ink)',
    fontFamily: 'var(--om-font-sans)',
    lineHeight: 1.55,
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  formHint: {
    fontSize: 12,
    color: 'var(--om-muted)',
    fontFamily: 'var(--om-font-sans)',
  },
  formError: {
    fontSize: 12,
    color: 'var(--om-danger)',
    fontFamily: 'var(--om-font-sans)',
    minHeight: 16,
  },
  segment: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    background: 'var(--om-canvas)',
    border: '1.5px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-sm)',
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    all: 'unset',
    cursor: 'pointer',
    padding: '12px 14px',
    borderRadius: 'var(--om-radius-xs)',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--om-muted)',
    transition: 'all 200ms',
  },
  segmentBtnActive: {
    background: 'var(--om-ink)',
    color: 'var(--om-canvas)',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    cursor: 'pointer',
    fontSize: 13,
    color: 'var(--om-muted)',
    lineHeight: 1.55,
  },
  checkboxBox: {
    width: 20, height: 20,
    borderRadius: 4,
    border: '1.5px solid var(--om-hairline)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--om-canvas)',
    transition: 'all 180ms',
    marginTop: 1,
  },
  checkboxBoxChecked: {
    background: 'var(--om-ink)',
    borderColor: 'var(--om-ink)',
    color: 'var(--om-canvas)',
  },

  /* nav */
  stepNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginTop: 36,
    flexWrap: 'wrap',
  },
  stepNavBack: {
    background: 'transparent',
    border: 'none',
    color: 'var(--om-muted)',
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: 'var(--om-font-sans)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 4px',
  },

  /* ── SUMMARY ───────────────────────────────── */
  summary: {
    position: 'sticky',
    top: 110,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  summaryCard: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-xl)',
    padding: '28px 28px 24px',
    boxShadow: 'var(--om-shadow-card)',
  },
  summaryEyebrow: {
    fontFamily: 'var(--om-font-mono)',
    fontSize: 11,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--om-gold-deep)',
    marginBottom: 16,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    padding: '14px 0',
    borderBottom: '1px solid var(--om-hairline-soft)',
  },
  summaryRowLast: { borderBottom: 'none' },
  summaryLabel: {
    fontSize: 12,
    color: 'var(--om-muted)',
    fontFamily: 'var(--om-font-mono)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 14,
    color: 'var(--om-ink)',
    fontWeight: 500,
    textAlign: 'right',
    maxWidth: '60%',
    lineHeight: 1.4,
  },
  summaryValueMuted: {
    color: 'var(--om-muted)',
    fontWeight: 400,
    fontStyle: 'italic',
  },
  summaryTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTop: '1.5px solid var(--om-ink)',
  },
  summaryTotalLabel: {
    fontSize: 13,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--om-ink)',
    fontWeight: 500,
  },
  summaryTotalValue: {
    fontFamily: 'var(--om-font-sans)',
    fontSize: 26,
    fontWeight: 500,
    color: 'var(--om-ink)',
    letterSpacing: '-0.01em',
  },
  summaryHelp: {
    background: 'var(--om-canvas-soft)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-lg)',
    padding: '20px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  summaryHelpH: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--om-ink)',
    margin: 0,
    letterSpacing: '-0.005em',
  },
  summaryHelpT: { fontSize: 13, color: 'var(--om-muted)', lineHeight: 1.5, margin: 0 },
  summaryHelpLinks: {
    display: 'flex',
    gap: 14,
    flexWrap: 'wrap',
    marginTop: 6,
  },
  summaryHelpLink: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--om-ink)',
    textDecoration: 'none',
    borderBottom: '1px solid var(--om-ink)',
    paddingBottom: 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  },

  /* ── SUCCESS ───────────────────────────────── */
  successCard: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-xl)',
    padding: '56px 48px',
    boxShadow: 'var(--om-shadow-card)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 18,
  },
  successIcon: {
    width: 84, height: 84,
    borderRadius: '50%',
    background: 'rgba(78,107,63,0.12)',
    color: 'var(--om-sage-deep)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successH: {
    fontFamily: 'var(--om-font-sans)',
    fontSize: 'clamp(26px, 3vw, 36px)',
    fontWeight: 500,
    letterSpacing: '-0.02em',
    color: 'var(--om-ink)',
    margin: 0,
    textWrap: 'balance',
  },
  successText: {
    fontSize: 16,
    lineHeight: 1.6,
    color: 'var(--om-muted)',
    maxWidth: '46ch',
    margin: 0,
  },
  successCode: {
    fontFamily: 'var(--om-font-mono)',
    fontSize: 13,
    letterSpacing: '0.12em',
    color: 'var(--om-coral-deep)',
    background: 'var(--om-canvas-soft)',
    padding: '8px 16px',
    borderRadius: 'var(--om-radius-pill)',
    marginTop: 4,
  },
  successRow: { display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 },

  /* ── REASSURANCE BAND ──────────────────────── */
  reass: {
    background: 'var(--om-canvas-soft)',
    padding: '80px 0',
  },
  reassInner: {
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
  },
  reassHead: { marginBottom: 40, display: 'flex', flexDirection: 'column', gap: 12 },
  reassH: {
    fontFamily: 'var(--om-font-sans)',
    fontSize: 'clamp(26px, 3vw, 38px)',
    fontWeight: 500,
    letterSpacing: '-0.02em',
    color: 'var(--om-ink)',
    margin: 0,
    maxWidth: '20ch',
    lineHeight: 1.05,
  },
  reassGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
  },
  reassCard: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-lg)',
    padding: '24px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  reassIcon: {
    width: 44, height: 44,
    borderRadius: 'var(--om-radius-sm)',
    background: 'var(--om-canvas)',
    border: '1px solid var(--om-hairline)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--om-coral-deep)',
  },
  reassText: { fontSize: 14, color: 'var(--om-body)', lineHeight: 1.5, margin: 0 },

  /* ── FAQ + ALT CONTACT ─────────────────────── */
  faqBand: { background: 'var(--om-canvas)', padding: '96px 0' },
  faqInner: {
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
    display: 'grid',
    gridTemplateColumns: '1fr 1.3fr',
    gap: 64,
    alignItems: 'start',
  },
  faqLeft: { display: 'flex', flexDirection: 'column', gap: 18 },
  faqH: {
    fontFamily: 'var(--om-font-sans)',
    fontSize: 'clamp(28px, 3vw, 42px)',
    fontWeight: 500,
    letterSpacing: '-0.02em',
    color: 'var(--om-ink)',
    margin: 0,
    lineHeight: 1.05,
    maxWidth: '14ch',
  },
  faqSub: {
    fontSize: 15,
    lineHeight: 1.6,
    color: 'var(--om-muted)',
    margin: 0,
    maxWidth: '36ch',
  },
  faqAltCard: {
    marginTop: 12,
    background: 'var(--om-canvas-soft)',
    borderRadius: 'var(--om-radius-lg)',
    padding: '22px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  faqAltH: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--om-ink)',
    margin: 0,
    letterSpacing: '0.02em',
  },
  faqAltLinks: { display: 'flex', flexDirection: 'column', gap: 10 },
  faqAltLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    color: 'var(--om-ink)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
  },
  faqAltIcon: {
    width: 36, height: 36,
    borderRadius: 'var(--om-radius-sm)',
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--om-ink)',
  },

  faqList: { display: 'flex', flexDirection: 'column', gap: 12 },
  faqItem: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-lg)',
    padding: '0',
    overflow: 'hidden',
  },
  faqQ: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    padding: '22px 26px',
    fontSize: 16,
    fontWeight: 500,
    color: 'var(--om-ink)',
    fontFamily: 'var(--om-font-sans)',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    letterSpacing: '-0.005em',
  },
  faqA: {
    padding: '0 26px 22px',
    fontSize: 14,
    lineHeight: 1.65,
    color: 'var(--om-body)',
  },
  faqToggle: {
    width: 28, height: 28, borderRadius: '50%',
    background: 'var(--om-canvas-soft)',
    color: 'var(--om-ink)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    transition: 'transform 220ms',
  },
};

/* ─────────────────────────────────────────────────────────── */
/* Helpers                                                     */
/* ─────────────────────────────────────────────────────────── */

function bookingReadInitialProgram() {
  // По требованию окно «Ваш выбор» всегда открывается пустым: программа
  // не предвыбирается из URL (?program=…), пользователь выбирает её сам.
  return null;
}

function parseEventDate(dateLabel) {
  const months = {
    'январ': '01', 'феврал': '02', 'март': '03', 'апрел': '04',
    'мая': '05', 'мае': '05', 'май': '05',
    'июн': '06', 'июл': '07', 'август': '08', 'сентябр': '09',
    'октябр': '10', 'ноябр': '11', 'декабр': '12',
  };
  const dayMatch = dateLabel.match(/(\d{1,2})/);
  const monthMatch = Object.keys(months).find(k => dateLabel.toLowerCase().includes(k));
  return {
    d: dayMatch ? dayMatch[1] : '—',
    m: monthMatch ? monthShort(months[monthMatch]) : '',
  };
}
function monthShort(num) {
  return ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'][parseInt(num, 10) - 1] || '';
}

/* ─────────────────────────────────────────────────────────── */
/* Sub-components                                              */
/* ─────────────────────────────────────────────────────────── */

function StepIndicator({ step }) {
  const steps = [
    { n: 1, label: 'Программа' },
    { n: 2, label: 'Дата' },
    { n: 3, label: 'Контакты' },
  ];
  return (
    <div style={bk.stepsTrack}>
      {steps.map((s, i) => {
        const isActive = step === s.n;
        const isDone = step > s.n;
        return (
          <React.Fragment key={s.n}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                ...bk.stepDot,
                ...(isActive ? bk.stepDotActive : {}),
                ...(isDone ? bk.stepDotDone : {}),
              }}>
                {isDone ? <i data-lucide="check" style={{ width: 14, height: 14 }} /> : s.n}
              </span>
              <span style={{
                fontFamily: 'var(--om-font-sans)',
                fontSize: 13,
                fontWeight: isActive || isDone ? 500 : 400,
                color: isActive ? 'var(--om-ink)' : isDone ? 'var(--om-ink)' : 'var(--om-muted)',
                letterSpacing: '0.01em',
              }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <span style={bk.stepLine} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function ProgramCard({ program, selected, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...bk.programCard,
        ...(selected ? bk.programCardSelected : {}),
        ...(hover && !selected ? { transform: 'translateY(-2px)', borderColor: 'var(--om-border-strong)' } : {}),
      }}
      data-animate="booking-program"
    >
      <span style={{ ...bk.programCardAccent, background: program.accent, opacity: selected ? 1 : 0.5 }} />

      <div style={bk.programCardHead}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ ...bk.programIcon, background: selected ? program.accent : 'var(--om-canvas-soft)', color: selected ? 'var(--om-on-gold)' : 'var(--om-ink)' }}>
            <i data-lucide={program.icon} style={{ width: 18, height: 18 }} />
          </div>
          <span className={`om-tag ${program.tagClass}`} style={{ fontSize: 11 }}>{program.tag}</span>
        </div>
        {selected && (
          <span style={bk.programChecked}>
            <i data-lucide="check" style={{ width: 14, height: 14 }} />
          </span>
        )}
      </div>

      <h3 style={bk.programTitle}>{program.title}</h3>
      <div style={bk.programSubtitle}>{program.subtitle}</div>
      <p style={bk.programDescription} dangerouslySetInnerHTML={{ __html: program.description }} />

      <div style={bk.programMeta}>
        <span style={bk.programMetaItem}><i data-lucide="map-pin" style={{ width: 12, height: 12 }} />{program.format}</span>
        <span style={bk.programMetaItem}><i data-lucide="clock" style={{ width: 12, height: 12 }} />{program.duration}</span>
      </div>

      <div style={bk.programPriceRow}>
        <span style={bk.programPrice}>{program.price}</span>
        {program.priceNote && <span style={bk.programPriceNote}>{program.priceNote}</span>}
      </div>
    </button>
  );
}

function EventCard({ event, program, selected, onClick }) {
  const dateObj = parseEventDate(event.dateLabel);
  const lowSpots = event.spots !== null && event.spots <= 5;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...bk.eventCard, ...(selected ? bk.eventCardSelected : {}) }}
      data-animate="booking-event"
    >
      <div style={{
        ...bk.eventDate,
        background: selected ? 'var(--om-ink)' : 'var(--om-coral)',
      }}>
        <div style={bk.eventDateD}>{dateObj.d}</div>
        <div style={bk.eventDateM}>{dateObj.m}</div>
      </div>
      <div style={bk.eventBody}>
        <div style={bk.eventTitle}>{event.dateLabel}</div>
        <div style={bk.eventMeta}>
          <span style={bk.eventMetaItem}><i data-lucide="clock" style={{ width: 12, height: 12 }} />{event.time}</span>
          <span style={bk.eventMetaItem}><i data-lucide="user" style={{ width: 12, height: 12 }} />{event.trainer}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        {event.spots !== null && (
          <span style={{ ...bk.eventSpots, ...(lowSpots ? {} : bk.eventSpotsOk) }}>
            <i data-lucide={lowSpots ? 'alert-circle' : 'check-circle-2'} style={{ width: 12, height: 12 }} />
            {lowSpots ? `осталось ${event.spots} мест` : `${event.spots} из ${event.total}`}
          </span>
        )}
        {selected && (
          <span style={bk.programChecked}>
            <i data-lucide="check" style={{ width: 14, height: 14 }} />
          </span>
        )}
      </div>
    </button>
  );
}

function TextField({ id, label, hint, type = 'text', value, placeholder, error, autoComplete, onChange, fullWidth }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ ...bk.formField, ...(fullWidth ? bk.formFieldFull : {}) }}>
      <label htmlFor={id} style={bk.formLabel}>{label}</label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={onChange}
        style={{
          ...bk.formInput,
          ...(focused ? bk.formInputFocused : {}),
          ...(error ? { borderColor: 'var(--om-danger)' } : {}),
        }}
      />
      {(hint || error) && (
        <span style={error ? bk.formError : bk.formHint}>{error || hint}</span>
      )}
    </div>
  );
}

function TextArea({ id, label, value, placeholder, hint, onChange }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ ...bk.formField, ...bk.formFieldFull }}>
      <label htmlFor={id} style={bk.formLabel}>{label}</label>
      <textarea
        id={id}
        value={value}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={onChange}
        style={{
          ...bk.formTextarea,
          ...(focused ? bk.formInputFocused : {}),
        }}
      />
      {hint && <span style={bk.formHint}>{hint}</span>}
    </div>
  );
}

function Segment({ value, options, onChange }) {
  return (
    <div style={bk.segment}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            ...bk.segmentBtn,
            ...(value === opt.value ? bk.segmentBtnActive : {}),
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = React.useState(0);
  return (
    <div style={bk.faqList}>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.q} style={bk.faqItem}>
            <button
              type="button"
              style={bk.faqQ}
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              aria-expanded={isOpen}
            >
              {item.q}
              <span style={{ ...bk.faqToggle, transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                <i data-lucide="plus" style={{ width: 14, height: 14 }} />
              </span>
            </button>
            {isOpen && (
              <div style={bk.faqA} dangerouslySetInnerHTML={{ __html: item.a }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Main page                                                   */
/* ─────────────────────────────────────────────────────────── */

function BookingPage() {
  const [step, setStep] = React.useState(1);
  const [programId, setProgramId] = React.useState(bookingReadInitialProgram());
  const [eventId, setEventId] = React.useState(null);
  const [form, setForm] = React.useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    format: '',
    comment: '',
    agree: true,
  });
  const [errors, setErrors] = React.useState({});
  const [submitted, setSubmitted] = React.useState(false);
  const [bookingCode, setBookingCode] = React.useState('');

  const selectedProgram = BOOKING_PROGRAMS.find(p => p.id === programId);
  const programEvents = programId ? BOOKING_EVENTS.filter(e => e.programId === programId) : [];
  const selectedEvent = BOOKING_EVENTS.find(e => e.id === eventId);

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  React.useEffect(() => {
    setEventId(null);
  }, [programId]);

  const isConsult = selectedProgram && selectedProgram.id === 'consult';
  const needsFormat = selectedProgram && selectedProgram.format.toLowerCase().includes('или');

  function goNext() {
    if (step === 1 && !programId) return;
    if (step === 2 && !isConsult && !eventId) return;
    setStep(s => Math.min(s + 1, 3));
    window.scrollTo({ top: document.querySelector('[data-booking-anchor]').offsetTop - 80, behavior: 'smooth' });
  }
  function goBack() {
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: document.querySelector('[data-booking-anchor]').offsetTop - 80, behavior: 'smooth' });
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Укажите ваше имя';
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) {
      e.phone = 'Укажите корректный телефон';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Проверьте e-mail';
    }
    if (needsFormat && !form.format) e.format = 'Выберите формат';
    if (!form.agree) e.agree = 'Нужно согласие на обработку данных';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Копия записи в личный кабинет («Мои записи», localStorage в этом браузере).
  function saveMyBooking(code) {
    try {
      const raw = localStorage.getItem('omtime.bookings.v1');
      const list = raw ? JSON.parse(raw) : [];
      const tone = selectedProgram ? (String(selectedProgram.tagClass || '').replace('om-tag--', '') || 'lilac') : 'lilac';
      list.unshift({
        id: code,
        title: selectedProgram ? selectedProgram.title : 'Запись',
        tone: tone,
        format: form.format || (selectedProgram ? selectedProgram.format : ''),
        date: selectedEvent ? selectedEvent.dateLabel : '',
        time: selectedEvent ? selectedEvent.time : (selectedProgram ? selectedProgram.duration : ''),
        trainer: selectedEvent ? selectedEvent.trainer : '',
        cancelled: false,
      });
      localStorage.setItem('omtime.bookings.v1', JSON.stringify(list));
    } catch (e) {}
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    // Локальный код — fallback, если сервер недоступен (открытый файл).
    let code = 'OM-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, programId, eventId }),
      });
      const data = await res.json();
      if (data && data.ok && data.code) {
        code = data.code;
      } else if (data && data.errors) {
        setErrors(data.errors);
        return;
      }
    } catch (e) { /* нет сервера — используем локальный код */ }
    saveMyBooking(code);
    setBookingCode(code);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reset() {
    setSubmitted(false);
    setStep(1);
    setProgramId(bookingReadInitialProgram());
    setEventId(null);
    setForm({ name: '', phone: '', email: '', city: '', format: '', comment: '', agree: true });
    setErrors({});
  }

  /* ─── Success view ─────────────────────── */
  if (submitted) {
    return (
      <React.Fragment>
        <section style={bk.hero}>
          <div style={bk.heroBg} aria-hidden="true" />
          <div style={{ maxWidth: 'var(--om-container-max)', margin: '0 auto', padding: '0 var(--om-container-pad)', position: 'relative' }}>
            <div style={bk.heroEyebrow}>
              <span style={bk.heroEyebrowLine} />
              Заявка отправлена
            </div>
            <h1 style={{ ...bk.heroH1, maxWidth: '20ch' }}>
              Спасибо. Мы&nbsp;<span style={{ color: 'var(--om-coral-deep)' }}>с вами&nbsp;свяжемся</span>
            </h1>
          </div>
        </section>

        <section style={{ background: 'var(--om-canvas)', padding: '64px 0 96px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 var(--om-container-pad)' }}>
            <div style={bk.successCard}>
              <div style={bk.successIcon}>
                <i data-lucide="check" style={{ width: 40, height: 40 }} />
              </div>
              <h2 style={bk.successH}>Заявка принята</h2>
              <p style={bk.successText}>
                {selectedProgram ? `«${selectedProgram.title}»` : 'Запись'}
                {selectedEvent ? ` — ${selectedEvent.dateLabel}` : ''}.
                Администратор позвонит на номер{' '}
                <strong style={{ color: 'var(--om-ink)' }}>{form.phone}</strong>{' '}
                в течение часа в рабочее время (пн–пт 9:00–21:00).
              </p>
              <div style={bk.successCode}>код заявки · {bookingCode}</div>
              <div style={bk.successRow}>
                <a href="index.html" className="om-btn om-btn--primary">
                  На главную
                  <i data-lucide="arrow-up-right" style={{ width: 16, height: 16 }} />
                </a>
                <button type="button" onClick={reset} className="om-btn om-btn--secondary">
                  Новая заявка
                </button>
              </div>
            </div>
          </div>
        </section>
      </React.Fragment>
    );
  }

  /* ─── Step content ─────────────────────── */

  let stepContent;
  if (step === 1) {
    stepContent = (
      <div style={bk.stepCard}>
        <div style={bk.stepEyebrow}>Шаг 01 · Выбор программы</div>
        <h2 style={bk.stepH2}>Что подходит вашему запросу?</h2>
        <p style={bk.stepSub}>
          Если сомневаетесь — выбирайте «Первая консультация». Это бесплатная встреча,
          на&nbsp;которой мы&nbsp;вместе подберём программу.
        </p>
        <div style={bk.programGrid} className="om-booking-prog-grid">
          {BOOKING_PROGRAMS.map(p => (
            <ProgramCard
              key={p.id}
              program={p}
              selected={programId === p.id}
              onClick={() => setProgramId(p.id)}
            />
          ))}
        </div>
        <div style={bk.stepNav}>
          <span style={{ fontSize: 13, color: 'var(--om-muted)' }}>
            {programId ? `Выбрано: ${selectedProgram.title}` : 'Выберите одну программу'}
          </span>
          <button
            type="button"
            className="om-btn om-btn--primary"
            disabled={!programId}
            onClick={goNext}
            style={!programId ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
          >
            Дальше — выбор даты
            <i data-lucide="arrow-right" style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    );
  } else if (step === 2) {
    if (isConsult) {
      stepContent = (
        <div style={bk.stepCard}>
          <div style={bk.stepEyebrow}>Шаг 02 · Удобное время</div>
          <h2 style={bk.stepH2}>Первая консультация — по&nbsp;договорённости</h2>
          <p style={bk.stepSub}>
            Администратор предложит несколько окон в&nbsp;течение ближайших 2–3 дней.
            Шаг можно пропустить — мы&nbsp;договоримся о&nbsp;времени по&nbsp;телефону.
          </p>
          <div style={bk.eventEmpty}>
            <div style={{ ...bk.programIcon, margin: '0 auto 12px', background: 'var(--om-gold-soft)' }}>
              <i data-lucide="calendar-clock" style={{ width: 22, height: 22 }} />
            </div>
            <h3 style={bk.eventEmptyH}>Выберем время в&nbsp;диалоге</h3>
            <p style={bk.eventEmptyT}>
              Это бесплатная консультация — нам важно, чтобы было удобно вам.
            </p>
          </div>
          <div style={bk.stepNav}>
            <button type="button" style={bk.stepNavBack} onClick={goBack}>
              <i data-lucide="arrow-left" style={{ width: 14, height: 14 }} />
              Назад
            </button>
            <button type="button" className="om-btn om-btn--primary" onClick={goNext}>
              Дальше — контакты
              <i data-lucide="arrow-right" style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      );
    } else {
      stepContent = (
        <div style={bk.stepCard}>
          <div style={bk.stepEyebrow}>Шаг 02 · Дата старта</div>
          <h2 style={bk.stepH2}>Выберите ближайшую дату</h2>
          <p style={bk.stepSub}>
            Если ни&nbsp;одна не&nbsp;подходит — нажмите «Подобрать другое время»,
            и&nbsp;администратор предложит варианты лично.
          </p>
          {programEvents.length > 0 ? (
            <div style={bk.eventsList}>
              {programEvents.map(ev => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  program={selectedProgram}
                  selected={eventId === ev.id}
                  onClick={() => setEventId(ev.id)}
                />
              ))}
            </div>
          ) : (
            <div style={bk.eventEmpty}>
              <h3 style={bk.eventEmptyH}>Ближайший набор формируется</h3>
              <p style={bk.eventEmptyT}>
                Перейдите дальше — администратор расскажет о&nbsp;планируемых датах
                и&nbsp;закрепит за&nbsp;вами место.
              </p>
            </div>
          )}
          <div style={bk.stepNav}>
            <button type="button" style={bk.stepNavBack} onClick={goBack}>
              <i data-lucide="arrow-left" style={{ width: 14, height: 14 }} />
              Назад
            </button>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="om-btn om-btn--ghost"
                onClick={() => { setEventId(null); goNext(); }}
              >
                Подобрать другое время
              </button>
              <button
                type="button"
                className="om-btn om-btn--primary"
                disabled={programEvents.length > 0 && !eventId}
                onClick={goNext}
                style={programEvents.length > 0 && !eventId ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
              >
                Дальше — контакты
                <i data-lucide="arrow-right" style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        </div>
      );
    }
  } else {
    stepContent = (
      <form onSubmit={handleSubmit} noValidate autoComplete="off" style={bk.stepCard}>
        <div style={bk.stepEyebrow}>Шаг 03 · Контактные данные</div>
        <h2 style={bk.stepH2}>Куда вам перезвонить?</h2>
        <p style={bk.stepSub}>
          Достаточно имени и&nbsp;телефона. Остальное — по&nbsp;желанию,
          поможет администратору лучше подготовиться к&nbsp;звонку.
        </p>

        <div className="om-resp-grid-2" style={bk.formGrid}>
          <TextField
            id="bk-name"
            label="Имя"
            placeholder="Как к вам обращаться"
            value={form.name}
            error={errors.name}
            autoComplete="off"
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            id="bk-phone"
            label="Телефон"
            type="tel"
            placeholder="+7 (___) ___-__-__"
            value={form.phone}
            error={errors.phone}
            autoComplete="off"
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />
          <TextField
            id="bk-email"
            label="E-mail (необязательно)"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            error={errors.email}
            hint="Пришлём программу и&nbsp;ссылку на оплату"
            autoComplete="off"
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            id="bk-city"
            label="Город (необязательно)"
            placeholder="Алматы, Астана..."
            value={form.city}
            autoComplete="off"
            onChange={e => setForm({ ...form, city: e.target.value })}
          />

          {needsFormat && (
            <div style={bk.formFieldFull}>
              <label style={{ ...bk.formLabel, marginBottom: 10, display: 'block' }}>Формат участия</label>
              <Segment
                value={form.format}
                options={[
                  { value: 'offline', label: 'Офлайн, Алматы' },
                  { value: 'online', label: 'Онлайн' },
                ]}
                onChange={v => setForm({ ...form, format: v })}
              />
              {errors.format && <span style={{ ...bk.formError, marginTop: 8 }}>{errors.format}</span>}
            </div>
          )}

          <TextArea
            id="bk-comment"
            label="Комментарий (необязательно)"
            placeholder="Расскажите коротко о запросе или задайте вопрос..."
            value={form.comment}
            onChange={e => setForm({ ...form, comment: e.target.value })}
          />

          <div style={bk.formFieldFull}>
            <label style={bk.checkboxRow}>
              <span style={{
                ...bk.checkboxBox,
                ...(form.agree ? bk.checkboxBoxChecked : {}),
              }}>
                {form.agree && <i data-lucide="check" style={{ width: 14, height: 14 }} />}
              </span>
              <span>
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={e => setForm({ ...form, agree: e.target.checked })}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                />
                Согласен на обработку персональных данных. Мы&nbsp;не&nbsp;передаём контакты
                третьим лицам и&nbsp;используем их&nbsp;только для связи по&nbsp;этой заявке.
              </span>
            </label>
            {errors.agree && <span style={{ ...bk.formError, marginTop: 6, display: 'block' }}>{errors.agree}</span>}
          </div>
        </div>

        <div style={bk.stepNav}>
          <button type="button" style={bk.stepNavBack} onClick={goBack}>
            <i data-lucide="arrow-left" style={{ width: 14, height: 14 }} />
            Назад
          </button>
          <button type="submit" className="om-btn om-btn--primary">
            Отправить заявку
            <i data-lucide="arrow-up-right" style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </form>
    );
  }

  /* ─── Render ─────────────────────────────── */

  return (
    <React.Fragment>
      {/* ── HERO ───────────────────────────────── */}
      <section style={bk.hero}>
        <div style={bk.heroBg} aria-hidden="true" />
        <div style={bk.heroInner} className="om-booking-hero-inner">
          <div data-animate="booking-hero">
            <div style={bk.heroEyebrow}>
              <span style={bk.heroEyebrowLine} />
              Запись · Алматы и&nbsp;онлайн
            </div>
            <h1 style={bk.heroH1}>
              Начнём{' '}
              <span style={{ color: 'var(--om-coral-deep)' }}>с вашего запроса</span>
            </h1>
            <p style={bk.heroSub}>
              Три коротких шага — программа, удобная дата и&nbsp;контакты.
              Дальше с&nbsp;вами свяжется администратор, ответит на&nbsp;вопросы
              и&nbsp;закрепит место в&nbsp;группе.
            </p>
            <div style={bk.heroMeta}>
              <span style={bk.heroMetaItem}>
                <span style={bk.heroMetaDot} />
                Перезваниваем в течение часа
              </span>
              <span style={bk.heroMetaItem}>
                <i data-lucide="shield-check" style={{ width: 14, height: 14, color: 'var(--om-sage-deep)' }} />
                Лицензированная клиническая методика
              </span>
            </div>
          </div>

          <div style={bk.heroCard} data-animate="booking-hero-card" className="om-booking-hero-card">
            <div style={bk.heroCardGlow} aria-hidden="true" />
            <div style={{ position: 'relative' }}>
              <div style={bk.heroCardLabel}>Что вас ждёт</div>
              <h3 style={{ ...bk.heroCardH, marginTop: 12 }}>
                Понятный план записи без&nbsp;скрытых шагов
              </h3>
              <div style={bk.heroCardList}>
                {[
                  'Выбираете программу и&nbsp;удобную дату',
                  'Оставляете телефон — администратор перезванивает',
                  'Подтверждаете участие, получаете программу на&nbsp;e-mail',
                  'Приходите на&nbsp;первую встречу — место за&nbsp;вами',
                ].map((t, i) => (
                  <div key={i} style={bk.heroCardListItem}>
                    <span style={bk.heroCardListBullet}>{i + 1}</span>
                    <span dangerouslySetInnerHTML={{ __html: t }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STEPS ──────────────────────────────── */}
      <section style={bk.stepsBand}>
        <div style={bk.stepsInner} data-booking-anchor>
          <div style={bk.stepsHeader}>
            <div style={bk.stepsLabel}>Запись на программу · {String(step).padStart(2, '0')} из 03</div>
            <StepIndicator step={step} />
          </div>

          <div style={bk.stepsLayout} className="om-booking-steps-layout">
            <div data-animate="booking-step">
              {stepContent}
            </div>

            <aside style={bk.summary} className="om-booking-summary">
              <div style={bk.summaryCard}>
                <div style={bk.summaryEyebrow}>Ваш выбор</div>

                <div style={bk.summaryRow}>
                  <span style={bk.summaryLabel}>Программа</span>
                  <span style={selectedProgram ? bk.summaryValue : { ...bk.summaryValue, ...bk.summaryValueMuted }}>
                    {selectedProgram ? selectedProgram.title : 'не выбрана'}
                  </span>
                </div>

                <div style={bk.summaryRow}>
                  <span style={bk.summaryLabel}>Формат</span>
                  <span style={selectedProgram ? bk.summaryValue : { ...bk.summaryValue, ...bk.summaryValueMuted }}>
                    {selectedProgram ? selectedProgram.format : '—'}
                  </span>
                </div>

                <div style={bk.summaryRow}>
                  <span style={bk.summaryLabel}>Дата</span>
                  <span style={selectedEvent ? bk.summaryValue : { ...bk.summaryValue, ...bk.summaryValueMuted }}>
                    {selectedEvent
                      ? `${selectedEvent.dateLabel} · ${selectedEvent.time}`
                      : isConsult ? 'по договорённости' : 'не выбрана'}
                  </span>
                </div>

                <div style={{ ...bk.summaryRow, ...bk.summaryRowLast }}>
                  <span style={bk.summaryLabel}>Длительность</span>
                  <span style={selectedProgram ? bk.summaryValue : { ...bk.summaryValue, ...bk.summaryValueMuted }}>
                    {selectedProgram ? selectedProgram.duration : '—'}
                  </span>
                </div>

                <div style={bk.summaryTotal}>
                  <span style={bk.summaryTotalLabel}>Итого</span>
                  <span style={bk.summaryTotalValue}>
                    {selectedProgram ? selectedProgram.price : '—'}
                  </span>
                </div>
                {selectedProgram && selectedProgram.priceNote && (
                  <div style={{
                    fontSize: 12, color: 'var(--om-sage-deep)', marginTop: 8,
                    fontFamily: 'var(--om-font-mono)', letterSpacing: '0.02em',
                    textAlign: 'right',
                  }}>
                    {selectedProgram.priceNote}
                  </div>
                )}
              </div>

              <div style={bk.summaryHelp}>
                <h4 style={bk.summaryHelpH}>Нужна помощь с выбором?</h4>
                <p style={bk.summaryHelpT}>
                  Администратор подскажет, какая программа подойдёт вашему запросу.
                </p>
                <div style={bk.summaryHelpLinks}>
                  <a href="tel:+77270000000" style={bk.summaryHelpLink}>
                    <i data-lucide="phone" style={{ width: 14, height: 14 }} />
                    Позвонить
                  </a>
                  <a href="https://wa.me/77270000000" style={bk.summaryHelpLink}>
                    <i data-lucide="message-circle" style={{ width: 14, height: 14 }} />
                    WhatsApp
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── REASSURANCE BAND ────────────────────── */}
      <section style={bk.reass}>
        <div style={bk.reassInner}>
          <div style={bk.reassHead}>
            <div className="om-eyebrow">Что мы обещаем</div>
            <h2 style={bk.reassH}>
              Запись —{' '}
              <span style={{ color: 'var(--om-coral-deep)' }}>без давления</span>
            </h2>
          </div>
          <div style={bk.reassGrid} className="om-booking-reass-grid">
            {BOOKING_PROMISES.map(p => (
              <div key={p.text} style={bk.reassCard} data-animate="booking-reass">
                <div style={bk.reassIcon}>
                  <i data-lucide={p.icon} style={{ width: 20, height: 20 }} />
                </div>
                <p style={bk.reassText}>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ + ALT CONTACT ──────────────────── */}
      <section style={bk.faqBand}>
        <div style={bk.faqInner} className="om-booking-faq-inner">
          <div style={bk.faqLeft}>
            <div className="om-eyebrow">Частые вопросы</div>
            <h2 style={bk.faqH}>Что обычно спрашивают перед записью</h2>
            <p style={bk.faqSub}>
              Если вашего вопроса нет — напишите в&nbsp;комментарии к&nbsp;заявке
              или свяжитесь с&nbsp;администратором напрямую.
            </p>

            <div style={bk.faqAltCard}>
              <h4 style={bk.faqAltH}>Прямые контакты</h4>
              <div style={bk.faqAltLinks}>
                <a href="tel:+77270000000" style={bk.faqAltLink}>
                  <span style={bk.faqAltIcon}>
                    <i data-lucide="phone" style={{ width: 16, height: 16 }} />
                  </span>
                  +7 (727) 000-00-00
                </a>
                <a href="https://wa.me/77270000000" style={bk.faqAltLink}>
                  <span style={bk.faqAltIcon}>
                    <i data-lucide="message-circle" style={{ width: 16, height: 16 }} />
                  </span>
                  WhatsApp
                </a>
                <a href="https://t.me/omtime_kz" style={bk.faqAltLink}>
                  <span style={bk.faqAltIcon}>
                    <i data-lucide="send" style={{ width: 16, height: 16 }} />
                  </span>
                  Telegram @omtime_kz
                </a>
              </div>
            </div>
          </div>

          <FaqAccordion items={BOOKING_FAQ} />
        </div>
      </section>
    </React.Fragment>
  );
}

window.BookingPage = BookingPage;
