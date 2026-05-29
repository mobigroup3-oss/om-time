/* CtaBand.jsx — full-bleed editorial closer on ink-deep surface. */

function CtaBand() {
  return (
    <section className="om-cta" data-screen-label="Marketing site / CTA band">
      <div className="om-cta-inner">
        <div className="om-cta-card" data-animate="cta-band">
          <div data-animate="cta-content">
            <h2>
              Готовы <span className="om-italic">начать</span> &mdash; напишите нам
            </h2>
          </div>
          <div className="om-cta-side" data-animate="cta-side">
            <p>
              Оставьте заявку — администратор свяжется в&nbsp;течение часа в&nbsp;рабочее время и&nbsp;подберёт удобную программу и&nbsp;дату. Без обязательств: можно просто задать вопрос.
            </p>
            <div className="om-cta-row">
              <a
                className="om-btn om-btn--gold"
                href="booking.html"
                style={{ textDecoration: 'none' }}
              >
                Оставить заявку
                <i data-lucide="arrow-up-right" className="om-icon-16"></i>
              </a>
              <a
                className="om-btn om-btn--on-dark"
                href="tel:+77270000000"
                style={{ textDecoration: 'none' }}
              >
                +7 727 000 00 00
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

window.CtaBand = CtaBand;
