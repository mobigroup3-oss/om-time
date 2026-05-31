// ProfileView.jsx — личный раздел «Профиль».
// Контактные данные, уведомления, смена пароля (макет). Хранение:
// localStorage('omtime.profile.v1'). Стили — общая дизайн-система кабинета.
// Обёрнут в IIFE.

(function () {
  const { useState, useEffect } = React;
  const LucideIcon = window.LucideIcon;

  const PROFILE_KEY = 'omtime.profile.v1';

  const DEFAULT_PROFILE = {
    name: 'Татьяна Педас',
    email: 'tatiana@omtime.kz',
    phone: '+7 701 000 00 00',
    city: 'Алматы',
    notifyBookings: true,
    notifyReminders: true,
    notifyNews: false,
  };

  function useProfile() {
    const [data, setData] = useState(() => {
      try {
        const raw = localStorage.getItem(PROFILE_KEY);
        if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
      } catch (e) {}
      return DEFAULT_PROFILE;
    });
    useEffect(() => {
      try { localStorage.setItem(PROFILE_KEY, JSON.stringify(data)); } catch (e) {}
    }, [data]);
    return [data, setData];
  }

  function Card({ title, sub, children }) {
    return (
      <div style={S.card}>
        <div style={S.cardHead}>
          <h2 style={S.cardTitle}>{title}</h2>
          {sub && <p style={S.cardSub}>{sub}</p>}
        </div>
        {children}
      </div>
    );
  }

  function Toggle({ label, hint, checked, onChange }) {
    return (
      <label style={S.toggleRow}>
        <span>
          <span style={S.toggleLabel}>{label}</span>
          {hint && <span style={S.toggleHint}>{hint}</span>}
        </span>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          style={{ width: 18, height: 18, accentColor: 'var(--om-ink)', flexShrink: 0 }}
        />
      </label>
    );
  }

  function ProfileView() {
    const [data, setData] = useProfile();
    const [form, setForm] = useState(data);
    const [pwd, setPwd] = useState({ current: '', next: '', repeat: '' });
    const [toast, setToast] = useState(null);

    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
    const setP = (key, value) => setPwd(p => ({ ...p, [key]: value }));

    const showToast = (msg) => {
      setToast(msg);
      setTimeout(() => setToast(null), 2200);
    };

    const dirty = JSON.stringify(form) !== JSON.stringify(data);

    const saveProfile = () => {
      setData(form);
      showToast('Профиль сохранён');
    };

    const pwdValid = pwd.current && pwd.next.length >= 6 && pwd.next === pwd.repeat;
    const changePassword = () => {
      if (!pwdValid) return;
      setPwd({ current: '', next: '', repeat: '' });
      showToast('Пароль обновлён');
    };

    return (
      <React.Fragment>
        <div className="om-acc-head">
          <div>
            <div className="om-acc-eyebrow">Личное</div>
            <h1 className="om-acc-title">Профиль</h1>
            <p className="om-acc-sub">Контактные данные, уведомления и пароль.</p>
          </div>
        </div>

        <div style={S.stack}>
          <Card title="Контактные данные" sub="Используются для связи и подтверждения записей.">
            <div className="om-form-grid">
              <label className="om-form-field">
                <span className="om-form-label">Имя</span>
                <input className="om-form-input" type="text" value={form.name}
                  onChange={e => set('name', e.target.value)} />
              </label>
              <label className="om-form-field">
                <span className="om-form-label">Город</span>
                <input className="om-form-input" type="text" value={form.city}
                  onChange={e => set('city', e.target.value)} />
              </label>
              <label className="om-form-field">
                <span className="om-form-label">E-mail</span>
                <input className="om-form-input" type="email" value={form.email}
                  onChange={e => set('email', e.target.value)} />
              </label>
              <label className="om-form-field">
                <span className="om-form-label">Телефон</span>
                <input className="om-form-input" type="text" value={form.phone}
                  onChange={e => set('phone', e.target.value)} />
              </label>
            </div>
            <div style={S.cardFoot}>
              <button
                className="om-btn om-btn--primary"
                disabled={!dirty}
                style={{ opacity: dirty ? 1 : 0.5, pointerEvents: dirty ? 'auto' : 'none' }}
                onClick={saveProfile}
              >
                Сохранить изменения
              </button>
            </div>
          </Card>

          <Card title="Уведомления" sub="Что присылать на почту.">
            <div style={S.toggleList}>
              <Toggle
                label="Подтверждения записей"
                hint="Письмо при записи и изменении встречи"
                checked={form.notifyBookings}
                onChange={v => set('notifyBookings', v)}
              />
              <Toggle
                label="Напоминания"
                hint="За день до встречи"
                checked={form.notifyReminders}
                onChange={v => set('notifyReminders', v)}
              />
              <Toggle
                label="Новости центра"
                hint="Анонсы программ и клубных дней"
                checked={form.notifyNews}
                onChange={v => set('notifyNews', v)}
              />
            </div>
            <div style={S.cardFoot}>
              <button
                className="om-btn om-btn--primary"
                disabled={!dirty}
                style={{ opacity: dirty ? 1 : 0.5, pointerEvents: dirty ? 'auto' : 'none' }}
                onClick={saveProfile}
              >
                Сохранить изменения
              </button>
            </div>
          </Card>

          <Card title="Пароль" sub="Минимум 6 символов.">
            <div className="om-form-grid">
              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Текущий пароль</span>
                <input className="om-form-input" type="password" value={pwd.current}
                  onChange={e => setP('current', e.target.value)} placeholder="••••••••" />
              </label>
              <label className="om-form-field">
                <span className="om-form-label">Новый пароль</span>
                <input className="om-form-input" type="password" value={pwd.next}
                  onChange={e => setP('next', e.target.value)} placeholder="••••••••" />
              </label>
              <label className="om-form-field">
                <span className="om-form-label">Повторите пароль</span>
                <input className="om-form-input" type="password" value={pwd.repeat}
                  onChange={e => setP('repeat', e.target.value)} placeholder="••••••••" />
                {pwd.repeat && pwd.next !== pwd.repeat && (
                  <span className="om-form-help" style={{ color: 'var(--om-danger)' }}>Пароли не совпадают</span>
                )}
              </label>
            </div>
            <div style={S.cardFoot}>
              <button
                className="om-btn om-btn--primary"
                disabled={!pwdValid}
                style={{ opacity: pwdValid ? 1 : 0.5, pointerEvents: pwdValid ? 'auto' : 'none' }}
                onClick={changePassword}
              >
                Обновить пароль
              </button>
            </div>
          </Card>
        </div>

        {toast && (
          <div className="om-toast">
            <LucideIcon name="check" size={16} />
            {toast}
          </div>
        )}
      </React.Fragment>
    );
  }

  const S = {
    stack: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 },
    card: {
      background: 'var(--om-canvas-white)',
      border: '1px solid var(--om-hairline)',
      borderRadius: 'var(--om-radius-lg)',
      padding: 24,
      boxShadow: 'var(--om-shadow-card)',
    },
    cardHead: { marginBottom: 18 },
    cardTitle: { margin: 0, fontSize: 'var(--om-text-title-sm)', fontWeight: 500, color: 'var(--om-ink)', lineHeight: 1.3 },
    cardSub: { margin: '6px 0 0', fontSize: 13, color: 'var(--om-muted)' },
    cardFoot: { display: 'flex', justifyContent: 'flex-end', marginTop: 20 },
    toggleList: { display: 'flex', flexDirection: 'column' },
    toggleRow: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      padding: '14px 0', borderBottom: '1px solid var(--om-hairline-soft)', cursor: 'pointer',
    },
    toggleLabel: { display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--om-ink)' },
    toggleHint: { display: 'block', fontSize: 12, color: 'var(--om-muted)', marginTop: 3 },
  };

  window.ProfileView = ProfileView;
})();
