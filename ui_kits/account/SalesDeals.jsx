// SalesDeals.jsx — закрытые сделки + аналитика продаж. Экран для двух ролей (см. /api/deals):
//   • продажник видит/заводит/правит ТОЛЬКО свои сделки;
//   • администратор видит ВСЕ сделки, фильтрует по продажнику и периоду, видит
//     сводку (оплачено, средний чек, возвраты) и разбивку по продажникам —
//     это контроль работы отдела продаж (кто, сколько, когда, на какую сумму).
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

  // Периоды для фильтра аналитики. Возвращаем дату начала (конец = сейчас).
  const PERIODS = [
    { id: 'all',     label: 'Всё время' },
    { id: 'month',   label: 'Текущий месяц' },
    { id: 'quarter', label: 'Текущий квартал' },
    { id: 'year',    label: 'Текущий год' },
  ];
  function periodFrom(p) {
    const now = new Date(); const y = now.getFullYear(); const m = now.getMonth();
    if (p === 'month')   return new Date(y, m, 1);
    if (p === 'quarter') return new Date(y, Math.floor(m / 3) * 3, 1);
    if (p === 'year')    return new Date(y, 0, 1);
    return null;
  }

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

  function StatCard({ label, value, hint }) {
    return (
      <div style={ST.stat}>
        <div style={ST.statValue}>{value}</div>
        <div style={ST.statLabel}>{label}</div>
        {hint && <div style={ST.statHint}>{hint}</div>}
      </div>
    );
  }

  function SalesDeals() {
    const isAdmin = auth().isAdmin();
    const [items, setItems] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [sellerFilter, setSellerFilter] = useState('all');
    const [period, setPeriod] = useState('all');
    const [editing, setEditing] = useState(null);   // 'new' | deal.id | null
    const [toast, setToast] = useState(null);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

    const load = () => {
      const params = [];
      if (isAdmin && sellerFilter !== 'all') params.push('seller=' + encodeURIComponent(sellerFilter));
      const from = periodFrom(period);
      if (from) params.push('from=' + encodeURIComponent(from.toISOString()));
      const q = params.length ? '?' + params.join('&') : '';
      api('GET', null, q).then(j => {
        if (j && j.ok && Array.isArray(j.data)) setItems(j.data);
        setLoaded(true);
      });
    };
    useEffect(() => { load(); }, [sellerFilter, period]);

    useEffect(() => {
      if (!isAdmin) return;
      fetch('/api/sellers', { headers: auth().headers() })
        .then(r => r.ok ? r.json() : null)
        .then(j => { if (j && j.ok && Array.isArray(j.data)) setSellers(j.data); })
        .catch(() => {});
    }, []);

    // ── Сводка за период ──────────────────────────────────────
    const won = items.filter(d => d.status === 'won');
    const refunded = items.filter(d => d.status === 'refunded');
    const paidTotal = won.reduce((s, d) => s + (Number(d.amount) || 0), 0);
    const refundTotal = refunded.reduce((s, d) => s + (Number(d.amount) || 0), 0);
    const avg = won.length ? Math.round(paidTotal / won.length) : 0;

    // Разбивка по продажникам (только админ, когда выбраны все).
    const bySeller = [];
    if (isAdmin && sellerFilter === 'all') {
      const map = {};
      items.forEach(d => {
        const key = d.sellerId || '—';
        if (!map[key]) map[key] = { name: d.sellerName || 'Не указан', won: 0, paid: 0, refunds: 0 };
        if (d.status === 'won') { map[key].won += 1; map[key].paid += Number(d.amount) || 0; }
        else map[key].refunds += Number(d.amount) || 0;
      });
      Object.keys(map).forEach(k => bySeller.push(map[k]));
      bySeller.sort((a, b) => b.paid - a.paid);
    }

    const handleSave = (data, id) => {
      if (id) {
        api('PUT', { ...data, id }).then(j => {
          if (j && j.ok && j.data) { setItems(cur => cur.map(d => (d.id === id ? j.data : d))); showToast('Сделка обновлена'); }
          else showToast((j && j.error) || 'Не удалось сохранить');
        });
      } else {
        api('POST', data).then(j => {
          if (j && j.ok && j.data) { setItems(cur => [j.data, ...cur]); showToast('Сделка добавлена'); }
          else showToast((j && j.error) || 'Не удалось сохранить');
        });
      }
      setEditing(null);
    };

    const handleDelete = (id) => {
      setItems(cur => cur.filter(d => d.id !== id));
      api('DELETE', null, '?id=' + encodeURIComponent(id));
      setEditing(null);
      showToast('Сделка удалена');
    };

    const editingDeal = editing && editing !== 'new' ? items.find(d => d.id === editing) : null;

    return (
      <React.Fragment>
        <div className="om-acc-head">
          <div>
            <div className="om-acc-eyebrow">{isAdmin ? 'Управление' : 'Продажи'}</div>
            <h1 className="om-acc-title">{isAdmin ? 'Сделки' : 'Мои сделки'}</h1>
            <p className="om-acc-sub">
              {isAdmin
                ? 'Закрытые продажи по всем менеджерам: кто, когда и на какую сумму.'
                : 'Ваши закрытые продажи.'}
            </p>
          </div>
          <button className="om-btn om-btn--primary" onClick={() => setEditing('new')}>
            <LucideIcon name="plus" size={18} style={{ marginRight: 8 }} />
            Добавить сделку
          </button>
        </div>

        {/* Фильтры: период (всем) + продажник (админу) */}
        <div className="om-adm-toolbar">
          <select className="om-adm-select" value={period} onChange={e => setPeriod(e.target.value)}>
            {PERIODS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          {isAdmin && (
            <select className="om-adm-select" value={sellerFilter} onChange={e => setSellerFilter(e.target.value)}>
              <option value="all">Все продажники</option>
              {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
        </div>

        {/* Сводка за период */}
        <div style={ST.statRow}>
          <StatCard label="Оплачено" value={fmtMoney(paidTotal)} hint={`${won.length} сделок`} />
          <StatCard label="Средний чек" value={fmtMoney(avg)} />
          <StatCard label="Сделок" value={won.length} />
          {(isAdmin || refundTotal > 0) && (
            <StatCard label="Возвраты" value={fmtMoney(refundTotal)} hint={refunded.length ? `${refunded.length} шт.` : '—'} />
          )}
        </div>

        {/* Разбивка по продажникам (админ) */}
        {isAdmin && sellerFilter === 'all' && bySeller.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={ST.blockLabel}><LucideIcon name="users" size={15} /> По продажникам</div>
            <div className="om-adm-table-wrap">
              <table className="om-adm-table">
                <thead>
                  <tr>
                    <th>Продажник</th>
                    <th>Сделок</th>
                    <th>Оплачено</th>
                    <th>Возвраты</th>
                  </tr>
                </thead>
                <tbody>
                  {bySeller.map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, color: 'var(--om-ink)' }}>{s.name}</td>
                      <td>{s.won}</td>
                      <td style={{ fontWeight: 600, color: 'var(--om-ink)' }}>{fmtMoney(s.paid)}</td>
                      <td style={{ color: s.refunds ? 'var(--om-coral)' : 'var(--om-muted)' }}>
                        {s.refunds ? fmtMoney(s.refunds) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Список сделок */}
        {isAdmin && <div style={ST.blockLabel}><LucideIcon name="list" size={15} /> Все сделки</div>}
        {loaded && items.length === 0 ? (
          <div className="om-adm-table-wrap">
            <div className="om-adm-empty">
              <LucideIcon name="handshake" size={36} style={{ marginBottom: 12, opacity: 0.45 }} />
              <div style={{ fontSize: 15, color: 'var(--om-ink)', fontWeight: 500, marginBottom: 4 }}>
                Сделок за период нет
              </div>
              <div style={{ fontSize: 13 }}>Измените период или закройте сделку из карточки лида.</div>
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
                  <tr key={d.id} onClick={() => setEditing(d.id)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--om-ink)' }}>{d.clientName}</div>
                      {d.clientPhone && <div style={{ fontSize: 12, color: 'var(--om-muted)' }}>{d.clientPhone}</div>}
                    </td>
                    <td style={{ color: 'var(--om-muted)' }}>{programTitle(d.programId)}</td>
                    <td style={{ fontWeight: 600, color: 'var(--om-ink)', whiteSpace: 'nowrap' }}>{fmtMoney(d.amount)}</td>
                    {isAdmin && <td style={{ color: 'var(--om-muted)' }}>{d.sellerName || '—'}</td>}
                    <td><StatusBadge status={d.status} /></td>
                    <td style={{ color: 'var(--om-muted)', whiteSpace: 'nowrap' }}>{fmtDate(d.closedAt)}</td>
                    <td onClick={e => e.stopPropagation()} style={{ textAlign: 'right' }}>
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

        {(editing === 'new' || editingDeal) && (
          <DealModal
            key={editing}
            deal={editingDeal}
            isAdmin={isAdmin}
            sellers={isAdmin ? sellers : null}
            onClose={() => setEditing(null)}
            onSave={handleSave}
            onDelete={isAdmin ? handleDelete : null}
          />
        )}

        {toast && <div className="om-toast"><LucideIcon name="check" size={16} />{toast}</div>}
      </React.Fragment>
    );
  }

  // Модалка создания И редактирования сделки.
  function DealModal({ deal, isAdmin, sellers, onClose, onSave, onDelete }) {
    const isEdit = !!deal;
    const [form, setForm] = useState({
      clientName: deal ? deal.clientName : '',
      clientPhone: deal ? deal.clientPhone : '',
      programId: deal ? (deal.programId || 'flagship-offline') : 'flagship-offline',
      amount: deal ? String(deal.amount || '') : '',
      status: deal ? deal.status : 'won',
      sellerId: deal ? (deal.sellerId || '') : '',
      closedAt: deal ? (deal.closedAt ? deal.closedAt.slice(0, 10) : todayISO()) : todayISO(),
      note: deal ? (deal.note || '') : '',
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
        note: form.note.trim(),
      };
      if (!isEdit) data.closedAt = form.closedAt;   // дату закрытия задаём при создании
      if (sellers) data.sellerId = form.sellerId || null;
      onSave(data, isEdit ? deal.id : null);
    };

    return (
      <div className="om-modal-backdrop" onClick={onClose}>
        <div className="om-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
          <div className="om-modal-head">
            <h2 className="om-modal-title">{isEdit ? 'Сделка' : 'Новая сделка'}</h2>
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
                  {PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
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
                  {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </label>
              <label className="om-form-field">
                <span className="om-form-label">Дата закрытия</span>
                <input className="om-form-input" type="date" value={form.closedAt}
                  disabled={isEdit}
                  onChange={e => set('closedAt', e.target.value)}
                  style={isEdit ? { opacity: 0.6 } : null} />
              </label>
              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Комментарий</span>
                <textarea className="om-form-textarea" value={form.note}
                  onChange={e => set('note', e.target.value)} placeholder="Скидка, рассрочка, причина возврата" />
              </label>
            </div>
            {isEdit && form.status === 'refunded' && (
              <p style={ST.refundHint}>
                <LucideIcon name="alert-triangle" size={14} /> Сделка помечена как возврат — её сумма не войдёт в «Оплачено».
              </p>
            )}
          </div>

          <div className="om-modal-foot">
            {isEdit && onDelete && (
              <button style={ST.deleteBtn} onClick={() => onDelete(deal.id)}>
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
    statRow: { display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 22 },
    stat: {
      flex: '1 1 160px', minWidth: 140,
      background: 'var(--om-canvas-white)', border: '1px solid var(--om-hairline)',
      borderRadius: 'var(--om-radius-lg, 16px)', padding: '16px 18px',
    },
    statValue: { fontSize: 22, fontWeight: 600, color: 'var(--om-ink)', lineHeight: 1.1 },
    statLabel: { marginTop: 6, fontSize: 12.5, color: 'var(--om-muted)' },
    statHint: { marginTop: 2, fontSize: 11.5, color: 'var(--om-faint)' },
    blockLabel: {
      display: 'flex', alignItems: 'center', gap: 7, margin: '6px 0 10px',
      fontSize: 13, fontWeight: 600, color: 'var(--om-ink)',
    },
    refundHint: {
      display: 'flex', alignItems: 'center', gap: 6, margin: '12px 0 0',
      fontSize: 12.5, color: 'var(--om-coral)',
    },
    deleteBtn: {
      marginRight: 'auto', display: 'inline-flex', alignItems: 'center',
      padding: '12px 16px', border: 'none', borderRadius: 'var(--om-radius-pill)',
      background: 'transparent', color: 'var(--om-danger)',
      fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
    },
  };

  window.SalesDeals = SalesDeals;
})();
