// AdminTeamEditor.jsx — управление командой центра (admin)
// Хранение: localStorage('omtime.team.v1'). CRUD: добавление, редактирование, удаление.
// Стили — общая дизайн-система кабинета (классы om-acc-*, om-adm-*, om-modal-*,
// om-form-*, om-btn--*, om-tag-mini--*, токены --om-*), как в Programs/Schedule/Carousel.
// Обёрнут в IIFE: в общий scope попадает только window.AdminTeamEditor.

(function () {
  const { useState, useEffect, useRef } = React;
  const LucideIcon = window.LucideIcon;

  const TEAM_KEY = 'omtime.team.v1'; // локальный кэш / fallback без сервера
  const API = '/api/team';
  const adminToken = () => { try { return sessionStorage.getItem('omtime.admin.token') || ''; } catch (e) { return ''; } };
  const cache = (list) => { try { localStorage.setItem(TEAM_KEY, JSON.stringify(list)); } catch (e) {} };
  function apiWrite(method, body, query) {
    return fetch(API + (query || ''), {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
      body: body ? JSON.stringify(body) : undefined,
    }).then(r => r.json()).catch(() => null);
  }

  // Категория специалиста — для фильтра, как на публичной странице команды.
  // tone — вариант om-tag-mini / цвет аватара.
  const ROLES = [
    { id: 'psychologist', label: 'Психолог',    tone: 'lilac' },
    { id: 'nutritionist', label: 'Нутрициолог', tone: 'coral' },
    { id: 'trainer',      label: 'Инструктор',  tone: 'sage'  },
  ];

  const TONES = [
    { id: 'gold',  label: 'Золотой'  },
    { id: 'coral', label: 'Коралл'   },
    { id: 'sage',  label: 'Шалфей'   },
    { id: 'lilac', label: 'Сирень'   },
  ];

  // tone → цвета круглого аватара (превью в карточке)
  const TONE_AVATAR = {
    gold:  { bg: 'var(--om-gold-soft)', color: 'var(--om-on-gold)' },
    coral: { bg: 'var(--om-coral)',     color: '#fff' },
    sage:  { bg: 'var(--om-sage)',      color: 'var(--om-sage-deep)' },
    lilac: { bg: 'var(--om-lilac)',     color: 'var(--om-indigo-deep)' },
  };

  // Данные синхронны с публичной TeamPage.jsx (TEAM).
  const DEFAULT_TEAM = [
    { id: 't1', name: 'Татьяна Педас', roleCat: 'psychologist', roleLabel: 'Основатель · Психотерапевт', tag: 'Основатель', tone: 'gold', spec: ['Пищевое поведение', 'Нейропластика', 'Трансперсональная'], credentials: ['КПТ', 'EMDR', 'Психосоматика'], bio: 'Автор методики «Вес идеальности». Разрабатывала протокол 7 лет — от клинических исследований до апробации на 4 000 участниках. Работает с глубинными причинами переедания, а не с симптомами.', years: '18', yearsLabel: 'лет практики', sessions: '4 000', sessionsLabel: 'участников', featured: true, active: true },
    { id: 't2', name: 'Илья Брежнев', roleCat: 'psychologist', roleLabel: 'Клинический психолог', tag: 'Психолог', tone: 'lilac', spec: ['Групповая терапия', 'Стресс и тело', 'Якорные техники'], credentials: ['Гештальт', 'Телесная терапия'], bio: 'Специализируется на групповой психотерапии и стрессовом переедании. Ведёт клубные дни и поддерживающие встречи для выпускников программ.', years: '9', yearsLabel: 'лет практики', sessions: '1 200', sessionsLabel: 'сессий', featured: false, active: true },
    { id: 't3', name: 'Наталья Лоскутникова', roleCat: 'psychologist', roleLabel: 'Детский психолог', tag: 'Детский психолог', tone: 'sage', spec: ['Подростки 12–17', 'Пищевое поведение', 'Самовосприятие'], credentials: ['Детская КПТ', 'Арт-терапия'], bio: 'Разработала адаптированную версию методики для подростков. Создаёт безопасную среду, где дети учатся слышать своё тело без давления.', years: '11', yearsLabel: 'лет практики', sessions: '800', sessionsLabel: 'сессий', featured: false, active: true },
    { id: 't4', name: 'Марина Енгерова', roleCat: 'nutritionist', roleLabel: 'Нутрициолог', tag: 'Нутрициолог', tone: 'coral', spec: ['Детокс-питание', 'Пищевые привычки', 'Онлайн-сопровождение'], credentials: ['Клиническая нутрициология', 'Детокс-протоколы'], bio: 'Разрабатывает рационы для ONLINE DETOX и консультирует по питанию участников основных программ.', years: '7', yearsLabel: 'лет практики', sessions: '600', sessionsLabel: 'консультаций', featured: false, active: true },
    { id: 't5', name: 'Асель Нуркенова', roleCat: 'psychologist', roleLabel: 'Психолог · Куратор', tag: 'Куратор', tone: 'lilac', spec: ['Поддерживающая терапия', 'Онлайн-сопровождение', 'Мотивация'], credentials: ['Позитивная психотерапия', 'Коучинг ICF'], bio: 'Ведёт поддерживающие чаты с участниками онлайн-программ. Помогает в первые два месяца после интенсива — самый уязвимый период.', years: '5', yearsLabel: 'лет практики', sessions: '500', sessionsLabel: 'сессий', featured: false, active: true },
    { id: 't6', name: 'Дарья Ким', roleCat: 'trainer', roleLabel: 'Инструктор · Дыхательные практики', tag: 'Инструктор', tone: 'sage', spec: ['Психомоделирующее дыхание', 'Телесные практики', 'Медитация'], credentials: ['Breathwork', 'Mindfulness MBSR'], bio: 'Ведущий инструктор по психомоделирующему дыханию — авторской технике методики. Проводит практики на интенсивах и онлайн-сессии.', years: '6', yearsLabel: 'лет практики', sessions: '900', sessionsLabel: 'практик', featured: false, active: true },
  ];

  // Инициалы из имени: первые буквы первых двух слов.
  const initialsOf = (name) =>
    (name || '').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();

  const roleInfo = (id) => ROLES.find(r => r.id === id) || ROLES[0];
  const splitList = (str) => str.split(',').map(s => s.trim()).filter(Boolean);

  // Файл фото → квадратный data-URL: центр-кроп + сжатие.
  // Аватар маленький (макс. 80px на сайте), поэтому 256px с запасом под retina.
  // WebP с откатом на JPEG — чтобы строка в localStorage/БД была лёгкой.
  function fileToAvatarDataUrl(file, size) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const s = size || 256;
          const canvas = document.createElement('canvas');
          canvas.width = s; canvas.height = s;
          const ctx = canvas.getContext('2d');
          const min = Math.min(img.width, img.height);
          const sx = (img.width - min) / 2;
          const sy = (img.height - min) / 2;
          ctx.drawImage(img, sx, sy, min, min, 0, 0, s, s);
          let out = '';
          try { out = canvas.toDataURL('image/webp', 0.82); } catch (e) {}
          if (out.indexOf('data:image/webp') !== 0) out = canvas.toDataURL('image/jpeg', 0.85);
          resolve(out);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function useTeam() {
    const [items, setItems] = useState(() => {
      try {
        const raw = localStorage.getItem(TEAM_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return DEFAULT_TEAM;
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

  function Avatar({ initials, tone, size = 48, photo }) {
    const c = TONE_AVATAR[tone] || TONE_AVATAR.lilac;
    if (photo) {
      return (
        <div style={{
          width: size, height: size, borderRadius: '50%',
          overflow: 'hidden', flexShrink: 0, userSelect: 'none',
          background: 'var(--om-canvas)',
        }}>
          <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      );
    }
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: c.bg, color: c.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.round(size * 0.34), fontWeight: 500,
        fontFamily: 'var(--om-font-sans)', letterSpacing: '-0.01em',
        flexShrink: 0, userSelect: 'none',
      }}>
        {initials}
      </div>
    );
  }

  function AdminTeamEditor() {
    const [items, setItems] = useTeam();
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all'); // all | psychologist | nutritionist | trainer
    const [editing, setEditing] = useState(null); // id | 'new' | null
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
      setToast(msg);
      setTimeout(() => setToast(null), 2200);
    };

    const blank = {
      name: '', roleCat: 'psychologist', roleLabel: '', tag: '', tone: 'lilac', photo: '',
      spec: [], credentials: [], bio: '',
      years: '', yearsLabel: 'лет практики', sessions: '', sessionsLabel: 'сессий',
      featured: false, active: true,
    };
    const editingItem = editing === 'new' ? blank : items.find(i => i.id === editing);

    const filtered = items.filter(m => {
      if (filter !== 'all' && m.roleCat !== filter) return false;
      if (query.trim() && !m.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });

    const handleSave = (data) => {
      // Только один «Основатель» (featured) — снимаем флаг с остальных и на сервере.
      const unsetOthers = (excludeId) => {
        items.filter(i => i.featured && i.id !== excludeId).forEach(i => apiWrite('PUT', { ...i, featured: false }));
      };

      if (editing === 'new') {
        const created = { ...data, id: 't' + Date.now() };
        let next = [...items, created];
        if (data.featured) { next = next.map(i => (i.id === created.id ? i : { ...i, featured: false })); unsetOthers(created.id); }
        setItems(next); cache(next);
        apiWrite('POST', data).then(j => {
          if (j && j.ok && j.data) setItems(cur => { const n = cur.map(i => (i.id === created.id ? j.data : i)); cache(n); return n; });
        });
        showToast('Специалист добавлен');
      } else {
        const updated = { ...items.find(i => i.id === editing), ...data, id: editing };
        let next = items.map(i => (i.id === editing ? updated : i));
        if (data.featured) { next = next.map(i => (i.id === editing ? i : { ...i, featured: false })); unsetOthers(editing); }
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
      showToast('Специалист удалён');
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
            <h1 className="om-acc-title">Команда</h1>
            <p className="om-acc-sub">
              Тренеры и психологи центра: биографии, специализации и статистика.
              Изменения сохраняются автоматически.
            </p>
          </div>
          <button className="om-btn om-btn--primary" onClick={() => setEditing('new')}>
            <LucideIcon name="plus" size={18} style={{ marginRight: 8 }} />
            Добавить специалиста
          </button>
        </div>

        <div className="om-adm-toolbar">
          <div className="om-adm-search">
            <LucideIcon name="search" size={16} style={{ color: 'var(--om-faint)' }} />
            <input
              type="text"
              placeholder="Поиск по имени"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <select className="om-adm-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">Все направления</option>
            {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="om-adm-table-wrap">
            <div className="om-adm-empty">
              <LucideIcon name="users-round" size={36} style={{ marginBottom: 12, opacity: 0.45 }} />
              <div style={{ fontSize: 15, color: 'var(--om-ink)', fontWeight: 500, marginBottom: 4 }}>
                {items.length === 0 ? 'Специалистов пока нет' : 'Ничего не найдено'}
              </div>
              <div style={{ fontSize: 13 }}>
                {items.length === 0 ? 'Добавьте первого специалиста центра.' : 'Измените поиск или фильтр направления.'}
              </div>
            </div>
          </div>
        ) : (
          <div style={S.grid}>
            {filtered.map(m => (
              <div key={m.id} style={{ ...S.card, opacity: m.active ? 1 : 0.64 }}>
                <div style={S.cardTop}>
                  <Avatar initials={initialsOf(m.name)} tone={m.tone} size={48} photo={m.photo} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span className={'om-tag-mini om-tag-mini--' + m.tone}>{m.tag || roleInfo(m.roleCat).label}</span>
                      {m.featured && <span style={S.starBadge}><LucideIcon name="star" size={12} /> Основатель</span>}
                    </div>
                  </div>
                </div>

                <h3 style={S.cardTitle}>{m.name}</h3>
                <div style={S.cardRole}>{m.roleLabel}</div>
                <p style={S.cardBio}>{m.bio}</p>

                {m.spec.length > 0 && (
                  <div style={S.chipRow}>
                    {m.spec.slice(0, 3).map(s => <span key={s} style={S.specChip}>{s}</span>)}
                  </div>
                )}

                <div style={S.metaRow}>
                  <span style={S.metaItem}>
                    <strong style={S.metaNum}>{m.years || '—'}</strong>
                    <span style={S.metaLabel}>{m.yearsLabel}</span>
                  </span>
                  <span style={S.metaDivider} />
                  <span style={S.metaItem}>
                    <strong style={S.metaNum}>{m.sessions || '—'}</strong>
                    <span style={S.metaLabel}>{m.sessionsLabel}</span>
                  </span>
                </div>

                <div style={S.cardFoot}>
                  <button style={S.toggleBtn} onClick={() => toggleActive(m.id)}>
                    <LucideIcon name={m.active ? 'eye' : 'eye-off'} size={15} />
                    {m.active ? 'Опубликован' : 'Скрыт'}
                  </button>
                  <button
                    className="om-adm-icon-btn"
                    style={{ width: 34, height: 34 }}
                    title="Редактировать"
                    onClick={() => setEditing(m.id)}
                  >
                    <LucideIcon name="pencil" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editingItem && (
          <TeamModal
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

  function TeamModal({ item, isNew, onClose, onSave, onDelete }) {
    // spec/credentials редактируем как строку через запятую.
    const [form, setForm] = useState({
      ...item,
      specStr: (item.spec || []).join(', '),
      credentialsStr: (item.credentials || []).join(', '),
    });
    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
    const valid = form.name.trim().length > 0;

    const fileRef = useRef(null);
    const [photoErr, setPhotoErr] = useState('');
    const openPicker = () => { if (fileRef.current) fileRef.current.click(); };
    const onPickPhoto = (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = ''; // позволяем выбрать тот же файл повторно
      if (!file) return;
      if (!/^image\//.test(file.type)) { setPhotoErr('Нужен файл изображения'); return; }
      if (file.size > 8 * 1024 * 1024) { setPhotoErr('Файл больше 8 МБ'); return; }
      setPhotoErr('');
      fileToAvatarDataUrl(file, 256)
        .then(url => set('photo', url))
        .catch(() => setPhotoErr('Не удалось обработать изображение'));
    };

    const submit = () => {
      if (!valid) return;
      const { specStr, credentialsStr, ...rest } = form;
      onSave({
        ...rest,
        spec: splitList(specStr),
        credentials: splitList(credentialsStr),
      });
    };

    return (
      <div className="om-modal-backdrop" onClick={onClose}>
        <div className="om-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
          <div className="om-modal-head">
            <h2 className="om-modal-title">{isNew ? 'Новый специалист' : 'Редактировать специалиста'}</h2>
            <button className="om-modal-close" onClick={onClose}>
              <LucideIcon name="x" size={18} />
            </button>
          </div>

          <div className="om-modal-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <button type="button" onClick={openPicker} title="Загрузить фото" style={S.avatarBtn}>
                <Avatar initials={initialsOf(form.name) || '—'} tone={form.tone} size={64} photo={form.photo} />
                <span style={S.avatarCam}><LucideIcon name="camera" size={13} /></span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={onPickPhoto} style={{ display: 'none' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="om-btn om-btn--secondary"
                    style={{ padding: '8px 14px', fontSize: 13 }}
                    onClick={openPicker}
                  >
                    <LucideIcon name="upload" size={14} style={{ marginRight: 6 }} />
                    {form.photo ? 'Заменить фото' : 'Загрузить фото'}
                  </button>
                  {form.photo && (
                    <button type="button" style={S.photoRemoveBtn} onClick={() => { set('photo', ''); setPhotoErr(''); }}>
                      Удалить
                    </button>
                  )}
                </div>
                <span className="om-form-help" style={{ margin: 0, color: photoErr ? 'var(--om-danger)' : undefined }}>
                  {photoErr
                    ? photoErr
                    : form.photo
                      ? 'Фото заменит цветной аватар на сайте.'
                      : 'Без фото на карточке будут инициалы имени на цветном кружке.'}
                </span>
              </div>
            </div>

            <div className="om-form-grid">
              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Имя и фамилия</span>
                <input
                  className="om-form-input"
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Напр. Татьяна Педас"
                />
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Направление</span>
                <select className="om-form-select" value={form.roleCat} onChange={e => set('roleCat', e.target.value)}>
                  {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Цвет аватара</span>
                <select className="om-form-select" value={form.tone} onChange={e => set('tone', e.target.value)}>
                  {TONES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <span className="om-form-help">Если нет фото</span>
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Должность</span>
                <input
                  className="om-form-input"
                  type="text"
                  value={form.roleLabel}
                  onChange={e => set('roleLabel', e.target.value)}
                  placeholder="Напр. Клинический психолог"
                />
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Короткая подпись над именем</span>
                <input
                  className="om-form-input"
                  type="text"
                  value={form.tag}
                  onChange={e => set('tag', e.target.value)}
                  placeholder="Напр. Психолог"
                />
                <span className="om-form-help">Маленькая цветная подпись на карточке</span>
              </label>

              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Биография</span>
                <textarea
                  className="om-form-textarea"
                  value={form.bio}
                  onChange={e => set('bio', e.target.value)}
                  placeholder="Короткое описание опыта и подхода"
                />
              </label>

              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Специализации</span>
                <input
                  className="om-form-input"
                  type="text"
                  value={form.specStr}
                  onChange={e => set('specStr', e.target.value)}
                  placeholder="Через запятую: Пищевое поведение, Нейропластика"
                />
                <span className="om-form-help">Перечислите через запятую</span>
              </label>

              <label className="om-form-field om-form-field--full">
                <span className="om-form-label">Квалификация</span>
                <input
                  className="om-form-input"
                  type="text"
                  value={form.credentialsStr}
                  onChange={e => set('credentialsStr', e.target.value)}
                  placeholder="Через запятую: КПТ, EMDR"
                />
                <span className="om-form-help">Перечислите через запятую</span>
              </label>

              <div className="om-form-field om-form-field--full" style={{ gap: 2 }}>
                <span className="om-form-label">Две цифры под карточкой</span>
                <span className="om-form-help" style={{ marginTop: 0 }}>
                  Показываются внизу карточки специалиста, например «18 лет практики» и «4 000 участников».
                </span>
              </div>

              <label className="om-form-field">
                <span className="om-form-label">Цифра 1</span>
                <input
                  className="om-form-input"
                  type="text"
                  value={form.years}
                  onChange={e => set('years', e.target.value)}
                  placeholder="Напр. 18"
                />
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Подпись к цифре 1</span>
                <input
                  className="om-form-input"
                  type="text"
                  value={form.yearsLabel}
                  onChange={e => set('yearsLabel', e.target.value)}
                  placeholder="Напр. лет практики"
                />
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Цифра 2</span>
                <input
                  className="om-form-input"
                  type="text"
                  value={form.sessions}
                  onChange={e => set('sessions', e.target.value)}
                  placeholder="Напр. 4 000"
                />
              </label>

              <label className="om-form-field">
                <span className="om-form-label">Подпись к цифре 2</span>
                <input
                  className="om-form-input"
                  type="text"
                  value={form.sessionsLabel}
                  onChange={e => set('sessionsLabel', e.target.value)}
                  placeholder="Напр. участников"
                />
              </label>
            </div>

            <label style={S.checkboxRow}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={e => set('featured', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--om-ink)' }}
              />
              <span>Выделить как основателя (крупная карточка на странице)</span>
            </label>

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
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
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
    cardTop: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 },
    starBadge: {
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 'var(--om-radius-pill)',
      fontSize: 11, fontWeight: 500,
      color: 'var(--om-on-gold)', background: 'var(--om-gold-soft)',
    },
    cardTitle: {
      margin: '0 0 4px', fontSize: 'var(--om-text-title-sm)', fontWeight: 500,
      color: 'var(--om-ink)', lineHeight: 1.3,
    },
    cardRole: { margin: '0 0 12px', fontSize: 13, color: 'var(--om-muted)' },
    cardBio: {
      margin: '0 0 16px', fontSize: 13, color: 'var(--om-muted)',
      lineHeight: 'var(--om-leading-body)', flex: 1,
    },
    chipRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
    specChip: {
      fontSize: 11, padding: '4px 10px', borderRadius: 'var(--om-radius-pill)',
      background: 'var(--om-canvas)', border: '1px solid var(--om-hairline)',
      color: 'var(--om-muted)',
    },
    metaRow: {
      display: 'flex', alignItems: 'center', gap: 16, paddingTop: 14,
      borderTop: '1px solid var(--om-hairline-soft)',
    },
    metaItem: { display: 'flex', flexDirection: 'column', gap: 2 },
    metaNum: { fontSize: 17, fontWeight: 500, color: 'var(--om-ink)', lineHeight: 1, fontStyle: 'normal' },
    metaLabel: { fontSize: 11, color: 'var(--om-muted)' },
    metaDivider: { width: 1, height: 28, background: 'var(--om-hairline)', flexShrink: 0 },
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
    avatarBtn: {
      position: 'relative', padding: 0, border: 'none', background: 'none',
      borderRadius: '50%', cursor: 'pointer', flexShrink: 0, lineHeight: 0,
    },
    avatarCam: {
      position: 'absolute', right: -2, bottom: -2,
      width: 24, height: 24, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--om-ink)', color: '#fff',
      border: '2px solid var(--om-canvas-white)',
    },
    photoRemoveBtn: {
      padding: '8px 12px', border: '1px solid var(--om-hairline)',
      borderRadius: 'var(--om-radius-sm)', background: 'var(--om-canvas-white)',
      color: 'var(--om-danger)', fontSize: 13, fontWeight: 500,
      fontFamily: 'inherit', cursor: 'pointer',
    },
    deleteBtn: {
      marginRight: 'auto',
      display: 'inline-flex', alignItems: 'center',
      padding: '12px 16px', border: 'none', borderRadius: 'var(--om-radius-pill)',
      background: 'transparent', color: 'var(--om-danger)',
      fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
    },
  };

  window.AdminTeamEditor = AdminTeamEditor;
})();
