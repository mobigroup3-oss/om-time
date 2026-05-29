/* ContactsPage.jsx — страница «Контакты» OM Time */

const CHANNELS = [
  {
    icon: 'phone',
    title: 'Телефон',
    value: '+7 (727) 000-00-00',
    sub: 'Ежедневно 9:00–21:00',
    href: 'tel:+77270000000',
    cta: 'Позвонить',
    iconColor: 'var(--om-indigo)',
    iconBg: 'rgba(46,36,112,0.08)',
  },
  {
    icon: 'message-circle',
    title: 'WhatsApp',
    value: '+7 (727) 000-00-00',
    sub: 'Ответим в течение часа',
    href: 'https://wa.me/77270000000',
    cta: 'Написать',
    iconColor: '#25D366',
    iconBg: 'rgba(37,211,102,0.09)',
  },
  {
    icon: 'send',
    title: 'Telegram',
    value: '@omtime_kz',
    sub: 'Быстрые ответы',
    href: 'https://t.me/omtime_kz',
    cta: 'Открыть',
    iconColor: '#229ED9',
    iconBg: 'rgba(34,158,217,0.09)',
  },
  {
    icon: 'mail',
    title: 'E-mail',
    value: 'hello@omtime.kz',
    sub: 'Для официальных запросов',
    href: 'mailto:hello@omtime.kz',
    cta: 'Написать письмо',
    iconColor: 'var(--om-coral)',
    iconBg: 'rgba(192,58,59,0.08)',
  },
];

const HOURS = [
  { days: 'Понедельник — Пятница', time: '9:00 — 21:00' },
  { days: 'Суббота', time: '10:00 — 19:00' },
  { days: 'Воскресенье', time: '10:00 — 17:00' },
];

const PROMISES = [
  'Перезвоним в течение часа в рабочее время',
  'Подберём программу и дату под ваш запрос',
  'Первая консультация — бесплатно',
];

const ct = {
  hero: {
    background: 'var(--om-canvas)',
    padding: '120px 0 96px',
    position: 'relative',
    overflow: 'hidden',
    borderBottom: '1px solid var(--om-hairline)',
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(65% 50% at 80% 60%, rgba(46,36,112,0.06) 0%, transparent 65%), radial-gradient(50% 45% at 15% 30%, rgba(242,193,46,0.06) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  heroInner: {
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: 80,
    alignItems: 'center',
  },
  heroEyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 11,
    letterSpacing: '0.24em',
    textTransform: 'uppercase',
    fontWeight: 500,
    color: 'var(--om-muted)',
    marginBottom: 24,
  },
  heroEyebrowLine: { width: 28, height: 1, background: 'currentColor', opacity: 0.5, flexShrink: 0 },
  heroH1: {
    fontFamily: 'var(--om-font-sans)',
    fontSize: 'clamp(44px, 6vw, 80px)',
    fontWeight: 500,
    letterSpacing: '-0.03em',
    color: 'var(--om-ink)',
    lineHeight: 0.95,
    margin: '0 0 28px',
    maxWidth: '16ch',
  },
  heroSub: {
    fontSize: 18,
    lineHeight: 1.62,
    color: 'var(--om-muted)',
    maxWidth: '48ch',
    margin: '0 0 44px',
  },
  heroCtaRow: { display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' },

  heroCard: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-xl)',
    padding: '36px',
    boxShadow: 'var(--om-shadow-lifted)',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  heroCardLabel: {
    fontSize: 11,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    fontWeight: 500,
    color: 'var(--om-gold-deep)',
    marginBottom: 4,
    display: 'block',
  },
  heroInfoRow: { display: 'flex', alignItems: 'flex-start', gap: 14 },
  heroInfoIconWrap: {
    width: 36, height: 36,
    borderRadius: 'var(--om-radius-sm)',
    background: 'var(--om-canvas)',
    border: '1px solid var(--om-hairline)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'var(--om-muted)',
  },
  heroInfoLabel: { fontSize: 11, color: 'var(--om-muted)', display: 'block', marginBottom: 2 },
  heroInfoValue: { fontSize: 15, fontWeight: 500, color: 'var(--om-ink)', lineHeight: 1.4 },
  heroDivider: { height: 1, background: 'var(--om-hairline)' },
  heroOnlineBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--om-sage-deep)',
    background: 'rgba(78,107,63,0.08)',
    border: '1px solid rgba(78,107,63,0.15)',
    borderRadius: 'var(--om-radius-pill)',
    padding: '7px 14px',
    alignSelf: 'flex-start',
  },
  heroOnlineDot: {
    width: 7, height: 7,
    borderRadius: '50%',
    background: 'var(--om-sage-deep)',
    flexShrink: 0,
  },

  channels: { background: 'var(--om-canvas-soft)', padding: '96px 0' },
  channelsInner: { maxWidth: 'var(--om-container-max)', margin: '0 auto', padding: '0 var(--om-container-pad)' },
  channelsHead: { marginBottom: 56 },
  channelsH2: { fontFamily: 'var(--om-font-sans)', fontSize: 'clamp(28px, 3.2vw, 44px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--om-ink)', margin: '12px 0 0', lineHeight: 1.05 },
  channelsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 },
  channelCard: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-xl)',
    padding: '32px 28px 28px',
    display: 'flex',
    flexDirection: 'column',
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: 'var(--om-shadow-card)',
    transition: 'transform 0.28s var(--om-ease-out), box-shadow 0.28s var(--om-ease-out)',
  },
  channelIconWrap: {
    width: 52, height: 52,
    borderRadius: 'var(--om-radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    flexShrink: 0,
  },
  channelLabel: { fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--om-muted)', marginBottom: 8 },
  channelValue: { fontSize: 17, fontWeight: 500, color: 'var(--om-ink)', marginBottom: 8, letterSpacing: '-0.01em', lineHeight: 1.3 },
  channelSub: { fontSize: 13, color: 'var(--om-muted)', lineHeight: 1.5, marginBottom: 24, flexGrow: 1 },
  channelCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--om-ink)',
    padding: '8px 16px',
    background: 'var(--om-canvas)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-pill)',
    alignSelf: 'flex-start',
    marginTop: 'auto',
  },

  formSection: { background: 'var(--om-canvas)', padding: '96px 0' },
  formInner: {
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
    display: 'grid',
    gridTemplateColumns: '1fr 1.15fr',
    gap: 80,
    alignItems: 'start',
  },
  formLeft: { paddingTop: 12 },
  formH2: { fontFamily: 'var(--om-font-sans)', fontSize: 'clamp(28px, 3.2vw, 44px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--om-ink)', margin: '12px 0 20px', lineHeight: 1.05 },
  formSub: { fontSize: 16, lineHeight: 1.65, color: 'var(--om-muted)', margin: '0 0 36px', maxWidth: '38ch' },
  formPromises: { display: 'flex', flexDirection: 'column', gap: 14 },
  formPromise: { display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--om-body)' },
  formPromiseDot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--om-gold)', flexShrink: 0 },

  formCard: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-xl)',
    padding: '40px 36px',
    boxShadow: 'var(--om-shadow-lifted)',
  },
  formCardTitle: { fontSize: 18, fontWeight: 500, color: 'var(--om-ink)', margin: '0 0 28px', letterSpacing: '-0.01em' },
  formRow: { marginBottom: 20 },
  formRowTwo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  formLabel: { fontSize: 13, fontWeight: 500, color: 'var(--om-ink)', display: 'block', marginBottom: 8 },
  formNote: { fontSize: 12, color: 'var(--om-muted)', marginTop: 16, textAlign: 'center', lineHeight: 1.55 },

  formSuccess: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 340,
    gap: 16,
    textAlign: 'center',
    padding: '48px 36px',
  },
  successIconWrap: {
    width: 72, height: 72,
    background: 'rgba(78,107,63,0.1)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--om-sage-deep)',
    marginBottom: 4,
  },
  successH3: { fontSize: 24, fontWeight: 500, color: 'var(--om-ink)', margin: 0, letterSpacing: '-0.015em' },
  successText: { fontSize: 15, lineHeight: 1.65, color: 'var(--om-muted)', margin: 0, maxWidth: '30ch' },

  address: { background: 'var(--om-indigo-deep)', padding: '96px 0', position: 'relative', overflow: 'hidden' },
  addressBg: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(55% 40% at 80% 30%, rgba(242,193,46,0.10) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  addressInner: { maxWidth: 'var(--om-container-max)', margin: '0 auto', padding: '0 var(--om-container-pad)', display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 80, alignItems: 'start', position: 'relative' },
  addressLeft: { display: 'flex', flexDirection: 'column', gap: 40 },
  addressTopRow: {},
  addressEyebrow: { fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--om-gold)', marginBottom: 16, display: 'block' },
  addressH2: { fontFamily: 'var(--om-font-sans)', fontSize: 'clamp(28px, 3.2vw, 44px)', fontWeight: 500, letterSpacing: '-0.025em', color: 'var(--om-on-indigo)', margin: 0, lineHeight: 1.05 },

  addressItems: { display: 'flex', flexDirection: 'column', gap: 20 },
  addressItem: { display: 'flex', alignItems: 'flex-start', gap: 16 },
  addressItemIcon: {
    width: 40, height: 40,
    borderRadius: 'var(--om-radius-sm)',
    background: 'rgba(251,248,242,0.08)',
    border: '1px solid rgba(251,248,242,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    color: 'rgba(251,248,242,0.7)',
  },
  addressItemLabel: { fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(251,248,242,0.42)', display: 'block', marginBottom: 4 },
  addressItemValue: { fontSize: 15, color: 'var(--om-on-indigo)', lineHeight: 1.5 },
  addressItemLink: { fontSize: 15, color: 'rgba(251,248,242,0.85)', lineHeight: 1.5, textDecoration: 'none', borderBottom: '1px solid rgba(251,248,242,0.2)', paddingBottom: 1 },

  hoursCard: {
    background: 'rgba(251,248,242,0.06)',
    border: '1px solid rgba(251,248,242,0.1)',
    borderRadius: 'var(--om-radius-lg)',
    overflow: 'hidden',
  },
  hoursTitle: { fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--om-gold)', padding: '14px 20px', borderBottom: '1px solid rgba(251,248,242,0.08)', display: 'block' },
  hoursRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', fontSize: 14, color: 'rgba(251,248,242,0.85)', borderBottom: '1px solid rgba(251,248,242,0.05)' },
  hoursTime: { fontFamily: 'var(--om-font-mono)', fontSize: 13, color: 'rgba(251,248,242,0.6)' },

  mapWrap: {
    borderRadius: 'var(--om-radius-xl)',
    overflow: 'hidden',
    position: 'relative',
    aspectRatio: '16 / 11',
    background: 'rgba(251,248,242,0.04)',
    border: '1px solid rgba(251,248,242,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapGrid: {
    position: 'absolute', inset: 0,
    backgroundImage: 'linear-gradient(rgba(251,248,242,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(251,248,242,0.04) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  mapPin: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  mapPinDot: {
    width: 16, height: 16,
    borderRadius: '50%',
    background: 'var(--om-gold)',
    boxShadow: '0 0 0 6px rgba(242,193,46,0.25), 0 0 0 12px rgba(242,193,46,0.1)',
  },
  mapPinLine: { width: 1, height: 32, background: 'rgba(242,193,46,0.4)' },
  mapLabel: {
    background: 'rgba(27,20,72,0.92)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(251,248,242,0.14)',
    borderRadius: 'var(--om-radius-md)',
    padding: '14px 20px',
    minWidth: 220,
    zIndex: 2,
  },
  mapLabelAddress: { fontSize: 14, fontWeight: 500, color: 'var(--om-on-indigo)', margin: '0 0 4px' },
  mapLabelSub: { fontSize: 12, color: 'rgba(251,248,242,0.55)', margin: 0 },
  mapOpenLink: {
    position: 'absolute',
    bottom: 16, right: 16,
    zIndex: 3,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--om-on-indigo)',
    background: 'rgba(251,248,242,0.1)',
    border: '1px solid rgba(251,248,242,0.15)',
    borderRadius: 'var(--om-radius-pill)',
    padding: '8px 14px',
    textDecoration: 'none',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },

  social: { background: 'var(--om-canvas-soft)', padding: '56px 0' },
  socialInner: { maxWidth: 'var(--om-container-max)', margin: '0 auto', padding: '0 var(--om-container-pad)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' },
  socialText: {},
  socialH3: { fontFamily: 'var(--om-font-sans)', fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--om-ink)', margin: '0 0 6px' },
  socialSub: { fontSize: 14, color: 'var(--om-muted)', margin: 0 },
  socialIcons: { display: 'flex', gap: 10 },
  socialIconLink: {
    width: 48, height: 48,
    borderRadius: '50%',
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--om-ink)',
    textDecoration: 'none',
    boxShadow: 'var(--om-shadow-card)',
    transition: 'transform 0.25s var(--om-ease-out), box-shadow 0.25s var(--om-ease-out)',
  },
};

/* ── Sub-components ─────────────────────────── */

function ChannelCard({ ch }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <a
      href={ch.href}
      style={{
        ...ct.channelCard,
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: hovered ? '0 20px 48px rgba(27,24,64,0.13)' : 'var(--om-shadow-card)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-animate="contact-channel"
    >
      <div style={{ ...ct.channelIconWrap, background: ch.iconBg }}>
        <i data-lucide={ch.icon} style={{ width: 24, height: 24, color: ch.iconColor }} />
      </div>
      <div style={ct.channelLabel}>{ch.title}</div>
      <div style={ct.channelValue}>{ch.value}</div>
      <div style={ct.channelSub}>{ch.sub}</div>
      <span style={ct.channelCta}>
        {ch.cta}
        <i data-lucide="arrow-up-right" style={{ width: 13, height: 13 }} />
      </span>
    </a>
  );
}

function ContactForm() {
  const [form, setForm] = React.useState({ name: '', phone: '', topic: '', message: '' });
  const [sent, setSent] = React.useState(false);
  const [focused, setFocused] = React.useState(null);

  const inputStyle = (field) => ({
    width: '100%',
    height: 48,
    background: 'var(--om-canvas)',
    border: focused === field ? '1.5px solid var(--om-indigo)' : '1.5px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-sm)',
    padding: '0 16px',
    fontSize: 15,
    color: 'var(--om-ink)',
    fontFamily: 'var(--om-font-sans)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  });

  const textareaStyle = {
    width: '100%',
    height: 108,
    background: 'var(--om-canvas)',
    border: focused === 'message' ? '1.5px solid var(--om-indigo)' : '1.5px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-sm)',
    padding: '13px 16px',
    fontSize: 15,
    color: 'var(--om-ink)',
    fontFamily: 'var(--om-font-sans)',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    lineHeight: 1.55,
  };

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div style={ct.formCard}>
        <div style={ct.formSuccess}>
          <div style={ct.successIconWrap}>
            <i data-lucide="check" style={{ width: 32, height: 32 }} />
          </div>
          <h3 style={ct.successH3}>Заявка отправлена</h3>
          <p style={ct.successText}>
            Администратор свяжется с вами в&nbsp;течение часа в рабочее время.
          </p>
          <button
            className="om-btn om-btn--secondary"
            style={{ marginTop: 8 }}
            onClick={() => { setSent(false); setForm({ name: '', phone: '', topic: '', message: '' }); }}
          >
            Отправить ещё
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={ct.formCard} data-animate="contact-form">
      <h3 style={ct.formCardTitle}>Оставить заявку</h3>
      <form onSubmit={handleSubmit} noValidate>
        <div style={ct.formRowTwo}>
          <div>
            <label style={ct.formLabel}>Имя</label>
            <input
              type="text"
              placeholder="Ваше имя"
              value={form.name}
              required
              style={inputStyle('name')}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label style={ct.formLabel}>Телефон</label>
            <input
              type="tel"
              placeholder="+7 (___) ___-__-__"
              value={form.phone}
              required
              style={inputStyle('phone')}
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused(null)}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        <div style={ct.formRow}>
          <label style={ct.formLabel}>Тема обращения</label>
          <select
            value={form.topic}
            style={{ ...inputStyle('topic'), paddingRight: 40, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
            onFocus={() => setFocused('topic')}
            onBlur={() => setFocused(null)}
            onChange={e => setForm({ ...form, topic: e.target.value })}
          >
            <option value="">Выберите тему...</option>
            <option value="program">Программа «Вес идеальности»</option>
            <option value="intensive">Интенсив 2 дня</option>
            <option value="teen">Подростковый клуб</option>
            <option value="online">ONLINE DETOX</option>
            <option value="other">Другой вопрос</option>
          </select>
        </div>

        <div style={{ ...ct.formRow, marginBottom: 28 }}>
          <label style={ct.formLabel}>Сообщение <span style={{ color: 'var(--om-muted)', fontWeight: 400 }}>(необязательно)</span></label>
          <textarea
            placeholder="Расскажите подробнее о своём запросе или задайте вопрос..."
            value={form.message}
            style={textareaStyle}
            onFocus={() => setFocused('message')}
            onBlur={() => setFocused(null)}
            onChange={e => setForm({ ...form, message: e.target.value })}
          />
        </div>

        <button
          type="submit"
          className="om-btn om-btn--primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Отправить заявку
          <i data-lucide="arrow-up-right" style={{ width: 16, height: 16 }} />
        </button>

        <p style={ct.formNote}>
          Нажимая кнопку, вы соглашаетесь с&nbsp;
          <a href="#" style={{ color: 'var(--om-link)', textDecoration: 'none' }}>политикой конфиденциальности</a>.
          Мы не&nbsp;передаём данные третьим лицам.
        </p>
      </form>
    </div>
  );
}

function SocialIconLink({ icon, title, href }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <a
      href={href || '#'}
      title={title}
      style={{
        ...ct.socialIconLink,
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 12px 28px rgba(27,24,64,0.12)' : 'var(--om-shadow-card)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <i data-lucide={icon} style={{ width: 20, height: 20 }} />
    </a>
  );
}


/* ── Main page component ─────────────────────── */

function ContactsPage() {
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  return (
    <React.Fragment>

      {/* ── HERO ───────────────────────────────── */}
      <section style={ct.hero}>
        <div style={ct.heroBg} aria-hidden="true" />
        <div style={ct.heroInner} className="om-contacts-hero-inner">
          <div data-animate="contacts-hero">
            <div style={ct.heroEyebrow}>
              <span style={ct.heroEyebrowLine} />
              OM Time · Алматы · Онлайн
            </div>
            <h1 style={ct.heroH1}>
              Свяжитесь{' '}
              <span style={{ color: 'var(--om-coral-deep)' }}>с нами</span>
            </h1>
            <p style={ct.heroSub}>
              Первая консультация бесплатно. Подберём программу и&nbsp;дату,
              ответим на любые вопросы — в удобном для вас канале.
            </p>
            <div style={ct.heroCtaRow}>
              <a href="tel:+77270000000" className="om-btn om-btn--primary">
                <i data-lucide="phone" style={{ width: 16, height: 16 }} />
                Позвонить сейчас
              </a>
              <a href="https://wa.me/77270000000" className="om-btn om-btn--secondary" style={{ textDecoration: 'none' }}>
                Написать в WhatsApp
              </a>
            </div>
          </div>

          <div style={ct.heroCard} data-animate="contacts-hero-card" className="om-contacts-hero-card">
            <span style={ct.heroCardLabel}>Быстрая связь</span>
            {[
              { icon: 'phone', label: 'Телефон', value: '+7 (727) 000-00-00', href: 'tel:+77270000000' },
              { icon: 'send', label: 'Telegram', value: '@omtime_kz', href: 'https://t.me/omtime_kz' },
              { icon: 'mail', label: 'E-mail', value: 'hello@omtime.kz', href: 'mailto:hello@omtime.kz' },
            ].map((item, i, arr) => (
              <React.Fragment key={item.label}>
                <div style={ct.heroInfoRow}>
                  <div style={ct.heroInfoIconWrap}>
                    <i data-lucide={item.icon} style={{ width: 16, height: 16 }} />
                  </div>
                  <div>
                    <span style={ct.heroInfoLabel}>{item.label}</span>
                    <a href={item.href} style={{ ...ct.heroInfoValue, color: 'var(--om-ink)', textDecoration: 'none' }}>
                      {item.value}
                    </a>
                  </div>
                </div>
                {i < arr.length - 1 && <div style={ct.heroDivider} />}
              </React.Fragment>
            ))}
            <div style={ct.heroDivider} />
            <div style={ct.heroOnlineBadge}>
              <div style={ct.heroOnlineDot} />
              Ежедневно 9:00–21:00
            </div>
          </div>
        </div>
      </section>

      {/* ── CHANNELS ───────────────────────────── */}
      <section style={ct.channels}>
        <div style={ct.channelsInner}>
          <div style={ct.channelsHead} data-animate="contacts-channels-head">
            <div className="om-eyebrow">Способы связи</div>
            <h2 style={ct.channelsH2}>
              Выберите удобный{' '}
              <span style={{ color: 'var(--om-coral-deep)' }}>канал</span>
            </h2>
          </div>
          <div style={ct.channelsGrid} className="om-contacts-channels-grid">
            {CHANNELS.map(ch => <ChannelCard key={ch.title} ch={ch} />)}
          </div>
        </div>
      </section>

      {/* ── FORM ───────────────────────────────── */}
      <section style={ct.formSection}>
        <div style={ct.formInner} className="om-contacts-form-inner">
          <div style={ct.formLeft} data-animate="contacts-form-left">
            <div className="om-eyebrow">Форма обратной связи</div>
            <h2 style={ct.formH2}>
              Оставьте заявку —{' '}
              <span style={{ color: 'var(--om-coral-deep)' }}>перезвоним</span>
            </h2>
            <p style={ct.formSub}>
              Администратор свяжется в&nbsp;течение часа в&nbsp;рабочее время
              и&nbsp;подберёт удобную программу и&nbsp;дату.
            </p>
            <div style={ct.formPromises}>
              {PROMISES.map(p => (
                <div key={p} style={ct.formPromise}>
                  <div style={ct.formPromiseDot} />
                  {p}
                </div>
              ))}
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* ── ADDRESS ────────────────────────────── */}
      <section style={ct.address}>
        <div style={ct.addressBg} aria-hidden="true" />
        <div style={ct.addressInner} className="om-contacts-address-inner">
          <div style={ct.addressLeft} data-animate="contacts-address">
            <div style={ct.addressTopRow}>
              <span style={ct.addressEyebrow}>Адрес и часы работы</span>
              <h2 style={ct.addressH2}>Алматы, мкр.&nbsp;Алмагуль</h2>
            </div>

            <div style={ct.addressItems}>
              {[
                {
                  icon: 'map-pin',
                  label: 'Адрес',
                  content: <span style={ct.addressItemValue}>мкр. Алмагуль 23А, БЦ&nbsp;«ОмТайм»<br />Алматы, Казахстан</span>,
                },
                {
                  icon: 'phone',
                  label: 'Телефон и WhatsApp',
                  content: <a href="tel:+77270000000" style={ct.addressItemLink}>+7 (727) 000-00-00</a>,
                },
                {
                  icon: 'send',
                  label: 'Telegram',
                  content: <a href="https://t.me/omtime_kz" style={ct.addressItemLink}>@omtime_kz</a>,
                },
                {
                  icon: 'mail',
                  label: 'E-mail',
                  content: <a href="mailto:hello@omtime.kz" style={ct.addressItemLink}>hello@omtime.kz</a>,
                },
              ].map(item => (
                <div key={item.label} style={ct.addressItem}>
                  <div style={ct.addressItemIcon}>
                    <i data-lucide={item.icon} style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <span style={ct.addressItemLabel}>{item.label}</span>
                    {item.content}
                  </div>
                </div>
              ))}
            </div>

            <div style={ct.hoursCard}>
              <span style={ct.hoursTitle}>Часы работы</span>
              {HOURS.map((h, i) => (
                <div key={h.days} style={{ ...ct.hoursRow, borderBottom: i < HOURS.length - 1 ? '1px solid rgba(251,248,242,0.05)' : 'none' }}>
                  <span>{h.days}</span>
                  <span style={ct.hoursTime}>{h.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div data-animate="contacts-map">
            <div style={ct.mapWrap}>
              <div style={ct.mapGrid} aria-hidden="true" />
              <div style={ct.mapPin}>
                <div style={ct.mapPinDot} />
                <div style={ct.mapPinLine} />
                <div style={ct.mapLabel}>
                  <p style={ct.mapLabelAddress}>мкр. Алмагуль 23А, БЦ «ОмТайм»</p>
                  <p style={ct.mapLabelSub}>Алматы · ежедневно 9:00–21:00</p>
                </div>
              </div>
              <a
                href="https://2gis.kz/almaty/search/%D0%9E%D0%BC%D0%A2%D0%B0%D0%B9%D0%BC"
                target="_blank"
                rel="noopener noreferrer"
                style={ct.mapOpenLink}
              >
                <i data-lucide="map" style={{ width: 13, height: 13 }} />
                Открыть на карте
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL ─────────────────────────────── */}
      <section style={ct.social} data-animate="contacts-social">
        <div style={ct.socialInner}>
          <div style={ct.socialText}>
            <h3 style={ct.socialH3}>Мы в социальных сетях</h3>
            <p style={ct.socialSub}>Вдохновение, истории участников и анонсы программ</p>
          </div>
          <div style={ct.socialIcons}>
            <SocialIconLink icon="camera" title="Instagram" />
            <SocialIconLink icon="play" title="YouTube" />
            <SocialIconLink icon="music" title="TikTok" />
            <SocialIconLink icon="send" title="Telegram" href="https://t.me/omtime_kz" />
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────── */}
      <section className="om-cta" data-animate="contacts-cta">
        <div className="om-cta-inner">
          <div className="om-cta-card">
            <div>
              <h2>Готовы <span className="om-italic">начать</span>&nbsp;—<br />запишитесь сейчас</h2>
            </div>
            <div className="om-cta-side">
              <p>Первая консультация бесплатно. Подберём программу и дату, ответим на вопросы без обязательств.</p>
              <div className="om-cta-row">
                <a
                  className="om-btn om-btn--gold"
                  href="booking.html?program=consult"
                  style={{ textDecoration: 'none' }}
                >
                  Записаться на консультацию
                  <i data-lucide="arrow-up-right" className="om-icon-16" />
                </a>
                <a href="tel:+77270000000" className="om-btn om-btn--on-dark" style={{ textDecoration: 'none' }}>
                  +7 727 000 00 00
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </React.Fragment>
  );
}

window.ContactsPage = ContactsPage;
