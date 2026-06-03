// ProfileView.jsx — личный раздел «Профиль».
// Контактные данные, уведомления, смена пароля (макет). Хранение:
// localStorage('omtime.profile.v1'). Стили — общая дизайн-система кабинета.
// Обёрнут в IIFE.

(function () {
  const { useState, useEffect } = React;
  const LucideIcon = window.LucideIcon;

  const auth = () => window.omAuth;
  const ROLE_LABEL = { admin: 'администратор', seller: 'продажник', specialist: 'специалист', client: 'клиент' };

  // Личность текущего пользователя: роль + id + базовое имя из сессии.
  // Профиль раньше был общим моком (omtime.profile.v1) на весь браузер — поэтому
  // разные роли видели чужие данные. Теперь ключ привязан к роли+id, а контакты
  // подтягиваются из реального аккаунта (клиент → /api/clients?action=me и т.д.).
  function identity() {
    const A = auth();
    const role = A.role();
    if (role === 'client')     return { role, id: A.clientId(),     name: A.clientName()     || 'Клиент' };
    if (role === 'specialist') return { role, id: A.specialistId(), name: A.specialistName() || 'Специалист' };
    if (role === 'seller')     return { role, id: A.sellerId(),     name: A.sellerName()     || 'Продажник' };
    return { role: 'admin', id: 'admin', name: 'Администратор' };
  }

  const BLANK = { name: '', email: '', phone: '', city: '', notifyBookings: true, notifyReminders: true, notifyNews: false };

  // Возвращает [data, setData, ident, roleLabel]. Сидирование реальными данными —
  // только если профиль ещё не сохраняли локально под этим ключом.
  function useProfile() {
    const ident = identity();
    const KEY = 'omtime.profile.' + ident.role + '.' + (ident.id || 'x');
    const [data, setData] = useState(() => {
      try { const raw = localStorage.getItem(KEY); if (raw) return { ...BLANK, ...JSON.parse(raw) }; } catch (e) {}
      return { ...BLANK, name: ident.name };
    });
    const [roleLabel, setRoleLabel] = useState(ROLE_LABEL[ident.role] || '');

    useEffect(() => {
      try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
    }, [data]);

    // Подтянуть реальные контактные данные (если локально ещё не правили).
    useEffect(() => {
      let saved = false;
      try { saved = !!localStorage.getItem(KEY); } catch (e) {}
      if (ident.role === 'client') {
        fetch('/api/clients?action=me', { headers: auth().headers() })
          .then(r => r.ok ? r.json() : null)
          .then(j => {
            if (!j || !j.ok || !j.data) return;
            if (!saved) setData(d => ({ ...d, name: j.data.name || d.name, email: j.data.email || '', city: j.data.city || '', phone: j.data.phone || '' }));
          }).catch(() => {});
      } else if (ident.role === 'specialist') {
        fetch('/api/team?action=me', { headers: auth().headers() })
          .then(r => r.ok ? r.json() : null)
          .then(j => {
            if (!j || !j.ok || !j.data) return;
            if (j.data.roleLabel) setRoleLabel(j.data.roleLabel);
            if (!saved) setData(d => ({ ...d, name: j.data.name || d.name }));
          }).catch(() => {});
      }
    }, []);

    return [data, setData, ident, roleLabel];
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
    const [data, setData, ident, roleLabel] = useProfile();
    const [form, setForm] = useState(data);
    const [pwd, setPwd] = useState({ current: '', next: '', repeat: '' });
    const [toast, setToast] = useState(null);

    // data сидируется асинхронно (реальные данные аккаунта) — синхронизируем форму.
    useEffect(() => { setForm(data); }, [data]);

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
            <p className="om-acc-sub">
              {form.name || ident.name}{roleLabel ? ' · ' + roleLabel : ''}. Контактные данные, уведомления и пароль.
            </p>
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
