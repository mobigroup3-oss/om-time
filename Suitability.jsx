/* Suitability.jsx — "Кому подходит / не подходит" split block. */

const suitStyles = {
  band: { background: 'var(--om-canvas-soft)', padding: '96px 0' },
  inner: {
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)'
  },
  head: { textAlign: 'center', marginBottom: 48 },
  h2: { fontSize: 36, fontWeight: 500, color: 'var(--om-ink)', margin: '0 0 10px 0', letterSpacing: '-0.01em' },
  sub: { fontSize: 17, color: 'var(--om-body)', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-lg)',
    padding: 32,
    display: 'flex',
    flexDirection: 'column',
    gap: 18
  },
  cardYes: { background: 'var(--om-cream)', border: 'none' },
  cardNo: { background: 'var(--om-canvas-white)' },
  tag: {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '5px 12px', borderRadius: 'var(--om-radius-pill)',
    fontSize: 13, fontWeight: 500, alignSelf: 'flex-start'
  },
  tagYes: { background: 'var(--om-sage)', color: 'var(--om-sage-deep)' },
  tagNo: { background: 'rgba(192, 58, 59, 0.12)', color: 'var(--om-coral-deep)' },
  ul: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 },
  li: { display: 'flex', gap: 12, fontSize: 15, lineHeight: 1.5, color: 'var(--om-body)' },
  liIcon: { flexShrink: 0, marginTop: 3 }
};

const YES = [
'У кого лишний вес связан с эмоциональным перееданием',
'Кто перепробовал диеты и понял — дело не в еде',
'Кому нужен устойчивый результат, а не быстрый сброс с возвратом',
'Беременным со 2 триместра — да, методика безопасна',
'Людям с преддиабетом — методика нормализует сахар'];


const NO = [
'Острые психические расстройства в фазе обострения',
'Расстройства пищевого поведения (анорексия, булимия) — сначала специализированная помощь',
'Вес связан с эндокринными нарушениями — сначала эндокринолог',
'Внутреннего согласия на работу нет — методика требует личного включения'];


function Suitability() {
  return (
    <section style={suitStyles.band} data-screen-label="Marketing site / Suitability">
      <div style={suitStyles.inner}>
        <div style={suitStyles.head}>
          <h2 style={suitStyles.h2}>Кому подходит и кому — нет</h2>
          <p style={suitStyles.sub}>Будем честны на берегу — методика не для всех.</p>
        </div>
        <div style={suitStyles.grid}>
          <div style={{ ...suitStyles.card, ...suitStyles.cardYes }}>
            <span style={{ ...suitStyles.tag, ...suitStyles.tagYes, fontFamily: "Manrope", color: "rgb(0, 0, 0)", width: "124px", flexDirection: "row-reverse" }}>
              <i data-lucide="check" style={{ width: 14, height: 14 }}></i>
              Подходит
            </span>
            <ul style={suitStyles.ul}>
              {YES.map((y, i) =>
              <li key={i} style={suitStyles.li}>
                  <i data-lucide="check" style={{ width: 18, height: 18, color: 'var(--om-sage-deep)', ...suitStyles.liIcon }}></i>
                  {y}
                </li>
              )}
            </ul>
          </div>
          <div style={{ ...suitStyles.card, ...suitStyles.cardNo }}>
            <span style={{ ...suitStyles.tag, ...suitStyles.tagNo, fontFamily: "Manrope", color: "rgb(2, 2, 2)", flexDirection: "row-reverse" }}>
              <i data-lucide="x" style={{ width: 14, height: 14 }}></i>
              Не подходит
            </span>
            <ul style={suitStyles.ul}>
              {NO.map((y, i) =>
              <li key={i} style={suitStyles.li}>
                  <i data-lucide="x" style={{ width: 18, height: 18, color: 'var(--om-coral-deep)', ...suitStyles.liIcon }}></i>
                  {y}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>);

}

window.Suitability = Suitability;