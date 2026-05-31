/* ProgramsPage.jsx — каталог программ OM Time.
   Данные тянутся из /api/programs (источник правды — БД). Если запрос не удался
   (открытие файла локально без сервера) или БД пуста — рисуется SEED_PROGRAMS. */

const SEED_PROGRAMS = [
  {
    id: 'flagship',
    category: 'flagship',
    tag: '4-дневный интенсив',
    tagClass: 'om-tag--gold',
    title: 'Вес идеальности с модификацией фигуры',
    description: 'Флагманская авторская программа. Четыре дня интенсивной работы: нейропластика желудка, психомоделирующее дыхание, карта стройности и якорные техники. После — два месяца поддержки в закрытом чате с психологом.',
    includes: ['4 дня по 90–120 минут', '2 месяца сопровождения', 'Материалы и практики'],
    dates: '4–7 ноября, 17:00',
    trainer: 'Татьяна Педас',
    format: 'Офлайн, Алматы',
    price: '160 000 ₸',
    priceNote: '−15 000 ₸ при предоплате за 3–4 дня',
    capacity: 'осталось 3 места',
    featured: true,
  },
  {
    id: 'flagship-online',
    category: 'online',
    tag: 'Онлайн-интенсив',
    tagClass: 'om-tag--lilac',
    title: 'Вес идеальности ONLINE',
    description: 'Та же методика в онлайн-формате. Прямые эфиры, запись сессий, закрытый чат с психологом на два месяца. Подходит для тех, кто не в Алматы.',
    includes: ['4 прямых эфира', 'Доступ к записям', '2 месяца поддержки'],
    dates: 'старт 12 ноября',
    trainer: 'Татьяна Педас',
    format: 'Онлайн',
    price: '90 000 ₸',
  },
  {
    id: 'club',
    category: 'club',
    tag: 'Активация',
    tagClass: 'om-tag--sage',
    title: 'Клубный день',
    description: 'Двухчасовая встреча для выпускников программ. Углубление техник, групповая работа, ответы на вопросы. Помогает закрепить результат.',
    includes: ['2 часа групповой работы', 'Для выпускников', 'Практика техник'],
    dates: '10, 18, 21, 24 ноября, 19:00',
    trainer: 'Илья Брежнев',
    format: 'Офлайн',
    price: '12 000 ₸',
  },
  {
    id: 'teen',
    category: 'teen',
    tag: 'Подростки 12–17',
    tagClass: 'om-tag--coral',
    title: 'Подростковый клуб',
    description: 'Мягкая работа с пищевым поведением и самовосприятием для подростков. Игровые элементы, безопасная среда, фокус на уверенности.',
    includes: ['2 часа на встречу', 'Специальная методика', 'Темы: еда, тело, стресс'],
    dates: '8 и 22 ноября, 11:00–13:00',
    trainer: 'Наталья Лоскутникова',
    format: 'Офлайн',
    price: '30 000 ₸',
  },
  {
    id: 'detox',
    category: 'online',
    tag: 'Онлайн · 10 дней',
    tagClass: 'om-tag--lilac',
    title: 'ONLINE DETOX',
    description: 'Десятидневная программа детокса питания и сознания. Ежедневные практики, куратор в чате, чёткая структура без срывов.',
    includes: ['10 дней практик', 'Куратор в чате', 'Рацион + психотехники'],
    dates: 'старт 12 ноября',
    trainer: 'Марина Енгерова',
    format: 'Онлайн',
    price: '30 000 ₸',
  },
  {
    id: 'individual',
    category: 'individual',
    tag: 'Индивидуально',
    tagClass: '',
    title: 'Сессия с психологом',
    description: 'Персональная работа с любым специалистом центра. Разбор конкретного запроса, гибкое расписание.',
    includes: ['60–90 минут', 'Любой формат', 'Гибкое расписание'],
    dates: 'по договорённости',
    trainer: 'На выбор',
    format: 'Офлайн / Онлайн',
    price: 'от 25 000 ₸',
  },
];

const PROG_FILTERS = [
  { id: 'all', label: 'Все программы' },
  { id: 'flagship', label: 'Флагман' },
  { id: 'online', label: 'Онлайн' },
  { id: 'club', label: 'Клубный день' },
  { id: 'teen', label: 'Подростки' },
  { id: 'individual', label: 'Индивидуально' },
];

const PROG_FAQ = [
  {
    q: 'С чего начать, если я никогда не работала с психологом?',
    a: 'Начните с 4-дневного интенсива «Вес идеальности» — он даёт полную базу методики и двухмесячную поддержку. Если не уверены — оставьте заявку на бесплатную консультацию.',
  },
  {
    q: 'Можно ли пройти программу онлайн?',
    a: 'Да. «Вес идеальности ONLINE» и ONLINE DETOX полностью повторяют офлайн-содержание. Разница лишь в формате: прямые эфиры с доступом к записи.',
  },
  {
    q: 'Что входит в сопровождение после интенсива?',
    a: 'Закрытый чат с психологом на 2 месяца: ответы в течение 24 часов, разбор сложных ситуаций, дополнительные практики по запросу.',
  },
  {
    q: 'Есть ли рассрочка?',
    a: 'Да, рассрочка доступна для флагманского интенсива. Свяжитесь с нами в WhatsApp — подберём удобный формат оплаты.',
  },
  {
    q: 'Подходит ли программа при медицинских ограничениях?',
    a: 'Программа работает на уровне сознания, а не диеты. Тем не менее при серьёзных диагнозах рекомендуем предварительно проконсультироваться с лечащим врачом.',
  },
];

const pgStyles = {
  hero: {
    padding: '128px 0 80px',
    background: 'var(--om-canvas)',
    borderBottom: '1px solid var(--om-hairline)',
    position: 'relative',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(80% 60% at 80% 50%, rgba(242,193,46,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroInner: {
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
    position: 'relative',
  },
  heroCount: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 11,
    letterSpacing: '0.24em',
    textTransform: 'uppercase',
    fontWeight: 500,
    color: 'var(--om-muted)',
    marginBottom: 20,
  },
  heroCountDot: {
    width: 28,
    height: 1,
    background: 'currentColor',
    opacity: 0.5,
  },
  heroH1: {
    fontSize: 'clamp(52px, 8vw, 88px)',
    fontWeight: 500,
    letterSpacing: '-0.03em',
    color: 'var(--om-ink)',
    lineHeight: 0.92,
    margin: '0 0 28px',
  },
  heroH1Serif: {
    fontFamily: 'var(--om-font-sans)',
    fontWeight: 500,
    letterSpacing: '-0.03em',
  },
  heroSub: {
    fontSize: 18,
    color: 'var(--om-muted)',
    maxWidth: '56ch',
    lineHeight: 1.6,
    margin: 0,
  },

  catalog: {
    padding: '72px 0 96px',
    background: 'var(--om-canvas-white)',
  },
  catalogInner: {
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
  },

  filters: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 44,
  },
  chip: {
    padding: '9px 18px',
    borderRadius: 'var(--om-radius-pill)',
    background: 'var(--om-canvas)',
    border: '1px solid var(--om-hairline)',
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--om-body)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 180ms ease',
  },
  chipActive: {
    background: 'var(--om-ink)',
    color: '#fff',
    borderColor: 'var(--om-ink)',
  },

  featCard: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-lg)',
    padding: '36px 36px 36px 40px',
    marginBottom: 24,
    display: 'grid',
    gridTemplateColumns: '1fr 220px',
    gap: 48,
    alignItems: 'start',
    boxShadow: '0 2px 16px rgba(27,24,64,0.06), 0 0 0 1px rgba(27,24,64,0.04)',
    position: 'relative',
    overflow: 'hidden',
  },
  featAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    background: 'linear-gradient(180deg, var(--om-gold) 0%, var(--om-coral) 100%)',
  },
  featBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    background: 'var(--om-gold)',
    color: 'var(--om-on-gold)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '7px 18px',
    borderBottomLeftRadius: 12,
  },
  featTitle: {
    fontSize: 26,
    fontWeight: 500,
    color: 'var(--om-ink)',
    margin: '14px 0 12px',
    letterSpacing: '-0.01em',
    lineHeight: 1.25,
  },
  featDesc: {
    fontSize: 15,
    color: 'var(--om-body)',
    lineHeight: 1.65,
    maxWidth: '64ch',
    margin: '0 0 20px',
  },
  featMeta: {
    display: 'flex',
    gap: 22,
    flexWrap: 'wrap',
    fontSize: 13,
    color: 'var(--om-muted)',
    marginBottom: 18,
  },
  featMetaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  featIncludes: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  featIncludeChip: {
    fontSize: 12,
    background: 'var(--om-canvas)',
    border: '1px solid var(--om-hairline)',
    padding: '5px 12px',
    borderRadius: 'var(--om-radius-pill)',
    color: 'var(--om-body)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  },
  featRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 10,
    paddingTop: 28,
  },
  featPrice: {
    fontFamily: 'var(--om-font-mono)',
    fontSize: 28,
    fontWeight: 500,
    color: 'var(--om-ink)',
    textAlign: 'right',
    lineHeight: 1,
  },
  featPriceNote: {
    fontSize: 12,
    color: 'var(--om-sage-deep)',
    textAlign: 'right',
    maxWidth: 180,
    lineHeight: 1.4,
  },
  featCapacity: {
    fontSize: 12,
    color: 'var(--om-warning)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '56px 0',
    color: 'var(--om-muted)',
    fontSize: 16,
  },

  card: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-lg)',
    padding: 26,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    boxShadow: '0 1px 6px rgba(27,24,64,0.04)',
    transition: 'transform 0.26s cubic-bezier(0,0,0.2,1), box-shadow 0.26s cubic-bezier(0,0,0.2,1)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 500,
    color: 'var(--om-ink)',
    lineHeight: 1.3,
    margin: 0,
  },
  cardDesc: {
    fontSize: 14,
    color: 'var(--om-body)',
    lineHeight: 1.65,
    margin: 0,
    flexGrow: 1,
  },
  cardMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    fontSize: 13,
    color: 'var(--om-muted)',
  },
  cardMetaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  cardIncludes: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    padding: '14px 0',
    borderTop: '1px solid var(--om-hairline-soft)',
    borderBottom: '1px solid var(--om-hairline-soft)',
  },
  cardIncludeItem: {
    fontSize: 13,
    color: 'var(--om-body)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    lineHeight: 1.4,
  },
  cardFoot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 'auto',
  },
  cardPrice: {
    fontFamily: 'var(--om-font-mono)',
    fontSize: 20,
    fontWeight: 500,
    color: 'var(--om-ink)',
  },
  cardPriceNote: {
    fontSize: 11,
    color: 'var(--om-sage-deep)',
    marginTop: 2,
  },

  faqBand: {
    padding: '80px 0',
    background: 'var(--om-canvas-soft)',
  },
  faqInner: {
    maxWidth: 760,
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
  },
  faqH2: {
    fontSize: 40,
    fontWeight: 500,
    letterSpacing: '-0.02em',
    color: 'var(--om-ink)',
    margin: '0 0 40px',
  },
  faqItem: {
    borderBottom: '1px solid var(--om-hairline)',
  },
  faqBtn: {
    fontSize: 16,
    fontWeight: 500,
    color: 'var(--om-ink)',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    lineHeight: 1.4,
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    padding: '22px 0',
    fontFamily: 'inherit',
  },
  faqA: {
    fontSize: 15,
    color: 'var(--om-body)',
    lineHeight: 1.7,
    paddingBottom: 22,
    paddingRight: 40,
    margin: 0,
  },

  ctaBand: {
    padding: '96px 0',
    background: 'var(--om-indigo-deep)',
    textAlign: 'center',
  },
  ctaInner: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  ctaEyebrow: {
    fontSize: 11,
    letterSpacing: '0.24em',
    textTransform: 'uppercase',
    color: 'var(--om-gold)',
    fontWeight: 500,
  },
  ctaH2: {
    fontSize: 44,
    fontWeight: 500,
    letterSpacing: '-0.025em',
    margin: 0,
    lineHeight: 1.1,
    color: 'var(--om-on-indigo)',
  },
  ctaSub: {
    fontSize: 17,
    color: 'rgba(251,248,242,0.7)',
    lineHeight: 1.6,
    maxWidth: '44ch',
    margin: 0,
  },
};

function ProgFeaturedCard({ program: p }) {
  return (
    <div className="om-resp-featured" style={pgStyles.featCard} data-animate="prog-featured">
      <div style={pgStyles.featAccent}></div>
      <div style={pgStyles.featBadge}>Флагман</div>
      <div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`om-tag ${p.tagClass}`}>{p.tag}</span>
          {p.capacity && (
            <span style={pgStyles.featCapacity}>
              <i data-lucide="alert-circle" style={{ width: 12, height: 12 }}></i>
              {p.capacity}
            </span>
          )}
        </div>
        <h2 style={pgStyles.featTitle}>{p.title}</h2>
        <p style={pgStyles.featDesc}>{p.description}</p>
        <div style={pgStyles.featMeta}>
          <span style={pgStyles.featMetaItem}>
            <i data-lucide="calendar-days" style={{ width: 14, height: 14 }}></i>
            {p.dates}
          </span>
          <span style={pgStyles.featMetaItem}>
            <i data-lucide="user-round" style={{ width: 14, height: 14 }}></i>
            {p.trainer}
          </span>
          <span style={pgStyles.featMetaItem}>
            <i data-lucide="map-pin" style={{ width: 14, height: 14 }}></i>
            {p.format}
          </span>
        </div>
        <div style={pgStyles.featIncludes}>
          {p.includes.map(inc => (
            <span key={inc} style={pgStyles.featIncludeChip}>
              <i data-lucide="check" style={{ width: 12, height: 12, color: 'var(--om-sage-deep)' }}></i>
              {inc}
            </span>
          ))}
        </div>
      </div>
      <div style={pgStyles.featRight}>
        <div style={pgStyles.featPrice}>{p.price}</div>
        {p.priceNote && <div style={pgStyles.featPriceNote}>{p.priceNote}</div>}
        <a
          className="om-btn om-btn--primary"
          href={`booking.html?program=${p.id === 'flagship' ? 'flagship-offline' : p.id === 'individual' ? 'consult' : p.id}`}
          style={{ fontSize: 15, padding: '14px 26px', width: '100%', justifyContent: 'center', textDecoration: 'none' }}
        >
          Записаться
          <i data-lucide="arrow-up-right" className="om-icon-16"></i>
        </a>
        <button className="om-btn om-btn--secondary" style={{ fontSize: 14, padding: '11px 20px', width: '100%', justifyContent: 'center' }}>
          Подробнее
        </button>
      </div>
    </div>
  );
}

function ProgCard({ program: p }) {
  const iconName = p.format && p.format.toLowerCase().includes('онлайн') ? 'monitor' : 'map-pin';
  return (
    <div
      style={pgStyles.card}
      data-animate="prog-card"
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(27,24,64,0.10)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 6px rgba(27,24,64,0.04)'; }}
    >
      <div>
        <span className={`om-tag ${p.tagClass}`}>{p.tag}</span>
      </div>
      <h3 style={pgStyles.cardTitle}>{p.title}</h3>
      <p style={pgStyles.cardDesc}>{p.description}</p>
      <div style={pgStyles.cardMeta}>
        <span style={pgStyles.cardMetaItem}>
          <i data-lucide="calendar-days" style={{ width: 14, height: 14 }}></i>
          {p.dates}
        </span>
        <span style={pgStyles.cardMetaItem}>
          <i data-lucide="user-round" style={{ width: 14, height: 14 }}></i>
          {p.trainer}
        </span>
        <span style={pgStyles.cardMetaItem}>
          <i data-lucide={iconName} style={{ width: 14, height: 14 }}></i>
          {p.format}
        </span>
      </div>
      <div style={pgStyles.cardIncludes}>
        {p.includes.map(inc => (
          <div key={inc} style={pgStyles.cardIncludeItem}>
            <i data-lucide="check" style={{ width: 13, height: 13, color: 'var(--om-sage-deep)', flexShrink: 0 }}></i>
            {inc}
          </div>
        ))}
      </div>
      <div style={pgStyles.cardFoot}>
        <div>
          <div style={pgStyles.cardPrice}>{p.price}</div>
          {p.priceNote && <div style={pgStyles.cardPriceNote}>{p.priceNote}</div>}
        </div>
        <a
          className="om-btn om-btn--primary"
          href={`booking.html?program=${p.id === 'flagship' ? 'flagship-offline' : p.id === 'individual' ? 'consult' : p.id}`}
          style={{ fontSize: 13, padding: '10px 18px', textDecoration: 'none' }}
        >
          Записаться
        </a>
      </div>
    </div>
  );
}

function ProgFaqItem({ item, isOpen, onToggle }) {
  return (
    <div style={pgStyles.faqItem}>
      <button style={pgStyles.faqBtn} onClick={onToggle}>
        <span>{item.q}</span>
        <i data-lucide={isOpen ? 'minus' : 'plus'} style={{ width: 18, height: 18, flexShrink: 0 }}></i>
      </button>
      {isOpen && <p style={pgStyles.faqA}>{item.a}</p>}
    </div>
  );
}

// Канонический объект из /api/programs → render-форма этой страницы.
function progFromApi(c) {
  const num = (c.price == null || c.price === '') ? '' : Number(c.price).toLocaleString('ru-RU') + ' ₸';
  const price = [c.pricePrefix, num].filter(Boolean).join(' ').trim();
  return {
    id: c.id,
    category: c.category,
    tag: c.tag,
    tagClass: c.tagClass,
    title: c.title,
    description: c.descr,
    includes: c.includes || [],
    dates: c.dates,
    trainer: c.trainer,
    format: c.formatLabel,
    price: price,
    priceNote: c.priceNote,
    capacity: c.capacityNote,
    featured: c.featured,
  };
}

function ProgramsPage() {
  const [filter, setFilter] = React.useState('all');
  const [openFaq, setOpenFaq] = React.useState(null);
  const [programs, setPrograms] = React.useState(SEED_PROGRAMS);

  React.useEffect(() => {
    let alive = true;
    fetch('/api/programs')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(j => { if (alive && j && j.ok && j.data && j.data.length) setPrograms(j.data.map(progFromApi)); })
      .catch(() => {}); // fallback на SEED_PROGRAMS
    return () => { alive = false; };
  }, []);

  const showFeaturedBanner = filter === 'all';
  const gridPrograms = filter === 'all'
    ? programs.filter(p => !p.featured)
    : programs.filter(p => p.category === filter);

  const featuredProgram = programs.find(p => p.featured);

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  return (
    <React.Fragment>
      {/* Hero */}
      <section style={pgStyles.hero} id="programs-hero">
        <div style={pgStyles.heroBg}></div>
        <div style={pgStyles.heroInner} data-animate="prog-hero">
          <div style={pgStyles.heroCount}>
            <span style={pgStyles.heroCountDot}></span>
            каталог · {programs.length} программ
          </div>
          <h1 style={pgStyles.heroH1}>
            Программы<br />
            <span style={pgStyles.heroH1Serif}>OM Time</span>
          </h1>
          <p style={pgStyles.heroSub}>
            От 2-часового клубного дня до 4-дневного интенсива с двухмесячным сопровождением
          </p>
        </div>
      </section>

      {/* Catalog */}
      <section style={pgStyles.catalog}>
        <div style={pgStyles.catalogInner}>
          {/* Filters */}
          <div style={pgStyles.filters}>
            {PROG_FILTERS.map(f => (
              <button
                key={f.id}
                style={{ ...pgStyles.chip, ...(filter === f.id ? pgStyles.chipActive : {}) }}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Featured banner */}
          {showFeaturedBanner && <ProgFeaturedCard program={featuredProgram} />}

          {/* Grid */}
          <div className="om-resp-grid-3" style={pgStyles.grid}>
            {gridPrograms.length === 0 ? (
              <div style={pgStyles.emptyState}>Нет программ в этой категории</div>
            ) : (
              gridPrograms.map(p => <ProgCard key={p.id} program={p} />)
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={pgStyles.faqBand}>
        <div style={pgStyles.faqInner}>
          <h2 style={pgStyles.faqH2}>Часто спрашивают</h2>
          {PROG_FAQ.map((item, i) => (
            <ProgFaqItem
              key={i}
              item={item}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={pgStyles.ctaBand}>
        <div style={pgStyles.ctaInner}>
          <div style={pgStyles.ctaEyebrow}>бесплатно</div>
          <h2 style={pgStyles.ctaH2}>Не знаете, с&nbsp;чего начать?</h2>
          <p style={pgStyles.ctaSub}>
            Оставьте заявку — мы подберём программу под ваш запрос и расскажем о ближайших датах.
          </p>
          <a
            className="om-btn om-btn--on-dark"
            href="booking.html?program=consult"
            style={{ fontSize: 16, padding: '18px 36px', textDecoration: 'none' }}
          >
            Получить консультацию
            <i data-lucide="arrow-up-right" className="om-icon-16"></i>
          </a>
        </div>
      </section>
    </React.Fragment>
  );
}

window.ProgramsPage = ProgramsPage;
