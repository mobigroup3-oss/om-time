// DiaryTable.jsx — дневник питания под графиком веса (нижняя таблица бланка).
//
// Строки-привычки × дни программы (30 дней от даты старта). Клиент отмечает
// выполнение по дням: «отметки» — клик ставит/снимает галочку, «Количество
// ложек» — число. Специалист/админ смотрят (props.readOnly). Данные:
// /api/clients?resource=diary. Зависит от window.LucideIcon и window.omAuth.
// Экспортирует window.DiaryTable. Обёрнут в IIFE.

(function () {
  const { useState, useEffect } = React;
  const LucideIcon = window.LucideIcon;
  const auth = () => window.omAuth;

  // Поля = строки таблицы. Ключи совпадают с DIARY_FIELDS в api/clients.js.
  const FIELDS = [
    { key: 'log_before', label: 'Запись перед едой',            type: 'check' },
    { key: 'food_stock', label: 'Пищевой запас',                type: 'check' },
    { key: 'oil',        label: 'Масло раст.',                  type: 'check' },
    { key: 'vitamins',   label: 'Витамины',                     type: 'check' },
    { key: 'ca_zn',      label: 'Ca + Zn, клетчатка, пробиотики', type: 'check' },
    { key: 'spoons',     label: 'Количество ложек',             type: 'number' },
  ];
  const PROGRAM_DAYS = 30;

  const parseYMD = (s) => { const [y, m, d] = String(s).split('-').map(Number); return Date.UTC(y, m - 1, d); };
  const addDays = (ts, n) => ts + n * 86400000;
  const toYMD = (ts) => { const d = new Date(ts); return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0'); };
  const fmtDM = (ts) => { const d = new Date(ts); return String(d.getUTCDate()).padStart(2, '0') + '.' + String(d.getUTCMonth() + 1).padStart(2, '0'); };
  const todayYMD = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  function post(clientId, date, field, value) {
    const qs = new URLSearchParams(Object.assign({ resource: 'diary' }, clientId ? { clientId } : {})).toString();
    return fetch('/api/clients?' + qs, {
      method: 'POST',
      headers: auth().headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ date, field, value }),
    }).catch(() => {});
  }

  function DiaryTable({ clientId, setup, readOnly }) {
    const CK = 'omtime.diary.' + (clientId || 'self');
    const [marks, setMarks] = useState({});          // { 'YYYY-MM-DD|field': value }
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      let cached = false;
      try { const raw = localStorage.getItem(CK); if (raw) { setMarks(JSON.parse(raw)); setLoaded(true); cached = true; } } catch (e) {}
      if (!cached) setLoaded(false);
      const qs = new URLSearchParams(Object.assign({ resource: 'diary' }, clientId ? { clientId } : {})).toString();
      fetch('/api/clients?' + qs, { headers: auth().headers() })
        .then(r => r.ok ? r.json() : null)
        .then(j => {
          const m = {};
          if (j && j.ok && j.data && j.data.entries) j.data.entries.forEach(e => { m[e.date + '|' + e.field] = e.value; });
          setMarks(m); setLoaded(true);
        })
        .catch(() => setLoaded(true));
    }, [clientId]);

    // Кэшируем снимок отметок для мгновенной отрисовки при следующем заходе.
    useEffect(() => { if (loaded) { try { localStorage.setItem(CK, JSON.stringify(marks)); } catch (e) {} } }, [marks, loaded]);

    if (!setup) return null;

    const startTs = parseYMD(setup.startDate);
    const today = todayYMD();
    // 30 дней программы: день i (1..30) = старт + (i−1).
    const days = Array.from({ length: PROGRAM_DAYS }, (_, i) => {
      const ts = addDays(startTs, i);
      return { n: i + 1, date: toYMD(ts), label: fmtDM(ts) };
    });

    const get = (date, field) => marks[date + '|' + field] || '';
    const setLocal = (date, field, value) => setMarks(m => {
      const next = Object.assign({}, m); const k = date + '|' + field;
      if (value) next[k] = value; else delete next[k]; return next;
    });

    const toggleCheck = (date, field) => {
      if (readOnly) return;
      const value = get(date, field) ? '' : '1';
      setLocal(date, field, value);
      post(clientId, date, field, value);
    };
    const setNumber = (date, field, raw) => {
      const value = String(raw).replace(/[^\d.]/g, '').slice(0, 5);
      setLocal(date, field, value);
    };
    const commitNumber = (date, field) => { if (!readOnly) post(clientId, date, field, get(date, field)); };

    if (!loaded) return <div style={{ fontSize: 13, color: 'var(--om-muted)', marginTop: 18 }}>Загрузка дневника…</div>;

    return (
      <div style={{ marginTop: 22 }}>
        <div style={S.label}><LucideIcon name="clipboard-list" size={15} /> Дневник питания</div>
        <div style={S.hint}>
          {readOnly
            ? 'Клиент отмечает выполнение по дням. Галочка — выполнено, число — количество ложек.'
            : 'Отмечайте каждый день: нажмите клетку, чтобы поставить галочку. В нижней строке впишите количество ложек.'}
        </div>
        <div style={S.scroll}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.cornerCell }}>День →</th>
                {days.map(d => (
                  <th key={d.date} title={d.label} style={{ ...S.dayHead, ...(d.date === today ? S.todayHead : null) }}>
                    <span style={S.dayNum}>{d.n}</span>
                    <span style={S.dayDate}>{d.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FIELDS.map(f => (
                <tr key={f.key}>
                  <th style={S.rowLabel} title={f.label}>{f.label}</th>
                  {days.map(d => {
                    const v = get(d.date, f.key);
                    const isToday = d.date === today;
                    if (f.type === 'number') {
                      return (
                        <td key={d.date} style={{ ...S.cell, ...(isToday ? S.todayCell : null) }}>
                          {readOnly
                            ? <span style={S.numText}>{v || ''}</span>
                            : <input style={S.numInput} type="text" inputMode="numeric" value={v}
                                onChange={e => setNumber(d.date, f.key, e.target.value)}
                                onBlur={() => commitNumber(d.date, f.key)} />}
                        </td>
                      );
                    }
                    return (
                      <td key={d.date}
                        onClick={() => toggleCheck(d.date, f.key)}
                        style={{ ...S.cell, ...(isToday ? S.todayCell : null), cursor: readOnly ? 'default' : 'pointer', background: v ? 'var(--om-sage, #B7C9A8)' : (isToday ? S.todayCell.background : undefined) }}>
                        {v ? <LucideIcon name="check" size={15} style={{ color: 'var(--om-sage-deep, #4E6B3F)' }} /> : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const S = {
    label: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: 'var(--om-ink)', marginBottom: 4 },
    hint: { fontSize: 12.5, color: 'var(--om-muted)', marginBottom: 12, maxWidth: 560, lineHeight: 1.5 },
    scroll: {
      overflowX: 'auto', border: '1px solid var(--om-hairline)', borderRadius: 'var(--om-radius-md, 12px)',
      background: 'var(--om-canvas-white)',
    },
    table: { borderCollapse: 'collapse', fontSize: 12.5, color: 'var(--om-ink)', width: 'max-content' },
    cornerCell: {
      position: 'sticky', left: 0, zIndex: 2, background: 'var(--om-canvas, #fbf8f2)',
      padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11,
      color: 'var(--om-muted)', borderBottom: '1px solid var(--om-hairline)', borderRight: '1px solid var(--om-hairline)',
      minWidth: 168, whiteSpace: 'nowrap',
    },
    dayHead: {
      padding: '5px 0', width: 36, minWidth: 36, textAlign: 'center',
      borderBottom: '1px solid var(--om-hairline)', borderRight: '1px solid var(--om-hairline-soft, #efe9df)',
    },
    todayHead: { background: 'var(--om-gold-soft, #FAE7A8)' },
    dayNum: { display: 'block', fontWeight: 600, fontSize: 12, lineHeight: 1.2 },
    dayDate: { display: 'block', fontSize: 9, color: 'var(--om-faint, #b4ad9e)', lineHeight: 1.2 },
    rowLabel: {
      position: 'sticky', left: 0, zIndex: 1, background: 'var(--om-canvas-white)',
      padding: '8px 12px', textAlign: 'left', fontWeight: 500, color: 'var(--om-ink)',
      borderBottom: '1px solid var(--om-hairline-soft, #efe9df)', borderRight: '1px solid var(--om-hairline)',
      minWidth: 168, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    },
    cell: {
      width: 36, minWidth: 36, height: 34, textAlign: 'center', verticalAlign: 'middle',
      borderBottom: '1px solid var(--om-hairline-soft, #efe9df)', borderRight: '1px solid var(--om-hairline-soft, #efe9df)',
    },
    todayCell: { background: 'rgba(242,193,46,0.10)' },
    numInput: {
      width: 32, border: 'none', background: 'transparent', textAlign: 'center',
      fontFamily: 'inherit', fontSize: 12.5, color: 'var(--om-ink)', outline: 'none', padding: 0,
    },
    numText: { fontSize: 12.5, color: 'var(--om-ink)', fontWeight: 600 },
  };

  window.DiaryTable = DiaryTable;
})();
