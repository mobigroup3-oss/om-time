/* Hero.jsx — cinematic editorial opener.
   Mixes Onest with Fraunces italic for an editorial display moment;
   coral card receives mouse-tilt + scroll parallax via animations.js.
   Right column supports an image carousel managed from the admin panel
   (data stored in localStorage key "om-hero-carousel"). */

const HERO_DEFAULT_SLIDES = [
  { id: 'd2', url: '../../uploads/%D0%BA%D0%B0%D1%80%D1%83%D1%81%D0%B5%D0%BB%D1%8C/%D0%BA%D0%B0%D1%80%D1%83%D1%81%D0%B5%D0%BB%D1%8C%202.png', label: '' },
  { id: 'd3', url: '../../uploads/%D0%BA%D0%B0%D1%80%D1%83%D1%81%D0%B5%D0%BB%D1%8C/%D0%BA%D0%B0%D1%80%D1%83%D1%81%D0%B5%D0%BB%D1%8C%203.png', label: '' },
  { id: 'd4', url: '../../uploads/%D0%BA%D0%B0%D1%80%D1%83%D1%81%D0%B5%D0%BB%D1%8C/%D0%BA%D0%B0%D1%80%D1%83%D1%81%D0%B5%D0%BB%D1%8C%204.png', label: '' },
  { id: 'd5', url: '../../uploads/%D0%BA%D0%B0%D1%80%D1%83%D1%81%D0%B5%D0%BB%D1%8C/%D0%BA%D0%B0%D1%80%D1%83%D1%81%D0%B5%D0%BB%D1%8C%205.png', label: '' },
  { id: 'd6', url: '../../uploads/%D0%BA%D0%B0%D1%80%D1%83%D1%81%D0%B5%D0%BB%D1%8C/%D0%BA%D0%B0%D1%80%D1%83%D1%81%D0%B5%D0%BB%D1%8C%206.png', label: '' },
  { id: 'd7', url: '../../uploads/%D0%BA%D0%B0%D1%80%D1%83%D1%81%D0%B5%D0%BB%D1%8C/%D0%BA%D0%B0%D1%80%D1%83%D1%81%D0%B5%D0%BB%D1%8C%207.png', label: '' },
  { id: 'd8', url: '../../uploads/%D0%BA%D0%B0%D1%80%D1%83%D1%81%D0%B5%D0%BB%D1%8C/%D0%BA%D0%B0%D1%80%D1%83%D1%81%D0%B5%D0%BB%D1%8C%208.png', label: '' },
];

// Месяцы в родительном падеже (как в мини-календаре блока «Ближайшее событие»).
const HERO_MONTHS_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

// Из свободной строки дат программы («10-11 Июня 2026», «старт 12 ноября»)
// вытаскиваем число (день) и месяц для мини-календаря. Не нашли — пустая строка.
function heroParseDate(dates) {
  if (!dates) return { day: '', month: '' };
  const str = String(dates);
  const dayM = str.match(/\d+/);
  const low = str.toLowerCase();
  let month = '';
  for (let i = 0; i < HERO_MONTHS_RU.length; i++) {
    if (low.includes(HERO_MONTHS_RU[i].slice(0, 3))) { month = HERO_MONTHS_RU[i]; break; }
  }
  return { day: dayM ? dayM[0] : '', month };
}

// Цена программы (число тенге + опц. префикс «от») → строка вида «80 000₸».
function heroFormatPrice(prefix, price) {
  if (price == null || price === '') return '';
  const num = Number(price).toLocaleString('ru-RU') + '₸';
  return [prefix, num].filter(Boolean).join(' ');
}

// Каноничную программу из /api/programs → данные для блока «Ближайшее событие».
function heroFeaturedEvent(c) {
  if (!c) return null;
  const d = heroParseDate(c.dates);
  return {
    day: d.day,
    month: d.month,
    title: c.title || '',
    trainer: [c.trainer, c.formatLabel].filter(Boolean).join(' · '),
    price: heroFormatPrice(c.pricePrefix, c.price),
  };
}

function Hero() {
  const [slides, setSlides] = React.useState([]);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [featured, setFeatured] = React.useState(null);

  function loadSlides() {
    try {
      const saved = JSON.parse(localStorage.getItem('om-hero-carousel') || '[]');
      return saved.length > 0 ? saved : HERO_DEFAULT_SLIDES;
    }
    catch (e) { return HERO_DEFAULT_SLIDES; }
  }

  React.useEffect(() => {
    let alive = true;
    setSlides(loadSlides()); // мгновенно из кэша/дефолта
    // затем — источник правды с сервера
    fetch('/api/hero')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(j => { if (alive && j && j.ok && j.data && j.data.length) setSlides(j.data); })
      .catch(() => {});
    function onUpdate() { setSlides(loadSlides()); }
    window.addEventListener('om-carousel-updated', onUpdate);
    return () => { alive = false; window.removeEventListener('om-carousel-updated', onUpdate); };
  }, []);

  // Флагманская программа (featured) → в блок «Ближайшее событие».
  // /api/programs отдаёт только опубликованные, так что условие — просто featured.
  React.useEffect(() => {
    let alive = true;
    fetch('/api/programs')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(j => {
        if (!alive || !j || !j.ok || !Array.isArray(j.data)) return;
        // showInHero — явная галочка «Ближайшее событие»; featured — обратная совместимость
        const flag = j.data.find(p => p.showInHero) || j.data.find(p => p.featured);
        if (flag) setFeatured(heroFeaturedEvent(flag));
      })
      .catch(() => {}); // нет сервера/флагмана — остаётся дефолтное событие
    return () => { alive = false; };
  }, []);

  React.useEffect(() => {
    if (slides.length < 2) { setActiveIdx(0); return; }
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const hasSlides = slides.length > 0;

  return (
    <section className="om-hero" data-screen-label="Marketing site / Hero">
      <div className="om-hero-meta">
        <span className="om-dot"></span>
        <span>центр современных психотехнологий · алматы и онлайн</span>
      </div>

      <div className="om-hero-grid">
        <div data-animate="hero-text">
          <h1 id="hero-h1" className="om-hero-h1">
            <span className="om-hero-line">Снижение веса</span>
            {' '}
            <span className="om-hero-line">через <span className="om-italic">работу</span></span>
            {' '}
            <span className="om-hero-line">с сознанием</span>
          </h1>
          <p id="hero-sub" className="om-hero-sub">
            Четырёхдневный интенсив на основе психосоматики, медитации и нейропластики.
            Лицензированная клиническая методика — без диет, без гипноза, без насилия над собой.
          </p>
          <div id="hero-cta" className="om-hero-cta-row">
            <a
              className="om-btn om-btn--primary"
              href="booking.html?program=flagship-offline"
              style={{ textDecoration: 'none' }}
            >
              Записаться на программу
              <i data-lucide="arrow-up-right" className="om-icon-16"></i>
            </a>
            <a
              className="om-btn om-btn--secondary"
              href="schedule.html"
              style={{ textDecoration: 'none' }}
            >
              Посмотреть расписание
            </a>
          </div>
          <div id="hero-trust" className="om-hero-trust">
            <span>
              <i data-lucide="badge-check" className="om-icon-16" style={{ color: 'var(--om-sage-deep)' }}></i>
              Рассрочка Kaspi RED 0%
            </span>
            <span>
              <i data-lucide="shield-check" className="om-icon-16" style={{ color: 'var(--om-sage-deep)' }}></i>
              Лицензированная методика
            </span>
            <span>
              <i data-lucide="map-pin" className="om-icon-16" style={{ color: 'var(--om-sage-deep)' }}></i>
              Алматы и онлайн
            </span>
          </div>
        </div>

        <div className="om-hero-side" data-animate="hero-side">
          <div className="om-hero-card-stage">
            {!hasSlides ? (
              <div className="om-hero-card om-hero-card-float" data-animate="hero-card">
                <div>
                  <span className="om-hero-card-source" style={{ display: 'block', marginBottom: 28 }}>
                    Клинические исследования / 1 месяц
                  </span>
                  <div className="om-hero-card-fig">
                    <span className="om-counter-num" data-counter-target="93" data-counter-suffix="">0</span>
                    <sup>%</sup>
                  </div>
                  <p className="om-hero-card-cap">участников снижают ИМТ на 2–3 пункта без диет и гипноза</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 16 }}>
                  <span className="om-hero-card-source">«Вес идеальности»</span>
                  <span style={{
                    fontFamily: 'var(--om-font-mono)', fontSize: 11,
                    letterSpacing: '0.16em', opacity: 0.6,
                  }}>FIG · 01</span>
                </div>
              </div>
            ) : (
              <div className="om-hero-carousel om-hero-card-float" data-animate="hero-card" role="region" aria-label="Рекламные материалы">
                {slides.map((slide, i) => (
                  <div
                    key={slide.id}
                    className={'om-hero-carousel-slide' + (i === activeIdx ? ' is-active' : '')}
                    aria-hidden={i !== activeIdx}
                  >
                    <img src={slide.url} alt={slide.label || 'Реклама'} />
                  </div>
                ))}
                {slides.length > 1 && (
                  <div className="om-hero-carousel-dots" role="tablist" aria-label="Слайды">
                    {slides.map((slide, i) => (
                      <button
                        key={slide.id}
                        role="tab"
                        aria-selected={i === activeIdx}
                        className={'om-hero-carousel-dot' + (i === activeIdx ? ' is-active' : '')}
                        onClick={() => setActiveIdx(i)}
                        aria-label={'Слайд ' + (i + 1) + (slide.label ? ': ' + slide.label : '')}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <a href={featured ? 'programs.html' : 'schedule.html'} className="om-hero-events">
            <div className="om-hero-events-cal">
              <span className="om-hero-events-cal-d">{featured ? (featured.day || '—') : '10'}</span>
              <span className="om-hero-events-cal-m">{featured ? featured.month : 'июня'}</span>
            </div>
            <div className="om-hero-events-body">
              <div className="om-hero-events-label">
                <span className="om-hero-events-pulse"></span>
                Ближайшее событие
              </div>
              <div className="om-hero-events-name">{featured ? featured.title : 'Терапевтическая группа'}</div>
              <div className="om-hero-events-trainer">{featured ? featured.trainer : 'Дян Н.Г. · Алматы · 18:00'}</div>
            </div>
            <div className="om-hero-events-aside">
              <span className="om-hero-events-price">{featured ? featured.price : '15 000₸'}</span>
              <span className="om-hero-events-go" aria-hidden="true">
                <i data-lucide="arrow-up-right" style={{ width: 16, height: 16 }}></i>
              </span>
            </div>
          </a>
        </div>
      </div>

      <div className="om-hero-foot" style={{ maxWidth: 'var(--om-container-max)', margin: '80px auto 0', padding: '28px var(--om-container-pad) 0' }}>
        <span>лицензированная медицинская методика</span>
        <span>одобрено <strong>Казахстанской Академией питания</strong></span>
        <span>методика «Вес идеальности» / основана 2017</span>
      </div>
    </section>
  );
}

window.Hero = React.memo(Hero);
