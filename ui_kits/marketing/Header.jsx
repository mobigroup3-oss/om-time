/* Header.jsx — top navigation. Sticky, glass on scroll, editorial. */

const headerStyles = {
  bar: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    height: 84,
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(251, 248, 242, 0.72)',
    backdropFilter: 'blur(10px) saturate(1.2)',
    WebkitBackdropFilter: 'blur(10px) saturate(1.2)',
    borderBottom: '1px solid transparent',
    transition: 'background 0.3s, border-color 0.3s',
  },
  inner: {
    width: '100%',
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: 32,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    textDecoration: 'none',
    color: 'var(--om-ink)',
  },
  brandMark: { width: 42, height: 42, objectFit: 'contain' },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1,
  },
  brandName: { fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' },
  brandSub: {
    fontSize: 10,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'var(--om-muted)',
    marginTop: 4,
  },
  nav: {
    display: 'flex',
    gap: 28,
    justifyContent: 'center',
    fontFamily: 'var(--om-font-sans)',
  },
  navLink: {
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '0.04em',
    color: 'var(--om-body)',
    textDecoration: 'none',
    cursor: 'pointer',
    position: 'relative',
    paddingBottom: 4,
  },
  right: { display: 'flex', alignItems: 'center', gap: 14 },
  locale: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.12em',
    color: 'var(--om-muted)',
    display: 'flex',
    gap: 8,
    marginRight: 8,
  },
  localeActive: { color: 'var(--om-ink)' },
};

function Header({ active = 'programs', onNav }) {
  const path = typeof window !== 'undefined'
    ? window.location.pathname.replace(/\\/g, '/')
    : '';
  const isSubPage = path.includes('programs.html') || path.includes('schedule.html') || path.includes('team.html') || path.includes('reviews.html') || path.includes('about.html') || path.includes('contacts.html') || path.includes('booking.html');

  const items = [
    { id: 'programs', label: 'программы', href: 'programs.html', external: true },
    { id: 'schedule', label: 'расписание', href: 'schedule.html', external: true },
    { id: 'team', label: 'команда', href: 'team.html', external: true },
    { id: 'reviews', label: 'отзывы', href: 'reviews.html', external: true },
    { id: 'about', label: 'о центре', href: 'about.html', external: true },
    { id: 'contacts', label: 'контакты', href: 'contacts.html', external: true },
  ];

  const logoHref = isSubPage ? 'index.html' : '#top';

  return (
    <header style={headerStyles.bar} data-screen-label="Marketing site / Header" data-animate="header">
      <div style={headerStyles.inner}>
        <a
          href={logoHref}
          style={headerStyles.brand}
          onClick={isSubPage ? undefined : (e) => { e.preventDefault(); onNav && onNav('home'); }}
        >
          <img src="../../assets/om-time-mark.png" alt="" style={headerStyles.brandMark} />
          <span style={headerStyles.brandText}>
            <span style={headerStyles.brandName}>OM Time</span>
            <span style={headerStyles.brandSub}>est. 2017 · алматы</span>
          </span>
        </a>
        <nav style={headerStyles.nav}>
          {items.map(i => (
            <a
              key={i.id}
              href={i.href}
              style={{
                ...headerStyles.navLink,
                color: active === i.id ? 'var(--om-ink)' : 'var(--om-body)',
                borderBottom: active === i.id ? '1px solid var(--om-ink)' : '1px solid transparent',
              }}
              onClick={i.external || isSubPage ? undefined : (e) => { e.preventDefault(); onNav && onNav(i.id); }}
            >
              {i.label}
            </a>
          ))}
        </nav>
        <div style={headerStyles.right}>
          <div style={headerStyles.locale}>
            <span style={headerStyles.localeActive}>RU</span>
            <span>KZ</span>
            <span>EN</span>
          </div>
          <a
            className="om-btn om-btn--ghost"
            href="../account/account.html"
            style={{ textDecoration: 'none' }}
          >
            Войти
          </a>
          <a
            className="om-btn om-btn--primary"
            href="booking.html"
            style={{ textDecoration: 'none' }}
          >
            Записаться
          </a>
        </div>
      </div>
    </header>
  );
}

window.Header = Header;
