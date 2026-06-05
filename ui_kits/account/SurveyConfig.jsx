// SurveyConfig.jsx — единый источник вопросов анкеты обратной связи OM Time.
// Копия n8n-формы om-time-anketa: тексты вопросов и варианты ответов — дословно.
// Используется и формой клиента (ClientSurvey.jsx), и сводной аналитикой админа
// (SurveyAnalytics.jsx) — чтобы вопрос правился в одном месте. На сервере
// (api/clients.js SURVEY_FIELDS) валидируются только ключи и типы; точные
// варианты задаёт этот файл. Кладём в window, чтобы видели оба компонента.
//
// Типы вопросов:
//   single — выбор одного варианта (нейтральный список: источник, тренер, да/нет)
//   rating — выбор одного варианта по шкале (есть «вес» score для средних оценок)
//   number — число (килограммы)
//   text   — свободный текст (пожелания)

(function () {
  // Шкала оценки качества (Отлично…Очень плохо). score нужен аналитике для
  // средней оценки; «нейтральные» ответы (не пользовался/не участвовал) score:null
  // — в среднюю не идут, но в распределении показываются.
  const QUALITY = [
    { value: 'Отлично', score: 5 },
    { value: 'Хорошо', score: 4 },
    { value: 'Удовлетворительно', score: 3 },
    { value: 'Плохо', score: 2 },
    { value: 'Очень плохо', score: 1 },
  ];
  // Польза клубных дней / интенсива.
  const USEFUL = [
    { value: 'Очень полезно', score: 5 },
    { value: 'Полезно', score: 4 },
    { value: 'Средне', score: 3 },
    { value: 'Мало пользы', score: 2 },
    { value: 'Бесполезно', score: 1 },
  ];

  const QUESTIONS = [
    {
      id: 'source', type: 'single', label: 'Как вы узнали о программе?',
      options: ['От друзей/знакомых', 'Instagram', 'Telegram', 'WhatsApp', 'Через поиск в интернете', 'Другое'],
    },
    {
      id: 'times', type: 'single', label: 'Сколько раз вы были на программе?',
      options: ['1 раз (первый)', '2 раза', '3 раза', '4 раза', '5 раз', 'Более 5 раз'],
    },
    {
      id: 'kg_lost', type: 'number', label: 'Сколько килограммов вы снизили?',
      min: 0, max: 100, step: 0.1, unit: 'кг',
    },
    {
      id: 'admin', type: 'rating', label: 'Оцените работу администратора',
      options: QUALITY,
    },
    {
      id: 'trainer', type: 'single', label: 'Выберите, кто был ваш тренер',
      options: ['Педас Т.В.', 'Брежнев И.В.', 'Натх И.Р.'],
    },
    {
      id: 'trainer_rating', type: 'rating', label: 'Оцените работу тренера на программе',
      options: QUALITY,
    },
    {
      id: 'psy_chat', type: 'rating', label: 'Оцените поддержку психолога в чате WhatsApp',
      options: QUALITY.concat([{ value: 'Не пользовался(ась)', score: null }]),
    },
    {
      id: 'club', type: 'rating', label: 'Клубные дни — Польза',
      options: USEFUL.concat([{ value: 'Не участвовал(а)', score: null }]),
    },
    {
      id: 'intensive', type: 'rating', label: 'Интенсив — Польза',
      options: USEFUL.concat([{ value: 'Не участвовал(а)', score: null }]),
    },
    {
      id: 'recommend', type: 'single', label: 'Будете ли вы рекомендовать программу близким или знакомым?',
      options: ['Да', 'Нет'],
    },
    {
      id: 'suggestions', type: 'text', label: 'Ваши пожелания и предложения по улучшению качества',
      placeholder: 'Напишите, что можно улучшить — это поможет нам стать лучше',
    },
  ];

  // Нормализуем options к [{value, score}] независимо от того, как заданы.
  function optionList(q) {
    return (q.options || []).map(o => (typeof o === 'string' ? { value: o, score: undefined } : o));
  }

  window.OM_SURVEY = {
    questions: QUESTIONS,
    optionList,
    // Быстрый доступ к вопросу по id (для аналитики/рендера ответа).
    byId(id) { return QUESTIONS.find(q => q.id === id) || null; },
  };
})();
