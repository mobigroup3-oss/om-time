/* Footer.jsx — deep indigo footer with link columns. */

const ftStyles = {
  band: { background: 'var(--om-indigo-deep)', color: 'var(--om-on-indigo)', paddingTop: 72, paddingBottom: 36 },
  inner: {
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
  },
  top: { display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: 32, paddingBottom: 56 },
  brand: { display: 'flex', flexDirection: 'column', gap: 16 },
  brandRow: { display: 'flex', alignItems: 'center', gap: 12 },
  brandMark: { width: 44, height: 44, objectFit: 'contain' },
  brandText: { fontSize: 20, fontWeight: 500, color: 'var(--om-on-indigo)' },
  tagline: { fontSize: 14, color: 'rgba(251,248,242,0.7)', maxWidth: '34ch', lineHeight: 1.5 },
  socialRow: { display: 'flex', gap: 10, marginTop: 8 },
  socialIcon: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'rgba(251,248,242,0.08)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--om-on-indigo)', cursor: 'pointer',
  },
  colTitle: {
    fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
    fontWeight: 500, color: 'var(--om-gold)', marginBottom: 16,
  },
  links: { display: 'flex', flexDirection: 'column', gap: 10 },
  link: { fontSize: 14, color: 'rgba(251,248,242,0.78)', textDecoration: 'none', cursor: 'pointer' },
  divider: { borderTop: '1px solid rgba(251,248,242,0.12)', paddingTop: 24 },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    fontSize: 13,
    color: 'rgba(251,248,242,0.5)',
  },
  legalRow: { display: 'flex', gap: 24, flexWrap: 'wrap' },
  legalLink: { color: 'rgba(251,248,242,0.5)', textDecoration: 'none', cursor: 'pointer' },
  license: { fontSize: 13, color: 'rgba(251,248,242,0.55)', maxWidth: '70ch', marginBottom: 16 },
};

function Footer() {
  return (
    <footer style={ftStyles.band} id="contacts" data-screen-label="Marketing site / Footer">
      <div style={ftStyles.inner}>
        <div className="om-footer-top" style={ftStyles.top}>
          <div style={ftStyles.brand} data-animate="footer-col">
            <div style={ftStyles.brandRow}>
              <img src="../../assets/om-time-mark.png" alt="" style={ftStyles.brandMark} />
              <span style={ftStyles.brandText}>OM Time</span>
            </div>
            <div style={ftStyles.tagline}>Центр психосоматики и осознанной коррекции веса.</div>
            <div style={ftStyles.socialRow}>
              <a style={ftStyles.socialIcon} title="Instagram"><i data-lucide="camera" style={{ width: 18, height: 18 }}></i></a>
              <a style={ftStyles.socialIcon} title="YouTube"><i data-lucide="play" style={{ width: 18, height: 18 }}></i></a>
              <a style={ftStyles.socialIcon} title="TikTok"><i data-lucide="music" style={{ width: 18, height: 18 }}></i></a>
            </div>
          </div>

          <div data-animate="footer-col">
            <div style={ftStyles.colTitle}>Программы</div>
            <div style={ftStyles.links}>
              <a href="booking.html?program=flagship-offline" style={ftStyles.link}>Вес идеальности</a>
              <a href="booking.html?program=flagship-online" style={ftStyles.link}>Вес идеальности ONLINE</a>
              <a href="booking.html?program=teen" style={ftStyles.link}>Подростковый клуб</a>
              <a href="booking.html?program=detox" style={ftStyles.link}>ONLINE DETOX</a>
              <a href="booking.html?program=club" style={ftStyles.link}>Клубные дни</a>
              <a href="booking.html?program=consult" style={{ ...ftStyles.link, color: 'var(--om-gold)' }}>Записаться &rarr;</a>
            </div>
          </div>

          <div data-animate="footer-col">
            <div style={ftStyles.colTitle}>Центр</div>
            <div style={ftStyles.links}>
              <a href="team.html" style={ftStyles.link}>Команда тренеров</a>
              <a href="about.html" style={ftStyles.link}>О центре</a>
              <a href="reviews.html" style={ftStyles.link}>Отзывы</a>
              <a href="schedule.html" style={ftStyles.link}>Расписание</a>
              <a href="programs.html" style={ftStyles.link}>Каталог программ</a>
            </div>
          </div>

          <div data-animate="footer-col">
            <div style={ftStyles.colTitle}>Связаться</div>
            <div style={ftStyles.links}>
              <a href="tel:+77270000000" style={ftStyles.link}>+7 (727) 000-00-00</a>
              <a href="https://wa.me/77270000000" style={ftStyles.link}>WhatsApp</a>
              <a href="https://t.me/omtime_kz" style={ftStyles.link}>Telegram</a>
              <a href="mailto:hello@omtime.kz" style={ftStyles.link}>hello@omtime.kz</a>
              <span style={{ ...ftStyles.link, color: 'rgba(251,248,242,0.5)' }}>ежедневно 9:00–21:00</span>
            </div>
          </div>

          <div data-animate="footer-col">
            <div style={ftStyles.colTitle}>Адрес</div>
            <div style={ftStyles.links}>
              <span style={ftStyles.link}>Алматы</span>
              <span style={ftStyles.link}>мкр. Алмагуль 23А</span>
              <span style={ftStyles.link}>БЦ «ОмТайм»</span>
              <a style={ftStyles.link}><span style={{ borderBottom: '1px dashed currentColor', paddingBottom: 1 }}>Открыть на карте</span></a>
            </div>
          </div>
        </div>

        <div style={ftStyles.divider}>
          <p style={ftStyles.license}>
            Деятельность лицензирована как медицинская методика. Методика «Вес идеальности» одобрена
            Казахстанской Академией питания.
          </p>
          <div style={ftStyles.bottom}>
            <div>© 2026 OM Time. Все права защищены.</div>
            <div style={ftStyles.legalRow}>
              <a style={ftStyles.legalLink}>Политика конфиденциальности</a>
              <a style={ftStyles.legalLink}>Договор оферты</a>
              <a style={ftStyles.legalLink}>Согласие на обработку данных</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

window.Footer = Footer;
