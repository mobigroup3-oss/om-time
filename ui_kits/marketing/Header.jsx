/* Header.jsx — top navigation. Sticky, glass on scroll, editorial.
   Responsive: full nav on desktop, collapses to a burger drawer < 900px.
   Styling lives in page.css (.om-header*) so media queries can control it. */

function Header({ active = 'programs', onNav }) {
  const [open, setOpen] = React.useState(false);

  const path = typeof window !== 'undefined'
    ? window.location.pathname.replace(/\\/g, '/')
    : '';
  // Имя страницы без расширения — работает и с .html, и с чистыми URL (Vercel cleanUrls).
  const SUBPAGES = ['programs', 'schedule', 'team', 'reviews', 'about', 'contacts', 'booking'];
  const pageName = path.split('/').pop().replace(/\.html$/, '');
  const isSubPage = SUBPAGES.includes(pageName);

  const items = [
    { id: 'programs', label: 'программы', href: 'programs.html', external: true },
    { id: 'schedule', label: 'расписание', href: 'schedule.html', external: true },
    { id: 'team', label: 'команда', href: 'team.html', external: true },
    { id: 'reviews', label: 'отзывы', href: 'reviews.html', external: true },
    { id: 'about', label: 'о центре', href: 'about.html', external: true },
    { id: 'contacts', label: 'контакты', href: 'contacts.html', external: true },
  ];

  const logoHref = isSubPage ? 'index.html' : '#top';

  // Lock body scroll while the mobile drawer is open.
  React.useEffect(() => {
    document.documentElement.classList.toggle('om-no-scroll', open);
    return () => document.documentElement.classList.remove('om-no-scroll');
  }, [open]);

  // Close on Escape, and auto-close if the viewport grows back to desktop.
  React.useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    function onResize() { if (window.innerWidth > 900) setOpen(false); }
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  function navClick(item, e) {
    if (!item.external && !isSubPage) {
      e.preventDefault();
      onNav && onNav(item.id);
    }
    setOpen(false);
  }

  function brandClick(e) {
    if (!isSubPage) {
      e.preventDefault();
      onNav && onNav('home');
    }
    setOpen(false);
  }

  return (
    <header className="om-header" data-screen-label="Marketing site / Header" data-animate="header">
      <div className="om-header-inner">
        <a className="om-header-brand" href={logoHref} onClick={brandClick}>
          <img src="../../assets/om-time-mark.png" alt="" className="om-header-mark" />
          <span className="om-header-brand-text">
            <span className="om-header-brand-name">OM Time</span>
            <span className="om-header-brand-sub">est. 2017 · алматы</span>
          </span>
        </a>

        <nav className="om-header-nav">
          {items.map(i => (
            <a
              key={i.id}
              href={i.href}
              className={'om-header-link' + (active === i.id ? ' is-active' : '')}
              onClick={(e) => navClick(i, e)}
            >
              {i.label}
            </a>
          ))}
        </nav>

        <div className="om-header-actions">
          <div className="om-header-locale">
            <span className="is-active">RU</span>
            <span>KZ</span>
            <span>EN</span>
          </div>
          <a className="om-btn om-btn--ghost om-header-login" href="../account/account.html" style={{ textDecoration: 'none' }}>
            Войти
          </a>
          <a className="om-btn om-btn--primary om-header-cta" href="booking.html" style={{ textDecoration: 'none' }}>
            Записаться
          </a>
          <button
            type="button"
            className={'om-header-burger' + (open ? ' is-open' : '')}
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={open}
            aria-controls="om-mobile-menu"
            onClick={() => setOpen(o => !o)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <div id="om-mobile-menu" className={'om-header-mobile' + (open ? ' is-open' : '')}>
        <nav className="om-header-mobile-nav">
          {items.map(i => (
            <a
              key={i.id}
              href={i.href}
              className={'om-header-mobile-link' + (active === i.id ? ' is-active' : '')}
              onClick={(e) => navClick(i, e)}
            >
              {i.label}
            </a>
          ))}
        </nav>
        <div className="om-header-mobile-foot">
          <a className="om-btn om-btn--primary" href="booking.html" onClick={() => setOpen(false)} style={{ textDecoration: 'none', width: '100%', justifyContent: 'center' }}>
            Записаться
          </a>
          <a className="om-btn om-btn--secondary" href="../account/account.html" onClick={() => setOpen(false)} style={{ textDecoration: 'none', width: '100%', justifyContent: 'center' }}>
            Войти
          </a>
          <div className="om-header-mobile-locale">
            <span className="is-active">RU</span>
            <span>KZ</span>
            <span>EN</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        className={'om-header-scrim' + (open ? ' is-open' : '')}
        onClick={() => setOpen(false)}
      ></button>
    </header>
  );
}

window.Header = Header;
