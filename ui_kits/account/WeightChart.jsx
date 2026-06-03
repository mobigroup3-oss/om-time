// WeightChart.jsx — график снижения веса в кабинете клиента.
//
// Клиент один раз вводит старт программы (дата начала + стартовый вес). От них
// строятся три фиксированные целевые прямые на 30 дней:
//   −6%  = вес × 0.94  (красная),  −10% = вес × 0.90 (синяя),  −15% = вес × 0.85 (зелёная).
// Дальше клиент каждый день записывает фактический вес — это его чёрная линия.
// Специалист/админ видят график только на чтение (props.readOnly).
//
// Данные: /api/clients?resource=weights (см. api/clients.js). Зависит от
// window.LucideIcon и window.omAuth (определены в AccountPage.jsx).
// Экспортирует window.WeightChart. Обёрнут в IIFE.

(function () {
  const { useState, useEffect, useMemo } = React;
  const LucideIcon = window.LucideIcon;
  const auth = () => window.omAuth;

  // Целевые линии. Проценты закреплены: −6 / −10 / −15 от стартового веса.
  const TARGETS = [
    { pct: 6,  color: '#C03A3B', label: '−6 %'  },   // коралл/красный
    { pct: 10, color: '#2563EB', label: '−10 %' },   // синий
    { pct: 15, color: '#3F9D63', label: '−15 %' },   // зелёный
  ];
  const CLIENT_COLOR = '#1B1840';                     // чёрная (тёмный индиго) линия клиента
  const PROGRAM_DAYS = 30;

  // ── Утилиты дат (UTC, без сюрпризов часовых поясов) ──────────
  const parseYMD = (s) => { const [y, m, d] = String(s).split('-').map(Number); return Date.UTC(y, m - 1, d); };
  const addDays = (ts, n) => ts + n * 86400000;
  const diffDays = (a, b) => Math.round((a - b) / 86400000);
  const toYMD = (ts) => { const d = new Date(ts); return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0'); };
  const fmtDM = (ts) => { const d = new Date(ts); return String(d.getUTCDate()).padStart(2, '0') + '.' + String(d.getUTCMonth() + 1).padStart(2, '0'); };
  const todayYMD = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const round1 = (n) => Math.round(n * 10) / 10;

  function api(method, opts) {
    opts = opts || {};
    const qs = new URLSearchParams(Object.assign({ resource: 'weights' }, opts.query || {})).toString();
    return fetch('/api/clients?' + qs, {
      method,
      headers: auth().headers(opts.body ? { 'Content-Type': 'application/json' } : undefined),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(r => r.json().then(j => ({ ok: r.ok, j })).catch(() => ({ ok: false, j: null })));
  }

  // ── SVG-график ───────────────────────────────────────────────
  function Chart({ setup, entries }) {
    const startTs = parseYMD(setup.startDate);
    const sw = setup.startWeight;

    // целевые веса на день 30
    const targets = TARGETS.map(t => ({ ...t, weight: round1(sw * (1 - t.pct / 100)) }));

    // индексы дней замеров; растягиваем ось X, если клиент вышел за 30 дней
    const pts = entries
      .map(e => ({ day: diffDays(parseYMD(e.date), startTs), weight: e.weight }))
      .filter(p => p.day >= 0)
      .sort((a, b) => a.day - b.day);
    const maxDay = pts.reduce((m, p) => Math.max(m, p.day), 0);
    const totalDays = Math.max(PROGRAM_DAYS, maxDay);

    // вертикальный домен: от чуть ниже −15% до чуть выше старта, с запасом под факт
    let yMax = Math.ceil(sw + 0.5);
    let yMin = Math.floor(targets[2].weight - 0.5);
    pts.forEach(p => { yMax = Math.max(yMax, Math.ceil(p.weight + 0.5)); yMin = Math.min(yMin, Math.floor(p.weight - 0.5)); });

    const W = 840, H = 360, M = { t: 16, r: 56, b: 34, l: 40 };
    const pw = W - M.l - M.r, ph = H - M.t - M.b;
    const xs = (d) => M.l + (d / totalDays) * pw;
    const ys = (w) => M.t + ((yMax - w) / (yMax - yMin)) * ph;

    const yTicks = []; for (let w = yMin; w <= yMax; w++) yTicks.push(w);
    const xStep = totalDays > 36 ? 7 : 5;
    const xTicks = []; for (let d = 0; d <= totalDays; d += xStep) xTicks.push(d);
    if (xTicks[xTicks.length - 1] !== totalDays) xTicks.push(totalDays);

    const clientPath = pts.map((p, i) => (i ? 'L' : 'M') + xs(p.day) + ' ' + ys(p.weight)).join(' ');

    const grid = 'rgba(27,24,64,0.07)', gridStrong = 'rgba(27,24,64,0.14)', axis = 'rgba(27,24,64,0.28)';

    return (
      <div style={S.chartWrap}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img"
          aria-label="График снижения веса: целевые линии −6%, −10%, −15% и фактический вес клиента">
          {/* горизонтальная сетка + подписи кг */}
          {yTicks.map(w => (
            <g key={'y' + w}>
              <line x1={M.l} y1={ys(w)} x2={W - M.r} y2={ys(w)} stroke={w === yMax || w === yMin ? gridStrong : grid} strokeWidth="1" />
              <text x={M.l - 8} y={ys(w) + 4} textAnchor="end" style={S.axisLabel}>{w}</text>
            </g>
          ))}
          {/* вертикальная сетка по дням */}
          {Array.from({ length: totalDays + 1 }, (_, d) => (
            <line key={'g' + d} x1={xs(d)} y1={M.t} x2={xs(d)} y2={M.t + ph}
              stroke={d % xStep === 0 ? gridStrong : grid} strokeWidth="1" />
          ))}
          {/* подписи дат по оси X */}
          {xTicks.map(d => (
            <text key={'x' + d} x={xs(d)} y={H - M.b + 18} textAnchor="middle" style={S.axisLabel}>{fmtDM(addDays(startTs, d))}</text>
          ))}
          <line x1={M.l} y1={M.t} x2={M.l} y2={M.t + ph} stroke={axis} strokeWidth="1.5" />
          <line x1={M.l} y1={M.t + ph} x2={W - M.r} y2={M.t + ph} stroke={axis} strokeWidth="1.5" />

          {/* целевые прямые: старт → цель на день 30 */}
          {targets.map(t => (
            <g key={t.pct}>
              <line x1={xs(0)} y1={ys(sw)} x2={xs(PROGRAM_DAYS)} y2={ys(t.weight)}
                stroke={t.color} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx={xs(PROGRAM_DAYS)} cy={ys(t.weight)} r="3.5" fill={t.color} />
              <text x={xs(PROGRAM_DAYS) + 7} y={ys(t.weight) + 4} style={{ ...S.targetLabel, fill: t.color }}>{t.pct} %</text>
            </g>
          ))}

          {/* линия клиента (чёрная) */}
          {pts.length > 1 && <path d={clientPath} fill="none" stroke={CLIENT_COLOR} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
          {pts.map(p => <circle key={'p' + p.day} cx={xs(p.day)} cy={ys(p.weight)} r="3.5" fill={CLIENT_COLOR} />)}
        </svg>
      </div>
    );
  }

  // ── Легенда ──────────────────────────────────────────────────
  function Legend({ setup }) {
    const sw = setup.startWeight;
    const items = [
      { color: CLIENT_COLOR, text: 'Ваш фактический вес' },
      ...TARGETS.map(t => ({ color: t.color, text: t.label + ' → ' + round1(sw * (1 - t.pct / 100)) + ' кг' })),
    ];
    return (
      <div style={S.legend}>
        {items.map((it, i) => (
          <span key={i} style={S.legendItem}>
            <span style={{ ...S.legendDot, background: it.color }} />{it.text}
          </span>
        ))}
      </div>
    );
  }

  // ── Форма старта программы ───────────────────────────────────
  function SetupForm({ onSave, saving, error }) {
    const [date, setDate] = useState(todayYMD());
    const [weight, setWeight] = useState('');
    const valid = /^\d{4}-\d{2}-\d{2}$/.test(date) && Number(weight) >= 20 && Number(weight) <= 400;
    return (
      <div style={S.setupBox}>
        <LucideIcon name="line-chart" size={30} style={{ opacity: 0.6, marginBottom: 10 }} />
        <div style={S.setupTitle}>Заполните начальные данные</div>
        <div style={S.setupSub}>
          Укажите дату старта программы и вес на сегодня. По ним сразу построятся
          целевые линии −6 %, −10 % и −15 % на 30 дней. Дальше отмечайте вес каждый день.
        </div>
        <div style={S.setupRow}>
          <label className="om-form-field" style={{ flex: '1 1 160px' }}>
            <span className="om-form-label">Дата начала</span>
            <input className="om-form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </label>
          <label className="om-form-field" style={{ flex: '1 1 140px' }}>
            <span className="om-form-label">Текущий вес, кг</span>
            <input className="om-form-input" type="number" step="0.1" min="20" max="400" inputMode="decimal"
              value={weight} placeholder="75.3" onChange={e => setWeight(e.target.value)} />
          </label>
        </div>
        {error && <div style={S.err}>{error}</div>}
        <button className="om-btn om-btn--primary" disabled={!valid || saving}
          style={{ alignSelf: 'flex-start', marginTop: 4, opacity: valid && !saving ? 1 : 0.5, pointerEvents: valid && !saving ? 'auto' : 'none' }}
          onClick={() => onSave({ startDate: date, startWeight: Number(weight) })}>
          {saving ? 'Сохранение…' : 'Построить график'}
        </button>
      </div>
    );
  }

  // ── Дневной ввод веса ────────────────────────────────────────
  function DailyInput({ setup, onSave, saving }) {
    const minD = setup.startDate;
    const maxD = toYMD(addDays(parseYMD(setup.startDate), PROGRAM_DAYS));
    const [date, setDate] = useState(() => {
      const t = todayYMD();
      return (t >= minD && t <= maxD) ? t : maxD;
    });
    const [weight, setWeight] = useState('');
    const valid = /^\d{4}-\d{2}-\d{2}$/.test(date) && Number(weight) >= 20 && Number(weight) <= 400;
    const submit = () => { if (!valid || saving) return; onSave({ date, weight: Number(weight) }, () => setWeight('')); };
    return (
      <div style={S.dailyBox}>
        <div style={S.dailyLabel}><LucideIcon name="plus-circle" size={15} /> Записать вес за день</div>
        <div style={S.setupRow}>
          <label className="om-form-field" style={{ flex: '1 1 150px' }}>
            <span className="om-form-label">Дата</span>
            <input className="om-form-input" type="date" min={minD} max={maxD} value={date} onChange={e => setDate(e.target.value)} />
          </label>
          <label className="om-form-field" style={{ flex: '1 1 130px' }}>
            <span className="om-form-label">Вес, кг</span>
            <input className="om-form-input" type="number" step="0.1" min="20" max="400" inputMode="decimal"
              value={weight} placeholder="74.1" onChange={e => setWeight(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit(); }} />
          </label>
          <button className="om-btn om-btn--primary" disabled={!valid || saving}
            style={{ alignSelf: 'flex-end', height: 40, opacity: valid && !saving ? 1 : 0.5, pointerEvents: valid && !saving ? 'auto' : 'none' }}
            onClick={submit}>Записать</button>
        </div>
      </div>
    );
  }

  // ── Таблица замеров ──────────────────────────────────────────
  function EntriesTable({ setup, entries, readOnly, onDelete }) {
    if (!entries.length) return null;
    const startTs = parseYMD(setup.startDate);
    const rows = entries.map(e => {
      const day = diffDays(parseYMD(e.date), startTs);
      const drop = round1(setup.startWeight - e.weight);
      const pct = round1((1 - e.weight / setup.startWeight) * 100);
      return { ...e, day, drop, pct };
    }).sort((a, b) => b.day - a.day);
    return (
      <div style={{ marginTop: 18 }}>
        <div style={S.dailyLabel}><LucideIcon name="table-2" size={15} /> Замеры ({entries.length})</div>
        <div style={S.table}>
          <div style={{ ...S.trow, ...S.thead }}>
            <span>Дата</span><span>День</span><span>Вес</span><span>−кг</span><span>%</span>{!readOnly && <span />}
          </div>
          {rows.map(r => (
            <div key={r.date} style={S.trow}>
              <span>{fmtDM(parseYMD(r.date))}</span>
              <span style={S.muted}>{r.day === 0 ? 'старт' : r.day + '-й'}</span>
              <span style={{ fontWeight: 600 }}>{r.weight} кг</span>
              <span style={{ color: r.drop > 0 ? 'var(--om-sage-deep)' : 'var(--om-muted)' }}>{r.drop > 0 ? '−' + r.drop : '—'}</span>
              <span style={{ color: r.pct > 0 ? 'var(--om-sage-deep)' : 'var(--om-muted)' }}>{r.pct > 0 ? '−' + r.pct + '%' : '—'}</span>
              {!readOnly && (
                <button style={S.delBtn} title="Удалить замер" onClick={() => onDelete(r.date)}>
                  <LucideIcon name="trash-2" size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Сводка текущего прогресса ────────────────────────────────
  function Progress({ setup, entries }) {
    if (!entries.length) return null;
    const startTs = parseYMD(setup.startDate);
    const last = entries.slice().sort((a, b) => diffDays(parseYMD(b.date), startTs) - diffDays(parseYMD(a.date), startTs))[0];
    const drop = round1(setup.startWeight - last.weight);
    const pct = round1((1 - last.weight / setup.startWeight) * 100);
    return (
      <div style={S.progress}>
        <div style={S.progStat}><span style={S.progNum}>{last.weight}</span><span style={S.progUnit}>кг сейчас</span></div>
        <div style={S.progStat}><span style={S.progNum}>{setup.startWeight}</span><span style={S.progUnit}>кг старт</span></div>
        <div style={S.progStat}>
          <span style={{ ...S.progNum, color: drop > 0 ? 'var(--om-sage-deep)' : 'var(--om-ink)' }}>{drop > 0 ? '−' + drop : drop}</span>
          <span style={S.progUnit}>кг ({pct > 0 ? '−' + pct : pct} %)</span>
        </div>
      </div>
    );
  }

  // ── Корневой компонент ───────────────────────────────────────
  function WeightChart({ clientId, readOnly }) {
    const CK = 'omtime.weights.' + (clientId || 'self');
    const [loaded, setLoaded] = useState(false);
    const [setup, setSetup] = useState(null);
    const [entries, setEntries] = useState([]);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const load = () => {
      api('GET', { query: clientId ? { clientId } : {} }).then(({ ok, j }) => {
        if (ok && j && j.ok && j.data) { setSetup(j.data.setup); setEntries(j.data.entries || []); }
        setLoaded(true);
      });
    };

    // Мгновенно рисуем из кэша (stale-while-revalidate), затем тихо обновляем —
    // чтобы при каждом заходе не висела «Загрузка» из-за холодного старта функции.
    useEffect(() => {
      let cached = false;
      try {
        const raw = localStorage.getItem(CK);
        if (raw) { const c = JSON.parse(raw); setSetup(c.setup); setEntries(c.entries || []); setLoaded(true); cached = true; }
      } catch (e) {}
      if (!cached) setLoaded(false);
      load();
    }, [clientId]);

    // Сохраняем последний снимок в кэш при любом изменении данных.
    useEffect(() => {
      if (!loaded) return;
      try { localStorage.setItem(CK, JSON.stringify({ setup, entries })); } catch (e) {}
    }, [setup, entries, loaded]);

    const saveSetup = (payload) => {
      setSaving(true); setErr('');
      api('POST', { query: Object.assign({ action: 'setup' }, clientId ? { clientId } : {}), body: payload })
        .then(({ ok, j }) => {
          setSaving(false);
          if (ok && j && j.ok) { setSetup(j.data.setup); load(); }
          else setErr((j && (j.error || (j.errors && Object.values(j.errors)[0]))) || 'Не удалось сохранить');
        });
    };

    const saveDaily = (payload, done) => {
      setSaving(true);
      api('POST', { query: clientId ? { clientId } : {}, body: payload }).then(({ ok, j }) => {
        setSaving(false);
        if (ok && j && j.ok && j.data) {
          setEntries(cur => {
            const rest = cur.filter(e => e.date !== j.data.date);
            return [...rest, { date: j.data.date, weight: j.data.weight }].sort((a, b) => a.date.localeCompare(b.date));
          });
          done && done();
        }
      });
    };

    const deleteEntry = (date) => {
      setEntries(cur => cur.filter(e => e.date !== date));   // оптимистично
      api('DELETE', { query: Object.assign({ date }, clientId ? { clientId } : {}) });
    };

    // Скелетон той же высоты, что и панель графика — чтобы при загрузке вёрстка
    // не «прыгала» и не казалось, что подгрузилась другая страница.
    if (!loaded) return (
      <div style={S.skeleton}>
        <LucideIcon name="line-chart" size={26} style={{ opacity: 0.4, marginBottom: 10 }} />
        <div style={{ fontSize: 13, color: 'var(--om-muted)' }}>Загрузка графика…</div>
      </div>
    );

    // Нет старта программы.
    if (!setup) {
      if (readOnly) {
        return (
          <div style={S.setupBox}>
            <LucideIcon name="line-chart" size={28} style={{ opacity: 0.55, marginBottom: 10 }} />
            <div style={S.setupTitle}>График ещё не начат</div>
            <div style={S.setupSub}>Клиент пока не ввёл стартовый вес и дату начала программы.</div>
          </div>
        );
      }
      return <SetupForm onSave={saveSetup} saving={saving} error={err} />;
    }

    return (
      <div>
        <div style={S.panel}>
          <Progress setup={setup} entries={entries} />
          <Chart setup={setup} entries={entries} />
          <Legend setup={setup} />
        </div>
        {!readOnly && <DailyInput setup={setup} onSave={saveDaily} saving={saving} />}
        <EntriesTable setup={setup} entries={entries} readOnly={readOnly} onDelete={deleteEntry} />
        {window.DiaryTable && <window.DiaryTable clientId={clientId} setup={setup} readOnly={readOnly} />}
        {window.MeasureBlock && <window.MeasureBlock clientId={clientId} readOnly={readOnly} />}
      </div>
    );
  }

  const S = {
    muted: { fontSize: 13, color: 'var(--om-muted)' },
    skeleton: {
      background: 'var(--om-canvas-white)', border: '1px solid var(--om-hairline)',
      borderRadius: 'var(--om-radius-lg, 16px)', minHeight: 440, boxShadow: 'var(--om-shadow-card)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    },
    panel: {
      background: 'var(--om-canvas-white)', border: '1px solid var(--om-hairline)',
      borderRadius: 'var(--om-radius-lg, 16px)', padding: '18px 18px 16px', boxShadow: 'var(--om-shadow-card)',
    },
    chartWrap: { marginTop: 6 },
    axisLabel: { fontSize: '11px', fill: 'var(--om-muted, #8a8275)', fontFamily: 'inherit' },
    targetLabel: { fontSize: '12px', fontWeight: 600, fontFamily: 'inherit' },
    legend: { display: 'flex', flexWrap: 'wrap', gap: '8px 18px', marginTop: 10, paddingTop: 12, borderTop: '1px solid var(--om-hairline-soft, #efe9df)' },
    legendItem: { display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--om-ink)' },
    legendDot: { width: 14, height: 3, borderRadius: 2, display: 'inline-block' },
    setupBox: {
      background: 'var(--om-canvas-white)', border: '1px dashed var(--om-hairline)',
      borderRadius: 'var(--om-radius-lg, 16px)', padding: '28px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
    },
    setupTitle: { fontSize: 15, fontWeight: 600, color: 'var(--om-ink)' },
    setupSub: { fontSize: 13, color: 'var(--om-muted)', maxWidth: 460, lineHeight: 1.5, marginBottom: 8 },
    setupRow: { display: 'flex', flexWrap: 'wrap', gap: 14, width: '100%', margin: '4px 0 10px' },
    err: { fontSize: 13, color: 'var(--om-coral, #C03A3B)', marginBottom: 6 },
    dailyBox: {
      marginTop: 18, background: 'var(--om-canvas-white)', border: '1px solid var(--om-hairline)',
      borderRadius: 'var(--om-radius-lg, 16px)', padding: '16px 18px',
    },
    dailyLabel: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: 'var(--om-ink)', marginBottom: 10 },
    table: { border: '1px solid var(--om-hairline)', borderRadius: 'var(--om-radius-md, 12px)', overflow: 'hidden' },
    trow: {
      display: 'grid', gridTemplateColumns: '1fr 0.8fr 1fr 0.9fr 0.9fr auto', gap: 8,
      alignItems: 'center', padding: '9px 14px', borderTop: '1px solid var(--om-hairline-soft, #efe9df)',
      fontSize: 13, color: 'var(--om-ink)',
    },
    thead: {
      borderTop: 'none', background: 'var(--om-canvas, #fbf8f2)', fontSize: 11,
      letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--om-muted)', fontWeight: 600,
    },
    delBtn: {
      all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 26, height: 26, borderRadius: 8, color: 'var(--om-muted)',
    },
    progress: { display: 'flex', flexWrap: 'wrap', gap: 28, paddingBottom: 14, marginBottom: 4, borderBottom: '1px solid var(--om-hairline-soft, #efe9df)' },
    progStat: { display: 'flex', flexDirection: 'column', gap: 3 },
    progNum: { fontSize: 26, fontWeight: 600, color: 'var(--om-ink)', lineHeight: 1 },
    progUnit: { fontSize: 11.5, color: 'var(--om-muted)', letterSpacing: '0.02em' },
  };

  window.WeightChart = WeightChart;
})();
