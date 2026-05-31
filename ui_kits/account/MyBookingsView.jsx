// MyBookingsView.jsx — личный раздел «Мои записи».
// Программы, на которые записан пользователь. Хранение:
// localStorage('omtime.bookings.v1'). Можно отменить предстоящую запись.
// Стили — общая дизайн-система кабинета. Обёрнут в IIFE.

(function () {
  const { useState, useEffect } = React;
  const LucideIcon = window.LucideIcon;

  const BOOK_KEY = 'omtime.bookings.v1';

  // Статус вычисляется по дате; cancelled хранится явно.
  const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const DEFAULT_BOOKINGS = [
    { id: 'b1', title: 'Вес идеальности', tone: 'gold', format: 'Офлайн, Алматы', date: '2025-11-04', time: '17:00–20:00', trainer: 'Татьяна Педас', cancelled: false },
    { id: 'b2', title: 'Клубный день', tone: 'sage', format: 'Офлайн, Алматы', date: '2025-11-18', time: '19:00–21:00', trainer: 'Илья Брежнев', cancelled: false },
    { id: 'b3', title: 'Первая консультация', tone: 'lilac', format: 'Онлайн', date: '2025-09-12', time: '12:00–12:40', trainer: 'Асель Нуркенова', cancelled: false },
  ];

  function useBookings() {
    const [items, setItems] = useState(() => {
      try {
        const raw = localStorage.getItem(BOOK_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return DEFAULT_BOOKINGS;
    });
    useEffect(() => {
      try { localStorage.setItem(BOOK_KEY, JSON.stringify(items)); } catch (e) {}
    }, [items]);
    return [items, setItems];
  }

  // Статус: cancelled → отменена; дата в прошлом → завершена; иначе предстоит.
  function statusOf(b) {
    if (b.cancelled) return { id: 'cancelled', label: 'Отменена', tone: '' };
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = new Date(b.date);
    if (!isNaN(d) && d < today) return { id: 'past', label: 'Завершена', tone: 'sage' };
    return { id: 'upcoming', label: 'Предстоит', tone: 'lilac' };
  }

  function StatusBadge({ st }) {
    if (!st.tone) {
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', padding: '3px 9px',
          borderRadius: 'var(--om-radius-pill)', fontSize: 11, fontWeight: 500,
          color: 'var(--om-muted)', background: 'var(--om-canvas-strong)',
        }}>{st.label}</span>
      );
    }
    return <span className={'om-tag-mini om-tag-mini--' + st.tone}>{st.label}</span>;
  }

  function MyBookingsView() {
    const [items, setItems] = useBookings();
    const [tab, setTab] = useState('upcoming'); // upcoming | past
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
      setToast(msg);
      setTimeout(() => setToast(null), 2200);
    };

    const cancel = (id) => {
      setItems(items.map(i => (i.id === id ? { ...i, cancelled: true } : i)));
      showToast('Запись отменена');
    };
    const restore = (id) => {
      setItems(items.map(i => (i.id === id ? { ...i, cancelled: false } : i)));
      showToast('Запись восстановлена');
    };

    const upcoming = items.filter(b => statusOf(b).id === 'upcoming');
    const archive = items.filter(b => statusOf(b).id !== 'upcoming');
    const shown = tab === 'upcoming' ? upcoming : archive;

    return (
      <React.Fragment>
        <div className="om-acc-head">
          <div>
            <div className="om-acc-eyebrow">Личное</div>
            <h1 className="om-acc-title">Мои записи</h1>
            <p className="om-acc-sub">Программы и встречи, на которые вы записаны.</p>
          </div>
          <a className="om-btn om-btn--secondary" href="../marketing/booking.html"
             style={{ textDecoration: 'none' }}>
            <LucideIcon name="plus" size={18} style={{ marginRight: 8 }} />
            Записаться
          </a>
        </div>

        <div style={S.tabs}>
          <button style={{ ...S.tab, ...(tab === 'upcoming' ? S.tabActive : {}) }} onClick={() => setTab('upcoming')}>
            Предстоящие
            {upcoming.length > 0 && <span style={S.tabCount}>{upcoming.length}</span>}
          </button>
          <button style={{ ...S.tab, ...(tab === 'past' ? S.tabActive : {}) }} onClick={() => setTab('past')}>
            Архив
            {archive.length > 0 && <span style={S.tabCount}>{archive.length}</span>}
          </button>
        </div>

        {shown.length === 0 ? (
          <div className="om-adm-table-wrap">
            <div className="om-adm-empty">
              <LucideIcon name="bookmark" size={36} style={{ marginBottom: 12, opacity: 0.45 }} />
              <div style={{ fontSize: 15, color: 'var(--om-ink)', fontWeight: 500, marginBottom: 4 }}>
                {tab === 'upcoming' ? 'Предстоящих записей нет' : 'Архив пуст'}
              </div>
              <div style={{ fontSize: 13 }}>
                {tab === 'upcoming' ? 'Запишитесь на программу — она появится здесь.' : 'Завершённые и отменённые записи появятся здесь.'}
              </div>
            </div>
          </div>
        ) : (
          <div style={S.list}>
            {shown.map(b => {
              const st = statusOf(b);
              return (
                <div key={b.id} style={{ ...S.card, opacity: st.id === 'cancelled' ? 0.66 : 1 }}>
                  <div style={S.dateBox}>
                    <span className={'om-tag-mini om-tag-mini--' + b.tone} style={{ alignSelf: 'flex-start' }}>
                      {b.format}
                    </span>
                  </div>

                  <div style={S.body}>
                    <div style={S.topRow}>
                      <h3 style={S.title}>{b.title}</h3>
                      <StatusBadge st={st} />
                    </div>
                    <div style={S.metaRow}>
                      <span style={S.meta}><LucideIcon name="calendar-days" size={15} style={{ color: 'var(--om-muted)' }} />{fmtDate(b.date)}</span>
                      <span style={S.meta}><LucideIcon name="clock" size={15} style={{ color: 'var(--om-muted)' }} />{b.time}</span>
                      <span style={S.meta}><LucideIcon name="user-round" size={15} style={{ color: 'var(--om-muted)' }} />{b.trainer}</span>
                    </div>
                  </div>

                  <div style={S.actions}>
                    {st.id === 'upcoming' && (
                      <button style={S.cancelBtn} onClick={() => cancel(b.id)}>Отменить</button>
                    )}
                    {st.id === 'cancelled' && (
                      <button style={S.restoreBtn} onClick={() => restore(b.id)}>Восстановить</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
    tabs: { display: 'flex', gap: 8, marginBottom: 24 },
    tab: {
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '9px 18px', borderRadius: 'var(--om-radius-pill)',
      border: '1px solid var(--om-hairline)', background: 'var(--om-canvas-white)',
      fontSize: 14, fontWeight: 500, color: 'var(--om-body)',
      fontFamily: 'inherit', cursor: 'pointer', transition: 'all 160ms ease',
    },
    tabActive: { background: 'var(--om-ink)', color: '#fff', borderColor: 'var(--om-ink)' },
    tabCount: { fontFamily: 'var(--om-font-mono)', fontSize: 11, opacity: 0.6 },
    list: { display: 'flex', flexDirection: 'column', gap: 12 },
    card: {
      display: 'flex', alignItems: 'center', gap: 20,
      background: 'var(--om-canvas-white)',
      border: '1px solid var(--om-hairline)',
      borderRadius: 'var(--om-radius-lg)',
      padding: '20px 22px',
      boxShadow: 'var(--om-shadow-card)',
      transition: 'opacity 200ms ease',
    },
    dateBox: { display: 'flex', flexDirection: 'column', flexShrink: 0 },
    body: { flex: 1, minWidth: 0 },
    topRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' },
    title: { margin: 0, fontSize: 'var(--om-text-title-sm)', fontWeight: 500, color: 'var(--om-ink)', lineHeight: 1.3 },
    metaRow: { display: 'flex', gap: 18, flexWrap: 'wrap' },
    meta: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--om-body)' },
    actions: { flexShrink: 0 },
    cancelBtn: {
      padding: '9px 16px', border: '1px solid var(--om-hairline)',
      borderRadius: 'var(--om-radius-pill)', background: 'var(--om-canvas-white)',
      color: 'var(--om-danger)', fontSize: 13, fontWeight: 500,
      fontFamily: 'inherit', cursor: 'pointer',
    },
    restoreBtn: {
      padding: '9px 16px', border: '1px solid var(--om-hairline)',
      borderRadius: 'var(--om-radius-pill)', background: 'var(--om-canvas-white)',
      color: 'var(--om-ink)', fontSize: 13, fontWeight: 500,
      fontFamily: 'inherit', cursor: 'pointer',
    },
  };

  window.MyBookingsView = MyBookingsView;
})();
