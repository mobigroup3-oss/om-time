/* Testimonials.jsx — auto-scrolling marquee with 10 editorial cards. */

const STORIES = [
  {
    initial: 'А', name: 'Алия, 34', meta: 'СТАРТ 89 КГ · 1 МЕС',
    quote: 'Я не верила, что без диеты можно вообще что-то сбросить. Прошла четыре дня — поняла, что ела не потому что голодная. Через месяц минус одиннадцать килограммов — без насилия над собой.',
    pips: ['−11 кг', 'порции −40%', 'без ночных перекусов'],
    cls: 'is-1',
  },
  {
    initial: 'С', name: 'Светлана, 47', meta: 'СТАРТ 78 КГ · 2 МЕС',
    quote: 'Самое странное — я перестала хотеть сладкое. Не «терпеть и не есть», а именно перестала хотеть. Раньше без шоколадки к&nbsp;чаю день не день. Теперь спокойно прохожу мимо.',
    pips: ['−9 кг', 'тяга к сладкому ушла'],
    cls: 'is-2',
  },
  {
    initial: 'Ж', name: 'Жанар, 52', meta: 'ПРЕДДИАБЕТ · 2 МЕС',
    quote: 'Шла за&nbsp;весом — получила нормальный сахар. Эндокринолог удивился больше меня. Давление выровнялось.',
    pips: ['−8 кг', 'сахар в норме', 'давление'],
    cls: 'is-3',
  },
  {
    initial: 'К', name: 'Карина, 38', meta: 'СТАРТ 72 КГ · 2 МЕС',
    quote: 'До интенсива ела строго по расписанию — и всё равно срывалась. Оказалось, я не голод заедала, а тревогу. Теперь не считаю калории — вес идёт вниз сам.',
    pips: ['−12 кг', 'без срывов', 'тревога снизилась'],
    cls: 'is-1',
  },
  {
    initial: 'Н', name: 'Наталья, 44', meta: 'СТАРТ 83 КГ · 3 МЕС',
    quote: 'Три года пробовала разные диеты. На четвёртый день интенсива поняла, что ела не от голода ни разу. Это было странно — и очень освобождающе.',
    pips: ['−14 кг', 'диеты не нужны'],
    cls: 'is-2',
  },
  {
    initial: 'Г', name: 'Гульнара, 41', meta: 'СТРЕСС · 1 МЕС',
    quote: 'Я думала, что мне нужен диетолог. А нужен был психолог. Центр дал и то, и другое одновременно. Вес — это только видимая часть. Внутри произошло больше.',
    pips: ['−7 кг', 'сон улучшился', 'стресс ушёл'],
    cls: 'is-3',
  },
  {
    initial: 'И', name: 'Ирина, 36', meta: 'ЭМОЦ. ПЕРЕЕДАНИЕ · 1 МЕС',
    quote: 'На первый день хотела уйти — казалось слишком непривычно. Осталась. К вечеру третьего дня впервые за много лет остановилась, потому что наелась, а не потому что тарелка пустая.',
    pips: ['−6 кг', 'осознанное питание'],
    cls: 'is-1',
  },
  {
    initial: 'М', name: 'Мария, 50', meta: 'СТАРТ 91 КГ · 3 МЕС',
    quote: 'Врач сказал «просто ешьте меньше». Я так делала двадцать лет и снова набирала. Здесь объяснили почему. Теперь понимаю свой организм — не воюю с&nbsp;ним.',
    pips: ['−16 кг', 'холестерин в норме', 'энергия'],
    cls: 'is-2',
  },
  {
    initial: 'А', name: 'Айгуль, 29', meta: 'БУЛИМИЯ (РЕМИССИЯ) · 4 МЕС',
    quote: 'Не скажу вес — это моё. Скажу главное: я больше не наказываю себя едой. Четыре месяца без эпизодов. Для меня это огромно.',
    pips: ['без срывов 4 мес', 'отношения с едой'],
    cls: 'is-3',
  },
  {
    initial: 'Л', name: 'Лариса, 55', meta: 'МЕНОПАУЗА · 2 МЕС',
    quote: 'В менопаузу вес рос несмотря ни на что. Гормоны, обмен, всё не так. После интенсива минус восемь — без жёстких ограничений. Гинеколог удивился.',
    pips: ['−8 кг', 'гормональный фон', 'менопауза'],
    cls: 'is-1',
  },
];

function TestimonialCard({ s, ariaHidden }) {
  return (
    <article
      className={'om-testimonial-card ' + s.cls}
      data-animate="testimonial-card"
      aria-hidden={ariaHidden || undefined}
    >
      <div className="om-testimonial-head">
        <div className="om-testimonial-avatar">{s.initial}</div>
        <div>
          <div className="om-testimonial-name">{s.name}</div>
          <div className="om-testimonial-meta">{s.meta}</div>
        </div>
      </div>
      <p className="om-testimonial-quote" dangerouslySetInnerHTML={{ __html: '«' + s.quote + '»' }}></p>
      <div className="om-testimonial-pips">
        {s.pips.map((p, j) => <span key={j} className="om-testimonial-pip">{p}</span>)}
      </div>
    </article>
  );
}

function Testimonials() {
  return (
    <section className="om-testimonials" id="reviews" data-screen-label="Marketing site / Testimonials">
      <div className="om-testimonials-inner">
        <div className="om-testimonials-head" data-animate="testimonials-head">
          <h2>
            Что говорят те, кто <span className="om-italic">прошёл</span>
          </h2>
          <p>
            Имена настоящие, истории — с&nbsp;письменного согласия. Видео-отзывы &mdash; в&nbsp;закрытом разделе после первой консультации.
          </p>
        </div>
      </div>

      <div className="om-testimonial-marquee" data-animate="testimonial-marquee">
        <div className="om-testimonial-track">
          {STORIES.map((s, i) => <TestimonialCard key={'a' + i} s={s} />)}
          {STORIES.map((s, i) => <TestimonialCard key={'b' + i} s={s} ariaHidden="true" />)}
        </div>
      </div>
    </section>
  );
}

window.Testimonials = Testimonials;
