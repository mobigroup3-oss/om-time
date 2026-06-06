/* SupportPage.jsx — страница «Два месяца сопровождения» OM Time.
   Раскрывает блок из IntensiveDays: что входит в сопровождение после
   программы «Вес идеальности» и почему это часть методики. */

const SUP_STATS = [
  { num: '2', unit: 'месяца', label: 'в закрытом чате после интенсива' },
  { num: '0', unit: '₸', label: 'доплат — входит в стоимость' },
  { num: '7/7', unit: '', label: 'дней психолог на связи' },
];

const SUP_INCLUDED = [
  {
    icon: 'message-circle',
    title: 'Закрытый чат с психологом',
    text: 'Два месяца после интенсива вы остаётесь в закрытой группе с тренером методики. Можно задать вопрос в любой момент — ответ приходит, пока ситуация ещё актуальна.',
  },
  {
    icon: 'life-buoy',
    title: 'Поддержка в дни срывов',
    text: 'Самый уязвимый период — первые недели самостоятельной работы. Когда привычное «заесть стресс» возвращается, рядом есть человек, который поможет пройти момент, а не остаться с ним один на один.',
  },
  {
    icon: 'compass',
    title: 'Разбор сложных моментов',
    text: 'Не получается удержать технику, вернулась старая тяга, сомнения в результате — всё это разбирается индивидуально. Методика подстраивается под вашу ситуацию, а не наоборот.',
  },
  {
    icon: 'book-open',
    title: 'Материалы от тренера',
    text: 'Записи практик, напоминания и материалы для закрепления — всё собрано в личном кабинете. Можно вернуться к нужной технике в любой день сопровождения.',
  },
];

const SUP_FLOW = [
  {
    n: '01',
    title: 'Интенсив завершён',
    text: 'Четыре дня работы позади. Нейропластика запущена, вес идеальности зафиксирован. Дальше начинается то, что превращает результат в устойчивый.',
  },
  {
    n: '02',
    title: 'Открывается доступ к чату',
    text: 'В личном кабинете появляется кнопка «Перейти в чат сопровождения». Видно текущий этап — например, «1 месяц сопровождения из 2» — и ближайшие встречи.',
  },
  {
    n: '03',
    title: 'Два месяца рядом',
    text: 'Вопросы, поддержка, разбор сложных дней. Тренер ведёт вас через период, в котором без сопровождения самостоятельная работа чаще всего провисает.',
  },
  {
    n: '04',
    title: 'Привычка закрепилась',
    text: 'К концу сопровождения новое пищевое поведение становится автоматическим. Через нейропластичность мозга формируются устойчивые привычки — результат держится годами.',
  },
];

const SUP_FAQ = [
  {
    q: 'Сопровождение нужно оплачивать отдельно?',
    a: 'Нет. Два месяца в закрытом чате входят в стоимость программы «Вес идеальности». Это не дополнительная услуга, а часть методики — отдельно платить не нужно.',
  },
  {
    q: 'Что именно происходит в чате сопровождения?',
    a: 'Вы задаёте вопросы по технике, разбираете сложные моменты, получаете поддержку в дни срывов. Тренер методики отвечает индивидуально под вашу ситуацию. Там же — материалы и напоминания для закрепления.',
  },
  {
    q: 'Сколько длится сопровождение?',
    a: 'Два месяца после завершения четырёхдневного интенсива. Именно на этот период приходится самый уязвимый этап, когда новая привычка ещё не стала автоматической.',
  },
  {
    q: 'Что делать, если случился срыв?',
    a: 'Написать в чат. Срыв — это не провал, а рабочий момент, который важно разобрать вовремя. Тренер поможет понять, что его запустило, и вернуться к технике, а не остаться с ситуацией один на один.',
  },
  {
    q: 'Сопровождение онлайн или очно?',
    a: 'Закрытый чат — онлайн, поэтому оставаться на связи можно из любой точки и в удобное время. Сам интенсив проходит очно в Алматы, а поддержка после него не привязана к городу.',
  },
  {
    q: 'А что после того, как два месяца закончатся?',
    a: 'К этому моменту новое пищевое поведение обычно уже закреплено и держится самостоятельно. Для дальнейшей поддержки есть «клубные дни» и короткий интенсив на 2 дня — по желанию.',
  },
];

/* ── Inline style constants ────────────────────────────────── */
const sp = {
  /* Hero */
  hero: {
    background: 'var(--om-indigo-deep)',
    padding: '128px 0 96px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(60% 50% at 85% 30%, rgba(242,193,46,0.12) 0%, transparent 60%), radial-gradient(50% 50% at 10% 90%, rgba(192,58,59,0.10) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  heroInner: {
    maxWidth: 'var(--om-container-max)',
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
    position: 'relative',
  },
  heroEyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 11,
    letterSpacing: '0.24em',
    textTransform: 'uppercase',
    fontWeight: 500,
    color: 'var(--om-gold)',
    marginBottom: 24,
  },
  heroEyebrowLine: { width: 28, height: 1, background: 'currentColor', opacity: 0.6, flexShrink: 0 },
  heroH1: {
    fontFamily: 'var(--om-font-sans)',
    fontSize: 'clamp(44px, 6vw, 84px)',
    fontWeight: 500,
    letterSpacing: '-0.03em',
    color: 'var(--om-on-indigo)',
    lineHeight: 0.98,
    margin: '0 0 32px',
    maxWidth: '18ch',
    textWrap: 'balance',
  },
  heroSub: {
    fontSize: 18,
    lineHeight: 1.62,
    color: 'rgba(251,248,242,0.72)',
    maxWidth: '58ch',
    margin: '0 0 52px',
  },
  heroStats: { display: 'flex', flexWrap: 'wrap', gap: 0 },
  heroStat: { display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 36 },
  heroStatNum: {
    fontFamily: 'var(--om-font-sans)',
    fontSize: 34,
    fontWeight: 500,
    color: 'var(--om-gold)',
    letterSpacing: '-0.025em',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
  },
  heroStatUnit: { fontSize: 15, color: 'rgba(251,248,242,0.7)', fontWeight: 400, letterSpacing: 0 },
  heroStatLabel: { fontSize: 13, color: 'rgba(251,248,242,0.55)', maxWidth: '24ch' },
  heroStatDiv: { width: 1, height: 48, background: 'rgba(251,248,242,0.14)', marginRight: 36, flexShrink: 0, alignSelf: 'center' },

  /* Why */
  why: { background: 'var(--om-cream)', padding: '96px 0' },
  whyInner: { maxWidth: 'var(--om-container-max)', margin: '0 auto', padding: '0 var(--om-container-pad)', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 80, alignItems: 'start' },
  whyLabel: { paddingTop: 8 },
  whyQ: {
    fontFamily: 'var(--om-font-editorial)',
    fontSize: 'clamp(24px, 2.8vw, 36px)',
    lineHeight: 1.4,
    color: 'var(--om-ink)',
    margin: '0 0 36px',
    fontStyle: 'normal',
    maxWidth: '68ch',
  },
  whyBody: { fontSize: 17, lineHeight: 1.68, color: 'var(--om-body)', margin: 0, maxWidth: '64ch' },

  /* Included */
  incl: { background: 'var(--om-canvas-white)', padding: '96px 0' },
  inclInner: { maxWidth: 'var(--om-container-max)', margin: '0 auto', padding: '0 var(--om-container-pad)' },
  inclHead: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'end', marginBottom: 64 },
  inclH2: { fontFamily: 'var(--om-font-sans)', fontSize: 'clamp(32px, 3.6vw, 48px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--om-ink)', margin: 0, lineHeight: 1.05 },
  inclSub: { fontSize: 16, lineHeight: 1.6, color: 'var(--om-muted)', margin: 0, maxWidth: '40ch' },
  inclGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 },
  inclCard: {
    background: 'var(--om-canvas)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-xl)',
    padding: '40px 36px',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  inclIcon: {
    width: 52, height: 52,
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--om-ink)',
  },
  inclTitle: { fontSize: 21, fontWeight: 500, color: 'var(--om-ink)', margin: 0, letterSpacing: '-0.01em' },
  inclText: { fontSize: 15, lineHeight: 1.65, color: 'var(--om-body)', margin: 0 },

  /* Flow */
  flow: { background: 'var(--om-canvas-soft)', padding: '96px 0' },
  flowInner: { maxWidth: 'var(--om-container-max)', margin: '0 auto', padding: '0 var(--om-container-pad)' },
  flowHead: { marginBottom: 56 },
  flowH2: { fontFamily: 'var(--om-font-sans)', fontSize: 'clamp(32px, 3.6vw, 48px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--om-ink)', margin: '12px 0 0', lineHeight: 1.05 },
  flowGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 },
  flowCard: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-xl)',
    padding: '32px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  flowNum: {
    fontFamily: 'var(--om-font-mono)',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--om-gold-deep)',
    letterSpacing: '0.08em',
  },
  flowTitle: { fontSize: 17, fontWeight: 500, color: 'var(--om-ink)', margin: 0, lineHeight: 1.3 },
  flowText: { fontSize: 14, lineHeight: 1.65, color: 'var(--om-body)', margin: 0 },

  /* FAQ */
  faq: { background: 'var(--om-canvas)', padding: '96px 0' },
  faqInner: { maxWidth: 880, margin: '0 auto', padding: '0 var(--om-container-pad)' },
  faqHead: { textAlign: 'center', marginBottom: 40 },
  faqH2: { fontFamily: 'var(--om-font-sans)', fontSize: 'clamp(28px, 3.2vw, 40px)', fontWeight: 500, color: 'var(--om-ink)', margin: '10px 0 0', letterSpacing: '-0.01em', lineHeight: 1.1 },
  faqList: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-lg)',
    overflow: 'hidden',
  },
  faqRow: { borderBottom: '1px solid var(--om-hairline-soft)' },
  faqQ: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    padding: '22px 26px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    textAlign: 'left',
    font: 'inherit',
    color: 'var(--om-ink)',
    fontSize: 17,
    fontWeight: 500,
    gap: 16,
  },
  faqQActive: { background: 'var(--om-canvas-soft)' },
  faqChev: { width: 20, height: 20, color: 'var(--om-muted)', transition: 'transform 200ms ease', flexShrink: 0 },
  faqChevOpen: { transform: 'rotate(180deg)', color: 'var(--om-ink)' },
  faqA: { padding: '0 26px 22px 26px', fontSize: 15, lineHeight: 1.6, color: 'var(--om-body)' },
};


/* ── Sub-components ────────────────────────────────────────── */

function SupIncludedCard({ c }) {
  return (
    <div style={sp.inclCard} data-animate="support-incl">
      <div style={sp.inclIcon}>
        <i data-lucide={c.icon} style={{ width: 24, height: 24 }} />
      </div>
      <h3 style={sp.inclTitle}>{c.title}</h3>
      <p style={sp.inclText}>{c.text}</p>
    </div>
  );
}

function SupFlowCard({ c }) {
  return (
    <div style={sp.flowCard} data-animate="support-flow-card">
      <span style={sp.flowNum}>{c.n}</span>
      <h3 style={sp.flowTitle}>{c.title}</h3>
      <p style={sp.flowText}>{c.text}</p>
    </div>
  );
}


function SupFaq() {
  const [open, setOpen] = React.useState(0);

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  return (
    <section style={sp.faq}>
      <div style={sp.faqInner}>
        <div style={sp.faqHead} data-animate="support-faq-head">
          <div className="om-eyebrow">Частые вопросы</div>
          <h2 style={sp.faqH2}>О сопровождении — коротко</h2>
        </div>
        <div style={sp.faqList}>
          {SUP_FAQ.map((f, i) => {
            const isOpen = open === i;
            const isLast = i === SUP_FAQ.length - 1;
            return (
              <div
                key={i}
                style={{ ...sp.faqRow, ...(isLast ? { borderBottom: 'none' } : {}) }}
                data-animate="support-faq-item"
              >
                <button
                  style={{ ...sp.faqQ, ...(isOpen ? sp.faqQActive : {}) }}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                >
                  {f.q}
                  <i data-lucide="chevron-down" style={{ ...sp.faqChev, ...(isOpen ? sp.faqChevOpen : {}) }}></i>
                </button>
                <div style={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0, overflow: 'hidden' }}>
                  <div style={sp.faqA}>{f.a}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


/* ── Main page component ───────────────────────────────────── */

function SupportPage() {
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  return (
    <React.Fragment>

      {/* ── HERO ─────────────────────────────── */}
      <section style={sp.hero}>
        <div style={sp.heroBg} aria-hidden="true" />
        <div style={sp.heroInner} data-animate="support-hero">
          <div style={sp.heroEyebrow}>
            <span style={sp.heroEyebrowLine} />
            сопровождение · часть методики
          </div>
          <h1 style={sp.heroH1}>
            И ещё два месяца,{' '}
            <span style={{ color: 'var(--om-gold)' }}>когда вы не одни</span>
          </h1>
          <p style={sp.heroSub}>
            После четырёх дней интенсива «Вес идеальности» работа не заканчивается.
            Два месяца вы остаётесь в закрытом чате с психологом — это не
            дополнительная услуга, а часть методики. Без сопровождения первый месяц
            самостоятельной работы чаще всего провисает.
          </p>
          <div style={sp.heroStats}>
            {SUP_STATS.map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <div style={sp.heroStat}>
                  <span style={sp.heroStatNum}>
                    {s.num}
                    {s.unit && <span style={sp.heroStatUnit}>{s.unit}</span>}
                  </span>
                  <span style={sp.heroStatLabel}>{s.label}</span>
                </div>
                {i < arr.length - 1 && <div style={sp.heroStatDiv} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ──────────────────────────────── */}
      <section style={sp.why}>
        <div style={sp.whyInner} className="om-support-why-inner" data-animate="support-why">
          <div style={sp.whyLabel}>
            <div className="om-eyebrow">Зачем это нужно</div>
          </div>
          <div>
            <blockquote style={sp.whyQ}>
              «Интенсив запускает изменения. Но закрепляются они не за четыре дня —
              а в те недели, когда человек возвращается в обычную жизнь. Именно тогда
              важно, чтобы рядом кто-то был.»
            </blockquote>
            <p style={sp.whyBody}>
              Нейропластика, запущенная на интенсиве, без поддержки склонна
              возвращаться к исходному. Первый месяц — самый уязвимый: старые
              сценарии «заесть стресс» ещё сильны, а новая привычка ещё не
              автоматическая. Сопровождение закрывает именно этот разрыв: вопросы
              разбираются по мере того, как возникают, а дни срывов не остаются
              без внимания. Поэтому два месяца в закрытом чате входят в стоимость
              программы — отдельно платить не нужно.
            </p>
          </div>
        </div>
      </section>

      {/* ── INCLUDED ─────────────────────────── */}
      <section style={sp.incl}>
        <div style={sp.inclInner}>
          <div style={sp.inclHead} className="om-support-incl-head" data-animate="support-incl-head">
            <div>
              <div className="om-eyebrow">Что входит</div>
              <h2 style={sp.inclH2}>
                Поддержка,{' '}
                <span style={{ color: 'var(--om-coral-deep)' }}>а не рассылка</span>
              </h2>
            </div>
            <p style={sp.inclSub}>
              Живой контакт с тренером методики, а не автоматические напоминания.
              Всё, что помогает удержать результат после интенсива.
            </p>
          </div>
          <div style={sp.inclGrid} className="om-support-incl-grid">
            {SUP_INCLUDED.map(c => <SupIncludedCard key={c.title} c={c} />)}
          </div>
        </div>
      </section>

      {/* ── FLOW ─────────────────────────────── */}
      <section style={sp.flow}>
        <div style={sp.flowInner}>
          <div style={sp.flowHead} data-animate="support-flow-head">
            <div className="om-eyebrow">Как это устроено</div>
            <h2 style={sp.flowH2}>От интенсива — к привычке</h2>
          </div>
          <div style={sp.flowGrid} className="om-support-flow-grid">
            {SUP_FLOW.map(c => <SupFlowCard key={c.n} c={c} />)}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────── */}
      <SupFaq />

      {/* ── CTA ──────────────────────────────── */}
      <section className="om-cta" data-animate="support-cta">
        <div className="om-cta-inner">
          <div className="om-cta-card">
            <h2>
              Готовы пройти путь{' '}
              <span style={{ color: 'var(--om-gold)' }}>с поддержкой</span>?
            </h2>
            <div className="om-cta-side">
              <p>Оставьте заявку — расскажем о ближайших датах интенсива «Вес идеальности» и ответим на вопросы о сопровождении.</p>
              <div className="om-cta-row">
                <a
                  className="om-btn om-btn--on-dark"
                  href="booking.html?program=flagship-offline"
                  style={{ textDecoration: 'none' }}
                >
                  Оставить заявку
                  <i data-lucide="arrow-up-right" className="om-icon-16"></i>
                </a>
                <a href="programs.html" className="om-btn om-btn--ghost"
                  style={{ color: 'rgba(251,248,242,0.7)', textDecoration: 'none' }}>
                  О программе
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </React.Fragment>
  );
}

window.SupportPage = SupportPage;
