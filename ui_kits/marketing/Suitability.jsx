/* Suitability.jsx — "Кому подходит / не подходит".
   Editorial contrast: warm cream "yes" card vs deep indigo "no" card.
   Styling lives in page.css (.om-suit-*) so hover/responsive work cleanly.
   Animation hooks consumed by animations.js: suit-left, suit-right, suit-item. */

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
    <section className="om-suit" data-screen-label="Marketing site / Suitability">
      <div className="om-suit-inner">

        <div className="om-suit-head">
          <h2>Кому подходит<br/>и кому — нет</h2>
          <p>Будем честны на берегу — методика создана не&nbsp;для&nbsp;всех. Это сила, а&nbsp;не&nbsp;слабость.</p>
        </div>

        <div className="om-suit-grid">

          {/* YES — кремовая тёплая карточка */}
          <div className="om-suit-card om-suit-card--yes" data-animate="suit-left">
            <span className="om-suit-glow om-suit-glow--yes" aria-hidden="true"></span>
            <div className="om-suit-card-head">
              <span className="om-suit-tag om-suit-tag--yes">
                <i data-lucide="check" className="om-icon-16"></i>
                Подходит
              </span>
              <span className="om-suit-count">{YES.length} ситуаций</span>
            </div>

            <ul className="om-suit-list">
              {YES.map((text, i) => (
                <li className="om-suit-item om-suit-item--yes" data-animate="suit-item" key={i}>
                  <span className="om-suit-ico om-suit-ico--yes">
                    <i data-lucide="check" className="om-icon-16"></i>
                  </span>
                  <span className="om-suit-text">{text}</span>
                </li>
              ))}
            </ul>

            <p className="om-suit-note om-suit-note--yes">
              Всё из&nbsp;перечисленного — основания начать разговор.
            </p>
          </div>

          {/* NO — тёмная индиго-карточка */}
          <div className="om-suit-card om-suit-card--no" data-animate="suit-right">
            <span className="om-suit-glow om-suit-glow--no" aria-hidden="true"></span>
            <div className="om-suit-card-head">
              <span className="om-suit-tag om-suit-tag--no">
                <i data-lucide="x" className="om-icon-16"></i>
                Не&nbsp;подходит
              </span>
              <span className="om-suit-count om-suit-count--no">сначала другое</span>
            </div>

            <ul className="om-suit-list">
              {NO.map((text, i) => (
                <li className="om-suit-item om-suit-item--no" data-animate="suit-item" key={i}>
                  <span className="om-suit-ico om-suit-ico--no">
                    <i data-lucide="x" className="om-icon-16"></i>
                  </span>
                  <span className="om-suit-text">{text}</span>
                </li>
              ))}
            </ul>

            <p className="om-suit-note om-suit-note--no">
              Сомневаетесь? Напишите нам — разберёмся вместе.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

window.Suitability = Suitability;
