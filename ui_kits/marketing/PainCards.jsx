/* PainCards.jsx — large editorial two-column scatter of pain points. */

const PAINS = [
  {
    n: '01',
    title: 'Худеете — возвращается. Каждый раз',
    body: 'Сидели на диете, считали калории, ходили в зал. Сбросили — а через полгода всё на месте. И каждая новая попытка даётся тяжелее предыдущей.',
    emph: true,
  },
  {
    n: '02',
    title: 'Ем не от голода, а от чувств',
    body: 'Стресс — едите. Скучно — едите. Радость — тоже едите. Понимаете это, но в момент остановиться не получается. Ночные перекусы стали привычкой.',
  },
  {
    n: '03',
    title: 'Не могу без сладкого',
    body: 'Знаете, что вредно — но рука сама тянется. Без шоколада к чаю день не день. К вечеру тяга такая, будто без сахара заболит голова.',
  },
  {
    n: '04',
    title: 'Перестала узнавать себя',
    body: 'В зеркале — не вы. Вещи в шкафу не подходят. На фото больше не смотрите. И самое тяжёлое — стало непонятно, как ещё себя любить.',
    emph: true,
  },
];

function PainCards() {
  return (
    <section className="om-pains" data-screen-label="Marketing site / Pains">
      <div className="om-pains-head" data-animate="pains-head">
        <h2>
          Если что-то из этого <span className="om-italic">про вас</span> — методика для&nbsp;вас
        </h2>
        <p>
          Большинство приходит после того, как уже всё перепробовали. Не страшно — это нормально. Страшно остановиться на этом.
        </p>
      </div>
      <div className="om-pains-grid">
        {PAINS.map((p, i) => (
          <div key={i} className={p.emph ? 'is-emph' : ''} data-animate="pain-card">
            <span className="om-pains-num">{p.n}</span>
            <div>
              <h4>{p.title}</h4>
              <p>{p.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

window.PainCards = PainCards;
