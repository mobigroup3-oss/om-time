/* AccountPage.jsx — каркас личного кабинета OM Time.
   Боковая навигация + переключение разделов. Расписание управляется
   из AdminScheduleEditor. Остальные разделы — заглушки макета. */

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

const NAV_ITEMS = [
  { group: 'Управление', items: [
    { id: 'schedule',  label: 'Расписание',    icon: 'calendar-days', adminOnly: true },
    { id: 'carousel',  label: 'Карусель Hero', icon: 'image',         adminOnly: true },
    { id: 'programs',  label: 'Программы',     icon: 'layout-grid',   adminOnly: true },
    { id: 'team',      label: 'Команда',       icon: 'users-round',   adminOnly: true },
    { id: 'requests',  label: 'Заявки',        icon: 'inbox',         adminOnly: true },
  ]},
  { group: 'Личное', items: [
    { id: 'bookings',  label: 'Мои записи',  icon: 'bookmark' },
    { id: 'profile',   label: 'Профиль',     icon: 'user-round' },
  ]},
];

function AccountPage() {
  const [section, setSection] = React.useState('schedule');
  const [eventsCount, setEventsCount] = React.useState(null);

  // Подхватываем количество событий из редактора расписания через окно
  React.useEffect(() => {
    window.__omSetEventsCount = setEventsCount;
    return () => { delete window.__omSetEventsCount; };
  }, []);


  function renderSection() {
    if (section === 'schedule')  return <AdminScheduleEditor />;
    if (section === 'carousel')  return <AdminHeroCarousel />;
    if (section === 'programs')  return <AdminProgramsEditor />;
    if (section === 'team')      return <AdminTeamEditor />;
    if (section === 'requests')  return <AdminRequestsEditor />;
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
          <div className="om-acc-user-avatar">ТП</div>
          <div>
            <div className="om-acc-user-name">Татьяна Педас</div>
            <div className="om-acc-user-role">администратор</div>
          </div>
        </div>

        {NAV_ITEMS.map(group => (
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
              </button>
            ))}
          </div>
        ))}

        <div className="om-acc-side-foot">
          <a href="../marketing/index.html">
            <LucideIcon name="arrow-left" size={14} />
            На сайт
          </a>
          <a href="#logout" onClick={(e) => e.preventDefault()}>
            <LucideIcon name="log-out" size={14} />
            Выйти
          </a>
        </div>
      </aside>

      <main className="om-acc-main">
        {renderSection()}
      </main>
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
