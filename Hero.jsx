/* Hero.jsx — homepage hero. White canvas, calm, no gradient. */

const heroStyles = {
  wrap: {
    padding: '88px 0 96px 0',
    background: 'var(--om-canvas)'
  },
  inner: {
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
    display: 'grid',
    gridTemplateColumns: '1.3fr 1fr',
    gap: 64,
    alignItems: 'center'
  },
  eyebrow: {
    fontSize: 13,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: 500,
    color: 'var(--om-muted)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24
  },
  eyebrowDot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--om-coral)' },
  h1: {
    fontSize: 60,
    fontWeight: 500,
    lineHeight: 1.05,
    letterSpacing: '-0.015em',
    color: 'var(--om-ink)',
    margin: '0 0 24px 0',
    textWrap: 'balance'
  },
  sub: {
    fontSize: 18,
    lineHeight: 1.55,
    color: 'var(--om-body)',
    maxWidth: '46ch',
    margin: '0 0 32px 0'
  },
  ctaRow: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  trustRow: {
    marginTop: 32,
    display: 'flex',
    gap: 24,
    flexWrap: 'wrap',
    fontSize: 13,
    color: 'var(--om-muted)'
  },
  trustItem: { display: 'inline-flex', alignItems: 'center', gap: 8 },

  /* right column — a placeholder hero illustration card */
  card: {
    background: 'var(--om-coral)',
    color: 'var(--om-on-coral)',
    borderRadius: 'var(--om-radius-xl)',
    padding: 36,
    aspectRatio: '4 / 5',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden'
  },
  cardEyebrow: {
    fontSize: 12,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: 500,
    opacity: 0.75
  },
  cardFigure: {
    fontFamily: 'var(--om-font-mono)',
    fontSize: 180,
    fontWeight: 400,
    lineHeight: 0.85,
    letterSpacing: '-0.04em',
    margin: 0
  },
  cardCaption: {
    fontSize: 16,
    lineHeight: 1.4,
    margin: '8px 0 0 0',
    opacity: 0.9,
    maxWidth: '24ch'
  },
  cardSource: {
    fontSize: 11,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    opacity: 0.55,
    marginTop: 'auto'
  }
};

function Hero() {
  return (
    <section style={heroStyles.wrap} data-screen-label="Marketing site / Hero">
      <div style={heroStyles.inner}>
        <div>
          <div style={{ ...heroStyles.eyebrow, fontSize: "6px", fontWeight: "600" }}>
            <span style={heroStyles.eyebrowDot}></span>
            Авторская методика «Вес идеальности»
          </div>
          <h1 style={heroStyles.h1}>Снижение веса через работу 
с сознанием</h1>
          <p style={heroStyles.sub}>
            Четырёхдневный интенсив на основе психосоматики, медитации и нейропластики.
            Лицензирована как медицинская методика, одобрена Казахстанской Академией питания.
          </p>
          <div style={heroStyles.ctaRow}>
            <button className="om-btn om-btn--primary">Записаться на программу</button>
            <button className="om-btn om-btn--secondary">Посмотреть расписание</button>
          </div>
          <div style={heroStyles.trustRow}>
            <span style={heroStyles.trustItem}>
              <i data-lucide="badge-check" className="om-icon-16" style={{ color: 'var(--om-sage-deep)' }}></i>
              Рассрочка Kaspi RED 0%
            </span>
            <span style={heroStyles.trustItem}>
              <i data-lucide="shield-check" className="om-icon-16" style={{ color: 'var(--om-sage-deep)' }}></i>
              Лицензированная методика
            </span>
            <span style={heroStyles.trustItem}>
              <i data-lucide="map-pin" className="om-icon-16" style={{ color: 'var(--om-sage-deep)' }}></i>
              Алматы и онлайн
            </span>
          </div>
        </div>
        <div style={heroStyles.card}>
          <div>
            <span style={{ ...heroStyles.cardEyebrow, color: "rgb(253, 253, 253)" }}>За месяц</span>
            <h2 style={{ ...heroStyles.cardFigure, letterSpacing: "-7px", textAlign: "left" }}>93%</h2>
            <p style={{ ...heroStyles.cardCaption, color: "rgb(251, 251, 251)", fontSize: "6px", fontFamily: "Manrope" }}>участников снижают ИМТ 
на 2–3 пункта без диет и гипноза</p>
          </div>
          <span style={{ ...heroStyles.cardSource, color: "rgb(255, 249, 249)" }}>По данным клинических исследований методики</span>
        </div>
      </div>
    </section>);}

window.Hero = Hero;