// SalesDeals.jsx — закрытые сделки. Общий экран для двух ролей (см. /api/deals):
//   • продажник видит и заводит ТОЛЬКО свои сделки;
//   • администратор видит ВСЕ сделки, фильтрует по продажнику, видит итоги —
//     это и есть контроль работы отдела продаж.
// Источник правды — /api/deals. Общие классы дизайн-системы кабинета.

(function () {
  const { useState, useEffect } = React;
  const LucideIcon = window.LucideIcon;

  const API = '/api/deals';
  const auth = () => window.omAuth;
  function api(method, body, query) {
    return fetch(API + (query || ''), {
      method,
      headers: auth().headers({ 'Content-Type': 'application/json' }),
      body: body ? JSON.stringify(body) : undefined,
    }).then(r => r.json()).catch(() => null);
  }

  // Программы синхронны с booking.html / api/deals.js.
  const PROGRAMS = [
    { id: 'flagship-offline', title: 'Вес идеальности' },
    { id: 'flagship-online',  title: 'Вес идеальности ONLINE' },
    { id: 'club',             title: 'Клубный день' },
    { id: 'teen',             title: 'Подростковый клуб' },
    { id: 'detox',            title: 'ONLINE DETOX' },
    { id: 'consult',          title: 'Первая консультация' },
  ];
  const programTitle = (id) => (PROGRAMS.find(p => p.id === id) || {}).title || '—';

  const STATUSES = [
    { id: 'won',      label: 'Оплачено', tone: 'sage' },
    { id: 'refunded', label: 'Возврат',  tone: 'coral' },
  ];
  const statusInfo = (id) => STATUSES.find(s => s.id === id) || STATUSES[0];

  const fmtMoney = (n) => (Number(n) || 0).toLocaleString('ru-RU') + ' ₸';
  const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso); if (isNaN(d)) return iso;
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const todayISO = () => new Date().toISOString().slice(0, 10);

  function StatusBadge({ status }) {
    const s = statusInfo(status);
    return <span className={'om-tag-mini om-tag-mini--' + s.tone}>{s.label}</span>;
  }

  function SalesDeals() {
    const isAdmin = auth().isAdmin();
    const [items, setItems] = useState([]);
    const [sellers, setSellers] = useState([]);    // для фильтра/выбора (только админ)
    const [loaded, setLoaded] = useState(false);
    const [sellerFilter, setSellerFilter] = useState('all');
    const [editing, setEditing] = useState(null);  // 'new' | null (правка сделок — отдельно, пока создание)
    const [toast, setToast] = useState(null);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

    const load = () => {
      const q = isAdmin && sellerFilter !== 'all' ? '?seller=' + encodeURIComponent(sellerFilter) : '';
      api('GET', null, q).then(j => {
        if (j && j.ok && Array.isArray(j.data)) setItems(j.data);
        setLoaded(true);
      });
    };

    useEffect(() => { load(); }, [sellerFilter]);

    // Список продажников для фильтра и выбора в форме — только админу.
    useEffect(() => {
      if (!isAdmin) return;
      fetch('/api/sellers', { headers: auth().headers() })
        .then(r => r.ok ? r.json() : null)
        .then(j => { if (j && j.ok && Array.isArray(j.data)) setSellers(j.data); })
        .catch(() => {});
    }, []);

    const total = items.filter(d => d.status === 'won').reduce((s, d) => s + (Number(d.amount) || 0), 0);

    const handleSave = (data) => {
      api('POST', data).then(j => {
        if (j && j.ok && j.data) { setItems(cur => [j.data, ...cur]); showToast('Сделка добавлена'); }
        else showToast((j && j.error) || 'Не удалось сохранить');
      });
      setEditing(null);
    };

    const handleDelete = (id) => {
      setItems(cur => cur.filter(d => d.id !== id));
      api('DELETE', null, '?id=' + encodeURIComponent(id));
      showToast('Сделка удалена');
    };

    return (
      <React.Fragment>
        <div className="om-acc-head">
          <div>
            <div className="om-acc-eyebrow">{isAdmin ? 'Управление' : 'Продажи'}</div>
            <h1 className="om-acc-title">{isAdmin ? 'Сделки' : 'Мои сделки'}</h1>
            <p className="om-acc-sub">
              {isAdmin
                ? 'Закрытые продажи по всем менеджерам. Сумма оплаченных за период.'
                : 'Ваши закрытые продажи.'}
              {items.length > 0 && ` Оплачено: ${fmtMoney(total)}.`}
            </p>
          </div>
          <button className="om-btn om-btn--primary" onClick={() => setEditing('new')}>
            <LucideIcon name="plus" size={18} style={{ marginRight: 8 }} />
            Добавить сделку
          </button>
        </div>

        {isAdmin && (
          <div className="om-adm-toolbar">
            <select className="om-adm-select" value={sellerFilter} onChange={e => setSellerFilter(e.target.value)}>
              <option value="all">Все продажники</option>
              {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}

        {loaded && items.length === 0 ? (
          <div className="om-adm-table-wrap">
            <div className="om-adm-empty">
              <LucideIcon name="handshake" size={36} style={{ marginBottom: 12, opacity: 0.45 }} />
              <div style={{ fontSize: 15, color: 'var(--om-ink)', fontWeight: 500, marginBottom: 4 }}>
                Сделок пока нет
              </div>
              <div style={{ fontSize: 13 }}>Закрытые продажи появятся здесь.</div>
            </div>
          </div>
        ) : (
          <div className="om-adm-table-wrap">
            <table className="om-adm-table">
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th>Программа</th>
                  <th>Сумма</th>
                  {isAdmin && <th>Продажник</th>}
                  <th>Статус</th>
                  <th>Дата</th>
                  <th style={{ width: 48 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--om-ink)' }}>{d.clientName}</div>
                      {d.clientPhone && <div style={{ fontSize: 12, color: 'var(--om-muted)' }}>{d.clientPhone}</div>}
                    </td>
                    <td style={{ color: 'var(--om-muted)' }}>{programTitle(d.programId)}</td>
                    <td style={{ fontWeight: 600, color: 'var(--om-ink)', whiteSpace: 'nowrap' }}>{fmtMoney(d.amount)}</td>
                    {isAdmin && <td style={{ color: 'var(--om-muted)' }}>{d.sellerName || '—'}</td>}
                    <td><StatusBadge status={d.status} /></td>
                    <td style={{ color: 'var(--om-muted)', whiteSpace: 'nowrap' }}>{fmtDate(d.closedAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      {isAdmin && (
                        <button className="om-adm-icon-btn" data-danger="true" title="Удалить"
                          onClick={() => handleDelete(d.id)}>
                          <LucideIcon name="trash-2" size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editing === 'new' && (
          <DealModal
            sellers={isAdmin ? sellers : null}
            programs={PROGRAMS}
            statuses={STATUSES}
            onClose={() => setEditing(null)}
            onSave={handleSave}
          />
        )}

        {toast && <div className="om-toast"><LucideIcon name="check" size={16} />{toast}</div>}
      </React.Fragment>
    );
  }

  function DealModal({ sellers, programs, statuses, onClose, onSave }) {
    const [form, setForm] = useState({
      clientName: '', clientPhone: '', programId: 'flagship-offline',
      amount: '', status: 'won', sellerId: '', closedAt: todayISO(), note: '',
    });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const valid = form.clientName.trim().length > 0;
    const submit = () => {
      if (!valid) return;
      const data = {
        clientName: form.clientName.trim(),
        clientPhone: form.clientPhone.trim(),
        programId: form.programId,
        amount: Number(form.amount) || 0,
        status: form.status,
        closedAt: form.closedAt,
        note: form.note.trim(),
      };
      if (sellers) data.sellerId = form.sellerId || null;  // админ может назначить продажника
      onSave(data);
    };

    return (
      <div className="om-modal-backdrop" onClick={onClose}>
        <div className="om-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
          <div className="om-modal-head">
            <h2 className="om-modal-title">Новая сделка</h2>
            <button className="om-modal-close" onClick={onClose}><LucideIcon name="x" size={18} /></button>
          </div>

          <div className="om-modal-body">
            <div className="om-form-grid">
              <label className="om-form-field">
                <span className="om-form-label">Имя клиента</span>
                <input className="om-form-input" type="text" value={form.clientName}
                  onChange={e => set('clientName', e.target.value)} placeholder="Имя клиента" />
              </label>
              <label className="om-form-field">
                <span className="om-form-label">Телефон</span>
                <input className="om-form-input" type="text" value={form.clientPhone}
                  onChange={e => set('clientPhone', e.target.value)} placeholder="+7 ___ ___ __ __" />
              </label>
              <label className="om-form-field">
                <span className="om-form-label">Программа</span>
                <select className="om-form-select" value={form.programId} onChange={e => set('programId', e.target.value)}>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </label>
              <label className="om-form-field">
                <span className="om-form-label">Сумма, ₸</span>
                <input className="om-form-input" type="number" min="0" value={form.amount}
                  onChange={e => set('amount', e.target.value)} placeholder="0" />
              </label>
              {sellers && (
                <label className="om-form-field">
                  <span className="om-form-label">Продажник</span>
                  <select className="om-form-select" value={form.sellerId} onChange={e => set('sellerId', e.target.value)}>
                    <option value="">— не указан —</option>
                    {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </label>
              )}
              <label className="om-form-field">
                <span className="om-form-label">Статус</span>
                <select className="om-form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </label>
              <label className="om-form-field">
                <span className="om-form-label">Дата закрытия</span>
                <input className="om-form-input" type="date" value={form.closedAt}
                  onChange={e => set('closedAt', e.target.value)} />
              </label>
              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Комментарий</span>
                <textarea className="om-form-textarea" value={form.note}
                  onChange={e => set('note', e.target.value)} placeholder="Скидка, рассрочка, детали" />
              </label>
            </div>
          </div>

          <div className="om-modal-foot">
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

  window.SalesDeals = SalesDeals;
})();
