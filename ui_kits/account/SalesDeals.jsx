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
  const dayLabel = (d) => d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
  // Понедельник недели, в которую попадает дата.
  function weekStart(d) {
    const x = new Date(d);
    const shift = (x.getDay() + 6) % 7;   // 0=Пн … 6=Вс
    x.setDate(x.getDate() - shift); x.setHours(0, 0, 0, 0);
    return x;
  }

  // Выгрузка сделок в CSV (с BOM — корректно открывается в Excel; разделитель ';').
  function exportCsv(items, isAdmin) {
    const head = ['Дата', 'Клиент', 'Телефон', 'Программа', 'Сумма', 'Статус'];
    if (isAdmin) head.push('Продажник');
    const esc = (v) => {
      const s = String(v == null ? '' : v);
      return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const rows = items.map(d => {
      const r = [fmtDate(d.closedAt), d.clientName, d.clientPhone || '', programTitle(d.programId),
                 Number(d.amount) || 0, statusInfo(d.status).label];
      if (isAdmin) r.push(d.sellerName || '');
      return r;
    });
    const csv = [head].concat(rows).map(r => r.map(esc).join(';')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'om-time-сделки-' + todayISO() + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  // Прогресс-бар выполнения плана.
  function GoalBar({ paid, goal }) {
    if (!goal) return <span style={{ color: 'var(--om-faint)', fontSize: 12 }}>план не задан</span>;
    const pct = Math.round((paid / goal) * 100);
    const done = pct >= 100;
    return (
      <div style={{ minWidth: 120 }}>
        <div style={ST.barTrack}>
          <div style={{ ...ST.barFill, width: Math.min(pct, 100) + '%', background: done ? 'var(--om-sage-deep)' : 'var(--om-gold)' }} />
        </div>
        <div style={{ fontSize: 11.5, color: done ? 'var(--om-sage-deep)' : 'var(--om-muted)', marginTop: 3 }}>
          {pct}% · {fmtMoney(goal)}
        </div>
      </div>
    );
  }

  // График выручки по дням/неделям (только оплаченные).
  function RevenueChart({ deals, mode }) {
    const buckets = {};
    deals.forEach(d => {
      const dt = new Date(d.closedAt);
      if (isNaN(dt)) return;
      let key, label;
      if (mode === 'week') { const ws = weekStart(dt); key = ws.toISOString().slice(0, 10); label = dayLabel(ws); }
      else { key = dt.toISOString().slice(0, 10); label = dayLabel(dt); }
      if (!buckets[key]) buckets[key] = { sum: 0, label };
      buckets[key].sum += Number(d.amount) || 0;
    });
    const keys = Object.keys(buckets).sort();
    if (!keys.length) return null;
    const max = Math.max.apply(null, keys.map(k => buckets[k].sum)) || 1;
    const showLabels = keys.length <= 16;
    return (
      <div style={ST.chartWrap}>
        <div style={ST.chartBars}>
          {keys.map(k => {
            const b = buckets[k];
            const h = Math.max(Math.round((b.sum / max) * 140), 3);
            return (
              <div key={k} style={ST.chartCol} title={(mode === 'week' ? 'Неделя с ' : '') + b.label + ': ' + fmtMoney(b.sum)}>
                <div style={{ ...ST.chartBar, height: h + 'px' }} />
                {showLabels && <div style={ST.chartX}>{b.label}</div>}
              </div>
            );
          })}
        </div>
        <div style={ST.chartHintRow}>
          <span>{mode === 'week' ? 'По неделям' : 'По дням'}</span>
          <span>макс. {fmtMoney(max)}</span>
        </div>
      </div>
    );
  }

  // Воронка конверсии: горизонтальные полосы (ширина ∝ числу лидов на этапе).
  function ConversionFunnel({ f }) {
    const stages = [
      { key: 'total',     label: 'Все лиды',          n: f.total,     tone: 'var(--om-indigo, #6b6496)' },
      { key: 'inWork',    label: 'Взяты в работу',    n: f.inWork,    tone: 'var(--om-lilac, #8b7fb8)' },
      { key: 'scheduled', label: 'Назначена встреча', n: f.scheduled, tone: 'var(--om-gold)' },
      { key: 'won',       label: 'Сделка закрыта',    n: f.won,       tone: 'var(--om-sage-deep)' },
    ];
    const base = f.total || 1;
    const conv = f.total ? Math.round((f.won / f.total) * 100) : 0;
    return (
      <div style={ST.chartWrap}>
        {stages.map((s, i) => {
          const pct = Math.round((s.n / base) * 100);
          const fromPrev = i > 0 && stages[i - 1].n ? Math.round((s.n / stages[i - 1].n) * 100) : null;
          return (
            <div key={s.key} style={ST.funRow}>
              <div style={ST.funLabel}>{s.label}</div>
              <div style={ST.funTrack}>
                <div style={{ ...ST.funFill, width: Math.max(pct, 2) + '%', background: s.tone }}>
                  <span style={ST.funNum}>{s.n}</span>
                </div>
              </div>
              <div style={ST.funPct}>
                {pct}%{fromPrev !== null && <span style={{ color: 'var(--om-faint)' }}> · {fromPrev}% от пред.</span>}
              </div>
            </div>
          );
        })}
        <div style={ST.funFooter}>
          <LucideIcon name="target" size={14} />
          Итоговая конверсия лид → сделка: <strong style={{ color: 'var(--om-ink)' }}>{conv}%</strong>
        </div>
      </div>
    );
  }

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
    const [period, setPeriod] = useState('month');   // по умолчанию — текущий месяц (план тоже месячный)
    const [chartMode, setChartMode] = useState('day');
    const [myGoal, setMyGoal] = useState(0);          // план самого продажника
    const [history, setHistory] = useState([]);       // все сделки за всё время (план/факт по месяцам)
    const [leads, setLeads] = useState([]);           // заявки/лиды (воронка конверсии)
    const [editing, setEditing] = useState(null);    // 'new' | deal.id | null
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

    // История за всё время (план/факт по месяцам) + лиды (воронка) — не зависят
    // от выбранного периода, но реагируют на фильтр по продажнику (у админа).
    useEffect(() => {
      const sq = isAdmin && sellerFilter !== 'all' ? '?seller=' + encodeURIComponent(sellerFilter) : '';
      api('GET', null, sq).then(j => {
        if (j && j.ok && Array.isArray(j.data)) setHistory(j.data);
      });
      fetch('/api/requests', { headers: auth().headers() })
        .then(r => (r.ok ? r.json() : null))
        .then(j => { if (j && j.ok && Array.isArray(j.data)) setLeads(j.data); })
        .catch(() => {});
    }, [sellerFilter]);

    useEffect(() => {
      if (isAdmin) {
        fetch('/api/sellers', { headers: auth().headers() })
          .then(r => r.ok ? r.json() : null)
          .then(j => { if (j && j.ok && Array.isArray(j.data)) setSellers(j.data); })
          .catch(() => {});
      } else {
        // продажник — узнаём свой план продаж
        fetch('/api/sellers?action=me', { headers: auth().headers() })
          .then(r => r.ok ? r.json() : null)
          .then(j => { if (j && j.ok && j.data) setMyGoal(j.data.monthlyGoal || 0); })
          .catch(() => {});
      }
    }, []);

    // Карта планов продажников (id → план на месяц).
    const goalMap = {};
    sellers.forEach(s => { goalMap[s.id] = s.monthlyGoal || 0; });
    // План для текущего среза: продажнику — свой; админу при выборе конкретного — его.
    // Для «все продажники» план месяца = сумма планов всех продажников.
    const totalGoal = sellers.reduce((s, x) => s + (x.monthlyGoal || 0), 0);
    const currentGoal = isAdmin
      ? (sellerFilter !== 'all' ? (goalMap[sellerFilter] || 0) : totalGoal)
      : myGoal;
    // Месячный план-ориентир для блока «План/факт по месяцам».
    const monthlyGoalRef = isAdmin
      ? (sellerFilter !== 'all' ? (goalMap[sellerFilter] || 0) : totalGoal)
      : myGoal;

    // ── План/факт по месяцам (из всей истории, последние 12 мес.) ─────
    const monthRows = (() => {
      const map = {};
      history.forEach(d => {
        if (d.status !== 'won') return;
        const dt = new Date(d.closedAt); if (isNaN(dt)) return;
        const key = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0');
        if (!map[key]) map[key] = { key, paid: 0, count: 0, date: new Date(dt.getFullYear(), dt.getMonth(), 1) };
        map[key].paid += Number(d.amount) || 0; map[key].count += 1;
      });
      return Object.values(map).sort((a, b) => b.key.localeCompare(a.key)).slice(0, 12);
    })();

    // ── Воронка конверсии: лиды → сделки (за выбранный период) ────────
    const funnel = (() => {
      const from = periodFrom(period);
      const myId = auth().sellerId && auth().sellerId();
      const scoped = leads.filter(l =>
        (!from || new Date(l.createdAt) >= from) &&
        // продажник считает только взятые им лиды (без свободных), админ — все
        (isAdmin || (l.assignedSellerId && l.assignedSellerId === myId))
      );
      const total = scoped.length;
      const inWork = scoped.filter(l => ['contacted', 'scheduled', 'done'].includes(l.status)).length;
      const scheduled = scoped.filter(l => ['scheduled', 'done'].includes(l.status)).length;
      const won = scoped.filter(l => l.status === 'done').length;
      return { total, inWork, scheduled, won };
    })();

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
        if (!map[key]) map[key] = { id: d.sellerId || '', name: d.sellerName || 'Не указан', won: 0, paid: 0, refunds: 0 };
        if (d.status === 'won') { map[key].won += 1; map[key].paid += Number(d.amount) || 0; }
        else map[key].refunds += Number(d.amount) || 0;
      });
      Object.keys(map).forEach(k => { map[k].goal = goalMap[map[k].id] || 0; bySeller.push(map[k]); });
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
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button className="om-btn om-btn--secondary" onClick={() => exportCsv(items, isAdmin)}
              disabled={!items.length} style={{ opacity: items.length ? 1 : 0.5 }} title="Выгрузить список в CSV">
              <LucideIcon name="download" size={17} style={{ marginRight: 8 }} />
              Экспорт CSV
            </button>
            <button className="om-btn om-btn--primary" onClick={() => setEditing('new')}>
              <LucideIcon name="plus" size={18} style={{ marginRight: 8 }} />
              Добавить сделку
            </button>
          </div>
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
          {currentGoal > 0 && (
            <StatCard
              label="Выполнение плана"
              value={Math.round((paidTotal / currentGoal) * 100) + '%'}
              hint={'из ' + fmtMoney(currentGoal)}
            />
          )}
        </div>

        {/* График выручки */}
        {won.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={ST.blockLabelRow}>
              <div style={ST.blockLabel}><LucideIcon name="trending-up" size={15} /> Выручка</div>
              <div style={ST.toggle}>
                {['day', 'week'].map(m => (
                  <button key={m} onClick={() => setChartMode(m)}
                    style={{ ...ST.toggleBtn, ...(chartMode === m ? ST.toggleBtnActive : null) }}>
                    {m === 'day' ? 'По дням' : 'По неделям'}
                  </button>
                ))}
              </div>
            </div>
            <RevenueChart deals={won} mode={chartMode} />
          </div>
        )}

        {/* Воронка конверсии: лиды → сделки */}
        {funnel.total > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={ST.blockLabel}><LucideIcon name="filter" size={15} /> Воронка: лиды → сделки</div>
            <ConversionFunnel f={funnel} />
          </div>
        )}

        {/* План/факт по месяцам */}
        {monthRows.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={ST.blockLabel}><LucideIcon name="calendar-range" size={15} /> План / факт по месяцам</div>
            <div className="om-adm-table-wrap">
              <table className="om-adm-table">
                <thead>
                  <tr>
                    <th>Месяц</th>
                    <th>Сделок</th>
                    <th>Факт</th>
                    <th>План</th>
                    <th>Выполнение</th>
                  </tr>
                </thead>
                <tbody>
                  {monthRows.map(m => (
                    <tr key={m.key}>
                      <td style={{ fontWeight: 500, color: 'var(--om-ink)', textTransform: 'capitalize' }}>
                        {m.date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                      </td>
                      <td>{m.count}</td>
                      <td style={{ fontWeight: 600, color: 'var(--om-ink)' }}>{fmtMoney(m.paid)}</td>
                      <td style={{ color: 'var(--om-muted)' }}>{monthlyGoalRef ? fmtMoney(monthlyGoalRef) : '—'}</td>
                      <td><GoalBar paid={m.paid} goal={monthlyGoalRef} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {monthlyGoalRef === 0 && (
              <p style={{ fontSize: 12, color: 'var(--om-faint)', margin: '8px 2px 0' }}>
                Чтобы видеть процент выполнения, задайте план продаж{isAdmin ? ' продажникам в разделе «Продажники»' : ''}.
              </p>
            )}
          </div>
        )}

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
                    <th>План / выполнение</th>
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
                      <td><GoalBar paid={s.paid} goal={s.goal} /></td>
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
    blockLabelRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
    toggle: { display: 'inline-flex', gap: 4, background: 'var(--om-canvas-strong, #efe9dd)', padding: 3, borderRadius: 'var(--om-radius-pill)' },
    toggleBtn: {
      border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
      fontSize: 12.5, padding: '5px 12px', borderRadius: 'var(--om-radius-pill)', color: 'var(--om-muted)',
    },
    toggleBtnActive: { background: 'var(--om-canvas-white)', color: 'var(--om-ink)', fontWeight: 500, boxShadow: '0 1px 3px rgba(27,24,64,0.08)' },
    chartWrap: {
      background: 'var(--om-canvas-white)', border: '1px solid var(--om-hairline)',
      borderRadius: 'var(--om-radius-lg, 16px)', padding: '18px 18px 12px',
    },
    chartBars: { display: 'flex', alignItems: 'flex-end', gap: 6, height: 160, overflowX: 'auto', paddingBottom: 4 },
    chartCol: { flex: '1 0 18px', minWidth: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
    chartBar: { width: '100%', maxWidth: 36, background: 'var(--om-gold)', borderRadius: '6px 6px 0 0', transition: 'height .3s ease' },
    chartX: { marginTop: 6, fontSize: 10.5, color: 'var(--om-faint)', whiteSpace: 'nowrap' },
    chartHintRow: { display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11.5, color: 'var(--om-faint)' },
    barTrack: { height: 6, borderRadius: 3, background: 'var(--om-canvas-strong, #efe9dd)', overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 3, transition: 'width .3s ease' },
    funRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
    funLabel: { flex: '0 0 140px', fontSize: 12.5, color: 'var(--om-muted)' },
    funTrack: { flex: 1, height: 26, background: 'var(--om-canvas-strong, #efe9dd)', borderRadius: 6, overflow: 'hidden' },
    funFill: { height: '100%', borderRadius: 6, display: 'flex', alignItems: 'center', minWidth: 22, transition: 'width .4s ease' },
    funNum: { color: '#fff', fontSize: 12, fontWeight: 600, padding: '0 8px', whiteSpace: 'nowrap' },
    funPct: { flex: '0 0 130px', fontSize: 11.5, color: 'var(--om-muted)', textAlign: 'right' },
    funFooter: { display: 'flex', alignItems: 'center', gap: 7, marginTop: 6, paddingTop: 12, borderTop: '1px solid var(--om-hairline)', fontSize: 13, color: 'var(--om-muted)' },
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
