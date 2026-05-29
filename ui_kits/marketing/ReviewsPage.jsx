/* ReviewsPage.jsx — dedicated reviews page for OM Time */

const REVIEWS = [
  {
    id: 1, initial: 'А', name: 'Алия, 34',
    meta: 'СТАРТ 89 КГ · 1 МЕС',
    category: 'похудение', program: 'Вес идеальности',
    quote: 'Я не верила, что без диеты можно вообще что-то сбросить. Прошла четыре дня — поняла, что ела не потому что голодная. Через месяц минус одиннадцать килограммов — без насилия над собой.',
    pips: ['−11 кг', 'порции −40%', 'без ночных перекусов'],
    cls: 'is-1', rating: 5,
  },
  {
    id: 2, initial: 'С', name: 'Светлана, 47',
    meta: 'СТАРТ 78 КГ · 2 МЕС',
    category: 'эмоции', program: 'Вес идеальности',
    quote: 'Самое странное — я перестала хотеть сладкое. Не «терпеть и не есть», а именно перестала хотеть. Раньше без шоколадки к чаю день не день. Теперь спокойно прохожу мимо.',
    pips: ['−9 кг', 'тяга к сладкому ушла'],
    cls: 'is-2', rating: 5,
  },
  {
    id: 3, initial: 'Ж', name: 'Жанар, 52',
    meta: 'ПРЕДДИАБЕТ · 2 МЕС',
    category: 'здоровье', program: 'Вес идеальности',
    quote: 'Шла за весом — получила нормальный сахар. Эндокринолог удивился больше меня. Давление выровнялось.',
    pips: ['−8 кг', 'сахар в норме', 'давление'],
    cls: 'is-3', rating: 5,
  },
  {
    id: 4, initial: 'К', name: 'Карина, 38',
    meta: 'СТАРТ 72 КГ · 2 МЕС',
    category: 'эмоции', program: 'Вес идеальности',
    quote: 'До интенсива ела строго по расписанию — и всё равно срывалась. Оказалось, я не голод заедала, а тревогу. Теперь не считаю калории — вес идёт вниз сам.',
    pips: ['−12 кг', 'без срывов', 'тревога снизилась'],
    cls: 'is-1', rating: 5,
  },
  {
    id: 5, initial: 'Н', name: 'Наталья, 44',
    meta: 'СТАРТ 83 КГ · 3 МЕС',
    category: 'похудение', program: 'Вес идеальности',
    quote: 'Три года пробовала разные диеты. На четвёртый день интенсива поняла, что ела не от голода ни разу. Это было странно — и очень освобождающе.',
    pips: ['−14 кг', 'диеты не нужны'],
    cls: 'is-2', rating: 5,
  },
  {
    id: 6, initial: 'Г', name: 'Гульнара, 41',
    meta: 'СТРЕСС · 1 МЕС',
    category: 'эмоции', program: 'Вес идеальности',
    quote: 'Я думала, что мне нужен диетолог. А нужен был психолог. Центр дал и то, и другое одновременно. Вес — это только видимая часть. Внутри произошло больше.',
    pips: ['−7 кг', 'сон улучшился', 'стресс ушёл'],
    cls: 'is-3', rating: 5,
  },
  {
    id: 7, initial: 'И', name: 'Ирина, 36',
    meta: 'ЭМОЦ. ПЕРЕЕДАНИЕ · 1 МЕС',
    category: 'эмоции', program: 'Вес идеальности',
    quote: 'На первый день хотела уйти — казалось слишком непривычно. Осталась. К вечеру третьего дня впервые за много лет остановилась, потому что наелась, а не потому что тарелка пустая.',
    pips: ['−6 кг', 'осознанное питание'],
    cls: 'is-1', rating: 5,
  },
  {
    id: 8, initial: 'М', name: 'Мария, 50',
    meta: 'СТАРТ 91 КГ · 3 МЕС',
    category: 'похудение', program: 'Вес идеальности',
    quote: 'Врач сказал «просто ешьте меньше». Я так делала двадцать лет и снова набирала. Здесь объяснили почему. Теперь понимаю свой организм — не воюю с ним.',
    pips: ['−16 кг', 'холестерин в норме', 'энергия'],
    cls: 'is-2', rating: 5,
  },
  {
    id: 9, initial: 'А', name: 'Айгуль, 29',
    meta: 'БУЛИМИЯ (РЕМИССИЯ) · 4 МЕС',
    category: 'здоровье', program: 'Вес идеальности',
    quote: 'Не скажу вес — это моё. Скажу главное: я больше не наказываю себя едой. Четыре месяца без эпизодов. Для меня это огромно.',
    pips: ['без срывов 4 мес', 'отношения с едой'],
    cls: 'is-3', rating: 5,
  },
  {
    id: 10, initial: 'Л', name: 'Лариса, 55',
    meta: 'МЕНОПАУЗА · 2 МЕС',
    category: 'здоровье', program: 'Вес идеальности',
    quote: 'В менопаузу вес рос несмотря ни на что. Гормоны, обмен, всё не так. После интенсива минус восемь — без жёстких ограничений. Гинеколог удивился.',
    pips: ['−8 кг', 'гормональный фон', 'менопауза'],
    cls: 'is-1', rating: 5,
  },
  {
    id: 11, initial: 'Т', name: 'Татьяна, 43',
    meta: 'СТАРТ 76 КГ · 2 МЕС',
    category: 'похудение', program: 'Интенсив 2 дня',
    quote: 'Начала с двухдневного формата — думала, четыре дня это слишком. Сейчас жалею, что не пошла сразу на полный курс. Результат есть, но чувствую, что хочу глубже.',
    pips: ['−7 кг', 'понимание триггеров'],
    cls: 'is-2', rating: 4,
  },
  {
    id: 12, initial: 'Д', name: 'Динара, 31',
    meta: 'СТАРТ 65 КГ · 3 МЕС',
    category: 'эмоции', program: 'Online Detox',
    quote: 'Проходила онлайн из другого города. Оказалось удобнее — могла останавливаться, возвращаться к упражнениям. Минус пять кг за три месяца, но главное — ушёл страх перед едой.',
    pips: ['−5 кг', 'страх перед едой ушёл', 'онлайн'],
    cls: 'is-3', rating: 5,
  },
];

const REVIEW_CATS = [
  { id: 'все', label: 'Все' },
  { id: 'похудение', label: 'Похудение' },
  { id: 'здоровье', label: 'Здоровье' },
  { id: 'эмоции', label: 'Эмоции и поведение' },
];

const REVIEW_PROGRAMS = [
  'Вес идеальности',
  'Интенсив 2 дня',
  'Подростковый клуб',
  'Online Detox',
  'Клубные дни',
];

function RevStars({ count }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
      {[0,1,2,3,4].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24"
          fill={i < count ? 'var(--om-gold)' : 'none'}
          stroke={i < count ? 'var(--om-gold-deep)' : 'var(--om-border-strong)'}
          strokeWidth="1.5" strokeLinejoin="round"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </span>
  );
}

function ReviewCard({ r }) {
  return (
    <article className={'om-review-card om-testimonial-card ' + r.cls}>
      <div className="om-testimonial-head">
        <div className="om-testimonial-avatar">{r.initial}</div>
        <div>
          <div className="om-testimonial-name">{r.name}</div>
          <div className="om-testimonial-meta">{r.meta}</div>
        </div>
      </div>
      <RevStars count={r.rating} />
      <p className="om-testimonial-quote">«{r.quote}»</p>
      <div className="om-testimonial-pips">
        {r.pips.map((p, j) => <span key={j} className="om-testimonial-pip">{p}</span>)}
      </div>
      <div className="om-review-card-program">
        <span className="om-testimonial-meta">{r.program}</span>
      </div>
    </article>
  );
}

function ReviewForm() {
  const [form, setForm] = React.useState({ name: '', program: '', text: '', results: '' });
  const [submitted, setSubmitted] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  function change(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }

  function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Укажите имя';
    if (!form.program) errs.program = 'Выберите программу';
    if (form.text.trim().length < 20) errs.text = 'Напишите немного подробнее (не менее 20 символов)';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="om-form-success">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
          stroke="var(--om-sage-deep)" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"/>
          <polyline points="8,12 11,15 16,9"/>
        </svg>
        <h3 style={{ fontFamily: 'var(--om-font-sans)', fontWeight: 500, fontSize: 22, color: 'var(--om-ink)', margin: 0 }}>
          Спасибо за вашу историю
        </h3>
        <p style={{ color: 'var(--om-muted)', margin: 0, maxWidth: '34ch', lineHeight: 1.6, textAlign: 'center' }}>
          Мы получили ваш отзыв и свяжемся для подтверждения публикации.
        </p>
      </div>
    );
  }

  return (
    <form className="om-reviews-form-fields" onSubmit={submit} noValidate>
      <div className="om-form-row">
        <div className="om-form-field">
          <label className="om-form-label" htmlFor="rev-name">
            Имя <span style={{ color: 'var(--om-coral)' }}>*</span>
          </label>
          <input
            id="rev-name" type="text"
            className={'om-form-input' + (errors.name ? ' is-error' : '')}
            placeholder="Например: Анна, 42"
            value={form.name}
            onChange={e => change('name', e.target.value)}
          />
          {errors.name && <div className="om-form-error">{errors.name}</div>}
        </div>
        <div className="om-form-field">
          <label className="om-form-label" htmlFor="rev-prog">
            Программа <span style={{ color: 'var(--om-coral)' }}>*</span>
          </label>
          <select
            id="rev-prog"
            className={'om-form-select' + (errors.program ? ' is-error' : '')}
            value={form.program}
            onChange={e => change('program', e.target.value)}
          >
            <option value="">Выберите программу</option>
            {REVIEW_PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {errors.program && <div className="om-form-error">{errors.program}</div>}
        </div>
      </div>
      <div className="om-form-field">
        <label className="om-form-label" htmlFor="rev-text">
          Ваш отзыв <span style={{ color: 'var(--om-coral)' }}>*</span>
        </label>
        <textarea
          id="rev-text" rows={5}
          className={'om-form-textarea' + (errors.text ? ' is-error' : '')}
          placeholder="Расскажите о своём опыте — что изменилось, что было неожиданным, что вы открыли в себе."
          value={form.text}
          onChange={e => change('text', e.target.value)}
        />
        {errors.text && <div className="om-form-error">{errors.text}</div>}
      </div>
      <div className="om-form-field">
        <label className="om-form-label" htmlFor="rev-results">
          Ваши результаты{' '}
          <span style={{ color: 'var(--om-muted)', fontWeight: 400 }}>(необязательно)</span>
        </label>
        <input
          id="rev-results" type="text"
          className="om-form-input"
          placeholder="Например: −9 кг, сон улучшился, без срывов"
          value={form.results}
          onChange={e => change('results', e.target.value)}
        />
        <p style={{ margin: 0, fontSize: 12, color: 'var(--om-muted)', lineHeight: 1.5 }}>
          Перечислите через запятую — станут тегами под отзывом
        </p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
        <button type="submit" className="om-btn om-btn--primary" style={{ minWidth: 200 }}>
          Отправить отзыв
        </button>
      </div>
    </form>
  );
}

function ReviewsPage() {
  const [activeFilter, setActiveFilter] = React.useState('все');

  const filtered = activeFilter === 'все'
    ? REVIEWS
    : REVIEWS.filter(r => r.category === activeFilter);

  const countFor = id => id === 'все' ? REVIEWS.length : REVIEWS.filter(r => r.category === id).length;

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="om-reviews-hero" data-animate="reviews-hero">
        <div className="om-reviews-hero-inner">
          <div data-animate="reviews-hero-content">
            <div className="om-eyebrow" style={{ color: 'rgba(251,248,242,0.58)' }}>
              Истории клиентов
            </div>
            <h1 style={{
              fontFamily: 'var(--om-font-sans)',
              fontSize: 'clamp(44px, 5.6vw, 80px)',
              fontWeight: 500,
              lineHeight: 0.98,
              letterSpacing: '-0.025em',
              color: 'var(--om-on-indigo)',
              margin: '28px 0 0 0',
              maxWidth: '18ch',
              textWrap: 'balance',
            }}>
              Что говорят те,{' '}
              кто <span style={{ color: 'var(--om-gold)' }}>изменил</span> жизнь
            </h1>
            <p style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: 'rgba(251,248,242,0.7)',
              maxWidth: '50ch',
              margin: '32px 0 0 0',
            }}>
              Имена настоящие — публикуются с письменного согласия.
              Видеоотзывы доступны после первой консультации.
            </p>
          </div>
          <div data-animate="reviews-hero-chips">
            {[
              { num: '400+', label: 'историй за 7 лет' },
              { num: '93%', label: 'достигают результата' },
              { num: '4.9', label: 'средняя оценка' },
            ].map((c, i) => (
              <div key={i} className="om-reviews-hero-chip">
                <span className="om-reviews-hero-chip-num">{c.num}</span>
                <span className="om-reviews-hero-chip-label">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTER + GRID ────────────────────────────── */}
      <section className="om-reviews-grid-section">
        <div className="om-container">
          <div className="om-reviews-filter" data-animate="reviews-filter">
            {REVIEW_CATS.map(c => (
              <button
                key={c.id}
                className={'om-reviews-filter-chip' + (activeFilter === c.id ? ' is-active' : '')}
                onClick={() => setActiveFilter(c.id)}
              >
                {c.label}
                <span className="om-reviews-filter-count">{countFor(c.id)}</span>
              </button>
            ))}
          </div>

          <div className="om-reviews-cards" key={activeFilter}>
            {filtered.map(r => <ReviewCard key={r.id} r={r} />)}
          </div>
        </div>
      </section>

      {/* ── FEATURED QUOTE ───────────────────────────── */}
      <section className="om-reviews-featured">
        <div className="om-reviews-featured-inner" data-animate="reviews-featured">
          <div className="om-reviews-featured-label">
            <div className="om-eyebrow">История, которая остаётся</div>
          </div>
          <div>
            <blockquote className="om-reviews-featured-quote">
              «Врач сказал "просто ешьте меньше". Я так делала двадцать лет и снова набирала.
              Здесь объяснили почему. Теперь понимаю свой организм — не воюю с ним.»
            </blockquote>
            <div className="om-reviews-featured-author">
              <div className="om-testimonial-avatar" style={{ width: 52, height: 52, fontSize: 20, flexShrink: 0 }}>М</div>
              <div>
                <div style={{ fontWeight: 500, color: 'var(--om-ink)', fontSize: 16 }}>Мария, 50</div>
                <div style={{ fontSize: 12, color: 'var(--om-muted)', fontFamily: 'var(--om-font-mono)', letterSpacing: '0.05em', marginTop: 3 }}>
                  СТАРТ 91 КГ · 3 МЕС · −16 КГ
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FORM ─────────────────────────────────────── */}
      <section className="om-reviews-form-section">
        <div className="om-reviews-form-wrap">
          <div data-animate="reviews-form-head">
            <div className="om-eyebrow">Поделитесь</div>
            <h2 style={{
              fontFamily: 'var(--om-font-sans)',
              fontSize: 'clamp(32px, 3.6vw, 48px)',
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--om-ink)',
              margin: '16px 0 20px 0',
            }}>
              Ваша история{' '}
              <span style={{ color: 'var(--om-coral-deep)' }}>важна</span>
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--om-body)', maxWidth: '38ch' }}>
              Каждый отзыв — не просто слова. Он помогает людям, которые
              сомневаются, решиться на первый шаг.
            </p>
          </div>
          <div className="om-reviews-form-card" data-animate="reviews-form-card">
            <ReviewForm />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="om-cta" data-animate="reviews-cta">
        <div className="om-cta-inner">
          <div className="om-cta-card">
            <h2>
              Готовы начать{' '}
              <span style={{ color: 'var(--om-gold)' }}>свою историю</span>?
            </h2>
            <div className="om-cta-side">
              <p>Первая консультация — бесплатно. Следующий интенсив — в расписании.</p>
              <div className="om-cta-row">
                <a
                  className="om-btn om-btn--on-dark"
                  href="booking.html"
                  style={{ textDecoration: 'none' }}
                >
                  Записаться
                </a>
                <a href="schedule.html" className="om-btn om-btn--ghost"
                  style={{ color: 'rgba(251,248,242,0.7)', textDecoration: 'none' }}>
                  Расписание
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

window.ReviewsPage = ReviewsPage;
