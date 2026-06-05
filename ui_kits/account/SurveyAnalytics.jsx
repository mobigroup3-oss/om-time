// SurveyAnalytics.jsx — сводка анкет обратной связи в разделе «Аналитика» (admin).
// Реальные данные: /api/clients?resource=survey&action=all (только админ). Два вида:
//   «Сводно»     — распределения ответов по всем клиентам, средние оценки, NPS, текст.
//   «По клиенту» — выбор клиента → его анкета целиком.
// Вопросы/варианты берём из SurveyConfig.jsx (window.OM_SURVEY). Графики — на CSS
// классах дизайн-системы кабинета (om-stat-*, om-chart-*, om-hbar-*, om-seg) без
// внешних библиотек. Рендерится в самом низу AdminAnalytics.jsx как отдельная секция.

(function () {
  const { useState, useEffect, useMemo } = React;
  const LucideIcon = window.LucideIcon;
  const auth = () => window.omAuth;

  const C = { gold: '#C99A12', coral: '#C03A3B', sage: '#4E6B3F', indigo: '#2E2470', lilac: '#8E7CC3' };
  const PALETTE = [C.gold, C.indigo, C.coral, C.sage, C.lilac, '#B07A2E'];

  const PROGRAMS = {
    'flagship-offline': 'Вес идеальности', 'flagship-online': 'Вес идеальности ONLINE',
    'club': 'Клубный день', 'teen': 'Подростковый клуб', 'detox': 'ONLINE DETOX', 'consult': 'Первая консультация',
  };

  // Распределение ответов на один вопрос среди всех анкет: [{label, count}] в
  // порядке вариантов вопроса (плюс непредвиденные ответы в конце).
  function distribution(rows, q) {
    const counts = new Map();
    rows.forEach(r => {
      const v = r.answers && r.answers[q.id];
      if (v == null || String(v).trim() === '') return;
      const key = String(v);
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const ordered = window.OM_SURVEY.optionList(q).map(o => o.value);
    const out = [];
    ordered.forEach(label => { if (counts.has(label)) { out.push({ label, count: counts.get(label) }); counts.delete(label); } });
    counts.forEach((count, label) => out.push({ label, count })); // ответы вне списка
    return out;
  }

  // Средняя оценка (по score из конфига) для rating-вопроса. null — нет данных.
  function avgScore(rows, q) {
    const opts = window.OM_SURVEY.optionList(q);
    const scoreOf = (v) => { const o = opts.find(x => x.value === v); return o && typeof o.score === 'number' ? o.score : null; };
    let sum = 0, n = 0;
    rows.forEach(r => { const s = scoreOf(r.answers && r.answers[q.id]); if (s != null) { sum += s; n += 1; } });
    return n ? { avg: sum / n, n } : null;
  }

  // Среднее снижение веса (kg_lost) по числовым ответам.
  function avgKg(rows) {
    let sum = 0, n = 0;
    rows.forEach(r => { const v = Number(r.answers && r.answers.kg_lost); if (Number.isFinite(v)) { sum += v; n += 1; } });
    return n ? { avg: sum / n, n } : null;
  }

  // Доля «Да» в рекомендации.
  function recommendShare(rows) {
    let yes = 0, n = 0;
    rows.forEach(r => { const v = r.answers && r.answers.recommend; if (v === 'Да' || v === 'Нет') { n += 1; if (v === 'Да') yes += 1; } });
    return n ? { pct: Math.round((yes / n) * 100), yes, n } : null;
  }

  // ── Горизонтальные бары (распределение) ──
  function DistBars({ rows }) {
    const max = Math.max(1, ...rows.map(r => r.count));
    const total = rows.reduce((s, r) => s + r.count, 0) || 1;
    return (
      <div className="om-hbars">
        {rows.map((d, i) => (
          <div className="om-hbar-row" key={d.label}>
            <div className="om-hbar-label">{d.label}</div>
            <div className="om-hbar-track">
              <div className="om-hbar-fill" style={{ width: (d.count / max) * 100 + '%', background: PALETTE[i % PALETTE.length] }} />
            </div>
            <div className="om-hbar-val">{d.count} · {Math.round((d.count / total) * 100)}%</div>
          </div>
        ))}
      </div>
    );
  }

  function StatCard({ icon, accent, label, value, suffix, sub }) {
    return (
      <div className="om-stat-card">
        <div className="om-stat-top">
          <span className="om-stat-icon" style={{ background: accent + '22', color: accent }}>
            <LucideIcon name={icon} size={18} />
          </span>
        </div>
        <div className="om-stat-value">{value}{suffix && <span className="om-stat-suffix">{suffix}</span>}</div>
        <div className="om-stat-label">{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: 'var(--om-faint)', marginTop: 4 }}>{sub}</div>}
      </div>
    );
  }

  function SectionHead() {
    return (
      <div style={{ margin: '34px 0 18px', paddingTop: 28, borderTop: '1px solid var(--om-hairline)' }}>
        <div className="om-acc-eyebrow">Обратная связь</div>
        <h2 style={{
          fontFamily: 'var(--om-font-sans)', fontSize: 22, fontWeight: 600,
          color: 'var(--om-ink)', margin: '8px 0 4px', letterSpacing: 'var(--om-tracking-tight)',
        }}>Анкеты клиентов</h2>
        <p className="om-acc-sub" style={{ margin: 0 }}>
          Ответы клиентов на анкету обратной связи — сводно по всем и по каждому отдельно.
        </p>
      </div>
    );
  }

  function SurveyAnalytics() {
    const survey = window.OM_SURVEY;
    const [rows, setRows] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [view, setView] = useState('summary');      // summary | byClient
    const [clientId, setClientId] = useState('');

    useEffect(() => {
      fetch('/api/clients?resource=survey&action=all', { headers: auth().headers() })
        .then(r => r.ok ? r.json() : null)
        .then(j => { if (j && j.ok && Array.isArray(j.data)) setRows(j.data); setLoaded(true); })
        .catch(() => setLoaded(true));
    }, []);

    const kg = useMemo(() => avgKg(rows), [rows]);
    const rec = useMemo(() => recommendShare(rows), [rows]);
    const trainerScore = useMemo(() => survey && avgScore(rows, survey.byId('trainer_rating')), [rows, survey]);

    // Текстовые пожелания (с именем клиента).
    const comments = useMemo(() => rows
      .filter(r => r.answers && String(r.answers.suggestions || '').trim())
      .map(r => ({ name: r.clientName, text: r.answers.suggestions })), [rows]);

    if (!survey) return null;

    const choiceQuestions = survey.questions.filter(q => q.type === 'single' || q.type === 'rating');
    const selected = rows.find(r => r.clientId === clientId) || null;

    return (
      <React.Fragment>
        <SectionHead />

        {!loaded ? (
          <div style={{ fontSize: 13, color: 'var(--om-faint)', padding: '10px 0' }}>Загрузка анкет…</div>
        ) : rows.length === 0 ? (
          <div style={ST.empty}>
            <LucideIcon name="clipboard-list" size={28} style={{ marginBottom: 10, opacity: 0.5 }} />
            <div style={{ fontSize: 14, color: 'var(--om-ink)', fontWeight: 500 }}>Анкет пока нет</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Как только клиенты заполнят анкету в своём кабинете, здесь появится сводка.</div>
          </div>
        ) : (
          <React.Fragment>
            {/* Переключатель вида */}
            <div className="om-adm-toolbar">
              <div className="om-seg">
                <button className={'om-seg-btn' + (view === 'summary' ? ' is-active' : '')} onClick={() => setView('summary')}>Сводно</button>
                <button className={'om-seg-btn' + (view === 'byClient' ? ' is-active' : '')} onClick={() => setView('byClient')}>По клиенту</button>
              </div>
            </div>

            {view === 'summary' ? (
              <React.Fragment>
                {/* KPI */}
                <div className="om-stat-grid">
                  <StatCard icon="clipboard-check" accent={C.indigo} label="Анкет собрано" value={rows.length} />
                  <StatCard icon="star" accent={C.gold} label="Средняя оценка тренера"
                    value={trainerScore ? trainerScore.avg.toFixed(1) : '—'} suffix={trainerScore ? ' / 5' : ''}
                    sub={trainerScore ? `по ${trainerScore.n} ответам` : 'нет данных'} />
                  <StatCard icon="thumbs-up" accent={C.sage} label="Рекомендуют программу"
                    value={rec ? rec.pct : '—'} suffix={rec ? '%' : ''}
                    sub={rec ? `${rec.yes} из ${rec.n}` : 'нет данных'} />
                  <StatCard icon="trending-down" accent={C.coral} label="Среднее снижение веса"
                    value={kg ? kg.avg.toFixed(1) : '—'} suffix={kg ? ' кг' : ''}
                    sub={kg ? `по ${kg.n} ответам` : 'нет данных'} />
                </div>

                {/* Распределения по каждому вопросу с вариантами */}
                <div className="om-chart-grid">
                  {choiceQuestions.map(q => {
                    const dist = distribution(rows, q);
                    return (
                      <div className="om-chart-card om-chart-card--wide" key={q.id}>
                        <div className="om-chart-head">
                          <div>
                            <h3 className="om-chart-title">{q.label}</h3>
                            <p className="om-chart-sub">{dist.reduce((s, d) => s + d.count, 0)} ответов</p>
                          </div>
                        </div>
                        <div className="om-chart-body">
                          {dist.length ? <DistBars rows={dist} /> : <p className="om-chart-sub" style={{ margin: 0 }}>Нет ответов</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Пожелания и предложения (свободный текст) */}
                <div className="om-chart-card om-chart-card--wide" style={{ marginTop: 4 }}>
                  <div className="om-chart-head">
                    <div>
                      <h3 className="om-chart-title">Пожелания и предложения</h3>
                      <p className="om-chart-sub">Свободные ответы клиентов — {comments.length}</p>
                    </div>
                  </div>
                  <div className="om-chart-body">
                    {comments.length ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {comments.map((c, i) => (
                          <div key={i} style={ST.comment}>
                            <div style={ST.commentName}>{c.name || 'Клиент'}</div>
                            <div style={ST.commentText}>{c.text}</div>
                          </div>
                        ))}
                      </div>
                    ) : <p className="om-chart-sub" style={{ margin: 0 }}>Пока никто не оставил пожеланий.</p>}
                  </div>
                </div>
              </React.Fragment>
            ) : (
              /* ── По клиенту ── */
              <React.Fragment>
                <div style={{ margin: '4px 0 16px' }}>
                  <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={ST.select}>
                    <option value="">— выберите клиента —</option>
                    {rows.map(r => (
                      <option key={r.clientId} value={r.clientId}>
                        {r.clientName}{r.programId && PROGRAMS[r.programId] ? ` · ${PROGRAMS[r.programId]}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {selected ? (
                  <div className="om-chart-card om-chart-card--wide">
                    <div className="om-chart-head">
                      <div>
                        <h3 className="om-chart-title">{selected.clientName}</h3>
                        <p className="om-chart-sub">
                          {selected.programId && PROGRAMS[selected.programId] ? PROGRAMS[selected.programId] + ' · ' : ''}
                          заполнено {new Date(selected.submittedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="om-chart-body">
                      <div style={ST.answers}>
                        {survey.questions.map(q => {
                          const v = selected.answers && selected.answers[q.id];
                          const has = v != null && String(v).trim() !== '';
                          return (
                            <div key={q.id} style={ST.answerRow}>
                              <div style={ST.answerQ}>{q.label}</div>
                              <div style={Object.assign({}, ST.answerA, has ? null : ST.answerEmpty)}>
                                {has ? (q.type === 'number' && q.unit ? `${v} ${q.unit}` : String(v)) : '—'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="om-chart-sub" style={{ margin: '8px 0' }}>Выберите клиента, чтобы увидеть его анкету.</p>
                )}
              </React.Fragment>
            )}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }

  const ST = {
    empty: {
      background: 'var(--om-canvas-white)', border: '1px dashed var(--om-hairline)',
      borderRadius: 'var(--om-radius-lg)', padding: '40px 28px', textAlign: 'center', color: 'var(--om-muted)',
    },
    comment: {
      background: 'var(--om-canvas, #fbf8f2)', border: '1px solid var(--om-hairline)',
      borderRadius: 'var(--om-radius-sm, 10px)', padding: '11px 14px',
    },
    commentName: { fontSize: 12, fontWeight: 600, color: 'var(--om-coral-deep, #8C2528)', marginBottom: 4 },
    commentText: { fontSize: 14, color: 'var(--om-ink)', lineHeight: 1.5, whiteSpace: 'pre-wrap' },
    select: {
      font: 'inherit', fontSize: 14.5, padding: '10px 13px', minWidth: 280, maxWidth: '100%',
      border: '1px solid var(--om-hairline, #e7e1d6)', borderRadius: 'var(--om-radius-sm, 10px)',
      background: 'var(--om-canvas-white, #fff)', color: 'var(--om-ink)', outline: 'none',
    },
    answers: { display: 'flex', flexDirection: 'column' },
    answerRow: {
      display: 'flex', gap: 18, padding: '11px 0', borderBottom: '1px solid var(--om-hairline)',
      flexWrap: 'wrap',
    },
    answerQ: { flex: '1 1 280px', minWidth: 0, fontSize: 13.5, color: 'var(--om-muted)' },
    answerA: { flex: '0 1 auto', fontSize: 14, fontWeight: 600, color: 'var(--om-ink)', textAlign: 'right' },
    answerEmpty: { fontWeight: 400, color: 'var(--om-faint)' },
  };

  window.SurveyAnalytics = SurveyAnalytics;
})();
