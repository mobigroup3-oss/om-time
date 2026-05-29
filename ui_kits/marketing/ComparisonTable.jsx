/* ComparisonTable.jsx — gypnosis vs methodology comparison. */

const ROWS = [
  { label: 'Состояние сознания',   a: 'Транс, сниженный контроль',          b: 'Полная осознанность' },
  { label: 'Длительность эффекта', a: 'Временный — пока «работает кодировка»', b: 'Долгосрочный — через нейропластичность' },
  { label: 'Что формируется',      a: 'Запрет (нельзя есть)',                b: 'Новые привычки (хочется по-другому)' },
  { label: 'Беременность',         a: 'Противопоказано',                     b: 'Разрешено со 2 триместра' },
  { label: 'Изменения в теле',     a: 'Только психологический запрет',       b: 'Физиологические — желудок, гормоны' },
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
          <div className="om-compare-headrow">
            <div className="om-compare-headcell om-compare-headcell--empty" data-animate="compare-header"></div>
            <div className="om-compare-headcell om-compare-headcell--bad" data-animate="compare-header">
              <span className="om-compare-col-title">Гипноз и&nbsp;кодирование</span>
              <span className="om-compare-col-sub">традиционные методы</span>
            </div>
            <div className="om-compare-headcell om-compare-headcell--good" data-animate="compare-header">
              <span className="om-compare-col-title">Методика «Вес&nbsp;идеальности»</span>
              <span className="om-compare-col-sub">наш подход</span>
            </div>
          </div>

          {ROWS.map((r, i) => (
            <div key={i} className="om-compare-row" data-animate="compare-row">
              <div className="om-compare-label">{r.label}</div>
              <div className="om-compare-cell om-compare-cell--bad">
                <i data-lucide="x" className="om-icon-20 om-compare-icon" data-animate="compare-check"></i>
                <span>{r.a}</span>
              </div>
              <div className="om-compare-cell om-compare-cell--good">
                <i data-lucide="check" className="om-icon-20 om-compare-icon" data-animate="compare-check"></i>
                <span>{r.b}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

window.ComparisonTable = ComparisonTable;
