// AdminClientsEditor.jsx — раздел «Клиенты» (только администратор).
// После оплаты администратор формирует клиенту личный кабинет: заполняет
// персональные данные, прикрепляет специалиста (из «Команды») и выдаёт личный
// код входа. Источник правды — /api/clients. Модалка формы вынесена в
// window.ClientFormModal и переиспользуется из раздела «Сделки» (кнопка
// «Сформировать кабинет клиента» в карточке сделки).
// Общие классы дизайн-системы кабинета (om-acc/adm/modal/form/btn/tag-mini).

(function () {
  const { useState, useEffect } = React;
  const LucideIcon = window.LucideIcon;

  const API = '/api/clients';
  const auth = () => window.omAuth;
  function api(method, body, query) {
    return fetch(API + (query || ''), {
      method,
      headers: auth().headers({ 'Content-Type': 'application/json' }),
      body: body ? JSON.stringify(body) : undefined,
    }).then(r => r.json()).catch(() => null);
  }

  // Программы — те же id, что в SalesDeals/deals.js.
  const PROGRAMS = [
    { id: 'flagship-offline', title: 'Вес идеальности' },
    { id: 'flagship-online',  title: 'Вес идеальности ONLINE' },
    { id: 'club',             title: 'Клубный день' },
    { id: 'teen',             title: 'Подростковый клуб' },
    { id: 'detox',            title: 'ONLINE DETOX' },
    { id: 'consult',          title: 'Первая консультация' },
  ];
  const programTitle = (id) => (PROGRAMS.find(p => p.id === id) || {}).title || '—';

  // Читаемый код входа клиента (без 0/O, 1/I/L). Как у продажников/специалистов.
  const genCode = () => {
    const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)];
    return s;
  };

  const initials = (name) => {
    const p = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return '—';
    return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
  };

  // ── Переиспользуемая модалка: создание И редактирование клиента ──
  // Props: { client, prefill, onClose, onSaved }
  //   client  — существующий клиент (режим редактирования) или null;
  //   prefill — предзаполнение при создании (из сделки): { name, phone, programId, dealId, requestId };
  //   onSaved(savedClient) — вызывается после успешного сохранения.
  function ClientFormModal({ client, prefill, onClose, onSaved }) {
    const isEdit = !!client;
    const pf = prefill || {};
    const [form, setForm] = useState({
      name:     client ? client.name        : (pf.name || ''),
      phone:    client ? client.phone       : (pf.phone || ''),
      email:    client ? client.email       : (pf.email || ''),
      city:     client ? client.city        : (pf.city || ''),
      note:     client ? client.note        : (pf.note || ''),
      programId: client ? (client.programId || '') : (pf.programId || ''),
      specialistId: client ? (client.specialistId || '') : (pf.specialistId || ''),
      active:   client ? client.active !== false : true,
    });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const valid = form.name.trim().length > 0;

    // Код входа: новому клиенту генерируем сразу; при редактировании пусто = не менять.
    const [newCode, setNewCode] = useState(isEdit ? '' : genCode());
    const [savedCode, setSavedCode] = useState(null);   // показываем код после создания
    const [team, setTeam] = useState([]);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');

    useEffect(() => {
      fetch('/api/team?all=1', { headers: auth().headers() })
        .then(r => r.ok ? r.json() : null)
        .then(j => { if (j && j.ok && Array.isArray(j.data)) setTeam(j.data); })
        .catch(() => {});
    }, []);

    const copyCode = (code) => { try { navigator.clipboard.writeText(code); } catch (e) {} };

    const submit = () => {
      if (!valid || busy) return;
      setBusy(true); setErr('');
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        city: form.city.trim(),
        note: form.note.trim(),
        programId: form.programId || null,
        specialistId: form.specialistId || null,
        active: form.active,
      };
      if (isEdit) {
        payload.id = client.id;
        if (newCode.trim()) payload.code = newCode.trim();   // '' = код не трогаем
        api('PUT', payload).then(j => {
          setBusy(false);
          if (j && j.ok && j.data) { onSaved && onSaved(j.data); onClose(); }
          else setErr((j && j.error) || 'Не удалось сохранить');
        });
      } else {
        if (pf.dealId) payload.dealId = pf.dealId;
        if (pf.requestId) payload.requestId = pf.requestId;
        if (newCode.trim()) payload.code = newCode.trim();
        api('POST', payload).then(j => {
          setBusy(false);
          if (j && j.ok && j.data) {
            onSaved && onSaved(j.data);
            // Показываем код один раз — чтобы администратор передал его клиенту.
            if (newCode.trim()) setSavedCode(newCode.trim());
            else onClose();
          } else setErr((j && j.error) || 'Не удалось сохранить');
        });
      }
    };

    // Экран подтверждения с кодом (после создания клиента).
    if (savedCode) {
      return (
        <div className="om-modal-backdrop" onClick={onClose}>
          <div className="om-modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="om-modal-head">
              <h2 className="om-modal-title">Кабинет создан</h2>
              <button className="om-modal-close" onClick={onClose}><LucideIcon name="x" size={18} /></button>
            </div>
            <div className="om-modal-body" style={{ textAlign: 'center' }}>
              <LucideIcon name="check-circle-2" size={40} style={{ color: 'var(--om-sage-deep)', marginBottom: 10 }} />
              <p style={{ fontSize: 14, color: 'var(--om-muted)', margin: '0 0 16px' }}>
                Передайте клиенту <strong style={{ color: 'var(--om-ink)' }}>{form.name.trim()}</strong> этот код входа.
                Позже он не показывается — только сменить на новый.
              </p>
              <div style={ST.codeShow}>
                <span style={ST.codeText}>{savedCode}</span>
                <button type="button" className="om-adm-icon-btn" title="Скопировать" onClick={() => copyCode(savedCode)}>
                  <LucideIcon name="copy" size={18} />
                </button>
              </div>
            </div>
            <div className="om-modal-foot">
              <button className="om-btn om-btn--primary" onClick={onClose}>Готово</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="om-modal-backdrop" onClick={onClose}>
        <div className="om-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
          <div className="om-modal-head">
            <h2 className="om-modal-title">{isEdit ? 'Клиент' : 'Новый клиент'}</h2>
            <button className="om-modal-close" onClick={onClose}><LucideIcon name="x" size={18} /></button>
          </div>

          <div className="om-modal-body">
            <div className="om-form-grid">
              <label className="om-form-field">
                <span className="om-form-label">Имя клиента</span>
                <input className="om-form-input" type="text" value={form.name}
                  onChange={e => set('name', e.target.value)} placeholder="Имя и фамилия" />
              </label>
              <label className="om-form-field">
                <span className="om-form-label">Телефон</span>
                <input className="om-form-input" type="text" value={form.phone}
                  onChange={e => set('phone', e.target.value)} placeholder="+7 ___ ___ __ __" />
              </label>
              <label className="om-form-field">
                <span className="om-form-label">Эл. почта</span>
                <input className="om-form-input" type="email" value={form.email}
                  onChange={e => set('email', e.target.value)} placeholder="name@example.com" />
              </label>
              <label className="om-form-field">
                <span className="om-form-label">Город</span>
                <input className="om-form-input" type="text" value={form.city}
                  onChange={e => set('city', e.target.value)} placeholder="Напр. Алматы" />
              </label>
              <label className="om-form-field">
                <span className="om-form-label">Программа</span>
                <select className="om-form-select" value={form.programId} onChange={e => set('programId', e.target.value)}>
                  <option value="">— не выбрана —</option>
                  {PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </label>
              <label className="om-form-field">
                <span className="om-form-label">Специалист</span>
                <select className="om-form-select" value={form.specialistId} onChange={e => set('specialistId', e.target.value)}>
                  <option value="">— не прикреплён —</option>
                  {team.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}{t.roleLabel ? ' — ' + t.roleLabel : ''}{t.hasCode ? '' : ' (нет входа)'}
                    </option>
                  ))}
                </select>
                <span className="om-form-help">Проверяет таблицы и графики клиента. Вход специалисту задаётся в разделе «Команда».</span>
              </label>
              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Заметка администратора</span>
                <textarea className="om-form-textarea" value={form.note}
                  onChange={e => set('note', e.target.value)} placeholder="Внутренняя заметка (клиент её не видит)" />
              </label>

              {/* Код входа клиента */}
              <div className="om-form-field om-form-field--full">
                <span className="om-form-label">
                  {isEdit ? (client.hasCode ? 'Сменить код входа' : 'Задать код входа') : 'Код входа клиента'}
                </span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                  <input className="om-form-input" type="text" value={newCode}
                    onChange={e => setNewCode(e.target.value.toUpperCase())}
                    placeholder={isEdit && client.hasCode ? 'Оставьте пустым — код не изменится' : 'Например, K7QM4P'}
                    style={{ flex: 1, fontFamily: 'var(--om-font-mono, monospace)', letterSpacing: '0.12em' }} />
                  <button type="button" className="om-btn om-btn--secondary" onClick={() => setNewCode(genCode())}
                    style={{ whiteSpace: 'nowrap' }}>
                    <LucideIcon name="dices" size={16} style={{ marginRight: 6 }} />
                    Сгенерировать
                  </button>
                  {newCode && (
                    <button type="button" className="om-adm-icon-btn" title="Скопировать" onClick={() => copyCode(newCode)}>
                      <LucideIcon name="copy" size={16} />
                    </button>
                  )}
                </div>
                <span className="om-form-help">
                  {isEdit
                    ? (client.hasCode
                        ? 'Код хранится в зашифрованном виде и не показывается. Введите новый, чтобы заменить.'
                        : 'У клиента сейчас нет кода — вход закрыт. Задайте код, чтобы открыть кабинет.')
                    : 'С этим кодом клиент входит в свой кабинет. Код покажется один раз после сохранения.'}
                </span>
              </div>

              <label className="om-form-field om-form-field--full" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
                <span>
                  <span className="om-form-label" style={{ marginBottom: 2 }}>Доступ включён</span>
                  <span className="om-form-help" style={{ margin: 0 }}>Сняв галочку, вы временно закроете вход без удаления кабинета.</span>
                </span>
              </label>
            </div>
            {err && <p style={{ color: 'var(--om-danger)', fontSize: 13, margin: '10px 0 0' }}>{err}</p>}
          </div>

          <div className="om-modal-foot">
            <button className="om-btn om-btn--secondary" onClick={onClose}>Отмена</button>
            <button className="om-btn om-btn--primary" disabled={!valid || busy}
              style={{ opacity: (valid && !busy) ? 1 : 0.5, pointerEvents: (valid && !busy) ? 'auto' : 'none' }}
              onClick={submit}>
              {isEdit ? 'Сохранить' : 'Создать кабинет'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  window.ClientFormModal = ClientFormModal;

  function AdminClientsEditor() {
    const [items, setItems] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [editing, setEditing] = useState(null);   // client.id | 'new' | null
    const [toast, setToast] = useState(null);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

    const load = () => {
      api('GET').then(j => {
        if (j && j.ok && Array.isArray(j.data)) setItems(j.data);
        setLoaded(true);
      });
    };
    useEffect(() => { load(); }, []);

    const editingClient = editing && editing !== 'new' ? items.find(c => c.id === editing) : null;

    const handleSaved = (saved) => {
      setItems(cur => {
        const exists = cur.some(c => c.id === saved.id);
        return exists ? cur.map(c => (c.id === saved.id ? saved : c)) : [saved, ...cur];
      });
      showToast('Сохранено');
    };

    const handleDelete = (id) => {
      setItems(cur => cur.filter(c => c.id !== id));
      api('DELETE', null, '?id=' + encodeURIComponent(id));
      setEditing(null);
      showToast('Клиент удалён');
    };

    const activeCount = items.filter(c => c.active).length;

    return (
      <React.Fragment>
        <div className="om-acc-head">
          <div>
            <div className="om-acc-eyebrow">Продажи</div>
            <h1 className="om-acc-title">Клиенты</h1>
            <p className="om-acc-sub">
              Клиенты с личным кабинетом и прикреплённым специалистом.
              {items.length > 0 && ` Активных: ${activeCount} из ${items.length}.`}
            </p>
          </div>
          <button className="om-btn om-btn--primary" onClick={() => setEditing('new')}>
            <LucideIcon name="plus" size={18} style={{ marginRight: 8 }} />
            Добавить клиента
          </button>
        </div>

        {loaded && items.length === 0 ? (
          <div className="om-adm-table-wrap">
            <div className="om-adm-empty">
              <LucideIcon name="contact-round" size={36} style={{ marginBottom: 12, opacity: 0.45 }} />
              <div style={{ fontSize: 15, color: 'var(--om-ink)', fontWeight: 500, marginBottom: 4 }}>
                Клиентов пока нет
              </div>
              <div style={{ fontSize: 13 }}>
                Сформируйте кабинет вручную или из карточки оплаченной сделки в разделе «Сделки».
              </div>
            </div>
          </div>
        ) : (
          <div className="om-adm-table-wrap">
            <table className="om-adm-table">
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th>Программа</th>
                  <th>Специалист</th>
                  <th>Вход</th>
                  <th>Статус</th>
                  <th style={{ width: 90, textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map(c => (
                  <tr key={c.id} onClick={() => setEditing(c.id)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={ST.avatar}>{initials(c.name)}</span>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--om-ink)' }}>{c.name}</div>
                          {c.phone && <div style={{ fontSize: 12, color: 'var(--om-muted)' }}>{c.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--om-muted)' }}>{programTitle(c.programId)}</td>
                    <td style={{ color: c.specialistName ? 'var(--om-ink)' : 'var(--om-faint)' }}>
                      {c.specialistName || 'не прикреплён'}
                    </td>
                    <td>
                      {c.hasCode
                        ? <span className="om-tag-mini om-tag-mini--sage">код задан</span>
                        : <span style={ST.neutralTag}>нет кода</span>}
                    </td>
                    <td>
                      {c.active
                        ? <span className="om-tag-mini om-tag-mini--lilac">активен</span>
                        : <span style={ST.neutralTag}>отключён</span>}
                    </td>
                    <td onClick={e => e.stopPropagation()} style={{ textAlign: 'right' }}>
                      <button className="om-adm-icon-btn" title="Редактировать" onClick={() => setEditing(c.id)}>
                        <LucideIcon name="pencil" size={16} />
                      </button>
                      <button className="om-adm-icon-btn" data-danger="true" title="Удалить"
                        onClick={() => handleDelete(c.id)}>
                        <LucideIcon name="trash-2" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(editing === 'new' || editingClient) && (
          <ClientFormModal
            key={editing}
            client={editingClient}
            onClose={() => setEditing(null)}
            onSaved={handleSaved}
          />
        )}

        {toast && <div className="om-toast"><LucideIcon name="check" size={16} />{toast}</div>}
      </React.Fragment>
    );
  }

  const ST = {
    avatar: {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
      background: 'var(--om-lilac)', color: 'var(--om-indigo-deep)',
      fontSize: 12, fontWeight: 600,
    },
    neutralTag: {
      display: 'inline-flex', alignItems: 'center', padding: '3px 9px',
      borderRadius: 'var(--om-radius-pill)', fontSize: 11, fontWeight: 500,
      color: 'var(--om-muted)', background: 'var(--om-canvas-strong)',
    },
    codeShow: {
      display: 'inline-flex', alignItems: 'center', gap: 12,
      padding: '14px 18px', borderRadius: 'var(--om-radius-lg, 16px)',
      background: 'var(--om-canvas-strong, #efe9dd)',
    },
    codeText: {
      fontFamily: 'var(--om-font-mono, monospace)', fontSize: 26, fontWeight: 600,
      letterSpacing: '0.22em', color: 'var(--om-ink)',
    },
  };

  window.AdminClientsEditor = AdminClientsEditor;
})();
