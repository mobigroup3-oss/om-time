// AdminProgramsEditor.jsx — управление каталогом программ (admin)
// Хранение: localStorage('omtime.programs.v1'). CRUD: добавление, редактирование, удаление.
// Стили — общая дизайн-система кабинета (классы om-acc-*, om-adm-*, om-modal-*,
// om-form-*, om-btn--*, om-tag-mini--*, токены --om-*), как в Schedule/Carousel.
// Обёрнут в IIFE: в общий scope попадает только window.AdminProgramsEditor.

(function () {
  const { useState, useEffect } = React;
  const LucideIcon = window.LucideIcon;

  const PROGRAMS_KEY = 'omtime.programs.v1';

  // tone — вариант om-tag-mini для бейджа формата
  const FORMATS = [
    { id: 'offline', label: 'Очно',           tone: 'coral' },
    { id: 'online',  label: 'Онлайн',         tone: 'lilac' },
    { id: 'hybrid',  label: 'Очно + онлайн',  tone: 'sage'  },
  ];

  const DEFAULT_PROGRAMS = [
    { id: 'p1', title: 'Интенсив «Перезагрузка»', format: 'offline', weeks: 2, price: 180000, desc: 'Двухнедельное погружение: групповая терапия, работа с пищевым поведением и индивидуальное сопровождение.', active: true },
    { id: 'p2', title: 'Базовая программа снижения веса', format: 'hybrid', weeks: 8, price: 320000, desc: 'Комплексный курс с психологом и нутрициологом. Очные сессии и онлайн-поддержка между встречами.', active: true },
    { id: 'p3', title: 'Онлайн-сопровождение', format: 'online', weeks: 12, price: 240000, desc: 'Дистанционный формат для тех, кто не в Алматы: еженедельные видеосессии и чат с куратором.', active: true },
    { id: 'p4', title: 'Индивидуальная терапия', format: 'offline', weeks: 4, price: 160000, desc: 'Персональная работа один на один с психотерапевтом по запросу клиента.', active: false },
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

    useEffect(() => {
      try { localStorage.setItem(PROGRAMS_KEY, JSON.stringify(items)); } catch (e) {}
    }, [items]);

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

    const blank = { title: '', format: 'offline', weeks: 4, price: 0, desc: '', active: true };
    const editingItem = editing === 'new' ? blank : items.find(i => i.id === editing);

    const filtered = items.filter(p => {
      if (filter !== 'all' && p.format !== filter) return false;
      if (query.trim() && !p.title.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });

    const handleSave = (data) => {
      if (editing === 'new') {
        setItems([...items, { ...data, id: 'p' + Date.now() }]);
        showToast('Программа добавлена');
      } else {
        setItems(items.map(i => (i.id === editing ? { ...i, ...data } : i)));
        showToast('Изменения сохранены');
      }
      setEditing(null);
    };

    const handleDelete = (id) => {
      setItems(items.filter(i => i.id !== id));
      setEditing(null);
      showToast('Программа удалена');
    };

    const toggleActive = (id) => {
      setItems(items.map(i => (i.id === id ? { ...i, active: !i.active } : i)));
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
                    {!p.active && <span style={S.draftBadge}>Черновик</span>}
                  </div>

                  <h3 style={S.cardTitle}>{p.title}</h3>
                  <p style={S.cardDesc}>{p.desc}</p>

                  <div style={S.metaRow}>
                    <span style={S.metaItem}>
                      <LucideIcon name="clock" size={15} style={{ color: 'var(--om-muted)' }} />
                      {p.weeks} нед.
                    </span>
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
                <span className="om-form-label">Длительность, нед.</span>
                <input
                  className="om-form-input"
                  type="number" min="1"
                  value={form.weeks}
                  onChange={e => set('weeks', +e.target.value)}
                />
              </label>

              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Цена, ₸</span>
                <input
                  className="om-form-input"
                  type="number" min="0" step="1000"
                  value={form.price}
                  onChange={e => set('price', +e.target.value)}
                />
                <span className="om-form-help">{formatPrice(form.price)}</span>
              </label>

              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Описание</span>
                <textarea
                  className="om-form-textarea"
                  value={form.desc}
                  onChange={e => set('desc', e.target.value)}
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
