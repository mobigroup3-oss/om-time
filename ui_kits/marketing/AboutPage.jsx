/* AboutPage.jsx — страница «О центре» OM Time */

const TIMELINE = [
  {
    year: '2017',
    title: 'Центр открылся',
    text: 'Первый интенсив «Вес идеальности» — 8 участников. Татьяна Педас начинает практическую апробацию авторской методики в Алматы.',
    current: false,
  },
  {
    year: '2018',
    title: 'Клинические исследования',
    text: 'Первые задокументированные результаты: −8–14 кг за месяц, снижение ИМТ на 2–3 пункта. Формируется протокол и доказательная база.',
    current: false,
  },
  {
    year: '2019',
    title: 'Медицинская лицензия',
    text: 'Методика проходит лицензирование как медицинская. Первые сертифицированные тренеры — Татьяна Педас, Инна Натх, Илья Брежнев.',
    current: false,
  },
  {
    year: '2021',
    title: '1 000 участников',
    text: 'Тысячный участник. Запуск онлайн-форматов — методика становится доступной из любой страны. Старт подросткового клуба.',
    current: false,
  },
  {
    year: '2023',
    title: 'Одобрение Академии питания',
    text: 'Методика одобрена Казахстанской Академией питания. Расширение команды до 8 специалистов. Запуск программы для женщин в менопаузе.',
    current: false,
  },
  {
    year: '2025',
    title: '4 000 историй',
    text: 'Более 4 000 участников прошли программы OM Time. 93% показывают снижение ИМТ. Начало разработки цифровой платформы сопровождения.',
    current: true,
  },
];

const PILLARS = [
  {
    num: '01',
    icon: 'brain',
    title: 'Психосоматика',
    tag: 'Психика',
    tagClass: 'om-tag--lilac',
    text: 'Лишний вес — ответ тела на психологические состояния: тревогу, стресс, незакрытые потребности. Методика работает с психологическими причинами, а не с симптомами.',
  },
  {
    num: '02',
    icon: 'zap',
    title: 'Нейропластика',
    tag: 'Физиология',
    tagClass: 'om-tag--gold',
    text: 'Через медитативные техники физиологически уменьшается объём желудка на 30–40%. Мозг формирует новые нейронные связи — без операций, без препаратов.',
  },
  {
    num: '03',
    icon: 'wind',
    title: 'Дыхательные практики',
    tag: 'Клеточный уровень',
    tagClass: 'om-tag--sage',
    text: 'Психомоделирующее дыхание активирует расщепление жиров на клеточном уровне. Тело начинает использовать жировые запасы как основной источник энергии.',
  },
];

const EVIDENCE = [
  { num: '93', unit: '%', label: 'участников снижают ИМТ на 2–3 пункта', note: 'Данные клинических исследований методики' },
  { num: '15', prefix: 'до ', unit: ' см', label: 'уменьшение талии за первый месяц', note: 'По данным измерений' },
  { num: '40', prefix: 'до ', unit: '%', label: 'уменьшение объёма желудка', note: 'Нейропластика без операций' },
  { num: '100', unit: '%', label: 'нормализация сахара при преддиабете', note: 'По участникам с преддиабетом' },
];

const VALUES = [
  {
    icon: 'target',
    title: 'Работаем с причиной',
    text: 'Не ограничения в еде, а работа с тем, что запускает переедание. Без диет, без подсчёта калорий.',
  },
  {
    icon: 'shield-check',
    title: 'Доказательная база',
    text: 'Все техники — на основе КПТ, соматических и нейропластических методов с клинически подтверждёнными результатами.',
  },
  {
    icon: 'users',
    title: 'Долгосрочное сопровождение',
    text: 'Два месяца поддержки после интенсива. Психолог в закрытом чате — самый уязвимый период не остаётся без внимания.',
  },
  {
    icon: 'message-circle',
    title: 'Говорим честно',
    text: 'Методика не для всех — и мы об этом прямо говорим. Прямой разговор о противопоказаниях работает на доверие.',
  },
];

/* ── Inline style constants ────────────────────────────────── */
const ab = {
  /* Hero */
  hero: {
    background: 'var(--om-canvas)',
    padding: '128px 0 96px',
    position: 'relative',
    overflow: 'hidden',
    borderBottom: '1px solid var(--om-hairline)',
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(70% 55% at 90% 50%, rgba(242,193,46,0.07) 0%, transparent 60%), radial-gradient(50% 50% at 10% 80%, rgba(192,58,59,0.05) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  heroYear: {
    position: 'absolute',
    right: 'var(--om-container-pad)',
    top: '50%',
    transform: 'translateY(-50%)',
    fontFamily: 'var(--om-font-sans)',
    fontWeight: 500,
    fontSize: 'clamp(160px, 18vw, 260px)',
    lineHeight: 1,
    letterSpacing: '-0.04em',
    color: 'transparent',
    WebkitTextStroke: '1px rgba(27,24,64,0.06)',
    userSelect: 'none',
    pointerEvents: 'none',
  },
  heroInner: {
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
    position: 'relative',
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
  heroEyebrowLine: { width: 28, height: 1, background: 'currentColor', opacity: 0.5, flexShrink: 0 },
  heroH1: {
    fontFamily: 'var(--om-font-sans)',
    fontSize: 'clamp(44px, 6vw, 88px)',
    fontWeight: 500,
    letterSpacing: '-0.03em',
    color: 'var(--om-ink)',
    lineHeight: 0.95,
    margin: '0 0 32px',
    maxWidth: '20ch',
    textWrap: 'balance',
  },
  heroSub: {
    fontSize: 18,
    lineHeight: 1.62,
    color: 'var(--om-muted)',
    maxWidth: '56ch',
    margin: '0 0 52px',
  },
  heroStats: { display: 'flex', flexWrap: 'wrap', gap: 0 },
  heroStat: { display: 'flex', flexDirection: 'column', gap: 5, paddingRight: 32 },
  heroStatNum: { fontSize: 26, fontWeight: 500, color: 'var(--om-ink)', letterSpacing: '-0.025em', lineHeight: 1 },
  heroStatLabel: { fontSize: 13, color: 'var(--om-muted)' },
  heroStatDiv: { width: 1, height: 34, background: 'var(--om-hairline)', marginRight: 32, flexShrink: 0, alignSelf: 'center' },

  /* Mission */
  mission: { background: 'var(--om-cream)', padding: '96px 0' },
  missionInner: { maxWidth: 'var(--om-container-max)', margin: '0 auto', padding: '0 var(--om-container-pad)', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 80, alignItems: 'start' },
  missionLabel: { paddingTop: 8 },
  missionQ: {
    fontFamily: 'var(--om-font-editorial)',
    fontSize: 'clamp(24px, 2.8vw, 36px)',
    lineHeight: 1.4,
    color: 'var(--om-ink)',
    margin: '0 0 36px',
    fontStyle: 'normal',
    maxWidth: '68ch',
  },
  missionBody: { fontSize: 17, lineHeight: 1.68, color: 'var(--om-body)', margin: 0, maxWidth: '64ch' },

  /* Pillars */
  pillars: { background: 'var(--om-canvas-white)', padding: '96px 0' },
  pillarsInner: { maxWidth: 'var(--om-container-max)', margin: '0 auto', padding: '0 var(--om-container-pad)' },
  pillarsHead: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'end', marginBottom: 64 },
  pillarsH2: { fontFamily: 'var(--om-font-sans)', fontSize: 'clamp(32px, 3.6vw, 48px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--om-ink)', margin: 0, lineHeight: 1.05 },
  pillarsSub: { fontSize: 16, lineHeight: 1.6, color: 'var(--om-muted)', margin: 0, maxWidth: '36ch' },
  pillarsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  pillarCard: {
    background: 'var(--om-canvas)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-xl)',
    padding: '40px 36px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  pillarIcon: {
    width: 52, height: 52,
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--om-ink)',
  },
  pillarTitle: { fontSize: 22, fontWeight: 500, color: 'var(--om-ink)', margin: 0, letterSpacing: '-0.01em' },
  pillarText: { fontSize: 15, lineHeight: 1.65, color: 'var(--om-body)', margin: 0, flexGrow: 1 },

  /* Timeline */
  timeline: { background: 'var(--om-indigo-deep)', padding: '96px 0', position: 'relative', overflow: 'hidden' },
  timelineBg: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(55% 40% at 90% 20%, rgba(242,193,46,0.10) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  timelineInner: { maxWidth: 'var(--om-container-max)', margin: '0 auto', padding: '0 var(--om-container-pad)', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, alignItems: 'start', position: 'relative' },
  timelineLeft: {},
  timelineEyebrow: { fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--om-gold)', marginBottom: 20, display: 'block' },
  timelineH2: { fontFamily: 'var(--om-font-sans)', fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 500, letterSpacing: '-0.025em', color: 'var(--om-on-indigo)', margin: '0 0 20px', lineHeight: 1.05 },
  timelineSub: { fontSize: 16, lineHeight: 1.6, color: 'rgba(251,248,242,0.65)', margin: 0 },
  tlYear: { fontFamily: 'var(--om-font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--om-gold)', letterSpacing: '0.08em', marginBottom: 8, display: 'block' },
  tlTitle: { fontFamily: 'var(--om-font-sans)', fontSize: 18, fontWeight: 500, color: 'var(--om-on-indigo)', margin: '0 0 8px', letterSpacing: '-0.01em' },
  tlText: { fontSize: 15, lineHeight: 1.65, color: 'rgba(251,248,242,0.72)', margin: 0 },
  tlCurrentTag: {
    display: 'inline-block',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    background: 'var(--om-gold)',
    color: 'var(--om-on-gold)',
    padding: '3px 10px',
    borderRadius: '999px',
    marginBottom: 6,
  },

  /* Evidence */
  evidence: { background: 'var(--om-indigo-deep)', padding: '0 0 96px', position: 'relative' },
  evidenceInner: { maxWidth: 'var(--om-container-max)', margin: '0 auto', padding: '0 var(--om-container-pad)' },
  evNum: { fontFamily: 'var(--om-font-sans)', fontWeight: 500, fontSize: 'clamp(52px, 6vw, 88px)', lineHeight: 0.9, letterSpacing: '-0.04em', color: 'var(--om-gold)', display: 'flex', alignItems: 'baseline', gap: 2 },
  evUnit: { fontSize: '0.38em', color: 'var(--om-gold)', opacity: 0.9, letterSpacing: 0 },
  evPrefix: { fontSize: '0.32em', color: 'var(--om-gold)', opacity: 0.85, letterSpacing: 0, marginRight: 6, alignSelf: 'center' },
  evLabel: { fontSize: 15, lineHeight: 1.5, color: 'rgba(251,248,242,0.85)', margin: '16px 0 8px', fontWeight: 500 },
  evNote: { fontSize: 11, color: 'rgba(251,248,242,0.45)', letterSpacing: '0.04em', margin: 0 },

  /* Values */
  values: { background: 'var(--om-canvas-soft)', padding: '96px 0' },
  valuesInner: { maxWidth: 'var(--om-container-max)', margin: '0 auto', padding: '0 var(--om-container-pad)' },
  valuesHead: { marginBottom: 56 },
  valuesH2: { fontFamily: 'var(--om-font-sans)', fontSize: 'clamp(32px, 3.6vw, 48px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--om-ink)', margin: '12px 0 0', lineHeight: 1.05 },
  valuesGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 },
  valueCard: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-xl)',
    padding: '32px 28px',
  },
  valueIconWrap: {
    width: 46, height: 46,
    background: 'var(--om-canvas)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    color: 'var(--om-ink)',
  },
  valueTitle: { fontSize: 17, fontWeight: 500, color: 'var(--om-ink)', margin: '0 0 10px', lineHeight: 1.3 },
  valueText: { fontSize: 14, lineHeight: 1.65, color: 'var(--om-body)', margin: 0 },

  /* Licenses */
  licenses: { background: 'var(--om-canvas)', padding: '96px 0' },
  licensesInner: { maxWidth: 'var(--om-container-max)', margin: '0 auto', padding: '0 var(--om-container-pad)' },
  licensesHead: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'end', marginBottom: 64 },
  licensesH2: { fontFamily: 'var(--om-font-sans)', fontSize: 'clamp(32px, 3.6vw, 48px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--om-ink)', margin: '12px 0 0', lineHeight: 1.05 },
  licensesSub: { fontSize: 16, lineHeight: 1.6, color: 'var(--om-muted)', margin: 0, maxWidth: '36ch' },
  licensesGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  licCard: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-xl)',
    padding: '32px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxShadow: 'var(--om-shadow-card)',
  },
  licIcon: {
    width: 52, height: 52,
    borderRadius: 'var(--om-radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'var(--om-ink)',
  },
  licTitle: { fontSize: 17, fontWeight: 500, color: 'var(--om-ink)', margin: 0, lineHeight: 1.3 },
  licBody: { fontSize: 14, lineHeight: 1.65, color: 'var(--om-body)', margin: 0, flexGrow: 1 },
  licBadge: { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' },

  /* Location */
  location: { background: 'var(--om-canvas-soft)', padding: '96px 0' },
  locationInner: { maxWidth: 'var(--om-container-max)', margin: '0 auto', padding: '0 var(--om-container-pad)', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 64, alignItems: 'start' },
  locationLeft: { display: 'flex', flexDirection: 'column', gap: 32 },
  locationH2: { fontFamily: 'var(--om-font-sans)', fontSize: 'clamp(32px, 3.6vw, 44px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--om-ink)', margin: '12px 0 0', lineHeight: 1.05 },
  contactRow: { display: 'flex', flexDirection: 'column', gap: 12 },
  contactItem: { display: 'flex', alignItems: 'flex-start', gap: 14, fontSize: 15, color: 'var(--om-body)' },
  contactIcon: { width: 20, height: 20, color: 'var(--om-muted)', flexShrink: 0, marginTop: 1 },
  contactStrong: { fontWeight: 500, color: 'var(--om-ink)', display: 'block', marginBottom: 2 },
  hoursRow: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-lg)',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  hoursLabel: { fontSize: 13, color: 'var(--om-muted)', display: 'block', marginBottom: 2 },
  hoursValue: { fontSize: 16, fontWeight: 500, color: 'var(--om-ink)' },
  mapLabel: {
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(8px)',
    borderRadius: 'var(--om-radius-md)',
    padding: '16px 20px',
    margin: 16,
    boxShadow: 'var(--om-shadow-lifted)',
    width: 'calc(100% - 32px)',
  },
  mapLabelAddress: { fontWeight: 500, color: 'var(--om-ink)', fontSize: 15 },
  mapLabelSub: { fontSize: 12, color: 'var(--om-muted)', marginTop: 2 },
};


/* ── Sub-components ────────────────────────────────────────── */

function PillarCard({ p }) {
  return (
    <div style={ab.pillarCard} data-animate="about-pillar">
      <div className="om-about-pillar-num">{p.num}</div>
      <div style={ab.pillarIcon}>
        <i data-lucide={p.icon} style={{ width: 24, height: 24 }} />
      </div>
      <div>
        <h3 style={ab.pillarTitle}>{p.title}</h3>
      </div>
      <p style={ab.pillarText}>{p.text}</p>
      <span className={'om-tag ' + p.tagClass} style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>{p.tag}</span>
    </div>
  );
}

function TimelineItem({ item }) {
  return (
    <div className={'om-about-tl-item' + (item.current ? ' is-now' : '')}>
      <div className="om-about-tl-dot" />
      {item.current && <span style={ab.tlCurrentTag}>Сейчас</span>}
      <span style={ab.tlYear}>{item.year}</span>
      <h4 style={ab.tlTitle}>{item.title}</h4>
      <p style={ab.tlText}>{item.text}</p>
    </div>
  );
}

function EvidenceCell({ e }) {
  return (
    <div className="om-about-ev-cell">
      <div style={ab.evNum}>
        {e.prefix && <span style={ab.evPrefix}>{e.prefix}</span>}
        {e.num}
        <span style={ab.evUnit}>{e.unit}</span>
      </div>
      <p style={ab.evLabel}>{e.label}</p>
      <p style={ab.evNote}>{e.note}</p>
    </div>
  );
}

function ValueCard({ v }) {
  return (
    <div style={ab.valueCard} data-animate="about-value">
      <div style={ab.valueIconWrap}>
        <i data-lucide={v.icon} style={{ width: 22, height: 22 }} />
      </div>
      <h3 style={ab.valueTitle}>{v.title}</h3>
      <p style={ab.valueText}>{v.text}</p>
    </div>
  );
}

function LicenseCard({ icon, iconBg, title, body, badge, badgeColor }) {
  return (
    <div style={ab.licCard} data-animate="about-lic">
      <div style={{ ...ab.licIcon, background: iconBg }}>
        <i data-lucide={icon} style={{ width: 26, height: 26 }} />
      </div>
      <div>
        <p style={{ ...ab.licBadge, color: badgeColor }}>{badge}</p>
        <h3 style={ab.licTitle}>{title}</h3>
      </div>
      <p style={ab.licBody}>{body}</p>
    </div>
  );
}


/* ── Main page component ───────────────────────────────────── */

function AboutPage() {
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  return (
    <React.Fragment>

      {/* ── HERO ─────────────────────────────── */}
      <section style={ab.hero}>
        <div style={ab.heroBg} aria-hidden="true" />
        <div style={ab.heroYear} aria-hidden="true">2017</div>
        <div style={ab.heroInner} data-animate="about-hero">
          <div style={ab.heroEyebrow}>
            <span style={ab.heroEyebrowLine} />
            о центре · Алматы · с&nbsp;2017
          </div>
          <h1 style={ab.heroH1}>
            Снижение веса начинается{' '}
            <span style={{ color: 'var(--om-coral-deep)' }}>с головы</span>
          </h1>
          <p style={ab.heroSub}>
            OM Time — авторский центр психосоматики и осознанной коррекции веса.
            Методика «Вес идеальности» — лицензированная медицинская методика,
            одобренная Казахстанской Академией питания.
          </p>
          <div style={ab.heroStats}>
            {[
              { num: '2017', label: 'год основания' },
              { num: '7', label: 'лет практики' },
              { num: '4 000+', label: 'участников' },
              { num: '8', label: 'специалистов' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.num}>
                <div style={ab.heroStat}>
                  <span style={ab.heroStatNum}>{s.num}</span>
                  <span style={ab.heroStatLabel}>{s.label}</span>
                </div>
                {i < arr.length - 1 && <div style={ab.heroStatDiv} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ──────────────────────────── */}
      <section style={ab.mission}>
        <div style={ab.missionInner} className="om-about-mission-inner" data-animate="about-mission">
          <div style={ab.missionLabel}>
            <div className="om-eyebrow">Наш подход</div>
          </div>
          <div>
            <blockquote style={ab.missionQ}>
              «Большинство приходит после того, как уже всё перепробовали.
              Диеты, гипноз, кодирование, подсчёт калорий. Мы работаем с причиной —
              тем, что в голове запускает переедание.»
            </blockquote>
            <p style={ab.missionBody}>
              Методика «Вес идеальности» — это не ещё одна диетологическая схема. Это работа
              одновременно на трёх уровнях: психика, физиология, клеточный уровень. Поэтому
              результат держится — не пока есть «сила воли», а потому что меняется сам
              паттерн отношений с едой.
            </p>
          </div>
        </div>
      </section>

      {/* ── PILLARS ──────────────────────────── */}
      <section style={ab.pillars}>
        <div style={ab.pillarsInner}>
          <div style={ab.pillarsHead} className="om-about-pillars-head" data-animate="about-pillars-head">
            <div>
              <div className="om-eyebrow">Методика</div>
              <h2 style={ab.pillarsH2}>
                Три уровня,{' '}
                <span style={{ color: 'var(--om-coral-deep)' }}>одна система</span>
              </h2>
            </div>
            <p style={ab.pillarsSub}>
              Не одна техника, а система. Именно поэтому результат держится годами,
              а не возвращается после «срывов».
            </p>
          </div>
          <div style={ab.pillarsGrid} className="om-about-pillars-grid">
            {PILLARS.map(p => <PillarCard key={p.num} p={p} />)}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────── */}
      <section style={ab.timeline}>
        <div style={ab.timelineBg} aria-hidden="true" />
        <div style={ab.timelineInner} className="om-about-tl-inner">
          <div style={ab.timelineLeft} data-animate="about-tl-head">
            <span style={ab.timelineEyebrow}>История</span>
            <h2 style={ab.timelineH2}>
              Семь лет —{' '}
              <span style={{ color: 'var(--om-gold)' }}>одна методика</span>
            </h2>
            <p style={ab.timelineSub}>
              OM Time начинался с восьми участников в 2017 году.
              Сегодня — 4 000 историй, медицинская лицензия, одобрение
              Академии питания и команда из восьми специалистов.
            </p>
          </div>
          <div data-animate="about-tl-track">
            <div className="om-about-tl">
              {TIMELINE.map(item => <TimelineItem key={item.year} item={item} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── EVIDENCE ─────────────────────────── */}
      <section style={ab.evidence}>
        <div style={ab.evidenceInner} data-animate="about-ev">
          <div className="om-about-ev-grid">
            {EVIDENCE.map(e => <EvidenceCell key={e.label} e={e} />)}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(251,248,242,0.38)', marginTop: 16, textAlign: 'center', letterSpacing: '0.04em' }}>
            По данным клинических исследований методики «Вес идеальности»
          </p>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────── */}
      <section style={ab.values}>
        <div style={ab.valuesInner}>
          <div style={ab.valuesHead} data-animate="about-values-head">
            <div className="om-eyebrow">Принципы</div>
            <h2 style={ab.valuesH2}>Как мы работаем</h2>
          </div>
          <div style={ab.valuesGrid} className="om-about-values-grid">
            {VALUES.map(v => <ValueCard key={v.title} v={v} />)}
          </div>
        </div>
      </section>

      {/* ── LICENSES ─────────────────────────── */}
      <section style={ab.licenses}>
        <div style={ab.licensesInner}>
          <div style={ab.licensesHead} data-animate="about-lic-head">
            <div>
              <div className="om-eyebrow">Документы</div>
              <h2 style={ab.licensesH2}>
                Лицензии и{' '}
                <span style={{ color: 'var(--om-coral-deep)' }}>сертификаты</span>
              </h2>
            </div>
            <p style={ab.licensesSub}>
              Деятельность лицензирована как медицинская.
              Методика одобрена Казахстанской Академией питания.
            </p>
          </div>
          <div style={ab.licensesGrid} className="om-about-licenses-grid">
            <LicenseCard
              icon="shield-check"
              iconBg="rgba(78,107,63,0.12)"
              badgeColor="var(--om-sage-deep)"
              badge="Медицинская лицензия"
              title="Лицензированная медицинская деятельность"
              body="Центр осуществляет деятельность на основании медицинской лицензии. Методика прошла клиническое исследование и регуляторную экспертизу в Казахстане."
            />
            <LicenseCard
              icon="award"
              iconBg="rgba(242,193,46,0.15)"
              badgeColor="var(--om-gold-deep)"
              badge="Академия питания"
              title="Одобрено Казахстанской Академией питания"
              body="Методика «Вес идеальности» признана и одобрена Казахстанской Академией питания как эффективный инструмент коррекции веса через осознанное пищевое поведение."
            />
            <LicenseCard
              icon="file-text"
              iconBg="rgba(46,36,112,0.08)"
              badgeColor="var(--om-indigo)"
              badge="Авторская методика"
              title="Авторская методика «Вес идеальности»"
              body="Методика разработана Татьяной Педас, апробирована на 4 000+ участниках с 2017 по 2025 год. Права на методику защищены. Обучение тренеров — только в OM Time."
            />
          </div>
        </div>
      </section>

      {/* ── LOCATION ─────────────────────────── */}
      <section style={ab.location}>
        <div style={ab.locationInner} className="om-about-location-inner" data-animate="about-location">
          <div style={ab.locationLeft}>
            <div>
              <div className="om-eyebrow">Где мы</div>
              <h2 style={ab.locationH2}>Алматы, мкр.&nbsp;Алмагуль</h2>
            </div>

            <div style={ab.contactRow}>
              {[
                { icon: 'map-pin', label: 'Адрес', text: 'мкр. Алмагуль 23А, БЦ «ОмТайм»\nАлматы, Казахстан' },
                { icon: 'phone', label: 'Телефон и WhatsApp', text: '+7 (727) 000-00-00' },
                { icon: 'send', label: 'Telegram', text: '@omtime_kz' },
                { icon: 'mail', label: 'Email', text: 'hello@omtime.kz' },
              ].map(c => (
                <div key={c.label} style={ab.contactItem}>
                  <i data-lucide={c.icon} style={{ ...ab.contactIcon }} />
                  <div>
                    <span style={ab.contactStrong}>{c.label}</span>
                    <span style={{ color: 'var(--om-body)', whiteSpace: 'pre-line' }}>{c.text}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={ab.hoursRow}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--om-gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i data-lucide="clock" style={{ width: 20, height: 20, color: 'var(--om-gold-deep)' }} />
              </div>
              <div>
                <span style={ab.hoursLabel}>Часы работы</span>
                <span style={ab.hoursValue}>Ежедневно, 9:00–21:00</span>
              </div>
            </div>
          </div>

          <div className="om-about-map">
            <div className="om-about-map-pin">
              <div className="om-about-map-pin-ring" />
              <div className="om-about-map-pin-dot" />
            </div>
            <div className="om-about-map-label">
              <p style={ab.mapLabelAddress}>мкр. Алмагуль 23А, БЦ «ОмТайм»</p>
              <p style={ab.mapLabelSub}>Алматы · ежедневно 9:00–21:00</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section className="om-cta" data-animate="about-cta">
        <div className="om-cta-inner">
          <div className="om-cta-card">
            <h2>
              Хотите познакомиться{' '}
              <span style={{ color: 'var(--om-gold)' }}>с центром</span>?
            </h2>
            <div className="om-cta-side">
              <p>Первая консультация — бесплатно. Расскажем о программах и подберём формат под вашу ситуацию.</p>
              <div className="om-cta-row">
                <a
                  className="om-btn om-btn--on-dark"
                  href="booking.html?program=consult"
                  style={{ textDecoration: 'none' }}
                >
                  Записаться на консультацию
                </a>
                <a href="team.html" className="om-btn om-btn--ghost"
                  style={{ color: 'rgba(251,248,242,0.7)', textDecoration: 'none' }}>
                  Команда
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </React.Fragment>
  );
}

window.AboutPage = AboutPage;
