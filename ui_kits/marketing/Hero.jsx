/* Hero.jsx — cinematic editorial opener.
   Mixes Onest with Fraunces italic for an editorial display moment;
   coral card receives mouse-tilt + scroll parallax via animations.js.
   Right column supports an image carousel managed from the admin panel
   (data stored in localStorage key "om-hero-carousel"). */

function Hero() {
  const [slides, setSlides] = React.useState([]);
  const [activeIdx, setActiveIdx] = React.useState(0);

  function loadSlides() {
    try { return JSON.parse(localStorage.getItem('om-hero-carousel') || '[]'); }
    catch (e) { return []; }
  }

  React.useEffect(() => {
    setSlides(loadSlides());
    function onUpdate() { setSlides(loadSlides()); }
    window.addEventListener('om-carousel-updated', onUpdate);
    return () => window.removeEventListener('om-carousel-updated', onUpdate);
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

          <a href="schedule.html" className="om-hero-events">
            <div className="om-hero-events-cal">
              <span className="om-hero-events-cal-d">10</span>
              <span className="om-hero-events-cal-m">июня</span>
            </div>
            <div className="om-hero-events-body">
              <div className="om-hero-events-label">
                <span className="om-hero-events-pulse"></span>
                Ближайшее событие
              </div>
              <div className="om-hero-events-name">Терапевтическая группа</div>
              <div className="om-hero-events-trainer">Дян Н.Г. · Алматы · 18:00</div>
            </div>
            <div className="om-hero-events-aside">
              <span className="om-hero-events-price">15 000₸</span>
              <i data-lucide="arrow-right" style={{ width: 14, height: 14, color: 'var(--om-coral)' }}></i>
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
