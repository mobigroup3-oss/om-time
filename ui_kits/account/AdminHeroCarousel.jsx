/* AdminHeroCarousel.jsx */

var CAROUSEL_KEY = 'om-hero-carousel';

var DEFAULT_SLIDES = [
  { id: 'd1', url: '../../uploads/карусель/карусель 2.png',  label: 'Клубный день — Брежнев И.В.' },
  { id: 'd2', url: '../../uploads/карусель/карусель 3.png',  label: 'Мастер-класс Родовые сценарии — Логочева В.В.' },
  { id: 'd3', url: '../../uploads/карусель/карусель 4.png',  label: 'Терапевтическая группа — Дян Н.Г.' },
  { id: 'd4', url: '../../uploads/карусель/карусель 5.png',  label: 'Вес идеальности — Педас Т.В. (интенсив)' },
  { id: 'd5', url: '../../uploads/карусель/карусель 6.png',  label: 'Вес идеальности — Педас Т.В.' },
  { id: 'd6', url: '../../uploads/карусель/карусель 7.png',  label: 'Вес идеальности — Брежнев И.В.' },
  { id: 'd7', url: '../../uploads/карусель/карусель 8.png',  label: 'Вес идеальности — Натх И.Р.' },
];

function carouselRead() {
  try {
    var data = JSON.parse(localStorage.getItem(CAROUSEL_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  }
  catch (e) { return []; }
}

function carouselWrite(list) {
  localStorage.setItem(CAROUSEL_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('om-carousel-updated'));
}

/* ── SlideRow ─────────────────────────────────────────────────── */
function SlideRow(props) {
  var img       = props.img;
  var idx       = props.idx;
  var total     = props.total;
  var isPreview = props.isPreview;

  var editing    = React.useState(false);
  var setEditing = editing[1];
  editing        = editing[0];

  var localLabelState    = React.useState(img.label || '');
  var setLocalLabel      = localLabelState[1];
  var localLabel         = localLabelState[0];

  React.useEffect(function() { setLocalLabel(img.label || ''); }, [img.label]);

  function commitLabel() {
    setEditing(false);
    props.onLabelChange(localLabel);
  }

  var rowStyle = {
    display: 'grid',
    gridTemplateColumns: '36px 80px 1fr auto',
    alignItems: 'center',
    gap: 16,
    padding: '14px 24px',
    borderBottom: idx < total - 1 ? '1px solid var(--om-hairline)' : 'none',
    background: 'transparent',
    transition: 'background 120ms ease',
  };

  return (
    <div
      style={rowStyle}
      onMouseEnter={function(e) { e.currentTarget.style.background = 'var(--om-canvas)'; }}
      onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <button
          onClick={props.onMoveUp}
          disabled={idx === 0}
          style={{ all: 'unset', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.25 : 0.7, lineHeight: 1 }}
        >
          <LucideIcon name="chevron-up" size={12} />
        </button>
        <span style={{ fontFamily: 'var(--om-font-mono)', fontSize: 11, color: 'var(--om-faint)' }}>
          {idx + 1}
        </span>
        <button
          onClick={props.onMoveDown}
          disabled={idx === total - 1}
          style={{ all: 'unset', cursor: idx === total - 1 ? 'default' : 'pointer', opacity: idx === total - 1 ? 0.25 : 0.7, lineHeight: 1 }}
        >
          <LucideIcon name="chevron-down" size={12} />
        </button>
      </div>

      <div
        onClick={props.onPreview}
        style={{
          width: 80, height: 60, borderRadius: 8, overflow: 'hidden',
          background: 'var(--om-canvas)', cursor: 'pointer',
          border: isPreview ? '2px solid var(--om-coral)' : '2px solid transparent',
          transition: 'border-color 160ms ease',
        }}
      >
        <img
          src={img.url}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={function(e) { e.target.style.opacity = '0.2'; }}
        />
      </div>

      <div style={{ minWidth: 0 }}>
        {editing ? (
          <input
            autoFocus
            value={localLabel}
            onChange={function(e) { setLocalLabel(e.target.value); }}
            onBlur={commitLabel}
            onKeyDown={function(e) {
              if (e.key === 'Enter') commitLabel();
              if (e.key === 'Escape') { setLocalLabel(img.label || ''); setEditing(false); }
            }}
            style={{
              display: 'block', width: '100%', boxSizing: 'border-box',
              padding: '5px 10px', fontSize: 13,
              border: '1px solid var(--om-hairline)',
              borderRadius: 'var(--om-radius-sm)',
              background: 'var(--om-canvas)', color: 'var(--om-ink)',
              outline: 'none', fontFamily: 'var(--om-font-sans)',
            }}
          />
        ) : (
          <div onClick={function() { setEditing(true); }} style={{ cursor: 'text' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--om-ink)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {img.label || <span style={{ color: 'var(--om-faint)', fontStyle: 'italic' }}>Без подписи</span>}
            </div>
            <div style={{ fontSize: 11, color: 'var(--om-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {img.url}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button
          onClick={props.onPreview}
          title={isPreview ? 'Скрыть превью' : 'Просмотреть'}
          style={{ all: 'unset', cursor: 'pointer', color: isPreview ? 'var(--om-coral)' : 'var(--om-muted)', padding: 6, borderRadius: 6 }}
        >
          <LucideIcon name={isPreview ? 'eye-off' : 'eye'} size={14} />
        </button>
        <button
          onClick={function() { setEditing(true); }}
          title="Изменить подпись"
          style={{ all: 'unset', cursor: 'pointer', color: 'var(--om-muted)', padding: 6, borderRadius: 6 }}
        >
          <LucideIcon name="pencil" size={14} />
        </button>
        <button
          onClick={props.onRemove}
          title="Удалить слайд"
          style={{ all: 'unset', cursor: 'pointer', color: 'var(--om-muted)', padding: 6, borderRadius: 6 }}
          onMouseEnter={function(e) { e.currentTarget.style.color = 'var(--om-coral)'; }}
          onMouseLeave={function(e) { e.currentTarget.style.color = 'var(--om-muted)'; }}
        >
          <LucideIcon name="trash-2" size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── AdminHeroCarousel ────────────────────────────────────────── */
function AdminHeroCarousel() {
  var imagesState  = React.useState([]);
  var images       = imagesState[0];
  var setImages    = imagesState[1];

  var urlState     = React.useState('');
  var urlInput     = urlState[0];
  var setUrlInput  = urlState[1];

  var labelState   = React.useState('');
  var labelInput   = labelState[0];
  var setLabelInput = labelState[1];

  var errorState   = React.useState('');
  var error        = errorState[0];
  var setError     = errorState[1];

  var savedState   = React.useState(false);
  var saved        = savedState[0];
  var setSaved     = savedState[1];

  var previewState = React.useState(null);
  var preview      = previewState[0];
  var setPreview   = previewState[1];

  React.useEffect(function() {
    var stored = carouselRead();
    if (stored.length === 0) {
      carouselWrite(DEFAULT_SLIDES);
      setImages(DEFAULT_SLIDES);
    } else {
      setImages(stored);
    }
  }, []);

  function persist(newList) {
    carouselWrite(newList);
    setImages(newList);
    setSaved(true);
    setTimeout(function() { setSaved(false); }, 2000);
  }

  function handleAdd(e) {
    e.preventDefault();
    var url = urlInput.trim();
    if (!url) { setError('Введите URL изображения'); return; }
    setError('');
    persist(images.concat([{ id: String(Date.now()), url: url, label: labelInput.trim() }]));
    setUrlInput('');
    setLabelInput('');
  }

  function handleRemove(id) {
    persist(images.filter(function(img) { return img.id !== id; }));
    if (preview === id) setPreview(null);
  }

  function handleMoveUp(idx) {
    if (idx === 0) return;
    var next = images.slice();
    var tmp = next[idx - 1]; next[idx - 1] = next[idx]; next[idx] = tmp;
    persist(next);
  }

  function handleMoveDown(idx) {
    if (idx === images.length - 1) return;
    var next = images.slice();
    var tmp = next[idx]; next[idx] = next[idx + 1]; next[idx + 1] = tmp;
    persist(next);
  }

  function handleLabelChange(id, value) {
    persist(images.map(function(img) { return img.id === id ? { id: img.id, url: img.url, label: value } : img; }));
  }

  function handleClearAll() {
    if (!window.confirm('Удалить все изображения? Карусель скроется, вернётся карточка с 93%.')) return;
    persist([]);
    setPreview(null);
  }

  var previewImg = null;
  for (var pi = 0; pi < images.length; pi++) {
    if (images[pi].id === preview) { previewImg = images[pi]; break; }
  }

  var inputBase = {
    display: 'block', width: '100%', boxSizing: 'border-box',
    padding: '10px 14px',
    border: '1px solid var(--om-hairline)',
    borderRadius: 'var(--om-radius-sm)',
    fontSize: 14, color: 'var(--om-ink)',
    background: 'var(--om-canvas)',
    outline: 'none',
    fontFamily: 'var(--om-font-sans)',
  };

  return (
    <React.Fragment>
      <div className="om-acc-head">
        <div>
          <div className="om-acc-eyebrow">Управление</div>
          <h1 className="om-acc-title">Карусель Hero</h1>
          <p className="om-acc-sub">
            Рекламные изображения в баннере главной страницы. Переключение каждые 4 секунды.
            При пустом списке показывается карточка с 93%.
          </p>
        </div>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--om-sage-pale)', borderRadius: 'var(--om-radius-sm)', fontSize: 13, color: 'var(--om-sage-deep)', fontWeight: 500 }}>
            <LucideIcon name="check" size={14} />
            Сохранено
          </div>
        )}
      </div>

      <div style={{ background: 'var(--om-canvas-white)', border: '1px solid var(--om-hairline)', borderRadius: 'var(--om-radius-lg)', padding: '28px 32px', marginBottom: 28 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 20, color: 'var(--om-ink)' }}>Добавить изображение</div>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--om-muted)' }}>URL изображения *</label>
            <input
              type="text"
              value={urlInput}
              onChange={function(e) { setUrlInput(e.target.value); setError(''); }}
              placeholder="https://... или ../../uploads/карусель/файл.png"
              style={error ? Object.assign({}, inputBase, { border: '1px solid var(--om-coral)' }) : inputBase}
            />
            {error ? <span style={{ fontSize: 12, color: 'var(--om-coral)' }}>{error}</span> : null}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--om-muted)' }}>Подпись (необязательно)</label>
            <input
              type="text"
              value={labelInput}
              onChange={function(e) { setLabelInput(e.target.value); }}
              placeholder="Клубный день · 29 июня"
              style={inputBase}
            />
          </div>
          <div>
            <button type="submit" className="om-btn om-btn--primary" style={{ fontSize: 13, padding: '10px 22px' }}>
              <LucideIcon name="plus" size={14} />
              Добавить
            </button>
          </div>
        </form>
      </div>

      <div style={{ background: 'var(--om-canvas-white)', border: '1px solid var(--om-hairline)', borderRadius: 'var(--om-radius-lg)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: images.length > 0 ? '1px solid var(--om-hairline)' : 'none' }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--om-ink)' }}>
            Слайды
            <span style={{ marginLeft: 10, fontSize: 12, fontFamily: 'var(--om-font-mono)', background: 'var(--om-canvas)', padding: '2px 8px', borderRadius: 20, color: 'var(--om-muted)' }}>
              {images.length}
            </span>
          </div>
          {images.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{ all: 'unset', cursor: 'pointer', fontSize: 12, color: 'var(--om-muted)', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 'var(--om-radius-sm)' }}
              onMouseEnter={function(e) { e.currentTarget.style.color = 'var(--om-coral)'; }}
              onMouseLeave={function(e) { e.currentTarget.style.color = 'var(--om-muted)'; }}
            >
              <LucideIcon name="trash-2" size={13} />
              Очистить всё
            </button>
          )}
        </div>

        {images.length === 0 ? (
          <div style={{ padding: '56px 32px', textAlign: 'center', color: 'var(--om-muted)' }}>
            <LucideIcon name="image" size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: 14, color: 'var(--om-body)', fontWeight: 500, marginBottom: 6 }}>Список пуст</div>
            <div style={{ fontSize: 13 }}>Добавьте изображения выше — появится карусель на сайте.</div>
          </div>
        ) : (
          <div>
            {images.map(function(img, idx) {
              return (
                <SlideRow
                  key={img.id}
                  img={img}
                  idx={idx}
                  total={images.length}
                  isPreview={preview === img.id}
                  onPreview={function() { setPreview(preview === img.id ? null : img.id); }}
                  onMoveUp={function() { handleMoveUp(idx); }}
                  onMoveDown={function() { handleMoveDown(idx); }}
                  onRemove={function() { handleRemove(img.id); }}
                  onLabelChange={function(val) { handleLabelChange(img.id, val); }}
                />
              );
            })}
          </div>
        )}
      </div>

      {previewImg && (
        <div style={{ marginTop: 24, background: 'var(--om-canvas-white)', border: '1px solid var(--om-hairline)', borderRadius: 'var(--om-radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--om-hairline)', fontSize: 13, color: 'var(--om-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Предпросмотр: {previewImg.label || previewImg.url}</span>
            <button onClick={function() { setPreview(null); }} style={{ all: 'unset', cursor: 'pointer' }}>
              <LucideIcon name="x" size={16} style={{ color: 'var(--om-muted)' }} />
            </button>
          </div>
          <div style={{ maxHeight: 520, overflow: 'hidden', display: 'flex', justifyContent: 'center', background: '#000' }}>
            <img
              src={previewImg.url}
              alt={previewImg.label || ''}
              style={{ maxWidth: '100%', maxHeight: 520, objectFit: 'contain', display: 'block' }}
              onError={function(e) { e.target.style.opacity = '0.3'; }}
            />
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, padding: '14px 20px', background: 'var(--om-cream)', borderRadius: 'var(--om-radius-md)', fontSize: 12, color: 'var(--om-muted)', display: 'flex', gap: 10 }}>
        <LucideIcon name="info" size={14} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          Данные хранятся в localStorage и применяются в этом браузере мгновенно.
          Для локальных файлов путь: ../../uploads/карусель/файл.png
        </span>
      </div>
    </React.Fragment>
  );
}

window.AdminHeroCarousel = AdminHeroCarousel;
