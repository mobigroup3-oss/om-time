/* AccountPage.jsx — каркас личного кабинета OM Time.
   Боковая навигация + переключение разделов. Состав навигации зависит от роли
   (администратор / продажник) — роль определяется на входе (см. account.html).
   Расписание управляется из AdminScheduleEditor. */

// ── Авторизация и роль (единая точка для всех компонентов кабинета) ──
// Заполняется экраном входа в account.html. Компоненты берут заголовки отсюда:
//   fetch(url, { headers: window.omAuth.headers({ 'Content-Type': 'application/json' }) })
// Админу уходит x-admin-token, продажнику — x-seller-token; сервер (requireStaff)
// сам разбирает роль. Шлём оба, если оба есть — лишний заголовок не мешает.
window.omAuth = {
  _get(k) { try { return sessionStorage.getItem(k) || ''; } catch (e) { return ''; } },
  role()        { return this._get('omtime.role') || 'admin'; },
  isAdmin()     { return this.role() === 'admin'; },
  adminToken()  { return this._get('omtime.admin.token'); },
  sellerToken() { return this._get('omtime.seller.token'); },
  sellerId()    { return this._get('omtime.seller.id'); },
  sellerName()  { return this._get('omtime.seller.name'); },
  headers(extra) {
    const h = Object.assign({}, extra || {});
    const a = this.adminToken(); if (a) h['x-admin-token'] = a;
    const s = this.sellerToken(); if (s) h['x-seller-token'] = s;
    return h;
  },
  logout() {
    ['omtime.role', 'omtime.admin.token', 'omtime.seller.token', 'omtime.seller.id', 'omtime.seller.name']
      .forEach(k => { try { sessionStorage.removeItem(k); } catch (e) {} });
    location.reload();
  },
};

function LucideIcon({ name, size, style: extraStyle }) {
  const ref = React.useRef(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !window.lucide) return;
    el.innerHTML = '';
    const i = document.createElement('i');
    i.setAttribute('data-lucide', name);
    el.appendChild(i);
    window.lucide.createIcons({ el });
    const svg = el.querySelector('svg');
    if (svg) { svg.style.width = '100%'; svg.style.height = '100%'; }
  }, [name]);
  return <span ref={ref} style={{ display: 'inline-flex', flexShrink: 0, width: size, height: size, ...extraStyle }} />;
}
window.LucideIcon = LucideIcon;

// Навигация администратора — полный доступ.
const NAV_ADMIN = [
  { group: 'Управление', items: [
    { id: 'analytics', label: 'Аналитика',     icon: 'bar-chart-3'   },
    { id: 'schedule',  label: 'Расписание',    icon: 'calendar-days' },
    { id: 'carousel',  label: 'Карусель Hero', icon: 'image'         },
    { id: 'programs',  label: 'Программы',     icon: 'layout-grid'   },
    { id: 'team',      label: 'Команда',       icon: 'users-round'   },
  ]},
  { group: 'Продажи', items: [
    { id: 'requests',  label: 'Заявки',      icon: 'inbox'        },
    { id: 'sellers',   label: 'Продажники',  icon: 'user-round-cog' },
    { id: 'deals',     label: 'Сделки',      icon: 'handshake'    },
  ]},
  { group: 'Личное', items: [
    { id: 'bookings',  label: 'Мои записи',  icon: 'bookmark'    },
    { id: 'profile',   label: 'Профиль',     icon: 'user-round'  },
  ]},
];

// Навигация продажника — только своя воронка и сделки.
const NAV_SELLER = [
  { group: 'Продажи', items: [
    { id: 'requests',  label: 'Лиды',        icon: 'inbox'      },
    { id: 'deals',     label: 'Мои сделки',  icon: 'handshake'  },
  ]},
  { group: 'Личное', items: [
    { id: 'profile',   label: 'Профиль',     icon: 'user-round' },
  ]},
];

const initials = (name) => {
  const p = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!p.length) return 'OM';
  return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
};

function AccountPage() {
  const isAdmin = window.omAuth.isAdmin();
  const nav = isAdmin ? NAV_ADMIN : NAV_SELLER;
  const [section, setSection] = React.useState(isAdmin ? 'analytics' : 'requests');
  const [eventsCount, setEventsCount] = React.useState(null);
  const [freeLeads, setFreeLeads] = React.useState(0);   // свободных лидов (для продажника)
  const [leadToast, setLeadToast] = React.useState(null);
  const prevFreeRef = React.useRef(null);

  // Подхватываем количество событий из редактора расписания через окно
  React.useEffect(() => {
    window.__omSetEventsCount = setEventsCount;
    return () => { delete window.__omSetEventsCount; };
  }, []);

  // Уведомление продажнику о новых свободных лидах: периодически опрашиваем
  // /api/requests?free=1 и, если их стало больше, чем в прошлый раз, показываем
  // всплывашку. На пункте «Лиды» в навигации висит счётчик свободных.
  React.useEffect(() => {
    if (isAdmin) return;
    let alive = true;
    const poll = () => {
      fetch('/api/requests?free=1', { headers: window.omAuth.headers() })
        .then(r => (r.ok ? r.json() : null))
        .then(j => {
          if (!alive || !j || !j.ok || !Array.isArray(j.data)) return;
          const n = j.data.length;
          const prev = prevFreeRef.current;
          // Первый замер не считаем «новым» (это стартовое состояние, не событие).
          if (prev !== null && n > prev) {
            const delta = n - prev;
            setLeadToast(delta === 1 ? 'Новый свободный лид — можно взять в работу' : ('Новых свободных лидов: ' + delta));
            setTimeout(() => { if (alive) setLeadToast(null); }, 6000);
          }
          prevFreeRef.current = n;
          setFreeLeads(n);
        })
        .catch(() => {});
    };
    poll();
    const t = setInterval(poll, 45000);
    return () => { alive = false; clearInterval(t); };
  }, [isAdmin]);

  const userName = isAdmin ? 'Администратор' : (window.omAuth.sellerName() || 'Продажник');
  const userRole = isAdmin ? 'администратор' : 'продажник';

  function renderSection() {
    // Защита от прямого доступа продажника к админ-разделам.
    const adminOnly = ['analytics', 'schedule', 'carousel', 'programs', 'team', 'sellers', 'bookings'];
    if (!isAdmin && adminOnly.includes(section)) return <ProfileView />;

    if (section === 'analytics') return <AdminAnalytics />;
    if (section === 'schedule')  return <AdminScheduleEditor />;
    if (section === 'carousel')  return <AdminHeroCarousel />;
    if (section === 'programs')  return <AdminProgramsEditor />;
    if (section === 'team')      return <AdminTeamEditor />;
    if (section === 'requests')  return <AdminRequestsEditor />;
    if (section === 'sellers')   return <AdminSellersEditor />;
    if (section === 'deals')     return <SalesDeals />;
    if (section === 'bookings')  return <MyBookingsView />;
    if (section === 'profile')   return <ProfileView />;
    return <PlaceholderSection id={section} />;
  }

  return (
    <React.Fragment>
      <aside className="om-acc-side">
        <a className="om-acc-brand" href="../marketing/index.html">
          <img src="../../assets/om-time-mark.png" alt="" />
          <div>
            <div className="om-acc-brand-name">OM Time</div>
            <div className="om-acc-brand-sub">личный кабинет</div>
          </div>
        </a>

        <div className="om-acc-user">
          <div className="om-acc-user-avatar">{initials(userName)}</div>
          <div>
            <div className="om-acc-user-name">{userName}</div>
            <div className="om-acc-user-role">{userRole}</div>
          </div>
        </div>

        {nav.map(group => (
          <div className="om-acc-nav" key={group.group}>
            <div className="om-acc-nav-label">{group.group}</div>
            {group.items.map(it => (
              <button
                key={it.id}
                data-active={section === it.id}
                onClick={() => setSection(it.id)}
              >
                <LucideIcon name={it.icon} size={16} />
                {it.label}
                {it.id === 'schedule' && eventsCount !== null && (
                  <span className="om-acc-nav-count">{eventsCount}</span>
                )}
                {it.id === 'requests' && !isAdmin && freeLeads > 0 && (
                  <span className="om-acc-nav-count" title="Свободных лидов — можно взять в работу"
                    style={{ background: 'var(--om-coral)', color: '#fff' }}>{freeLeads}</span>
                )}
              </button>
            ))}
          </div>
        ))}

        <div className="om-acc-side-foot">
          <a href="../marketing/index.html">
            <LucideIcon name="arrow-left" size={14} />
            На сайт
          </a>
          <a href="#logout" onClick={(e) => { e.preventDefault(); window.omAuth.logout(); }}>
            <LucideIcon name="log-out" size={14} />
            Выйти
          </a>
        </div>
      </aside>

      <main className="om-acc-main">
        {renderSection()}
      </main>

      {leadToast && (
        <div className="om-toast" onClick={() => { setLeadToast(null); setSection('requests'); }}
          style={{ cursor: 'pointer' }}>
          <LucideIcon name="bell" size={16} />
          {leadToast}
        </div>
      )}
    </React.Fragment>
  );
}

function PlaceholderSection({ id }) {
  const titles = {
    programs: { eyebrow: 'Управление', title: 'Программы', sub: 'Каталог программ центра. Описания, цены и сроки.' },
    team:     { eyebrow: 'Управление', title: 'Команда',   sub: 'Тренеры и психологи центра, биографии и расписание ведения.' },
    requests: { eyebrow: 'Управление', title: 'Заявки',    sub: 'Заявки на запись и обратные звонки с сайта.' },
    bookings: { eyebrow: 'Личное',     title: 'Мои записи', sub: 'Программы, на которые вы записаны.' },
    profile:  { eyebrow: 'Личное',     title: 'Профиль',    sub: 'Контактные данные, пароль и уведомления.' },
  };
  const t = titles[id] || { eyebrow: '', title: id, sub: '' };
  return (
    <React.Fragment>
      <div className="om-acc-head">
        <div>
          <div className="om-acc-eyebrow">{t.eyebrow}</div>
          <h1 className="om-acc-title">{t.title}</h1>
          <p className="om-acc-sub">{t.sub}</p>
        </div>
      </div>
      <div style={{
        background: 'var(--om-canvas-white)',
        border: '1px dashed var(--om-hairline)',
        borderRadius: 'var(--om-radius-lg)',
        padding: '72px 32px',
        textAlign: 'center',
        color: 'var(--om-muted)',
      }}>
        <LucideIcon name="construction" size={32} style={{ marginBottom: 12, opacity: 0.6 }} />
        <div style={{ fontSize: 15, color: 'var(--om-ink)', fontWeight: 500, marginBottom: 6 }}>
          Раздел в разработке
        </div>
        <div style={{ fontSize: 13 }}>
          Макет будущего интерфейса. Здесь появится управление этим разделом.
        </div>
      </div>
    </React.Fragment>
  );
}

window.AccountPage = AccountPage;
