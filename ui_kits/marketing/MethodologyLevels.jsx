/* MethodologyLevels.jsx — horizontal pinned scroll through three levels.
   animations.js wires ScrollTrigger.pin + scrub for the .om-method-track,
   and updates the section progress bar + counter as panels pass center. */

const LEVELS = [
  {
    n: '01',
    label: 'Психика',
    title: 'Психосоматика пищевого поведения',
    body: 'Разбираем, что в голове запускает переедание. Тревога, скука, обида, детские сценарии — у каждого свои триггеры. Когда видишь свой — становится возможно выбирать.',
    footL: 'уровень 1',
    footR: '4 техники',
    cls: 'om-method-panel--cream',
  },
  {
    n: '02',
    label: 'Физиология',
    title: 'Уменьшение объёма желудка',
    body: 'Через медитативные техники нейропластики желудок физиологически сокращается на 30–40%. Без операций, без таблеток. Порции уменьшаются естественно — насыщение приходит раньше.',
    footL: 'уровень 2',
    footR: 'нейропластика',
    cls: 'om-method-panel--gold',
  },
  {
    n: '03',
    label: 'Клеточный уровень',
    title: 'Активация липолиза',
    body: 'Через дыхательные практики и медитации запускается расщепление жиров на клеточном уровне. Уходит подкожный и висцеральный жир — тот, который окружает внутренние органы.',
    footL: 'уровень 3',
    footR: 'дыхание + медитация',
    cls: 'om-method-panel--indigo',
  },
];

function MethodologyLevels() {
  return (
    <section className="om-method" data-screen-label="Marketing site / Methodology">
      <div className="om-method-pin" data-method-pin>
        <div className="om-method-head">
          <div>
            <span className="om-eyebrow" style={{ color: 'var(--om-coral-deep)' }}>Как это работает</span>
            <h2 data-animate="method-heading">
              Три уровня, на&nbsp;которых работает методика
            </h2>
          </div>
          <div className="om-method-counter">
            <span data-method-counter>01</span> / 03
          </div>
        </div>

        <div className="om-method-track" data-method-track>
          {LEVELS.map((l, i) => (
            <article key={l.n} className={'om-method-panel ' + l.cls} data-method-panel data-index={i}>
              <span className="om-method-panel-label">{l.label}</span>
              <span className="om-method-panel-num">{l.n}</span>
              <div>
                <h3>{l.title}</h3>
                <p>{l.body}</p>
              </div>
              <div className="om-method-panel-foot">
                <span>{l.footL}</span>
                <span>{l.footR}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="om-method-progress"><span data-method-progress></span></div>
      </div>

      <div className="om-method-cta">
        <p data-animate="method-closer">
          «Работаем со&nbsp;всеми тремя уровнями одновременно. Поэтому это <span style={{ fontStyle: 'normal', fontFamily: 'var(--om-font-sans)', color: 'var(--om-coral-deep)' }}>не</span> ещё одна диета — а&nbsp;методика.»
        </p>
      </div>
    </section>
  );
}

window.MethodologyLevels = MethodologyLevels;
