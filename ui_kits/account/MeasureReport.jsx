// MeasureReport.jsx — замеры тела (см) + авто-отчёт по динамике за первые 3 дня.
//
// Клиент вводит обхваты в двух точках: «Старт» (день 1) и «4-й день» (старт + 3
// суток). Система сравнивает значения и сама собирает отчёт (500–700 симв.):
// где объёмы ушли (хорошо), где без изменений / выросли (внимание) + рекомендации.
// Специалист/админ видят таблицу и отчёт только на чтение (props.readOnly).
// Данные: /api/clients?resource=measures. Экспортирует window.MeasureBlock. IIFE.

(function () {
  const { useState, useEffect } = React;
  const LucideIcon = window.LucideIcon;
  const auth = () => window.omAuth;

  // Замеры = строки таблицы. Ключи совпадают с MEASURE_FIELDS в api/clients.js.
  const FIELDS = [
    { key: 'waist',       label: 'Талия' },
    { key: 'chest',       label: 'Обхват груди' },
    { key: 'chest_over',  label: 'Обхват над грудью' },
    { key: 'chest_under', label: 'Обхват под грудью' },
    { key: 'hips',        label: 'Обхват бёдер' },
    { key: 'galife',      label: 'Обхват галифе' },
    { key: 'neck',        label: 'Обхват шеи' },
    { key: 'arm',         label: 'Обхват плеча' },
    { key: 'wrist',       label: 'Обхват запястья' },
  ];
  const round1 = (n) => Math.round(n * 10) / 10;
  const sm = (n) => round1(n) + ' см';

  function post(clientId, phase, field, value) {
    const qs = new URLSearchParams(Object.assign({ resource: 'measures' }, clientId ? { clientId } : {})).toString();
    return fetch('/api/clients?' + qs, {
      method: 'POST',
      headers: auth().headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ phase, field, value }),
    }).catch(() => {});
  }

  // Список вида «Талия, Обхват груди и Обхват шеи».
  function joinRu(arr) {
    if (arr.length <= 1) return arr.join('');
    return arr.slice(0, -1).join(', ') + ' и ' + arr[arr.length - 1];
  }

  // Авто-отчёт по разнице старт → 4-й день. Возвращает строку или null.
  function buildReport(get) {
    const rows = FIELDS
      .map(f => ({ label: f.label, s: get('start', f.key), d: get('d4', f.key) }))
      .filter(r => r.s != null && r.d != null && r.s !== '' && r.d !== '')
      .map(r => ({ label: r.label, s: Number(r.s), d: Number(r.d), delta: round1(Number(r.d) - Number(r.s)) }));
    if (rows.length < 3) return null;   // отчёт после хотя бы 3 пар замеров

    const down = rows.filter(r => r.delta <= -0.1);
    const same = rows.filter(r => Math.abs(r.delta) < 0.1);
    const up   = rows.filter(r => r.delta >= 0.1);
    const totalDown = round1(down.reduce((acc, r) => acc + (-r.delta), 0));
    const best = down.slice().sort((a, b) => a.delta - b.delta)[0];

    const parts = [];
    parts.push(`За первые 3 дня программы сняты замеры по ${rows.length} зонам. Суммарно объёмы ушли на ${totalDown} см.`);

    if (down.length) {
      const list = joinRu(down.slice().sort((a, b) => a.delta - b.delta).map(r => `${r.label.toLowerCase()} (−${round1(-r.delta)} см)`));
      parts.push(`Хорошая динамика: ${list}.${best ? ` Сильнее всего ушла ${best.label.toLowerCase()} — это главный результат старта.` : ''}`);
    } else {
      parts.push('Заметного снижения объёмов пока нет — это нормально для первых дней, тело перестраивает водно-солевой баланс.');
    }

    if (same.length) parts.push(`Без изменений: ${joinRu(same.map(r => r.label.toLowerCase()))} — держим под наблюдением.`);
    if (up.length) {
      parts.push(`Требует внимания: ${joinRu(up.map(r => `${r.label.toLowerCase()} (+${round1(r.delta)} см)`))}. Чаще это отёк или замер в разное время суток — повторите измерение утром натощак.`);
    }

    // Рекомендации «что добавить» — привязаны к дневнику питания.
    const reco = ['питьевой режим', 'запись еды перед приёмом и контроль порций'];
    if (up.length || same.length) reco.push('клетчатку и пробиотики');
    reco.push('масло, витамины и Ca + Zn по схеме');
    parts.push(`Что усилить: ${joinRu(reco)}. Ориентируйтесь на динамику талии и бёдер, а не на вес в моменте.`);

    return parts.join(' ');
  }

  function MeasureBlock({ clientId, readOnly }) {
    const CK = 'omtime.measures.' + (clientId || 'self');
    const [vals, setVals] = useState({});      // { 'phase|field': value }
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      let cached = false;
      try { const raw = localStorage.getItem(CK); if (raw) { setVals(JSON.parse(raw)); setLoaded(true); cached = true; } } catch (e) {}
      if (!cached) setLoaded(false);
      const qs = new URLSearchParams(Object.assign({ resource: 'measures' }, clientId ? { clientId } : {})).toString();
      fetch('/api/clients?' + qs, { headers: auth().headers() })
        .then(r => r.ok ? r.json() : null)
        .then(j => {
          const m = {};
          if (j && j.ok && j.data && j.data.entries) j.data.entries.forEach(e => { m[e.phase + '|' + e.field] = e.value; });
          setVals(m); setLoaded(true);
        })
        .catch(() => setLoaded(true));
    }, [clientId]);

    // Кэш для мгновенной отрисовки таблицы/отчёта при следующем заходе.
    useEffect(() => { if (loaded) { try { localStorage.setItem(CK, JSON.stringify(vals)); } catch (e) {} } }, [vals, loaded]);

    const get = (phase, field) => { const v = vals[phase + '|' + field]; return v == null ? '' : v; };
    const setLocal = (phase, field, value) => setVals(m => {
      const next = Object.assign({}, m); const k = phase + '|' + field;
      if (value === '' || value == null) delete next[k]; else next[k] = value;
      return next;
    });
    const onInput = (phase, field, raw) => setLocal(phase, field, String(raw).replace(/[^\d.]/g, '').slice(0, 5));
    const commit = (phase, field) => { if (!readOnly) post(clientId, phase, field, get(phase, field)); };

    if (!loaded) return <div style={{ fontSize: 13, color: 'var(--om-muted)', marginTop: 22 }}>Загрузка замеров…</div>;

    const report = buildReport(get);

    return (
      <div style={{ marginTop: 22 }}>
        <div style={S.label}><LucideIcon name="ruler" size={15} /> Замеры тела, см</div>
        <div style={S.hint}>
          {readOnly
            ? 'Объёмы тела клиента на старте и на 4-й день программы (после 3 суток).'
            : 'Снимите обхваты в начале программы, затем повторите на 4-й день (после 3 суток). По разнице сформируется отчёт.'}
        </div>

        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.th, ...S.thLabel }}>Замер</th>
                <th style={S.th}>Старт</th>
                <th style={S.th}>4-й день</th>
                <th style={S.th}>Δ</th>
              </tr>
            </thead>
            <tbody>
              {FIELDS.map(f => {
                const s = get('start', f.key), d = get('d4', f.key);
                const has = s !== '' && d !== '';
                const delta = has ? round1(Number(d) - Number(s)) : null;
                return (
                  <tr key={f.key}>
                    <th style={S.rowLabel}>{f.label}</th>
                    <td style={S.cell}>
                      {readOnly ? <span style={S.cellText}>{s !== '' ? s : '—'}</span>
                        : <input style={S.input} type="text" inputMode="decimal" value={s} placeholder="—"
                            onChange={e => onInput('start', f.key, e.target.value)} onBlur={() => commit('start', f.key)} />}
                    </td>
                    <td style={S.cell}>
                      {readOnly ? <span style={S.cellText}>{d !== '' ? d : '—'}</span>
                        : <input style={S.input} type="text" inputMode="decimal" value={d} placeholder="—"
                            onChange={e => onInput('d4', f.key, e.target.value)} onBlur={() => commit('d4', f.key)} />}
                    </td>
                    <td style={S.cell}>
                      {delta == null ? <span style={S.deltaMuted}>—</span>
                        : <span style={{ ...S.deltaText, color: delta < 0 ? 'var(--om-sage-deep)' : delta > 0 ? 'var(--om-coral)' : 'var(--om-muted)' }}>
                            {delta > 0 ? '+' + delta : delta}
                          </span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={S.reportBox}>
          <div style={S.reportHead}><LucideIcon name="file-text" size={15} /> Отчёт по динамике объёмов</div>
          {report
            ? <p style={S.reportText}>{report}</p>
            : <p style={S.reportEmpty}>Отчёт появится, когда будут заполнены замеры «старт» и «4-й день» (минимум по 3 зонам).</p>}
        </div>
      </div>
    );
  }

  const S = {
    label: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: 'var(--om-ink)', marginBottom: 4 },
    hint: { fontSize: 12.5, color: 'var(--om-muted)', marginBottom: 12, maxWidth: 560, lineHeight: 1.5 },
    tableWrap: { border: '1px solid var(--om-hairline)', borderRadius: 'var(--om-radius-md, 12px)', overflow: 'hidden', background: 'var(--om-canvas-white)', maxWidth: 520 },
    table: { borderCollapse: 'collapse', width: '100%', fontSize: 13, color: 'var(--om-ink)' },
    th: {
      padding: '8px 12px', textAlign: 'center', fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase',
      color: 'var(--om-muted)', fontWeight: 600, background: 'var(--om-canvas, #fbf8f2)', borderBottom: '1px solid var(--om-hairline)',
    },
    thLabel: { textAlign: 'left' },
    rowLabel: { padding: '7px 12px', textAlign: 'left', fontWeight: 500, color: 'var(--om-ink)', borderBottom: '1px solid var(--om-hairline-soft, #efe9df)', whiteSpace: 'nowrap' },
    cell: { padding: '5px 8px', textAlign: 'center', borderBottom: '1px solid var(--om-hairline-soft, #efe9df)', borderLeft: '1px solid var(--om-hairline-soft, #efe9df)' },
    input: {
      width: 56, border: '1px solid var(--om-hairline)', borderRadius: 8, background: 'var(--om-canvas-white)',
      textAlign: 'center', fontFamily: 'inherit', fontSize: 13, color: 'var(--om-ink)', padding: '5px 4px', outline: 'none',
    },
    cellText: { fontSize: 13, color: 'var(--om-ink)', fontWeight: 500 },
    deltaText: { fontSize: 13, fontWeight: 600 },
    deltaMuted: { fontSize: 13, color: 'var(--om-faint, #b4ad9e)' },
    reportBox: {
      marginTop: 16, background: 'var(--om-canvas-white)', border: '1px solid var(--om-hairline)',
      borderLeft: '3px solid var(--om-sage, #B7C9A8)', borderRadius: 'var(--om-radius-md, 12px)', padding: '16px 18px', maxWidth: 640,
    },
    reportHead: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 600, color: 'var(--om-ink)', marginBottom: 8 },
    reportText: { margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--om-ink)' },
    reportEmpty: { margin: 0, fontSize: 13, lineHeight: 1.5, color: 'var(--om-muted)' },
  };

  window.MeasureBlock = MeasureBlock;
})();
