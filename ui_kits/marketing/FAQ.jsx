/* FAQ.jsx — accordion of frequently-asked questions. */

const faqStyles = {
  inner: {
    maxWidth: 880,
    margin: '0 auto',
    padding: '0 var(--om-container-pad)',
  },
  head: { textAlign: 'center', marginBottom: 40 },
  eyebrow: {
    fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
    fontWeight: 500, color: 'var(--om-muted)', display: 'block', marginBottom: 10,
  },
  h2: { fontSize: 36, fontWeight: 500, color: 'var(--om-ink)', margin: 0, letterSpacing: '-0.01em' },

  list: {
    background: 'var(--om-canvas-white)',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-lg)',
    overflow: 'hidden',
  },
  row: { borderBottom: '1px solid var(--om-hairline-soft)' },
  rowLast: { borderBottom: 'none' },
  q: {
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
  qActive: { background: 'var(--om-canvas-soft)' },
  chev: { width: 20, height: 20, color: 'var(--om-muted)', transition: 'transform 200ms ease' },
  chevOpen: { transform: 'rotate(180deg)', color: 'var(--om-ink)' },
  a: {
    padding: '0 26px 22px 26px',
    fontSize: 15,
    lineHeight: 1.6,
    color: 'var(--om-body)',
  },
};

const FAQS = [
  {
    q: 'Как быстро будет результат?',
    a: 'По данным методики — 10–15% от исходного веса в месяц. При весе 80 кг это от 8 до 12 килограммов за первый месяц. Дальше темп зависит от того, как идёт сопровождение.',
  },
  {
    q: 'Это гипноз?',
    a: 'Нет. Все техники — в полной осознанности. Вы контролируете процесс, не уходите в транс, всё понимаете. Это принципиальное отличие от гипноза и кодирования.',
  },
  {
    q: 'Нужна ли диета?',
    a: 'Нет. Методика учит осознанному питанию — без подсчёта калорий и списка запрещённых продуктов. Через изменение пищевого поведения порции уменьшаются естественно.',
  },
  {
    q: 'Сколько стоит и есть ли рассрочка?',
    a: 'Полный 4-дневный курс — от 130 000 до 160 000 ₸. Доступна рассрочка Kaspi RED 0% на 12 или 24 месяца. При предоплате за 3–4 дня — скидка 15 000 ₸.',
  },
  {
    q: 'Подходит ли беременным?',
    a: 'Да, со 2 триместра — методика безопасна. Это одно из её отличий от гипноза. На первой консультации скажите о беременности — тренер учтёт это в работе.',
  },
  {
    q: 'Это очно или онлайн?',
    a: 'Курс «Вес идеальности» проходит очно в Алматы по адресу мкр. Алмагуль 23А, БЦ «ОмТайм». Некоторые программы (онлайн-детокс, разборы) — онлайн через Zoom, доступны из любой страны.',
  },
];

function FAQ() {
  const [open, setOpen] = React.useState(0);
  const contentRefs = React.useRef({});
  const isFirstRun = React.useRef(true);

  React.useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    Object.keys(contentRefs.current).forEach((key) => {
      const el = contentRefs.current[key];
      if (!el) return;
      const idx = parseInt(key, 10);
      const shouldOpen = idx === open;
      if (window.omAnimateFaqOpen) {
        window.omAnimateFaqOpen(el, shouldOpen);
      } else {
        el.style.height = shouldOpen ? 'auto' : '0px';
        el.style.opacity = shouldOpen ? '1' : '0';
        el.style.overflow = 'hidden';
      }
    });
  }, [open]);

  return (
    <section className="om-section" data-screen-label="Marketing site / FAQ">
      <div style={faqStyles.inner}>
        <div style={faqStyles.head} data-animate="faq-head">
          <span style={faqStyles.eyebrow}>Часто задают</span>
          <h2 style={faqStyles.h2}>Что обычно спрашивают перед записью</h2>
        </div>
        <div style={faqStyles.list}>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            const isLast = i === FAQS.length - 1;
            return (
              <div
                key={i}
                style={{ ...faqStyles.row, ...(isLast ? faqStyles.rowLast : {}) }}
                data-animate="faq-item"
              >
                <button
                  style={{ ...faqStyles.q, ...(isOpen ? faqStyles.qActive : {}) }}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  {f.q}
                  <i data-lucide="chevron-down" style={{ ...faqStyles.chev, ...(isOpen ? faqStyles.chevOpen : {}) }}></i>
                </button>
                <div
                  ref={(el) => { contentRefs.current[i] = el; }}
                  data-animate="faq-content"
                  style={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0, overflow: 'hidden' }}
                >
                  <div style={faqStyles.a}>{f.a}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

window.FAQ = FAQ;
