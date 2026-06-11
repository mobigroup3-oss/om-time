// AdminProgramsEditor.jsx — управление каталогом программ (admin)
// Хранение: localStorage('omtime.programs.v1'). CRUD: добавление, редактирование, удаление.
// Стили — общая дизайн-система кабинета (классы om-acc-*, om-adm-*, om-modal-*,
// om-form-*, om-btn--*, om-tag-mini--*, токены --om-*), как в Schedule/Carousel.
// Обёрнут в IIFE: в общий scope попадает только window.AdminProgramsEditor.

(function () {
  const { useState, useEffect } = React;
  const LucideIcon = window.LucideIcon;

  const PROGRAMS_KEY = 'omtime.programs.v1'; // локальный кэш / fallback без сервера
  const API = '/api/programs';

  // tone — вариант om-tag-mini для бейджа формата (enum редактора)
  const FORMATS = [
    { id: 'offline', label: 'Очно',           tone: 'coral' },
    { id: 'online',  label: 'Онлайн',         tone: 'lilac' },
    { id: 'hybrid',  label: 'Очно + онлайн',  tone: 'sage'  },
  ];

  // Категория — фильтр на публичной ProgramsPage.
  const CATEGORIES = [
    { id: 'flagship',   label: 'Флагман'       },
    { id: 'online',     label: 'Онлайн'        },
    { id: 'club',       label: 'Клубный день'  },
    { id: 'teen',       label: 'Подростки'     },
    { id: 'individual', label: 'Индивидуально' },
  ];

  // Цвет бейджа на витрине (класс om-tag--*).
  const TAG_CLASSES = [
    { id: '',              label: 'Без цвета' },
    { id: 'om-tag--gold',  label: 'Золотой'   },
    { id: 'om-tag--lilac', label: 'Сирень'    },
    { id: 'om-tag--sage',  label: 'Шалфей'    },
    { id: 'om-tag--coral', label: 'Коралл'    },
  ];

  const adminToken = () => { try { return sessionStorage.getItem('omtime.admin.token') || ''; } catch (e) { return ''; } };
  const cache = (list) => { try { localStorage.setItem(PROGRAMS_KEY, JSON.stringify(list)); } catch (e) {} };

  // Запись на сервер (POST/PUT/DELETE). Ошибки не валят UI — локальный стейт уже
  // обновлён оптимистично, а без сервера (открытый файл) правка живёт в кэше.
  function apiWrite(method, body, query) {
    return fetch(API + (query || ''), {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
      body: body ? JSON.stringify(body) : undefined,
    }).then(r => r.json()).catch(() => null);
  }

  // Канонический shape (= /api/programs). Реальные программы сайта — fallback,
  // когда нет ни сервера, ни кэша (совпадает с db/seed.sql и ProgramsPage).
  const DEFAULT_PROGRAMS = [
    { id: 'flagship', title: 'Вес идеальности с модификацией фигуры', format: 'offline', formatLabel: 'Офлайн, Алматы', weeks: null, price: 160000, pricePrefix: '', priceNote: '−15 000 ₸ при предоплате за 3–4 дня', descr: 'Флагманская авторская программа. Четыре дня интенсивной работы: нейропластика желудка, психомоделирующее дыхание, карта стройности и якорные техники. После — два месяца поддержки в закрытом чате с психологом.', category: 'flagship', tag: '4-дневный интенсив', tagClass: 'om-tag--gold', includes: ['4 дня по 90–120 минут', '2 месяца сопровождения', 'Материалы и практики'], dates: '4–7 ноября, 17:00', trainer: 'Татьяна Педас', capacityNote: 'осталось 3 места', featured: true, showInHero: true, active: true },
    { id: 'flagship-online', title: 'Вес идеальности ONLINE', format: 'online', formatLabel: 'Онлайн', weeks: null, price: 90000, pricePrefix: '', priceNote: '', descr: 'Та же методика в онлайн-формате. Прямые эфиры, запись сессий, закрытый чат с психологом на два месяца. Подходит для тех, кто не в Алматы.', category: 'online', tag: 'Онлайн-интенсив', tagClass: 'om-tag--lilac', includes: ['4 прямых эфира', 'Доступ к записям', '2 месяца поддержки'], dates: 'старт 12 ноября', trainer: 'Татьяна Педас', capacityNote: '', featured: false, active: true },
    { id: 'club', title: 'Клубный день', format: 'offline', formatLabel: 'Офлайн', weeks: null, price: 12000, pricePrefix: '', priceNote: '', descr: 'Двухчасовая встреча для выпускников программ. Углубление техник, групповая работа, ответы на вопросы. Помогает закрепить результат.', category: 'club', tag: 'Активация', tagClass: 'om-tag--sage', includes: ['2 часа групповой работы', 'Для выпускников', 'Практика техник'], dates: '10, 18, 21, 24 ноября, 19:00', trainer: 'Илья Брежнев', capacityNote: '', featured: false, active: true },
    { id: 'teen', title: 'Подростковый клуб', format: 'offline', formatLabel: 'Офлайн', weeks: null, price: 30000, pricePrefix: '', priceNote: '', descr: 'Мягкая работа с пищевым поведением и самовосприятием для подростков. Игровые элементы, безопасная среда, фокус на уверенности.', category: 'teen', tag: 'Подростки 12–17', tagClass: 'om-tag--coral', includes: ['2 часа на встречу', 'Специальная методика', 'Темы: еда, тело, стресс'], dates: '8 и 22 ноября, 11:00–13:00', trainer: 'Наталья Лоскутникова', capacityNote: '', featured: false, active: true },
    { id: 'detox', title: 'ONLINE DETOX', format: 'online', formatLabel: 'Онлайн', weeks: null, price: 30000, pricePrefix: '', priceNote: '', descr: 'Десятидневная программа детокса питания и сознания. Ежедневные практики, куратор в чате, чёткая структура без срывов.', category: 'online', tag: 'Онлайн · 10 дней', tagClass: 'om-tag--lilac', includes: ['10 дней практик', 'Куратор в чате', 'Рацион + психотехники'], dates: 'старт 12 ноября', trainer: 'Марина Енгерова', capacityNote: '', featured: false, active: true },
    { id: 'individual', title: 'Сессия с психологом', format: 'hybrid', formatLabel: 'Офлайн / Онлайн', weeks: null, price: 25000, pricePrefix: 'от', priceNote: '', descr: 'Персональная работа с любым специалистом центра. Разбор конкретного запроса, гибкое расписание.', category: 'individual', tag: 'Индивидуально', tagClass: '', includes: ['60–90 минут', 'Любой формат', 'Гибкое расписание'], dates: 'по договорённости', trainer: 'На выбор', capacityNote: '', featured: false, active: true },
  ];

  const formatPrice = (value) => (Number(value) || 0).toLocaleString('ru-RU') + ' ₸';
  const formatInfo = (id) => FORMATS.find(f => f.id === id) || FORMATS[0];

  function usePrograms() {
    const [items, setItems] = useState(() => {
      try {
        const raw = localStorage.getItem(PROGRAMS_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return DEFAULT_PROGRAMS;
    });

    // Первичная загрузка с сервера (источник правды). Нет сервера → остаёмся на кэше.
    useEffect(() => {
      let alive = true;
      fetch(API + '?all=1', { headers: { 'x-admin-token': adminToken() } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(j => { if (alive && j && j.ok && j.data && j.data.length) { setItems(j.data); cache(j.data); } })
        .catch(() => {});
      return () => { alive = false; };
    }, []);

    return [items, setItems];
  }

  function AdminProgramsEditor() {
    const [items, setItems] = usePrograms();
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all'); // all | offline | online | hybrid
    const [editing, setEditing] = useState(null); // id | 'new' | null
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
      setToast(msg);
      setTimeout(() => setToast(null), 2200);
    };

    const blank = { title: '', format: 'offline', formatLabel: '', weeks: null, price: 0, pricePrefix: '', priceNote: '', descr: '', category: 'flagship', tag: '', tagClass: '', includes: [], dates: '', trainer: '', capacityNote: '', featured: false, showInHero: false, active: true };
    const editingItem = editing === 'new' ? blank : items.find(i => i.id === editing);

    const filtered = items.filter(p => {
      if (filter !== 'all' && p.format !== filter) return false;
      if (query.trim() && !p.title.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });

    const handleSave = (data) => {
      if (editing === 'new') {
        const tmp = { ...data, id: 'p' + Date.now() };
        const next = [...items, tmp];
        setItems(next); cache(next);
        // сервер вернёт каноническую запись — подменяем временный объект
        apiWrite('POST', data).then(j => {
          if (j && j.ok && j.data) setItems(cur => { const n = cur.map(i => (i.id === tmp.id ? j.data : i)); cache(n); return n; });
        });
        showToast('Программа добавлена');
      } else {
        const updated = { ...items.find(i => i.id === editing), ...data, id: editing };
        const next = items.map(i => (i.id === editing ? updated : i));
        setItems(next); cache(next);
        apiWrite('PUT', updated);
        showToast('Изменения сохранены');
      }
      setEditing(null);
    };

    const handleDelete = (id) => {
      const next = items.filter(i => i.id !== id);
      setItems(next); cache(next);
      apiWrite('DELETE', null, '?id=' + encodeURIComponent(id));
      setEditing(null);
      showToast('Программа удалена');
    };

    const toggleActive = (id) => {
      const tgt = items.find(i => i.id === id);
      if (!tgt) return;
      const updated = { ...tgt, active: !tgt.active };
      const next = items.map(i => (i.id === id ? updated : i));
      setItems(next); cache(next);
      apiWrite('PUT', updated);
    };

    return (
      <React.Fragment>
        <div className="om-acc-head">
          <div>
            <div className="om-acc-eyebrow">Управление</div>
            <h1 className="om-acc-title">Программы</h1>
            <p className="om-acc-sub">
              Каталог программ центра: описания, форматы, цены и сроки.
              Изменения сохраняются автоматически.
            </p>
          </div>
          <button className="om-btn om-btn--primary" onClick={() => setEditing('new')}>
            <LucideIcon name="plus" size={18} style={{ marginRight: 8 }} />
            Добавить программу
          </button>
        </div>

        <div className="om-adm-toolbar">
          <div className="om-adm-search">
            <LucideIcon name="search" size={16} style={{ color: 'var(--om-faint)' }} />
            <input
              type="text"
              placeholder="Поиск по названию"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <select className="om-adm-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">Все форматы</option>
            {FORMATS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="om-adm-table-wrap">
            <div className="om-adm-empty">
              <LucideIcon name="layout-grid" size={36} style={{ marginBottom: 12, opacity: 0.45 }} />
              <div style={{ fontSize: 15, color: 'var(--om-ink)', fontWeight: 500, marginBottom: 4 }}>
                {items.length === 0 ? 'Программ пока нет' : 'Ничего не найдено'}
              </div>
              <div style={{ fontSize: 13 }}>
                {items.length === 0 ? 'Добавьте первую программу центра.' : 'Измените поиск или фильтр формата.'}
              </div>
            </div>
          </div>
        ) : (
          <div style={S.grid}>
            {filtered.map(p => {
              const fmt = formatInfo(p.format);
              return (
                <div key={p.id} style={{ ...S.card, opacity: p.active ? 1 : 0.64 }}>
                  <div style={S.cardTop}>
                    <span className={'om-tag-mini om-tag-mini--' + fmt.tone}>{fmt.label}</span>
                    {p.showInHero && (
                      <span className="om-tag-mini om-tag-mini--coral" title="Анонсируется в строке наверху главной страницы">
                        <LucideIcon name="megaphone" size={11} style={{ marginRight: 4 }} />
                        Ближайшее событие
                      </span>
                    )}
                    {!p.active && <span style={S.draftBadge}>Черновик</span>}
                  </div>

                  <h3 style={S.cardTitle}>{p.title}</h3>
                  <p style={S.cardDesc}>{p.descr}</p>

                  <div style={S.metaRow}>
                    {p.weeks ? (
                      <span style={S.metaItem}>
                        <LucideIcon name="clock" size={15} style={{ color: 'var(--om-muted)' }} />
                        {p.weeks} нед.
                      </span>
                    ) : (
                      <span style={S.metaItem}>
                        <LucideIcon name="layout-grid" size={15} style={{ color: 'var(--om-muted)' }} />
                        {(CATEGORIES.find(c => c.id === p.category) || {}).label || '—'}
                      </span>
                    )}
                    <span style={S.metaItem}>
                      <LucideIcon name="tag" size={15} style={{ color: 'var(--om-muted)' }} />
                      {formatPrice(p.price)}
                    </span>
                  </div>

                  <div style={S.cardFoot}>
                    <button style={S.toggleBtn} onClick={() => toggleActive(p.id)}>
                      <LucideIcon name={p.active ? 'eye' : 'eye-off'} size={15} />
                      {p.active ? 'Опубликовано' : 'Скрыто'}
                    </button>
                    <button
                      className="om-adm-icon-btn"
                      style={{ width: 34, height: 34 }}
                      title="Редактировать"
                      onClick={() => setEditing(p.id)}
                    >
                      <LucideIcon name="pencil" size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {editingItem && (
          <ProgramModal
            key={editing}
            item={editingItem}
            isNew={editing === 'new'}
            onClose={() => setEditing(null)}
            onSave={handleSave}
            onDelete={handleDelete}
          />
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

  function ProgramModal({ item, isNew, onClose, onSave, onDelete }) {
    const [form, setForm] = useState(item);
    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
    const valid = form.title.trim().length > 0;

    const submit = () => { if (valid) onSave(form); };

    return (
      <div className="om-modal-backdrop" onClick={onClose}>
        <div className="om-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
          <div className="om-modal-head">
            <h2 className="om-modal-title">{isNew ? 'Новая программа' : 'Редактировать программу'}</h2>
            <button className="om-modal-close" onClick={onClose}>
              <LucideIcon name="x" size={18} />
            </button>
          </div>

          <div className="om-modal-body">
            <div className="om-form-grid">
              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Название</span>
                <input
                  className="om-form-input"
                  type="text"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="Напр. Интенсив «Перезагрузка»"
                />
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Формат</span>
                <select className="om-form-select" value={form.format} onChange={e => set('format', e.target.value)}>
                  {FORMATS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Категория (фильтр на сайте)</span>
                <select className="om-form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Длительность, нед. (необяз.)</span>
                <input
                  className="om-form-input"
                  type="number" min="1"
                  value={form.weeks == null ? '' : form.weeks}
                  onChange={e => set('weeks', e.target.value === '' ? null : +e.target.value)}
                />
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Цена, ₸</span>
                <input
                  className="om-form-input"
                  type="number" min="0" step="1000"
                  value={form.price}
                  onChange={e => set('price', +e.target.value)}
                />
                <span className="om-form-help">{(form.pricePrefix ? form.pricePrefix + ' ' : '') + formatPrice(form.price)}</span>
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Префикс цены</span>
                <input
                  className="om-form-input"
                  type="text"
                  value={form.pricePrefix}
                  onChange={e => set('pricePrefix', e.target.value)}
                  placeholder="напр. «от»"
                />
              </label>

              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Примечание к цене</span>
                <input
                  className="om-form-input"
                  type="text"
                  value={form.priceNote}
                  onChange={e => set('priceNote', e.target.value)}
                  placeholder="−15 000 ₸ при предоплате"
                />
              </label>

              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Формат (текст на витрине)</span>
                <input
                  className="om-form-input"
                  type="text"
                  value={form.formatLabel}
                  onChange={e => set('formatLabel', e.target.value)}
                  placeholder="Офлайн, Алматы"
                />
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Бейдж — текст</span>
                <input
                  className="om-form-input"
                  type="text"
                  value={form.tag}
                  onChange={e => set('tag', e.target.value)}
                  placeholder="4-дневный интенсив"
                />
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Бейдж — цвет</span>
                <select className="om-form-select" value={form.tagClass} onChange={e => set('tagClass', e.target.value)}>
                  {TAG_CLASSES.map(t => <option key={t.id || 'none'} value={t.id}>{t.label}</option>)}
                </select>
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Даты / расписание</span>
                <input
                  className="om-form-input"
                  type="text"
                  value={form.dates}
                  onChange={e => set('dates', e.target.value)}
                  placeholder="4–7 ноября, 17:00"
                />
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Ведущий</span>
                <input
                  className="om-form-input"
                  type="text"
                  value={form.trainer}
                  onChange={e => set('trainer', e.target.value)}
                  placeholder="Татьяна Педас"
                />
              </label>

              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Доступность мест (текст)</span>
                <input
                  className="om-form-input"
                  type="text"
                  value={form.capacityNote}
                  onChange={e => set('capacityNote', e.target.value)}
                  placeholder="осталось 3 места"
                />
              </label>

              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Что входит (по одному в строке)</span>
                <textarea
                  className="om-form-textarea"
                  value={(form.includes || []).join('\n')}
                  onChange={e => set('includes', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                  placeholder={'4 дня по 90–120 минут\n2 месяца сопровождения\nМатериалы и практики'}
                />
              </label>

              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Описание</span>
                <textarea
                  className="om-form-textarea"
                  value={form.descr}
                  onChange={e => set('descr', e.target.value)}
                  placeholder="Краткое описание программы"
                />
              </label>
            </div>

            <label style={S.checkboxRow}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={e => set('active', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--om-ink)' }}
              />
              <span>Публиковать на сайте</span>
            </label>

            <label style={S.checkboxRow}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={e => set('featured', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--om-ink)' }}
              />
              <span>Флагман (крупная карточка-баннер на странице программ)</span>
            </label>

            <label style={S.checkboxRow}>
              <input
                type="checkbox"
                checked={!!form.showInHero}
                onChange={e => set('showInHero', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--om-coral)' }}
              />
              <span>
                Показывать в строке «Ближайшее событие» наверху главной страницы
                <span style={{ display: 'block', fontSize: 12, fontWeight: 400, color: 'var(--om-muted)', marginTop: 2 }}>
                  Можно отметить несколько программ — анонсы будут сменять друг друга по очереди.
                </span>
              </span>
            </label>
          </div>

          <div className="om-modal-foot">
            {!isNew && (
              <button style={S.deleteBtn} onClick={() => onDelete(form.id)}>
                <LucideIcon name="trash-2" size={15} style={{ marginRight: 6 }} />
                Удалить
              </button>
            )}
            <button className="om-btn om-btn--secondary" onClick={onClose}>Отмена</button>
            <button
              className="om-btn om-btn--primary"
              disabled={!valid}
              style={{ opacity: valid ? 1 : 0.5, pointerEvents: valid ? 'auto' : 'none' }}
              onClick={submit}
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== card-grid inline styles (общие компоненты — через CSS-классы) =====
  const S = {
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 16,
    },
    card: {
      display: 'flex', flexDirection: 'column',
      background: 'var(--om-canvas-white)',
      border: '1px solid var(--om-hairline)',
      borderRadius: 'var(--om-radius-lg)',
      padding: 22,
      boxShadow: 'var(--om-shadow-card)',
      transition: 'opacity 200ms ease',
    },
    cardTop: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 },
    draftBadge: {
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px', borderRadius: 'var(--om-radius-pill)',
      fontSize: 11, fontWeight: 500,
      color: 'var(--om-muted)', background: 'var(--om-canvas-strong)',
    },
    cardTitle: {
      margin: '0 0 8px', fontSize: 'var(--om-text-title-sm)', fontWeight: 500,
      color: 'var(--om-ink)', lineHeight: 1.3,
    },
    cardDesc: {
      margin: '0 0 18px', fontSize: 13, color: 'var(--om-muted)',
      lineHeight: 'var(--om-leading-body)', flex: 1,
    },
    metaRow: {
      display: 'flex', gap: 18, paddingTop: 14,
      borderTop: '1px solid var(--om-hairline-soft)',
    },
    metaItem: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 13, fontWeight: 500, color: 'var(--om-ink)',
    },
    cardFoot: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 },
    toggleBtn: {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, flex: 1,
      padding: '9px 12px',
      border: '1px solid var(--om-hairline)', borderRadius: 'var(--om-radius-sm)',
      background: 'var(--om-canvas-white)', color: 'var(--om-muted)',
      fontSize: 13, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
    },
    checkboxRow: {
      display: 'flex', alignItems: 'center', gap: 10, marginTop: 16,
      fontSize: 14, fontWeight: 500, color: 'var(--om-ink)', cursor: 'pointer',
    },
    deleteBtn: {
      marginRight: 'auto',
      display: 'inline-flex', alignItems: 'center',
      padding: '12px 16px', border: 'none', borderRadius: 'var(--om-radius-pill)',
      background: 'transparent', color: 'var(--om-danger)',
      fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
    },
  };

  window.AdminProgramsEditor = AdminProgramsEditor;
})();
