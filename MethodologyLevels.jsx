/* MethodologyLevels.jsx — three levels at which the methodology works. */

const methodStyles = {
  band: { background: 'var(--om-cream)', padding: '96px 0' },
  inner: {
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)'
  },
  head: { textAlign: 'center', marginBottom: 56 },
  eyebrow: {
    fontSize: 12,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: 500,
    color: 'var(--om-coral-deep)',
    marginBottom: 12,
    display: 'block'
  },
  h2: {
    fontSize: 40,
    fontWeight: 500,
    color: 'var(--om-ink)',
    margin: '0 0 12px 0',
    lineHeight: 1.1,
    letterSpacing: '-0.01em',
    textWrap: 'balance'
  },
  sub: { fontSize: 17, color: 'var(--om-body)', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 },
  card: {
    background: 'var(--om-canvas-white)',
    borderRadius: 'var(--om-radius-lg)',
    padding: 32,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    minHeight: 280
  },
  num: {
    fontFamily: 'var(--om-font-mono)',
    fontSize: 14,
    color: 'var(--om-muted)',
    letterSpacing: '0.08em'
  },
  level: {
    fontSize: 13,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontWeight: 500,
    color: 'var(--om-coral-deep)'
  },
  title: {
    fontSize: 22,
    fontWeight: 500,
    color: 'var(--om-ink)',
    margin: 0,
    lineHeight: 1.25
  },
  body: { fontSize: 15, lineHeight: 1.55, color: 'var(--om-body)', margin: 0 },
  closer: {
    marginTop: 40,
    textAlign: 'center',
    fontFamily: 'var(--om-font-editorial)',
    fontStyle: 'italic',
    fontSize: 19,
    color: 'var(--om-ink)',
    maxWidth: '52ch',
    marginLeft: 'auto',
    marginRight: 'auto'
  }
};

const LEVELS = [
{
  n: '01', level: 'Психика',
  title: 'Психосоматика пищевого поведения',
  body: 'Разбираем, что в голове запускает переедание. Тревога, скука, обида, детские сценарии — у каждого свои триггеры. Когда видишь свой — становится возможно выбирать.'
},
{
  n: '02', level: 'Физиология',
  title: 'Уменьшение объёма желудка',
  body: 'Через медитативные техники нейропластики желудок физиологически сокращается на 30–40%. Без операций, без таблеток. Порции уменьшаются естественно — насыщение приходит раньше.'
},
{
  n: '03', level: 'Клеточный уровень',
  title: 'Активация липолиза',
  body: 'Через дыхательные практики и медитации запускается расщепление жиров на клеточном уровне. Уходит подкожный и висцеральный жир — тот, который окружает внутренние органы.'
}];


function MethodologyLevels() {
  return (
    <section style={methodStyles.band} data-screen-label="Marketing site / Methodology">
      <div style={methodStyles.inner}>
        <div style={methodStyles.head}>
          <span style={methodStyles.eyebrow}>Как это работает</span>
          <h2 style={methodStyles.h2}>Три уровня, на которых работает методика</h2>
          <p style={methodStyles.sub}>Не одна техника, а система. Поэтому результат держится.</p>
        </div>
        <div style={methodStyles.grid}>
          {LEVELS.map((l) =>
          <div key={l.n} style={methodStyles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={methodStyles.num}>{l.n}</span>
                <span style={methodStyles.level}>{l.level}</span>
              </div>
              <h3 style={methodStyles.title}>{l.title}</h3>
              <p style={methodStyles.body}>{l.body}</p>
            </div>
          )}
        </div>
        <p style={{ ...methodStyles.closer, fontSize: "20px" }}>«Работаем со всеми тремя уровнями одновременно. Поэтому это не „ещё одна диета", а методика»</p>
      </div>
    </section>);

}

window.MethodologyLevels = MethodologyLevels;