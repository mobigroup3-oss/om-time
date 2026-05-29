/* IntensiveDays.jsx — dark indigo signature surface, sticky day rail. */

const DAYS = [
  {
    n: '01',
    title: 'Нейропластика желудка',
    body: 'Медитативная техника, которая уменьшает объём желудка на 30–40%. После первого дня многие отмечают, что насыщение приходит после половины обычной порции.',
    meta: ['медитация', 'нейропластика', '90 минут'],
  },
  {
    n: '02',
    title: 'Карта стройности',
    body: 'Работа с пищевыми триггерами — теми, что запускают переедание. По данным методики, после второго дня тяга к сладкому снижается в среднем на 67%.',
    meta: ['психосоматика', 'групповой разбор', '2 часа'],
  },
  {
    n: '03',
    title: 'Психомоделирующее дыхание',
    body: 'Активация липолиза — расщепления жиров на клеточном уровне. Тело начинает использовать жировые запасы как основной источник энергии.',
    meta: ['дыхание', 'липолиз', '90 минут'],
  },
  {
    n: '04',
    title: 'Фиксация веса идеальности',
    body: 'Якорные техники, которые закрепляют новое состояние. Без фиксации нейропластика возвращается к исходному. С фиксацией — держится годами.',
    meta: ['якорение', 'долгосрочно', '2 часа'],
  },
];

function IntensiveDays() {
  return (
    <section className="om-intensive" data-screen-label="Marketing site / Intensive days">
      <div className="om-intensive-inner">
        <div className="om-intensive-head" data-animate="intensive-head">
          <h2>
            Что происходит за&nbsp;<span className="om-italic">четыре дня</span>
          </h2>
          <p>
            Каждый день — отдельная техника. Все четыре собираются в&nbsp;одну работающую систему. Расписание плотное, но&nbsp;паузы между блоками длинные — чтобы успеть прожить материал.
          </p>
        </div>

        <div className="om-intensive-rail">
          <nav className="om-intensive-list" data-day-list>
            {DAYS.map((d, i) => (
              <button key={d.n} data-day-item={i} className={i === 0 ? 'is-active' : ''}>
                <span>{d.n} · {d.title.split(' ').slice(0, 2).join(' ')}</span>
              </button>
            ))}
          </nav>
          <div className="om-intensive-stack" data-day-stack>
            {DAYS.map((d, i) => (
              <article key={d.n} className="om-day" data-animate="day-card" data-day-card={i}>
                <span className="om-day-num">{d.n}</span>
                <div>
                  <div className="om-day-tag">день {d.n}</div>
                  <h3>{d.title}</h3>
                  <p>{d.body}</p>
                  <div className="om-day-meta">
                    {d.meta.map(m => <span key={m}>{m}</span>)}
                  </div>
                </div>
              </article>
            ))}

            <div className="om-intensive-footer" data-animate="intensive-footer">
              <div>
                <h4>И&nbsp;ещё <span className="om-italic">два месяца</span> сопровождения</h4>
                <p>
                  После интенсива — закрытый чат с&nbsp;психологом. Ответы на&nbsp;вопросы, поддержка, разбор сложных моментов. Без сопровождения первый месяц самостоятельной работы провисает.
                </p>
              </div>
              <button className="om-btn" style={{ background: 'var(--om-ink)', color: '#fff' }}>
                Подробнее
                <i data-lucide="arrow-up-right" className="om-icon-16"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

window.IntensiveDays = IntensiveDays;
