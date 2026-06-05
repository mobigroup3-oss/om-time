// ClientSurvey.jsx — раздел «Анкета» в кабинете клиента (роль client).
// Анкета обратной связи по программе: вопросы/варианты из SurveyConfig.jsx
// (копия n8n-формы om-time-anketa). Одна актуальная анкета на клиента —
// при повторном заходе подгружается ранее заполненное и доступно для правки.
// Хранилище — /api/clients?resource=survey (GET self / POST upsert). Сводку
// по всем анкетам админ видит в разделе «Аналитика» (SurveyAnalytics.jsx).

(function () {
  const { useState, useEffect } = React;
  const LucideIcon = window.LucideIcon;
  const auth = () => window.omAuth;
  const SURVEY = () => window.OM_SURVEY;

  function ClientSurvey() {
    const survey = SURVEY();
    const questions = (survey && survey.questions) || [];

    const [answers, setAnswers] = useState({});
    const [loaded, setLoaded] = useState(false);
    const [submittedAt, setSubmittedAt] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [error, setError] = useState('');

    // Подгрузить ранее заполненную анкету (если есть) — для правки.
    useEffect(() => {
      fetch('/api/clients?resource=survey', { headers: auth().headers() })
        .then(r => r.ok ? r.json() : null)
        .then(j => {
          if (j && j.ok && j.data) {
            setAnswers(j.data.answers || {});
            setSubmittedAt(j.data.submittedAt || null);
          }
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    }, []);

    const set = (id, value) => setAnswers(prev => Object.assign({}, prev, { [id]: value }));

    const filledCount = questions.filter(q => {
      const v = answers[q.id];
      return v != null && String(v).trim() !== '';
    }).length;

    function submit() {
      setError('');
      if (filledCount === 0) { setError('Заполните хотя бы один вопрос'); return; }
      setSaving(true);
      fetch('/api/clients?resource=survey', {
        method: 'POST',
        headers: auth().headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ answers }),
      })
        .then(r => r.ok ? r.json() : r.json().then(j => Promise.reject(j)))
        .then(j => {
          setSubmittedAt((j.data && j.data.submittedAt) || new Date().toISOString());
          if (j.data && j.data.answers) setAnswers(j.data.answers);
          setToast('Спасибо! Ваша анкета сохранена.');
          setTimeout(() => setToast(null), 4500);
        })
        .catch(j => setError((j && j.error) || 'Не удалось сохранить. Попробуйте ещё раз.'))
        .finally(() => setSaving(false));
    }

    const submittedLabel = submittedAt
      ? new Date(submittedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
      : null;

    return (
      <React.Fragment>
        <div className="om-acc-head" style={{ display: 'block' }}>
          <div className="om-acc-eyebrow">Кабинет</div>
          <h1 className="om-acc-title">Анкета обратной связи</h1>
          <p className="om-acc-sub" style={{ marginBottom: 0 }}>
            Помогите нам стать лучше — расскажите о вашей программе. Ответы видит только команда центра.
            {submittedLabel && <span style={{ color: 'var(--om-sage-deep, #4E6B3F)', fontWeight: 600 }}>{' '}Заполнено {submittedLabel} — можно изменить.</span>}
          </p>
        </div>

        {!loaded ? (
          <div style={ST.loading}>Загрузка…</div>
        ) : (
          <div style={ST.wrap}>
            {questions.map((q, i) => (
              <div key={q.id} style={ST.card}>
                <div style={ST.qLabel}>
                  <span style={ST.qNum}>{i + 1}</span>
                  <span>{q.label}</span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <QuestionInput q={q} value={answers[q.id]} onChange={(v) => set(q.id, v)} />
                </div>
              </div>
            ))}

            {error && <div style={ST.error}><LucideIcon name="alert-circle" size={15} /> {error}</div>}

            <div style={ST.footer}>
              <span style={ST.progress}>Заполнено {filledCount} из {questions.length}</span>
              <button className="om-btn" style={ST.submitBtn} onClick={submit} disabled={saving}>
                <LucideIcon name={saving ? 'loader' : 'send'} size={16} style={{ marginRight: 8 }} />
                {saving ? 'Сохранение…' : (submittedAt ? 'Сохранить изменения' : 'Отправить анкету')}
              </button>
            </div>
          </div>
        )}

        {toast && (
          <div className="om-toast" style={{ background: 'var(--om-sage-deep, #4E6B3F)' }}>
            <LucideIcon name="check-circle-2" size={16} />
            {toast}
          </div>
        )}
      </React.Fragment>
    );
  }

  // Один вопрос: чипы выбора (single/rating), число или текст.
  function QuestionInput({ q, value, onChange }) {
    if (q.type === 'number') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="number" min={q.min} max={q.max} step={q.step || 1}
            value={value == null ? '' : value}
            onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
            placeholder="0"
            style={ST.numInput}
          />
          {q.unit && <span style={{ color: 'var(--om-muted)', fontSize: 14 }}>{q.unit}</span>}
        </div>
      );
    }
    if (q.type === 'text') {
      return (
        <textarea
          rows={3}
          value={value == null ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={q.placeholder || ''}
          style={ST.textArea}
        />
      );
    }
    // single / rating — чипы выбора одного варианта.
    const opts = window.OM_SURVEY.optionList(q);
    return (
      <div style={ST.chips}>
        {opts.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(active ? null : o.value)}
              style={Object.assign({}, ST.chip, active ? ST.chipOn : null)}
            >
              {o.value}
            </button>
          );
        })}
      </div>
    );
  }

  const ST = {
    wrap: { maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 14 },
    loading: { fontSize: 13, color: 'var(--om-faint)', padding: '24px 0' },
    card: {
      background: 'var(--om-glass, rgba(255,255,255,0.66))',
      backdropFilter: 'blur(14px) saturate(1.1)', WebkitBackdropFilter: 'blur(14px) saturate(1.1)',
      border: '1px solid var(--om-glass-line, rgba(255,255,255,0.7))',
      borderRadius: 'var(--om-radius-lg, 16px)', padding: '18px 20px',
      boxShadow: 'var(--om-shadow-aurora, 0 12px 32px rgba(27,24,64,0.06))',
    },
    qLabel: { display: 'flex', alignItems: 'flex-start', gap: 11, fontSize: 15, fontWeight: 600, color: 'var(--om-ink)', lineHeight: 1.35 },
    qNum: {
      flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 24, height: 24, borderRadius: '50%', fontSize: 12.5, fontWeight: 700, color: '#fff',
      background: 'linear-gradient(140deg, var(--om-indigo), var(--om-coral))', boxShadow: '0 4px 10px rgba(46,36,112,0.28)',
    },
    chips: { display: 'flex', flexWrap: 'wrap', gap: 8 },
    chip: {
      font: 'inherit', fontSize: 13.5, cursor: 'pointer',
      padding: '8px 14px', borderRadius: 999,
      border: '1px solid var(--om-hairline, #e7e1d6)', background: 'var(--om-canvas-white, #fff)',
      color: 'var(--om-ink)', transition: 'all 0.14s ease',
    },
    chipOn: {
      borderColor: 'transparent', color: '#fff',
      background: 'linear-gradient(140deg, var(--om-indigo), #5b3fb0 55%, var(--om-coral))',
      boxShadow: '0 6px 16px rgba(46,36,112,0.28)',
    },
    numInput: {
      font: 'inherit', fontSize: 15, width: 140, padding: '10px 12px',
      border: '1px solid var(--om-hairline, #e7e1d6)', borderRadius: 'var(--om-radius-sm, 10px)',
      background: 'var(--om-canvas-white, #fff)', color: 'var(--om-ink)', outline: 'none',
    },
    textArea: {
      font: 'inherit', fontSize: 14.5, width: '100%', padding: '11px 13px', resize: 'vertical',
      border: '1px solid var(--om-hairline, #e7e1d6)', borderRadius: 'var(--om-radius-sm, 10px)',
      background: 'var(--om-canvas-white, #fff)', color: 'var(--om-ink)', outline: 'none', lineHeight: 1.5,
    },
    footer: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
      marginTop: 4, paddingTop: 6,
    },
    progress: { fontSize: 13, color: 'var(--om-muted)' },
    submitBtn: { display: 'inline-flex', alignItems: 'center' },
    error: {
      display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5,
      color: 'var(--om-coral, #C03A3B)', padding: '2px 2px',
    },
  };

  window.ClientSurvey = ClientSurvey;
})();
