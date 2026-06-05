// AdminAnalytics.jsx — профессиональная аналитика центра (admin)
// Графики на чистом SVG/CSS, без внешних библиотек (no-build окружение).
// Данные демонстрационные, по периодам; число новых заявок берётся live
// из localStorage('omtime.requests.v1'). Программы и специалисты синхронны
// с AdminProgramsEditor / AdminTeamEditor. Стили — общая дизайн-система кабинета
// (om-stat-*, om-chart-*, om-seg, om-hbar-*, om-legend-*). Обёрнут в IIFE.

(function () {
  const { useState, useMemo } = React;
  const LucideIcon = window.LucideIcon;

  const RQ_KEY   = 'omtime.requests.v1';
  const TEAM_KEY = 'omtime.team.v1'; // источник реальной команды (AdminTeamEditor)

  // Палитра графиков — бренд-токены (colors_and_type.css), подобраны под
  // читаемость на белом: глубокие оттенки вместо пастельных surface-цветов.
  const C = {
    gold:   '#C99A12', // --om-gold-deep
    coral:  '#C03A3B', // --om-coral
    sage:   '#4E6B3F', // --om-sage-deep
    indigo: '#2E2470', // --om-indigo
    lilac:  '#8E7CC3', // глубже --om-lilac для контраста
  };

  const fmt = (n) => n.toLocaleString('ru-RU');
  const money = (n) => n.toLocaleString('ru-RU') + ' ₸';

  // Наборы данных по периодам (демо).
  // clients     — KPI по клиентам (active — активных, fresh — новых за период,
  //               retention — доходят до конца курса %, churn — отток %).
  // clientsDelta — изменение к прошлому периоду (для churn меньше = лучше).
  // newClients  — приток новых клиентов по тем же отрезкам, что и revenue.
  const DATA = {
    month: {
      label: 'за последние 30 дней',
      kpi:   { revenue: 2130000, bookings: 142, avgCheck: 15000, fill: 78 },
      delta: { revenue: 12.4, bookings: 8.1, avgCheck: 4.0, fill: 5 },
      clients:      { active: 168, fresh: 41, retention: 71, churn: 9 },
      clientsDelta: { active: 6.2, fresh: 9.4, retention: 3, churn: -2 },
      newClients: [9, 11, 13, 8],
      revenue: [
        { label: 'Нед. 1', value: 498000 },
        { label: 'Нед. 2', value: 521000 },
        { label: 'Нед. 3', value: 558000 },
        { label: 'Нед. 4', value: 553000 },
      ],
      weekday: [
        { label: 'Пн', value: 14 }, { label: 'Вт', value: 19 },
        { label: 'Ср', value: 22 }, { label: 'Чт', value: 24 },
        { label: 'Пт', value: 31 }, { label: 'Сб', value: 26 },
        { label: 'Вс', value: 6 },
      ],
    },
    quarter: {
      label: 'за квартал',
      kpi:   { revenue: 6360000, bookings: 418, avgCheck: 15200, fill: 74 },
      delta: { revenue: 9.2, bookings: 6.4, avgCheck: 2.6, fill: 3 },
      clients:      { active: 412, fresh: 123, retention: 73, churn: 8 },
      clientsDelta: { active: 5.1, fresh: 6.8, retention: 2, churn: -1 },
      newClients: [38, 41, 44],
      revenue: [
        { label: 'Март',   value: 1980000 },
        { label: 'Апрель', value: 2130000 },
        { label: 'Май',    value: 2250000 },
      ],
      weekday: [
        { label: 'Пн', value: 41 }, { label: 'Вт', value: 55 },
        { label: 'Ср', value: 63 }, { label: 'Чт', value: 70 },
        { label: 'Пт', value: 92 }, { label: 'Сб', value: 78 },
        { label: 'Вс', value: 19 },
      ],
    },
    year: {
      label: 'за год',
      kpi:   { revenue: 24600000, bookings: 1640, avgCheck: 15000, fill: 71 },
      delta: { revenue: 21.7, bookings: 18.3, avgCheck: 2.9, fill: 7 },
      clients:      { active: 1180, fresh: 469, retention: 74, churn: 7 },
      clientsDelta: { active: 14.6, fresh: 17.2, retention: 5, churn: -3 },
      newClients: [31, 33, 38, 41, 44, 40, 35, 33, 39, 43, 47, 45],
      revenue: [
        { label: 'Янв', value: 1720000 }, { label: 'Фев', value: 1810000 },
        { label: 'Мар', value: 1980000 }, { label: 'Апр', value: 2130000 },
        { label: 'Май', value: 2250000 }, { label: 'Июн', value: 2080000 },
        { label: 'Июл', value: 1840000 }, { label: 'Авг', value: 1760000 },
        { label: 'Сен', value: 1990000 }, { label: 'Окт', value: 2150000 },
        { label: 'Ноя', value: 2280000 }, { label: 'Дек', value: 2210000 },
      ],
      weekday: [
        { label: 'Пн', value: 168 }, { label: 'Вт', value: 214 },
        { label: 'Ср', value: 246 }, { label: 'Чт', value: 271 },
        { label: 'Пт', value: 358 }, { label: 'Сб', value: 305 },
        { label: 'Вс', value: 78 },
      ],
    },
  };

  // Демография и каналы привлечения — стабильные доли, не зависят от периода.
  const AGE_GROUPS = [
    { label: '26–35 лет', value: 38, color: C.gold },
    { label: '36–45 лет', value: 31, color: C.indigo },
    { label: '18–25 лет', value: 16, color: C.lilac },
    { label: '46–55 лет', value: 11, color: C.coral },
    { label: '55+ лет',   value: 4,  color: C.sage },
  ];

  const SOURCES = [
    { label: 'Instagram',          value: 34, color: C.coral },
    { label: 'Рекомендации',       value: 27, color: C.gold },
    { label: 'Поиск и сайт',       value: 19, color: C.indigo },
    { label: 'Реклама',            value: 13, color: C.lilac },
    { label: 'Повторное обращение', value: 7, color: C.sage },
  ];

  // Программы центра — синхронно с AdminProgramsEditor.
  const PROGRAMS = [
    { label: 'Базовая программа снижения веса', value: 1920000, color: C.gold },
    { label: 'Онлайн-сопровождение',           value: 1440000, color: C.indigo },
    { label: 'Интенсив «Перезагрузка»',        value: 1080000, color: C.coral },
    { label: 'Индивидуальная терапия',         value: 640000,  color: C.sage },
  ];

  // Реальная команда центра живёт в localStorage('omtime.team.v1') и
  // редактируется в AdminTeamEditor. Если хранилище ещё пустое (админ не
  // заходил в раздел «Команда»), используем тот же дефолтный состав.
  const FALLBACK_TEAM = [
    { name: 'Татьяна Педас',        tag: 'Основатель',  roleLabel: 'Психотерапевт',  active: true },
    { name: 'Илья Брежнев',         tag: 'Психолог',    roleLabel: 'Клинический психолог', active: true },
    { name: 'Наталья Лоскутникова', tag: 'Психолог',    roleLabel: 'Детский психолог', active: true },
    { name: 'Марина Енгерова',      tag: 'Нутрициолог', roleLabel: 'Нутрициолог',     active: true },
    { name: 'Асель Нуркенова',      tag: 'Куратор',     roleLabel: 'Психолог · Куратор', active: true },
    { name: 'Дарья Ким',            tag: 'Инструктор',  roleLabel: 'Дыхательные практики', active: true },
  ];

  function loadTeam() {
    try {
      const raw = localStorage.getItem(TEAM_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) return arr;
      }
    } catch (e) {}
    return FALLBACK_TEAM;
  }

  // Детерминированный seed из строки (FNV-1a) — чтобы у каждого специалиста
  // были стабильные «реалистичные» метрики загрузки между перерисовками.
  function seedOf(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // Множитель числа сессий по периоду (загрузка % — это ставка, не масштабируется).
  const SESSION_FACTOR = { month: 1, quarter: 2.9, year: 11.4 };

  // Команда → строки «Загрузка специалистов»: только опубликованные,
  // отсортированы по загрузке. Загрузка/сессии выводятся из seed имени.
  function specialistRows(team, period) {
    return team
      .filter(m => m.active !== false && (m.name || '').trim())
      .map(m => {
        const s = seedOf(m.name);
        const load = 58 + (s % 38);                 // 58…95 %
        const monthly = Math.round(load * 0.52);    // ~30…49 сессий/мес
        const sessions = Math.round(monthly * (SESSION_FACTOR[period] || 1));
        const role = (m.tag || m.roleLabel || '').toLowerCase();
        return { label: role ? `${m.name} · ${role}` : m.name, value: load, sessions };
      })
      .sort((a, b) => b.value - a.value);
  }

  /* ---------- График: площадь/линия (выручка) ---------- */
  function AreaChart({ data, color }) {
    const W = 640, H = 220, padX = 16, padTop = 16, padBottom = 28;
    const innerW = W - padX * 2, innerH = H - padTop - padBottom;
    const max = Math.max(...data.map(d => d.value)) * 1.12;
    const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
    const pts = data.map((d, i) => {
      const x = padX + stepX * i;
      const y = padTop + innerH * (1 - d.value / max);
      return [x, y];
    });
    const line = pts.map(p => p.join(',')).join(' ');
    const area = `${padX},${padTop + innerH} ` + line + ` ${padX + innerW},${padTop + innerH}`;

    return (
      <svg className="om-chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Динамика выручки">
        <defs>
          <linearGradient id="omAnArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.26" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((g, i) => (
          <line key={i} x1={padX} y1={padTop + innerH * g} x2={padX + innerW} y2={padTop + innerH * g} className="om-chart-grid-line" />
        ))}
        <polygon points={area} fill="url(#omAnArea)" />
        <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r="4" fill="#fff" stroke={color} strokeWidth="2.5" />
            <text x={p[0]} y={H - 8} className="om-chart-axis-label" textAnchor="middle">{data[i].label}</text>
          </g>
        ))}
      </svg>
    );
  }

  /* ---------- График: вертикальные столбцы (загрузка по дням) ---------- */
  function BarChart({ data, color }) {
    const W = 640, H = 220, padX = 16, padTop = 16, padBottom = 28;
    const innerW = W - padX * 2, innerH = H - padTop - padBottom;
    const max = Math.max(...data.map(d => d.value)) * 1.12;
    const peak = Math.max(...data.map(d => d.value));
    const slot = innerW / data.length;
    const barW = Math.min(slot * 0.56, 40);

    return (
      <svg className="om-chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Загрузка по дням недели">
        {[0.25, 0.5, 0.75, 1].map((g, i) => (
          <line key={i} x1={padX} y1={padTop + innerH * g} x2={padX + innerW} y2={padTop + innerH * g} className="om-chart-grid-line" />
        ))}
        {data.map((d, i) => {
          const h = innerH * (d.value / max);
          const x = padX + slot * i + (slot - barW) / 2;
          const y = padTop + innerH - h;
          const isPeak = d.value === peak;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={h} rx="6" fill={isPeak ? C.gold : color} opacity={isPeak ? 1 : 0.5} />
              <text x={x + barW / 2} y={y - 7} className="om-chart-bar-value" textAnchor="middle">{d.value}</text>
              <text x={x + barW / 2} y={H - 8} className="om-chart-axis-label" textAnchor="middle">{d.label}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  /* ---------- График: кольцо (доли) ---------- */
  function Donut({ segments, centerTop, centerBottom }) {
    const size = 180, r = 70, cx = size / 2, cy = size / 2;
    const circ = 2 * Math.PI * r;
    const total = segments.reduce((s, x) => s + x.value, 0);
    let offset = 0;
    return (
      <svg className="om-donut-svg" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Распределение долей">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(31,28,46,0.07)" strokeWidth="20" />
        {segments.map((s, i) => {
          const len = (s.value / total) * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="20"
              strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`} />
          );
          offset += len;
          return el;
        })}
        <text x={cx} y={cy - 4} className="om-donut-center-top" textAnchor="middle">{centerTop}</text>
        <text x={cx} y={cy + 16} className="om-donut-center-bottom" textAnchor="middle">{centerBottom}</text>
      </svg>
    );
  }

  function Legend({ segments, withPercent }) {
    const sum = segments.reduce((s, x) => s + x.value, 0);
    return (
      <div className="om-legend">
        {segments.map((s, i) => (
          <div className="om-legend-item" key={i}>
            <span className="om-legend-dot" style={{ background: s.color }} />
            <span className="om-legend-label">{s.label}</span>
            <span className="om-legend-val">{withPercent ? Math.round((s.value / sum) * 100) + '%' : money(s.value)}</span>
          </div>
        ))}
      </div>
    );
  }

  /* ---------- Горизонтальные бары ---------- */
  function HBars({ rows }) {
    const max = Math.max(...rows.map(d => d.value));
    return (
      <div className="om-hbars">
        {rows.map((d, i) => (
          <div className="om-hbar-row" key={i}>
            <div className="om-hbar-label">{d.label}</div>
            <div className="om-hbar-track">
              <div className="om-hbar-fill" style={{ width: (d.value / max) * 100 + '%', background: d.color || C.gold }} />
            </div>
            <div className="om-hbar-val">{d.valueLabel}</div>
          </div>
        ))}
      </div>
    );
  }

  /* ---------- KPI-карточка ---------- */
  // invertDelta — для метрик, где снижение положительно (напр. отток).
  function StatCard({ icon, accent, label, value, suffix, delta, invertDelta }) {
    const up = delta >= 0;
    const good = invertDelta ? !up : up;
    return (
      <div className="om-stat-card">
        <div className="om-stat-top">
          <span className="om-stat-icon" style={{ background: accent + '22', color: accent }}>
            <LucideIcon name={icon} size={18} />
          </span>
          <span className={'om-stat-delta ' + (good ? 'is-up' : 'is-down')}>
            <LucideIcon name={up ? 'trending-up' : 'trending-down'} size={13} />
            {up ? '+' : ''}{delta}%
          </span>
        </div>
        <div className="om-stat-value">{value}{suffix && <span className="om-stat-suffix">{suffix}</span>}</div>
        <div className="om-stat-label">{label}</div>
      </div>
    );
  }

  function AdminAnalytics() {
    const [period, setPeriod] = useState('month');

    const newRequests = useMemo(() => {
      try {
        const raw = localStorage.getItem(RQ_KEY);
        if (raw) return JSON.parse(raw).filter(r => r.status === 'new').length;
      } catch (e) {}
      return 1;
    }, []);

    // Реальная команда из localStorage (один раз за сессию рендера).
    const team = useMemo(() => loadTeam(), []);

    const d = DATA[period];
    const specialists = useMemo(() => specialistRows(team, period), [team, period]);

    // Приток новых клиентов — по тем же отрезкам, что динамика выручки.
    const clientFlow = d.revenue.map((r, i) => ({ label: r.label, value: d.newClients[i] || 0 }));

    // Структура клиентов: продолжающие (доходят) vs первичные — из retention.
    const clientSplit = [
      { label: 'Завершают курс', value: d.clients.retention,       color: C.gold },
      { label: 'Первичные',      value: 100 - d.clients.retention, color: C.sage },
    ];

    return (
      <React.Fragment>
        <div className="om-acc-head">
          <div>
            <div className="om-acc-eyebrow">Аналитика</div>
            <h1 className="om-acc-title">Показатели центра</h1>
            <p className="om-acc-sub">Выручка, загрузка, программы и клиенты — данные {d.label}.</p>
          </div>
          <button className="om-btn om-btn--secondary">
            <LucideIcon name="download" size={16} style={{ marginRight: 8 }} />
            Экспорт
          </button>
        </div>

        {/* Период */}
        <div className="om-adm-toolbar">
          <div className="om-seg">
            {[{ id: 'month', label: 'Месяц' }, { id: 'quarter', label: 'Квартал' }, { id: 'year', label: 'Год' }].map(p => (
              <button key={p.id} className={'om-seg-btn' + (period === p.id ? ' is-active' : '')} onClick={() => setPeriod(p.id)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI */}
        <div className="om-stat-grid">
          <StatCard icon="banknote"       accent={C.gold}   label="Выручка"           value={money(d.kpi.revenue)}  delta={d.delta.revenue} />
          <StatCard icon="calendar-check" accent={C.sage}   label="Проведено сессий"  value={fmt(d.kpi.bookings)}   delta={d.delta.bookings} />
          <StatCard icon="users-round"    accent={C.lilac}  label="Средний чек"       value={money(d.kpi.avgCheck)} delta={d.delta.avgCheck} />
          <StatCard icon="gauge"          accent={C.coral}  label="Заполняемость"     value={d.kpi.fill} suffix="%" delta={d.delta.fill} />
        </div>

        {/* Графики */}
        <div className="om-chart-grid">
          <div className="om-chart-card om-chart-card--wide">
            <div className="om-chart-head">
              <div>
                <h3 className="om-chart-title">Динамика выручки</h3>
                <p className="om-chart-sub">Поступления по периодам</p>
              </div>
              <span className="om-tag-mini om-tag-mini--gold">
                <LucideIcon name="trending-up" size={13} /> +{d.delta.revenue}%
              </span>
            </div>
            <div className="om-chart-body"><AreaChart data={d.revenue} color={C.gold} /></div>
          </div>

          <div className="om-chart-card om-chart-card--wide">
            <div className="om-chart-head">
              <div>
                <h3 className="om-chart-title">Загрузка по дням недели</h3>
                <p className="om-chart-sub">Количество сессий</p>
              </div>
              <span className="om-tag-mini om-tag-mini--sage">Пик — пятница</span>
            </div>
            <div className="om-chart-body"><BarChart data={d.weekday} color={C.sage} /></div>
          </div>

          <div className="om-chart-card om-chart-card--wide">
            <div className="om-chart-head">
              <div>
                <h3 className="om-chart-title">Выручка по программам</h3>
                <p className="om-chart-sub">Доля направлений центра</p>
              </div>
            </div>
            <div className="om-chart-body">
              <HBars rows={PROGRAMS.map(s => ({ label: s.label, value: s.value, color: s.color, valueLabel: money(s.value) }))} />
            </div>
          </div>

          <div className="om-chart-card om-chart-card--wide">
            <div className="om-chart-head">
              <div>
                <h3 className="om-chart-title">Загрузка специалистов</h3>
                <p className="om-chart-sub">Заполняемость расписания и число сессий — по команде центра</p>
              </div>
              {specialists.length > 0 && (
                <span className="om-tag-mini om-tag-mini--lilac">{specialists.length} в команде</span>
              )}
            </div>
            <div className="om-chart-body">
              {specialists.length > 0 ? (
                <HBars rows={specialists.map(m => ({ label: m.label, value: m.value, color: C.gold, valueLabel: `${m.value}% · ${m.sessions} сес.` }))} />
              ) : (
                <p className="om-chart-sub" style={{ margin: 0 }}>
                  Нет опубликованных специалистов. Добавьте команду в разделе «Команда».
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ─────────── Аналитика по клиентам ─────────── */}
        <div style={{ margin: '34px 0 18px', paddingTop: 28, borderTop: '1px solid var(--om-hairline)' }}>
          <div className="om-acc-eyebrow">Клиенты</div>
          <h2 style={{
            fontFamily: 'var(--om-font-sans)', fontSize: 22, fontWeight: 600,
            color: 'var(--om-ink)', margin: '8px 0 4px', letterSpacing: 'var(--om-tracking-tight)',
          }}>Аналитика по клиентам</h2>
          <p className="om-acc-sub" style={{ margin: 0 }}>
            Приток, удержание и портрет аудитории центра — данные {d.label}.
          </p>
        </div>

        {/* KPI по клиентам */}
        <div className="om-stat-grid">
          <StatCard icon="users"        accent={C.gold}   label="Активных клиентов"  value={fmt(d.clients.active)} delta={d.clientsDelta.active} />
          <StatCard icon="user-plus"    accent={C.sage}   label="Новых за период"    value={fmt(d.clients.fresh)} delta={d.clientsDelta.fresh} />
          <StatCard icon="heart-handshake" accent={C.lilac} label="Удержание"        value={d.clients.retention} suffix="%" delta={d.clientsDelta.retention} />
          <StatCard icon="user-minus"   accent={C.coral}  label="Отток"              value={d.clients.churn} suffix="%" delta={d.clientsDelta.churn} invertDelta />
        </div>

        {/* Графики по клиентам */}
        <div className="om-chart-grid">
          <div className="om-chart-card om-chart-card--wide">
            <div className="om-chart-head">
              <div>
                <h3 className="om-chart-title">Приток новых клиентов</h3>
                <p className="om-chart-sub">Сколько человек впервые пришли в центр</p>
              </div>
              <span className="om-tag-mini om-tag-mini--sage">
                <LucideIcon name="trending-up" size={13} /> +{d.clientsDelta.fresh}%
              </span>
            </div>
            <div className="om-chart-body"><AreaChart data={clientFlow} color={C.sage} /></div>
          </div>

          <div className="om-chart-card">
            <div className="om-chart-head">
              <div>
                <h3 className="om-chart-title">Структура клиентов</h3>
                <p className="om-chart-sub">Первичные и продолжающие</p>
              </div>
            </div>
            <div className="om-chart-body om-chart-body--split">
              <Donut segments={clientSplit} centerTop={d.clients.retention + '%'} centerBottom="доходят" />
              <Legend segments={clientSplit} withPercent />
            </div>
          </div>

          <div className="om-chart-card">
            <div className="om-chart-head">
              <div>
                <h3 className="om-chart-title">Возрастные группы</h3>
                <p className="om-chart-sub">Портрет активной аудитории</p>
              </div>
            </div>
            <div className="om-chart-body om-chart-body--split">
              <Donut segments={AGE_GROUPS} centerTop={fmt(d.clients.active)} centerBottom="клиентов" />
              <Legend segments={AGE_GROUPS} withPercent />
            </div>
          </div>

          <div className="om-chart-card om-chart-card--wide">
            <div className="om-chart-head">
              <div>
                <h3 className="om-chart-title">Источники привлечения</h3>
                <p className="om-chart-sub">Откуда клиенты узнают о центре</p>
              </div>
              <span className="om-tag-mini om-tag-mini--lilac">{newRequests} новых заявок</span>
            </div>
            <div className="om-chart-body">
              <HBars rows={SOURCES.map(s => ({ label: s.label, value: s.value, color: s.color, valueLabel: s.value + '%' }))} />
            </div>
          </div>
        </div>

        {/* ─────────── Анкеты обратной связи (реальные данные) ─────────── */}
        {window.SurveyAnalytics && <window.SurveyAnalytics />}
      </React.Fragment>
    );
  }

  window.AdminAnalytics = AdminAnalytics;
})();
