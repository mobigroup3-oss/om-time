/* TrustNumbers.jsx — editorial asymmetric grid of clinical figures.
   Big serif figures, mixed color blocks, source line as side caption. */

function TrustNumbers() {
  return (
    <section className="om-trust" data-screen-label="Marketing site / Trust numbers">
      <div className="om-trust-inner">
        <div className="om-trust-head" data-animate="trust-head">
          <div>
            <span className="om-eyebrow">Доказательная база</span>
            <h2>
              Цифры, за которыми <span className="om-accent">клинические</span> исследования
            </h2>
          </div>
          <p className="om-trust-source">
            По данным методики «Вес идеальности», 2017–2025. Выборка: 2 380 участников программы в&nbsp;Алматы и&nbsp;онлайн.
          </p>
        </div>

        <div className="om-trust-grid">
          <div className="om-trust-card is-c1 om-trust-card--gold" data-animate="trust-card">
            <span className="om-trust-card-eyebrow">ИМТ за 1 месяц</span>
            <div className="om-trust-card-num">
              <span className="om-counter-num" data-counter-target="93" data-counter-suffix="">0</span>
              <span className="om-unit">%</span>
            </div>
            <p className="om-trust-card-cap">участников снижают индекс массы тела на&nbsp;2–3&nbsp;пункта без диет и&nbsp;гипноза.</p>
          </div>

          <div className="om-trust-card is-c2" data-animate="trust-card">
            <span className="om-trust-card-eyebrow">талия</span>
            <div className="om-trust-card-num">
              <span className="om-prefix">до</span>
              <span className="om-counter-num" data-counter-target="15" data-counter-suffix="">0</span>
              <span className="om-unit">см</span>
            </div>
            <p className="om-trust-card-cap">уменьшение объёма талии за&nbsp;1&nbsp;месяц работы.</p>
          </div>

          <div className="om-trust-card is-c3 om-trust-card--indigo" data-animate="trust-card">
            <span className="om-trust-card-eyebrow">нейропластика</span>
            <div className="om-trust-card-num">
              <span className="om-prefix">до</span>
              <span className="om-counter-num" data-counter-target="40" data-counter-suffix="">0</span>
              <span className="om-unit">%</span>
            </div>
            <p className="om-trust-card-cap">физиологическое уменьшение объёма желудка через медитативные техники.</p>
          </div>

          <div className="om-trust-card is-c4 om-trust-card--coral" data-animate="trust-card">
            <span className="om-trust-card-eyebrow">преддиабет</span>
            <div className="om-trust-card-num">
              <span className="om-counter-num" data-counter-target="100" data-counter-suffix="">0</span>
              <span className="om-unit">%</span>
            </div>
            <p className="om-trust-card-cap">нормализация давления и&nbsp;сахара у&nbsp;пациентов с&nbsp;преддиабетом в&nbsp;анамнезе.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

window.TrustNumbers = TrustNumbers;
