// AdminSellersEditor.jsx — раздел «Продажники» (только администратор).
// Админ заводит менеджеров отдела продаж, выдаёт им личный код входа,
// включает/отключает доступ. Код в БД не хранится (только хеш) — поэтому
// сгенерированный код показываем здесь ОДИН раз, чтобы передать продажнику.
// Источник правды — /api/sellers. Общие классы дизайн-системы кабинета.

(function () {
  const { useState, useEffect } = React;
  const LucideIcon = window.LucideIcon;

  const API = '/api/sellers';
  const auth = () => window.omAuth;
  function api(method, body, query) {
    return fetch(API + (query || ''), {
      method,
      headers: auth().headers({ 'Content-Type': 'application/json' }),
      body: body ? JSON.stringify(body) : undefined,
    }).then(r => r.json()).catch(() => null);
  }

  // Читаемый код: без похожих символов (0/O, 1/I/L). 6 знаков — легко продиктовать.
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

  function AdminSellersEditor() {
    const [items, setItems] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [editing, setEditing] = useState(null);   // id | 'new' | null
    const [toast, setToast] = useState(null);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

    useEffect(() => {
      let alive = true;
      api('GET').then(j => {
        if (!alive) return;
        if (j && j.ok && Array.isArray(j.data)) setItems(j.data);
        setLoaded(true);
      });
      return () => { alive = false; };
    }, []);

    const blank = { name: '', phone: '', active: true, code: '' };
    const editingItem = editing === 'new' ? blank : items.find(i => i.id === editing);

    const handleSave = (data) => {
      if (editing === 'new') {
        api('POST', data).then(j => {
          if (j && j.ok && j.data) { setItems(cur => [...cur, j.data]); showToast('Продажник добавлен'); }
          else showToast((j && j.error) || 'Не удалось сохранить');
        });
      } else {
        // code: '' → не трогаем; строка → меняем; null → закрыть вход (см. api/sellers.js)
        const payload = { ...data, id: editing };
        api('PUT', payload).then(j => {
          if (j && j.ok && j.data) {
            setItems(cur => cur.map(i => (i.id === editing ? j.data : i)));
            showToast('Изменения сохранены');
          } else showToast((j && j.error) || 'Не удалось сохранить');
        });
      }
      setEditing(null);
    };

    const handleDelete = (id) => {
      setItems(cur => cur.filter(i => i.id !== id));
      api('DELETE', null, '?id=' + encodeURIComponent(id));
      setEditing(null);
      showToast('Продажник удалён');
    };

    const activeCount = items.filter(s => s.active).length;

    return (
      <React.Fragment>
        <div className="om-acc-head">
          <div>
            <div className="om-acc-eyebrow">Управление</div>
            <h1 className="om-acc-title">Продажники</h1>
            <p className="om-acc-sub">
              Менеджеры отдела продаж и их доступ в кабинет.
              {items.length > 0 && ` Активных: ${activeCount} из ${items.length}.`}
            </p>
          </div>
          <button className="om-btn om-btn--primary" onClick={() => setEditing('new')}>
            <LucideIcon name="plus" size={18} style={{ marginRight: 8 }} />
            Добавить продажника
          </button>
        </div>

        {loaded && items.length === 0 ? (
          <div className="om-adm-table-wrap">
            <div className="om-adm-empty">
              <LucideIcon name="user-plus" size={36} style={{ marginBottom: 12, opacity: 0.45 }} />
              <div style={{ fontSize: 15, color: 'var(--om-ink)', fontWeight: 500, marginBottom: 4 }}>
                Продажников пока нет
              </div>
              <div style={{ fontSize: 13 }}>
                Добавьте менеджера и выдайте ему код — он сможет входить и вести своих клиентов.
              </div>
            </div>
          </div>
        ) : (
          <div className="om-adm-table-wrap">
            <table className="om-adm-table">
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Телефон</th>
                  <th>Вход</th>
                  <th>Статус</th>
                  <th style={{ width: 90, textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map(s => (
                  <tr key={s.id} onClick={() => setEditing(s.id)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={ST.avatar}>{initials(s.name)}</span>
                        <span style={{ fontWeight: 500, color: 'var(--om-ink)' }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--om-muted)' }}>{s.phone || '—'}</td>
                    <td>
                      {s.hasCode
                        ? <span className="om-tag-mini om-tag-mini--sage">код задан</span>
                        : <span style={ST.neutralTag}>нет кода</span>}
                    </td>
                    <td>
                      {s.active
                        ? <span className="om-tag-mini om-tag-mini--lilac">активен</span>
                        : <span style={ST.neutralTag}>отключён</span>}
                    </td>
                    <td onClick={e => e.stopPropagation()} style={{ textAlign: 'right' }}>
                      <button className="om-adm-icon-btn" title="Редактировать" onClick={() => setEditing(s.id)}>
                        <LucideIcon name="pencil" size={16} />
                      </button>
                      <button className="om-adm-icon-btn" data-danger="true" title="Удалить"
                        onClick={() => handleDelete(s.id)}>
                        <LucideIcon name="trash-2" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editingItem && (
          <SellerModal
            key={editing}
            item={editingItem}
            isNew={editing === 'new'}
            onClose={() => setEditing(null)}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        )}

        {toast && (
          <div className="om-toast"><LucideIcon name="check" size={16} />{toast}</div>
        )}
      </React.Fragment>
    );
  }

  function SellerModal({ item, isNew, onClose, onSave, onDelete }) {
    const [form, setForm] = useState({ name: item.name || '', phone: item.phone || '', active: item.active !== false });
    // newCode: что отправим в поле code. '' = не менять (для существующего).
    const [newCode, setNewCode] = useState(isNew ? genCode() : '');
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const valid = form.name.trim().length > 0;

    const submit = () => {
      if (!valid) return;
      const data = { name: form.name.trim(), phone: form.phone.trim(), active: form.active };
      // code: для нового всегда отправляем; для существующего — только если задали новый.
      if (isNew) data.code = newCode;
      else if (newCode) data.code = newCode;
      onSave(data);
    };

    const copyCode = () => {
      try { navigator.clipboard.writeText(newCode); } catch (e) {}
    };

    return (
      <div className="om-modal-backdrop" onClick={onClose}>
        <div className="om-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
          <div className="om-modal-head">
            <h2 className="om-modal-title">{isNew ? 'Новый продажник' : 'Продажник'}</h2>
            <button className="om-modal-close" onClick={onClose}><LucideIcon name="x" size={18} /></button>
          </div>

          <div className="om-modal-body">
            <div className="om-form-grid">
              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Имя</span>
                <input className="om-form-input" type="text" value={form.name}
                  onChange={e => set('name', e.target.value)} placeholder="Имя и фамилия" />
              </label>

              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Телефон</span>
                <input className="om-form-input" type="text" value={form.phone}
                  onChange={e => set('phone', e.target.value)} placeholder="+7 ___ ___ __ __" />
              </label>

              {/* Код входа */}
              <div className="om-form-field om-form-field--full">
                <span className="om-form-label">
                  {isNew ? 'Код для входа' : (item.hasCode ? 'Сменить код входа' : 'Задать код входа')}
                </span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                  <input
                    className="om-form-input"
                    type="text"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value.toUpperCase())}
                    placeholder={item.hasCode ? 'Оставьте пустым — код не изменится' : 'Например, K7QM4P'}
                    style={{ flex: 1, fontFamily: 'var(--om-font-mono, monospace)', letterSpacing: '0.12em' }}
                  />
                  <button type="button" className="om-btn om-btn--secondary" onClick={() => setNewCode(genCode())}
                    style={{ whiteSpace: 'nowrap' }}>
                    <LucideIcon name="dices" size={16} style={{ marginRight: 6 }} />
                    Сгенерировать
                  </button>
                  {newCode && (
                    <button type="button" className="om-adm-icon-btn" title="Скопировать" onClick={copyCode}>
                      <LucideIcon name="copy" size={16} />
                    </button>
                  )}
                </div>
                <p style={ST.hint}>
                  {isNew
                    ? 'Передайте этот код продажнику — им он входит в кабинет. Позже код виден не будет, только сменить на новый.'
                    : (item.hasCode
                        ? 'Код хранится в зашифрованном виде и не показывается. Введите новый, чтобы заменить.'
                        : 'У продажника сейчас нет кода — вход закрыт. Задайте код, чтобы открыть доступ.')}
                </p>
              </div>

              {/* Доступ */}
              <label className="om-form-field om-form-field--full" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
                <span>
                  <span className="om-form-label" style={{ marginBottom: 2 }}>Доступ включён</span>
                  <span style={{ ...ST.hint, margin: 0 }}>Сняв галочку, вы временно закроете вход без удаления аккаунта.</span>
                </span>
              </label>
            </div>
          </div>

          <div className="om-modal-foot">
            {!isNew && (
              <button style={ST.deleteBtn} onClick={() => onDelete(item.id)}>
                <LucideIcon name="trash-2" size={15} style={{ marginRight: 6 }} />
                Удалить
              </button>
            )}
            <button className="om-btn om-btn--secondary" onClick={onClose}>Отмена</button>
            <button className="om-btn om-btn--primary" disabled={!valid}
              style={{ opacity: valid ? 1 : 0.5, pointerEvents: valid ? 'auto' : 'none' }}
              onClick={submit}>
              Сохранить
            </button>
          </div>
        </div>
      </div>
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
    hint: { margin: '6px 0 0', fontSize: 12, color: 'var(--om-muted)', lineHeight: 1.5 },
    deleteBtn: {
      marginRight: 'auto', display: 'inline-flex', alignItems: 'center',
      padding: '12px 16px', border: 'none', borderRadius: 'var(--om-radius-pill)',
      background: 'transparent', color: 'var(--om-danger)',
      fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
    },
  };

  window.AdminSellersEditor = AdminSellersEditor;
})();
