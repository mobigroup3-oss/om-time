/* TeamPage.jsx — страница команды OM Time */

// Данные тянутся из /api/team. Нет сервера / пустая БД → SEED_TEAM (см. ниже).
const SEED_TEAM = [
  {
    id: 'tatiana-pedas',
    name: 'Татьяна Педас',
    filterRoles: ['psychologist'],
    roleLabel: 'Основатель · Психотерапевт',
    initials: 'ТП',
    tag: 'Основатель',
    tagClass: 'om-tag--gold',
    spec: ['Пищевое поведение', 'Нейропластика', 'Трансперсональная'],
    bio: 'Автор методики «Вес идеальности». Разрабатывала протокол 7 лет — от клинических исследований до апробации на 4 000 участниках. Работает с глубинными причинами переедания, а не с симптомами.',
    credentials: ['КПТ', 'EMDR', 'Психосоматика'],
    years: '18',
    yearsLabel: 'лет практики',
    sessions: '4 000',
    sessionsLabel: 'участников',
    avatarBg: 'var(--om-coral)',
    avatarColor: '#fff',
    featured: true,
  },
  {
    id: 'ilya-brezhnev',
    name: 'Илья Брежнев',
    filterRoles: ['psychologist'],
    roleLabel: 'Клинический психолог',
    initials: 'ИБ',
    tag: 'Психолог',
    tagClass: 'om-tag--lilac',
    spec: ['Групповая терапия', 'Стресс и тело', 'Якорные техники'],
    bio: 'Специализируется на групповой психотерапии и стрессовом переедании. Ведёт клубные дни и поддерживающие встречи для выпускников программ.',
    credentials: ['Гештальт', 'Телесная терапия'],
    years: '9',
    yearsLabel: 'лет практики',
    sessions: '1 200',
    sessionsLabel: 'сессий',
    avatarBg: 'var(--om-indigo)',
    avatarColor: 'var(--om-on-indigo)',
    featured: false,
  },
  {
    id: 'natalia-loskutnikova',
    name: 'Наталья Лоскутникова',
    filterRoles: ['psychologist'],
    roleLabel: 'Детский психолог',
    initials: 'НЛ',
    tag: 'Детский психолог',
    tagClass: 'om-tag--sage',
    spec: ['Подростки 12–17', 'Пищевое поведение', 'Самовосприятие'],
    bio: 'Разработала адаптированную версию методики для подростков. Создаёт безопасную среду, где дети учатся слышать своё тело без давления.',
    credentials: ['Детская КПТ', 'Арт-терапия'],
    years: '11',
    yearsLabel: 'лет практики',
    sessions: '800',
    sessionsLabel: 'сессий',
    avatarBg: 'var(--om-sage)',
    avatarColor: 'var(--om-sage-deep)',
    featured: false,
  },
  {
    id: 'marina-engerova',
    name: 'Марина Енгерова',
    filterRoles: ['nutritionist'],
    roleLabel: 'Нутрициолог',
    initials: 'МЕ',
    tag: 'Нутрициолог',
    tagClass: 'om-tag--coral',
    spec: ['Детокс-питание', 'Пищевые привычки', 'Онлайн-сопровождение'],
    bio: 'Разрабатывает рационы для ONLINE DETOX и консультирует по питанию участников основных программ.',
    credentials: ['Клиническая нутрициология', 'Детокс-протоколы'],
    years: '7',
    yearsLabel: 'лет практики',
    sessions: '600',
    sessionsLabel: 'консультаций',
    avatarBg: 'var(--om-gold-soft)',
    avatarColor: 'var(--om-on-gold)',
    featured: false,
  },
  {
    id: 'asel-nurkenova',
    name: 'Асель Нуркенова',
    filterRoles: ['psychologist'],
    roleLabel: 'Психолог · Куратор',
    initials: 'АН',
    tag: 'Куратор',
    tagClass: 'om-tag--lilac',
    spec: ['Поддерживающая терапия', 'Онлайн-сопровождение', 'Мотивация'],
    bio: 'Ведёт поддерживающие чаты с участниками онлайн-программ. Помогает в первые два месяца после интенсива — самый уязвимый период.',
    credentials: ['Позитивная психотерапия', 'Коучинг ICF'],
    years: '5',
    yearsLabel: 'лет практики',
    sessions: '500',
    sessionsLabel: 'сессий',
    avatarBg: 'var(--om-lilac)',
    avatarColor: 'var(--om-indigo-deep)',
    featured: false,
  },
  {
    id: 'daria-kim',
    name: 'Дарья Ким',
    filterRoles: ['trainer'],
    roleLabel: 'Инструктор · Дыхательные практики',
    initials: 'ДК',
    tag: 'Инструктор',
    tagClass: 'om-tag--sage',
    spec: ['Психомоделирующее дыхание', 'Телесные практики', 'Медитация'],
    bio: 'Ведущий инструктор по психомоделирующему дыханию — авторской технике методики. Проводит практики на интенсивах и онлайн-сессии.',
    credentials: ['Breathwork', 'Mindfulness MBSR'],
    years: '6',
    yearsLabel: 'лет практики',
    sessions: '900',
    sessionsLabel: 'практик',
    avatarBg: 'var(--om-canvas-strong)',
    avatarColor: 'var(--om-ink)',
    featured: false,
  },
];

const TEAM_FILTERS = [
  { id: 'all', label: 'Все специалисты' },
  { id: 'psychologist', label: 'Психологи' },
  { id: 'nutritionist', label: 'Нутрициологи' },
  { id: 'trainer', label: 'Инструкторы' },
];

const VALUES = [
  {
    icon: 'brain',
    title: 'Работа с причиной',
    text: 'Мы не даём диеты и не считаем калории. Методика работает с психологическими триггерами, управляющими пищевым поведением.',
  },
  {
    icon: 'shield-check',
    title: 'Доказательная база',
    text: 'Все техники основаны на КПТ, соматических и нейропластических методах с клинически подтверждёнными результатами.',
  },
  {
    icon: 'users',
    title: 'Долгосрочное сопровождение',
    text: 'Два месяца поддержки после интенсива — психолог в закрытом чате. Самый уязвимый период не остаётся без внимания.',
  },
];

const tm = {
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
    background: 'radial-gradient(70% 60% at 75% 40%, rgba(192,58,59,0.06) 0%, rgba(242,193,46,0.05) 40%, transparent 70%)',
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
    marginBottom: 20,
  },
  heroEyebrowLine: {
    width: 28,
    height: 1,
    background: 'currentColor',
    display: 'inline-block',
    opacity: 0.5,
    flexShrink: 0,
  },
  heroH1: {
    fontSize: 'clamp(52px, 8vw, 88px)',
    fontWeight: 500,
    letterSpacing: '-0.03em',
    color: 'var(--om-ink)',
    lineHeight: 0.92,
    margin: '0 0 28px',
  },
  heroSub: {
    fontSize: 18,
    color: 'var(--om-muted)',
    maxWidth: '52ch',
    lineHeight: 1.6,
    margin: '0 0 44px',
  },
  heroStats: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    flexWrap: 'wrap',
  },
  heroStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    paddingRight: 32,
  },
  heroStatNum: {
    fontSize: 28,
    fontWeight: 500,
    color: 'var(--om-ink)',
    letterSpacing: '-0.025em',
    lineHeight: 1,
    fontStyle: 'normal',
  },
  heroStatLabel: {
    fontSize: 13,
    color: 'var(--om-muted)',
  },
  heroStatDivider: {
    width: 1,
    height: 36,
    background: 'var(--om-hairline)',
    marginRight: 32,
    flexShrink: 0,
    alignSelf: 'center',
  },

  teamSection: {
    padding: '80px 0 96px',
    background: 'var(--om-canvas-white)',
  },
  teamInner: {
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
  },
  teamSectionHead: { marginBottom: 40 },
  teamH2: {
    fontSize: 40,
    fontWeight: 500,
    letterSpacing: '-0.02em',
    color: 'var(--om-ink)',
    margin: 0,
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
    display: 'grid',
    gridTemplateColumns: '1fr 210px',
    gap: 48,
    alignItems: 'start',
    boxShadow: '0 2px 16px rgba(27,24,64,0.06), 0 0 0 1px rgba(27,24,64,0.04)',
    position: 'relative',
    overflow: 'hidden',
  },
  featAccent: {
    position: 'absolute',
    top: 0, left: 0,
    width: 4, height: '100%',
    background: 'linear-gradient(180deg, var(--om-gold) 0%, var(--om-coral) 100%)',
  },
  featBadge: {
    position: 'absolute',
    top: 0, right: 0,
    background: 'var(--om-gold)',
    color: 'var(--om-on-gold)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '7px 18px',
    borderBottomLeftRadius: 12,
  },
  featAvatarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  featInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  featName: {
    fontSize: 24,
    fontWeight: 500,
    color: 'var(--om-ink)',
    margin: 0,
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
  },
  featRole: {
    fontSize: 14,
    color: 'var(--om-muted)',
    marginTop: 2,
  },
  featBio: {
    fontSize: 15,
    color: 'var(--om-body)',
    lineHeight: 1.7,
    margin: '0 0 20px',
    maxWidth: '68ch',
  },
  featCredRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  featCredChip: {
    fontSize: 12,
    padding: '5px 12px',
    borderRadius: 'var(--om-radius-pill)',
    background: 'rgba(46,36,112,0.06)',
    border: '1px solid rgba(46,36,112,0.12)',
    color: 'var(--om-indigo)',
  },
  featSpecRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  featSpecChip: {
    fontSize: 12,
    padding: '5px 12px',
    borderRadius: 'var(--om-radius-pill)',
    background: 'var(--om-canvas)',
    border: '1px solid var(--om-hairline)',
    color: 'var(--om-muted)',
  },
  featRight: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 28,
  },
  featStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    marginBottom: 24,
    padding: '20px',
    background: 'var(--om-canvas)',
    borderRadius: 'var(--om-radius-md)',
    border: '1px solid var(--om-hairline)',
  },
  featStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  featStatNum: {
    fontSize: 30,
    fontWeight: 500,
    color: 'var(--om-ink)',
    lineHeight: 1,
    letterSpacing: '-0.025em',
    fontStyle: 'normal',
  },
  featStatLabel: {
    fontSize: 12,
    color: 'var(--om-muted)',
  },
  featStatDivider: {
    height: 1,
    background: 'var(--om-hairline)',
    width: '100%',
  },

  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
  },

  card: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-lg)',
    padding: '26px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 6px rgba(27,24,64,0.04)',
    transition: 'transform 0.26s cubic-bezier(0,0,0.2,1), box-shadow 0.26s cubic-bezier(0,0,0.2,1)',
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 500,
    color: 'var(--om-ink)',
    margin: '0 0 4px',
    lineHeight: 1.3,
  },
  cardRole: {
    fontSize: 13,
    color: 'var(--om-muted)',
    marginBottom: 14,
  },
  cardBio: {
    fontSize: 14,
    color: 'var(--om-body)',
    lineHeight: 1.65,
    margin: '0 0 16px',
    flexGrow: 1,
  },
  cardSpecRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 12,
    paddingBottom: 14,
    borderBottom: '1px solid var(--om-hairline-soft)',
  },
  cardSpecChip: {
    fontSize: 11,
    padding: '4px 10px',
    borderRadius: 'var(--om-radius-pill)',
    background: 'var(--om-canvas)',
    border: '1px solid var(--om-hairline)',
    color: 'var(--om-muted)',
  },
  cardCredRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  cardCredChip: {
    fontSize: 11,
    padding: '4px 10px',
    borderRadius: 'var(--om-radius-pill)',
    background: 'rgba(46,36,112,0.05)',
    border: '1px solid rgba(46,36,112,0.10)',
    color: 'var(--om-indigo)',
  },
  cardFoot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 'auto',
    paddingTop: 4,
  },
  cardStats: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  cardStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  cardStatNum: {
    fontSize: 15,
    fontWeight: 500,
    color: 'var(--om-ink)',
    lineHeight: 1,
    fontStyle: 'normal',
  },
  cardStatLabel: {
    fontSize: 10,
    color: 'var(--om-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  cardStatDivider: {
    width: 1,
    height: 24,
    background: 'var(--om-hairline)',
    flexShrink: 0,
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '56px 0',
    color: 'var(--om-muted)',
    fontSize: 16,
  },

  valuesBand: {
    padding: '80px 0',
    background: 'var(--om-canvas-soft)',
  },
  valuesInner: {
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
  },
  valuesHead: { marginBottom: 48 },
  valuesEyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 11,
    letterSpacing: '0.24em',
    textTransform: 'uppercase',
    fontWeight: 500,
    color: 'var(--om-muted)',
    marginBottom: 12,
  },
  valuesEyebrowLine: {
    width: 28, height: 1,
    background: 'currentColor',
    display: 'inline-block',
    opacity: 0.5,
    flexShrink: 0,
  },
  valuesH2: {
    fontSize: 40,
    fontWeight: 500,
    letterSpacing: '-0.02em',
    color: 'var(--om-ink)',
    margin: 0,
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
  },
  valueCard: {
    background: 'var(--om-canvas-white)',
    borderRadius: 'var(--om-radius-lg)',
    padding: '32px 28px',
    border: '1px solid var(--om-hairline)',
  },
  valueIconWrap: {
    width: 48, height: 48,
    borderRadius: 'var(--om-radius-md)',
    background: 'var(--om-canvas)',
    border: '1px solid var(--om-hairline)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    color: 'var(--om-ink)',
  },
  valueTitle: {
    fontSize: 18,
    fontWeight: 500,
    color: 'var(--om-ink)',
    margin: '0 0 10px',
    lineHeight: 1.3,
  },
  valueText: {
    fontSize: 15,
    color: 'var(--om-body)',
    lineHeight: 1.65,
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

function TeamAvatar({ initials, bg, color, size = 72, photo }) {
  if (photo) {
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        userSelect: 'none',
        background: 'var(--om-canvas)',
      }}>
        <img src={photo} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    );
  }
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: bg,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: Math.round(size * 0.29),
      fontWeight: 500,
      fontFamily: 'var(--om-font-sans)',
      letterSpacing: '-0.01em',
      flexShrink: 0,
      userSelect: 'none',
    }}>
      {initials}
    </div>
  );
}

function TeamFeaturedCard({ member: m }) {
  return (
    <div className="om-resp-featured" style={tm.featCard} data-animate="team-featured">
      <div style={tm.featAccent} aria-hidden="true" />
      <div style={tm.featBadge}>Основатель</div>

      <div>
        <div style={tm.featAvatarRow}>
          <TeamAvatar initials={m.initials} bg={m.avatarBg} color={m.avatarColor} size={80} photo={m.photo} />
          <div style={tm.featInfo}>
            <span className={`om-tag ${m.tagClass}`} style={{ marginBottom: 6, display: 'inline-flex' }}>
              {m.tag}
            </span>
            <h2 style={tm.featName}>{m.name}</h2>
            <div style={tm.featRole}>{m.roleLabel}</div>
          </div>
        </div>
        <p style={tm.featBio}>{m.bio}</p>
        <div style={tm.featCredRow}>
          {m.credentials.map(c => <span key={c} style={tm.featCredChip}>{c}</span>)}
        </div>
        <div style={tm.featSpecRow}>
          {m.spec.map(s => <span key={s} style={tm.featSpecChip}>{s}</span>)}
        </div>
      </div>

      <div style={tm.featRight}>
        <div style={tm.featStats}>
          <div style={tm.featStat}>
            <span style={tm.featStatNum}>{m.years}</span>
            <span style={tm.featStatLabel}>{m.yearsLabel}</span>
          </div>
          <div style={tm.featStatDivider} />
          <div style={tm.featStat}>
            <span style={tm.featStatNum}>{m.sessions}</span>
            <span style={tm.featStatLabel}>{m.sessionsLabel}</span>
          </div>
        </div>
        <a
          className="om-btn om-btn--primary"
          href="booking.html?program=consult"
          style={{ fontSize: 14, padding: '14px 20px', width: '100%', justifyContent: 'center', textDecoration: 'none' }}
        >
          Записаться
          <i data-lucide="arrow-up-right" style={{ width: 16, height: 16 }} />
        </a>
      </div>
    </div>
  );
}

function TeamCard({ member: m }) {
  return (
    <div
      style={tm.card}
      data-animate="team-card"
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(27,24,64,0.10)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '0 1px 6px rgba(27,24,64,0.04)';
      }}
    >
      <div style={tm.cardTopRow}>
        <TeamAvatar initials={m.initials} bg={m.avatarBg} color={m.avatarColor} size={60} photo={m.photo} />
        <span className={`om-tag ${m.tagClass}`}>{m.tag}</span>
      </div>
      <h3 style={tm.cardName}>{m.name}</h3>
      <div style={tm.cardRole}>{m.roleLabel}</div>
      <p style={tm.cardBio}>{m.bio}</p>
      <div style={tm.cardSpecRow}>
        {m.spec.map(s => <span key={s} style={tm.cardSpecChip}>{s}</span>)}
      </div>
      <div style={tm.cardCredRow}>
        {m.credentials.map(c => <span key={c} style={tm.cardCredChip}>{c}</span>)}
      </div>
      <div style={tm.cardFoot}>
        <div style={tm.cardStats}>
          <div style={tm.cardStat}>
            <span style={tm.cardStatNum}>{m.years}</span>
            <span style={tm.cardStatLabel}>{m.yearsLabel}</span>
          </div>
          <div style={tm.cardStatDivider} />
          <div style={tm.cardStat}>
            <span style={tm.cardStatNum}>{m.sessions}</span>
            <span style={tm.cardStatLabel}>{m.sessionsLabel}</span>
          </div>
        </div>
        <a
          className="om-btn om-btn--secondary"
          href="booking.html?program=consult"
          style={{ fontSize: 13, padding: '10px 18px', textDecoration: 'none' }}
        >
          Записаться
        </a>
      </div>
    </div>
  );
}

function ValueCard({ value: v }) {
  return (
    <div style={tm.valueCard} data-animate="team-value">
      <div style={tm.valueIconWrap}>
        <i data-lucide={v.icon} style={{ width: 24, height: 24 }} />
      </div>
      <h3 style={tm.valueTitle}>{v.title}</h3>
      <p style={tm.valueText}>{v.text}</p>
    </div>
  );
}

// tone → цвета круглого аватара (как TONE_AVATAR в AdminTeamEditor).
const TEAM_TONE_AVATAR = {
  gold:  { avatarBg: 'var(--om-gold-soft)', avatarColor: 'var(--om-on-gold)' },
  coral: { avatarBg: 'var(--om-coral)',     avatarColor: '#fff' },
  sage:  { avatarBg: 'var(--om-sage)',      avatarColor: 'var(--om-sage-deep)' },
  lilac: { avatarBg: 'var(--om-lilac)',     avatarColor: 'var(--om-indigo-deep)' },
};

function teamInitials(name) {
  return String(name || '').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
}

// Канонический объект из /api/team → render-форма этой страницы.
function teamFromApi(c) {
  const av = TEAM_TONE_AVATAR[c.tone] || TEAM_TONE_AVATAR.lilac;
  return {
    id: c.id,
    name: c.name,
    filterRoles: c.roleCat ? [c.roleCat] : [],
    roleLabel: c.roleLabel,
    initials: teamInitials(c.name),
    tag: c.tag,
    tagClass: 'om-tag--' + (c.tone || 'lilac'),
    spec: c.spec || [],
    bio: c.bio,
    credentials: c.credentials || [],
    years: c.years,
    yearsLabel: c.yearsLabel,
    sessions: c.sessions,
    sessionsLabel: c.sessionsLabel,
    avatarBg: av.avatarBg,
    avatarColor: av.avatarColor,
    photo: c.photo || '',
    featured: c.featured,
  };
}

// Кэш из личного кабинета (AdminTeamEditor пишет 'omtime.team.v1' в той же
// localStorage — один домен). Используется как фолбэк, когда /api/team
// недоступен (локальный предпросмотр без сервера), чтобы правки из кабинета
// — включая загруженные фото — были видны на публичной странице.
function readLocalTeam() {
  try {
    const raw = localStorage.getItem('omtime.team.v1');
    const arr = raw && JSON.parse(raw);
    if (Array.isArray(arr) && arr.length) {
      return arr.filter(m => m && m.active !== false).map(teamFromApi);
    }
  } catch (e) {}
  return null;
}

function TeamPage() {
  const [filter, setFilter] = React.useState('all');
  const [team, setTeam] = React.useState(SEED_TEAM);

  React.useEffect(() => {
    let alive = true;
    fetch('/api/team')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(j => {
        if (!alive) return;
        if (j && j.ok && j.data && j.data.length) { setTeam(j.data.map(teamFromApi)); return; }
        throw new Error('empty');
      })
      .catch(() => {
        if (!alive) return;
        const local = readLocalTeam();
        if (local && local.length) setTeam(local);
      });
    return () => { alive = false; };
  }, []);

  const founder = team.find(m => m.featured);
  const showFeatured = filter === 'all' || filter === 'psychologist';
  const gridMembers = filter === 'all'
    ? team.filter(m => !m.featured)
    : team.filter(m => !m.featured && m.filterRoles.includes(filter));

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  return (
    <React.Fragment>
      {/* Hero */}
      <section style={tm.hero}>
        <div style={tm.heroBg} aria-hidden="true" />
        <div style={tm.heroInner} data-animate="team-hero">
          <div style={tm.heroEyebrow}>
            <span style={tm.heroEyebrowLine} />
            команда · {team.length} специалистов
          </div>
          <h1 style={tm.heroH1}>
            Команда<br />OM&nbsp;Time
          </h1>
          <p style={tm.heroSub}>
            Каждый специалист центра — часть авторской методики «Вес идеальности». Работаем как единая система, а не набор отдельных кабинетов.
          </p>
          <div style={tm.heroStats}>
            <div style={tm.heroStat}>
              <span style={tm.heroStatNum}>18</span>
              <span style={tm.heroStatLabel}>лет в практике</span>
            </div>
            <div style={tm.heroStatDivider} />
            <div style={tm.heroStat}>
              <span style={tm.heroStatNum}>4 000</span>
              <span style={tm.heroStatLabel}>участников программ</span>
            </div>
            <div style={tm.heroStatDivider} />
            <div style={tm.heroStat}>
              <span style={tm.heroStatNum}>3</span>
              <span style={tm.heroStatLabel}>направления работы</span>
            </div>
          </div>
        </div>
      </section>

      {/* Team section */}
      <section style={tm.teamSection}>
        <div style={tm.teamInner}>
          <div style={tm.teamSectionHead} data-animate="team-section-head">
            <h2 style={tm.teamH2}>Наша команда</h2>
          </div>

          <div style={tm.filters}>
            {TEAM_FILTERS.map(f => (
              <button
                key={f.id}
                style={{ ...tm.chip, ...(filter === f.id ? tm.chipActive : {}) }}
                onClick={() => setFilter(f.id)}
                data-animate="team-chip"
              >
                {f.label}
              </button>
            ))}
          </div>

          {showFeatured && <TeamFeaturedCard member={founder} />}

          {gridMembers.length > 0 && (
            <div className="om-resp-grid-3" style={{ ...tm.teamGrid, marginTop: showFeatured ? 20 : 0 }}>
              {gridMembers.map(m => <TeamCard key={m.id} member={m} />)}
            </div>
          )}

          {!showFeatured && gridMembers.length === 0 && (
            <div className="om-resp-grid-3" style={tm.teamGrid}>
              <div style={tm.emptyState}>Специалисты не найдены</div>
            </div>
          )}
        </div>
      </section>

      {/* Values section */}
      <section style={tm.valuesBand}>
        <div style={tm.valuesInner}>
          <div style={tm.valuesHead} data-animate="team-values-head">
            <div style={tm.valuesEyebrow}>
              <span style={tm.valuesEyebrowLine} />
              наш подход
            </div>
            <h2 style={tm.valuesH2}>Принципы работы</h2>
          </div>
          <div className="om-resp-grid-3" style={tm.valuesGrid}>
            {VALUES.map(v => <ValueCard key={v.title} value={v} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={tm.ctaBand}>
        <div style={tm.ctaInner}>
          <div style={tm.ctaEyebrow}>бесплатно</div>
          <h2 style={tm.ctaH2}>Хотите познакомиться с&nbsp;командой?</h2>
          <p style={tm.ctaSub}>
            Оставьте заявку — расскажем о специалистах и подберём подходящую программу.
          </p>
          <a
            className="om-btn om-btn--on-dark"
            href="booking.html?program=consult"
            style={{ fontSize: 16, padding: '18px 36px', textDecoration: 'none' }}
          >
            Записаться на консультацию
            <i data-lucide="arrow-up-right" style={{ width: 16, height: 16 }} />
          </a>
        </div>
      </section>
    </React.Fragment>
  );
}

window.TeamPage = TeamPage;
