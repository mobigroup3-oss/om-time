/* ComparisonTable.jsx — gypnosis vs methodology comparison.
   Layout: 3 stacked layers sharing one column geometry — background "lanes"
   (recessed traditional / elevated gold winner) + content cells + a floating
   "winner" flag. Lanes & flag are absolute grid overlays; data rows are
   `display:contents` wrappers so their cells become direct grid children.
   Animation hooks consumed by animations.js: compare-header, compare-row. */

const ROWS = [
  { label: 'Состояние сознания',   a: 'Транс, сниженный контроль',             b: 'Полная осознанность' },
  { label: 'Длительность эффекта', a: 'Временный — пока «работает кодировка»', b: 'Долгосрочный — через нейропластичность' },
  { label: 'Что формируется',      a: 'Запрет (нельзя есть)',                  b: 'Новые привычки (хочется по-другому)' },
  { label: 'Беременность',         a: 'Противопоказано',                       b: 'Разрешено со 2 триместра' },
  { label: 'Изменения в теле',     a: 'Только психологический запрет',         b: 'Физиологические — желудок, гормоны' },
];

function ComparisonTable() {
  return (
    <section className="om-compare" data-screen-label="Marketing site / Comparison">
      <div className="om-compare-inner">
        <div className="om-compare-head">
          <div>
            <span className="om-eyebrow" style={{ color: 'var(--om-coral-deep)' }}>Чем это отличается</span>
            <h2>
              Это <span className="om-italic">не&nbsp;гипноз</span> и&nbsp;не&nbsp;кодирование
            </h2>
          </div>
          <p>
            Вопрос задают почти все, поэтому сразу проясняем: разница не&nbsp;в&nbsp;названии — в&nbsp;механике, длительности и&nbsp;последствиях для&nbsp;тела.
          </p>
        </div>

        <div className="om-compare-card">
          <div className="om-compare-grid">
            {/* Background lanes — absolute overlay sharing the column geometry */}
            <div className="om-compare-lanes" aria-hidden="true">
              <div className="om-compare-lane om-compare-lane--bad"></div>
              <div className="om-compare-lane om-compare-lane--good"></div>
            </div>

            {/* Header row */}
            <div className="om-compare-cell om-compare-cell--corner">
              <span className="om-compare-corner-label">параметр</span>
            </div>
            <div className="om-compare-cell om-compare-cell--head om-compare-cell--bad" data-animate="compare-header">
              <span className="om-compare-col-title">Гипноз и&nbsp;кодирование</span>
              <span className="om-compare-col-sub">традиционные методы</span>
            </div>
            <div className="om-compare-cell om-compare-cell--head om-compare-cell--good" data-animate="compare-header">
              <span className="om-compare-col-title">Методика «Вес&nbsp;идеальности»</span>
              <span className="om-compare-col-sub">наш подход</span>
            </div>

            {/* Data rows — display:contents wrappers keep cells aligned to lanes */}
            {ROWS.map((r, i) => (
              <div key={i} className="om-compare-row" data-animate="compare-row">
                <div className="om-compare-cell om-compare-label">{r.label}</div>
                <div className="om-compare-cell om-compare-cell--bad">
                  <span className="om-compare-mark om-compare-mark--bad">
                    <i data-lucide="x" className="om-icon-16"></i>
                  </span>
                  <span>{r.a}</span>
                </div>
                <div className="om-compare-cell om-compare-cell--good">
                  <span className="om-compare-mark om-compare-mark--good">
                    <i data-lucide="check" className="om-icon-16"></i>
                  </span>
                  <span>{r.b}</span>
                </div>
              </div>
            ))}

            {/* Floating winner flag — top overlay sharing the column geometry */}
            <div className="om-compare-flaglayer" aria-hidden="true">
              <span className="om-compare-flag">
                <i data-lucide="sparkles" className="om-icon-16"></i>
                наш метод
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

window.ComparisonTable = ComparisonTable;
