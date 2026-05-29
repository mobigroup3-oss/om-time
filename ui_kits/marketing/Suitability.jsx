/* Suitability.jsx — "Кому подходит / не подходит". Редакционный контраст: кремовая + тёмная индиго-карточка. */

const suitStyles = {
  section: {
    background: 'var(--om-canvas)',
    padding: '120px 0',
    position: 'relative',
  },
  inner: {
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
  },
  head: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: 48,
    alignItems: 'end',
    marginBottom: 72,
  },
  h2: {
    fontFamily: 'var(--om-font-sans)',
    fontSize: 'clamp(36px, 4.4vw, 56px)',
    fontWeight: 500,
    lineHeight: 1.02,
    letterSpacing: '-0.02em',
    color: 'var(--om-ink)',
    margin: 0,
    textWrap: 'balance',
  },
  sub: {
    fontSize: 16,
    lineHeight: 1.55,
    color: 'var(--om-muted)',
    margin: 0,
    maxWidth: '36ch',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
    alignItems: 'start',
  },

  /* ---- YES card ---- */
  cardYes: {
    background: 'var(--om-cream)',
    borderRadius: 'var(--om-radius-xl)',
    padding: '44px 44px 40px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  yesAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: 'var(--om-sage-deep)',
    borderRadius: 'var(--om-radius-xl) var(--om-radius-xl) 0 0',
  },
  bigNumYes: {
    position: 'absolute',
    bottom: 24,
    right: 32,
    fontFamily: 'var(--om-font-mono)',
    fontWeight: 500,
    fontSize: 120,
    lineHeight: 1,
    letterSpacing: '-0.04em',
    color: 'var(--om-sage)',
    opacity: 0.22,
    userSelect: 'none',
    pointerEvents: 'none',
  },

  /* ---- NO card ---- */
  cardNo: {
    background: 'var(--om-indigo)',
    borderRadius: 'var(--om-radius-xl)',
    padding: '44px 44px 40px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  noGlow: {
    position: 'absolute',
    top: '-30%',
    right: '-20%',
    width: '70%',
    height: '70%',
    background: 'radial-gradient(50% 50% at 50% 50%, rgba(192,58,59,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bigNumNo: {
    position: 'absolute',
    bottom: 24,
    right: 32,
    fontFamily: 'var(--om-font-mono)',
    fontWeight: 500,
    fontSize: 120,
    lineHeight: 1,
    letterSpacing: '-0.04em',
    color: 'var(--om-coral)',
    opacity: 0.15,
    userSelect: 'none',
    pointerEvents: 'none',
  },

  /* ---- Shared card head row ---- */
  cardHeadRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 32,
  },
  labelYes: {
    fontFamily: 'var(--om-font-mono)',
    fontSize: 14,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    fontWeight: 600,
    color: 'var(--om-canvas)',
    background: 'var(--om-sage-deep)',
    padding: '5px 14px',
    borderRadius: 100,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  labelNo: {
    fontFamily: 'var(--om-font-mono)',
    fontSize: 14,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    fontWeight: 600,
    color: 'var(--om-on-coral)',
    background: 'var(--om-coral)',
    padding: '5px 14px',
    borderRadius: 100,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  divYes: {
    flex: 1,
    height: 1,
    background: 'rgba(78,107,63,0.3)',
  },
  divNo: {
    flex: 1,
    height: 1,
    background: 'rgba(251,248,242,0.15)',
  },

  /* ---- List ---- */
  ul: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 1,
  },
  liYes: {
    display: 'flex',
    gap: 16,
    padding: '14px 0',
    borderBottom: '1px solid rgba(78,107,63,0.14)',
    fontSize: 15,
    lineHeight: 1.55,
    color: 'var(--om-ink)',
    alignItems: 'flex-start',
  },
  liNo: {
    display: 'flex',
    gap: 16,
    padding: '14px 0',
    borderBottom: '1px solid rgba(251,248,242,0.09)',
    fontSize: 15,
    lineHeight: 1.55,
    color: 'var(--om-on-indigo)',
    alignItems: 'flex-start',
  },
  numYes: {
    fontFamily: 'var(--om-font-mono)',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--om-sage-deep)',
    letterSpacing: '0.04em',
    marginTop: 2,
    flexShrink: 0,
    width: 22,
    opacity: 0.85,
  },
  numNo: {
    fontFamily: 'var(--om-font-mono)',
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(251,248,242,0.4)',
    letterSpacing: '0.04em',
    marginTop: 2,
    flexShrink: 0,
    width: 22,
  },

  /* ---- Footer notes inside cards ---- */
  noteYes: {
    marginTop: 28,
    paddingTop: 22,
    borderTop: '1px solid rgba(78,107,63,0.14)',
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--om-sage-deep)',
    position: 'relative',
    zIndex: 1,
  },
  noteNo: {
    marginTop: 28,
    paddingTop: 22,
    borderTop: '1px solid rgba(251,248,242,0.09)',
    fontSize: 13,
    lineHeight: 1.5,
    color: 'rgba(251,248,242,0.55)',
    position: 'relative',
    zIndex: 1,
  },
};

const YES = [
  'У кого лишний вес связан с эмоциональным перееданием',
  'Кто перепробовал диеты и понял — дело не в еде',
  'Кому нужен устойчивый результат, а не быстрый сброс с возвратом',
  'Беременным со 2 триместра — методика безопасна',
  'Людям с преддиабетом — методика нормализует сахар',
];

const NO = [
  'Острые психические расстройства в фазе обострения',
  'Расстройства пищевого поведения (анорексия, булимия) — сначала специализированная помощь',
  'Вес связан с эндокринными нарушениями — сначала эндокринолог',
  'Внутреннего согласия на работу нет — методика требует личного включения',
];

function Suitability() {
  return (
    <section style={suitStyles.section} data-screen-label="Marketing site / Suitability">
      <div style={suitStyles.inner}>

        <div style={suitStyles.head}>
          <h2 style={suitStyles.h2}>Кому подходит<br/>и кому — нет</h2>
          <p style={suitStyles.sub}>
            Будем честны на берегу — методика создана не для всех. Это сила, а не слабость.
          </p>
        </div>

        <div style={suitStyles.grid}>

          {/* YES — кремовая тёплая карточка */}
          <div style={suitStyles.cardYes} data-animate="suit-left">
            <span style={suitStyles.yesAccentBar} aria-hidden="true"></span>
            <span style={suitStyles.bigNumYes} aria-hidden="true">{YES.length}</span>

            <div style={suitStyles.cardHeadRow}>
              <span style={suitStyles.labelYes}>✓ Подходит</span>
              <span style={suitStyles.divYes}></span>
            </div>

            <ul style={suitStyles.ul}>
              {YES.map((text, i) => (
                <li key={i} style={suitStyles.liYes} data-animate="suit-item">
                  <span style={suitStyles.numYes}>0{i + 1}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <p style={suitStyles.noteYes}>
              Всё из перечисленного — основания начать разговор.
            </p>
          </div>

          {/* NO — тёмная индиго-карточка */}
          <div style={suitStyles.cardNo} data-animate="suit-right">
            <span style={suitStyles.noGlow} aria-hidden="true"></span>
            <span style={suitStyles.bigNumNo} aria-hidden="true">{NO.length}</span>

            <div style={suitStyles.cardHeadRow}>
              <span style={suitStyles.labelNo}>✕ Не подходит</span>
              <span style={suitStyles.divNo}></span>
            </div>

            <ul style={suitStyles.ul}>
              {NO.map((text, i) => (
                <li key={i} style={suitStyles.liNo} data-animate="suit-item">
                  <span style={suitStyles.numNo}>0{i + 1}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <p style={suitStyles.noteNo}>
              Сомневаетесь? Напишите нам — разберёмся вместе.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

window.Suitability = Suitability;
