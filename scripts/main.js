// Если человек отключил анимации в настройках системы — ничего не анимируем
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


// =========================================
// 1. ПЛАВНОЕ ПОЯВЛЕНИЕ РАЗДЕЛОВ (все страницы)
// Раздел появляется каждый раз, когда возвращается на экран:
// листаешь вниз — выезжает снизу, листаешь вверх — выезжает сверху
// =========================================

// Все разделы страницы внутри <main>
const sections = document.querySelectorAll('main > section');

// Наблюдатель: следит, виден ли раздел на экране
const sectionObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    const section = entry.target;

    if (entry.isIntersecting) {
      section.classList.add('show'); // раздел на экране — показываем
    } else {
      section.classList.remove('show'); // раздел совсем ушёл с экрана — снова прячем

      // Ушёл за верхний край — вернётся сверху, ушёл за нижний — вернётся снизу
      if (entry.boundingClientRect.top < 0) {
        section.classList.add('from-top');
      } else {
        section.classList.remove('from-top');
      }
    }
  });
});

if (!reduceMotion) {
  sections.forEach(function (section) {
    section.classList.add('reveal'); // прячем раздел до появления на экране
    sectionObserver.observe(section);
  });
}


// =========================================
// 2. СЧЁТЧИКИ В БЛОКЕ «В ЦИФРАХ» (главная)
// Числа с классом count набегают от 0, когда их видно на экране
// =========================================

const counters = document.querySelectorAll('.count');

// Плавно увеличивает число в элементе от 0 до нужного значения
function countUp(element) {
  const target = Number(element.dataset.target); // настоящее число, например 39
  const duration = 1500;                         // длительность в миллисекундах
  const start = performance.now();               // время начала

  function step(now) {
    // Какая часть анимации прошла: от 0 до 1
    const progress = Math.min((now - start) / duration, 1);
    // К концу число растёт медленнее — так выглядит плавнее
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased);

    if (progress < 1) {
      requestAnimationFrame(step); // следующий кадр
    }
  }

  requestAnimationFrame(step);
}

// Наблюдатель: срабатывает, когда число видно хотя бы наполовину
const counterObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      countUp(entry.target);
      counterObserver.unobserve(entry.target); // считаем только один раз
    }
  });
}, { threshold: 0.5 });

if (!reduceMotion) {
  counters.forEach(function (counter) {
    counter.dataset.target = counter.textContent; // запоминаем число из HTML
    counter.textContent = '0';                    // до анимации показываем 0
    counterObserver.observe(counter);
  });
}


// =========================================
// 3. ФИЛЬТР НАПРАВЛЕНИЙ (страница «Направления»)
// Кнопка с data-filter показывает только карточки с таким же data-group
// =========================================

const filterButtons = document.querySelectorAll('[data-filter]');
const directionCards = document.querySelectorAll('[data-group]');

filterButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    const filter = button.dataset.filter; // например "games"

    // Подсвечиваем только нажатую кнопку
    filterButtons.forEach(function (btn) {
      btn.classList.remove('active');
    });
    button.classList.add('active');

    // Подходящие карточки показываем, остальные прячем (d-none — класс Bootstrap)
    directionCards.forEach(function (card) {
      if (filter === 'all' || card.dataset.group === filter) {
        card.classList.remove('d-none');
      } else {
        card.classList.add('d-none');
      }
    });
  });
});


// =========================================
// 4. СМЕНА ФРАЗ (главная, «Направления», «Отзывы»)
// Элемент с data-phrases="ключ" по очереди показывает фразы из объекта phrases.
// Первая фраза в каждом списке — та, что написана в HTML.
// Круг: остальные фразы в случайном порядке, в конце снова первая — и новый круг.
// =========================================

const phrases = {
  // Главная: текст под заголовком баннера
  home: [
    'Выбери, что хочешь создавать, — и узнай, какие языки и инструменты учить и в каком порядке.',
    '8 направлений и 39 языков и инструментов — простыми словами, бесплатно и без регистрации.',
    'Игры, сайты, данные или безопасность — найди в IT то, что интересно именно тебе.',
    'Не знаешь, с чего начать? Тьмуша поможет найти твой первый язык программирования.',
    'Посмотри, что создают в каждом направлении, — и сделай свой первый шаг в IT.',
  ],
  // «Направления»: облачко Ады
  directions: [
    'Я пока не определилась… А ты?',
    'Может, игры? Или всё-таки сайты?',
    'Нажми на кнопку фильтра — так выбирать проще!',
    'Посмотри на иконки — это языки, которые там учат.',
    'Мне нравятся все картинки… Как тут выбрать?',
  ],
  // «Отзывы»: облачко Ады
  reviews: [
    'Мне тоже было трудно выбрать… Почитай, что пишут другие!',
    'Аня начала с HTML — и уже сверстала страницу!',
    'Максим выбрал Unity и двигает своего персонажа!',
    'Тимур запустил приложение на своём телефоне!',
    'Скоро здесь появится и твоя история!',
  ],
};

const phraseDelay = 4000; // сколько миллисекунд видна одна фраза
const fadeTime = 500;     // время исчезновения — как transition у .phrase в style.css

// Возвращает копию списка, перемешанную в случайном порядке
function shuffle(list) {
  const result = list.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // случайный номер от 0 до i
    const temp = result[i];                        // меняем местами i и j
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

// Запускает смену фраз в одном элементе
function startPhrases(element) {
  const list = phrases[element.dataset.phrases]; // фразы для этого места
  if (!list) {
    return; // такого ключа в объекте нет — ничего не делаем
  }

  let queue = []; // фразы, которые осталось показать в этом круге

  setInterval(function () {
    // Круг закончился — собираем новый: остальные фразы вперемешку, в конце первая
    if (queue.length === 0) {
      queue = shuffle(list.slice(1));
      queue.push(list[0]);
    }
    const next = queue.shift(); // берём следующую фразу из очереди

    element.classList.add('hide');      // плавно прячем старую фразу
    setTimeout(function () {
      element.textContent = next;       // меняем текст, пока его не видно
      element.classList.remove('hide'); // плавно показываем новую
    }, fadeTime);
  }, phraseDelay);
}

// Ищем на странице элементы с data-phrases. Если их нет — скрипт ничего не делает
if (!reduceMotion) {
  document.querySelectorAll('[data-phrases]').forEach(startPhrases);
}



// =========================================
// 5. ДОБАВЛЕНИЕ ОТЗЫВА (страница «Отзывы»)
// Отзыв из формы появляется первым в списке и сохраняется в браузере (localStorage),
// поэтому после обновления страницы он не пропадает
// =========================================

const reviewForm = document.querySelector('#review-form');

// Код ниже работает только на странице, где есть форма
if (reviewForm) {
  const reviewList = document.querySelector('#review-list');         // сетка с отзывами
  const reviewTemplate = document.querySelector('#review-template'); // шаблон карточки
  const reviewMessage = document.querySelector('#review-message');   // надпись под кнопкой
  const reviewBubble = document.querySelector('#review-bubble');     // облачко Тьмуши
  const storageKey = 'devpath-reviews';                              // имя ячейки в localStorage

  // Читает сохранённые отзывы. Если хранилище недоступно — возвращает пустой список
  function loadReviews() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch (error) {
      return [];
    }
  }

  // Сохраняет список отзывов
  function saveReviews(reviews) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(reviews));
    } catch (error) {
      // Хранилище недоступно (например, приватный режим) — отзыв просто не сохранится
    }
  }

  // Делает карточку отзыва из шаблона и ставит её первой в списке
  function showReview(review) {
    const card = reviewTemplate.content.firstElementChild.cloneNode(true);

    // textContent, а не innerHTML: всё, что написали в форме, вставляется как обычный текст
    card.querySelector('[data-field="text"]').textContent = review.text;
    card.querySelector('[data-field="letter"]').textContent = review.name[0].toUpperCase();
    card.querySelector('[data-field="name"]').textContent = review.name;
    card.querySelector('[data-field="direction"]').textContent = 'Направление: ' + review.direction;

    // Кнопка «Удалить» убирает отзыв со страницы и из хранилища
    card.querySelector('[data-field="delete"]').addEventListener('click', function () {
      const reviews = loadReviews().filter(function (item) {
        return item.id !== review.id;
      });
      saveReviews(reviews);
      card.remove();
    });

    reviewList.prepend(card);
    return card;
  }

  // При открытии страницы показываем сохранённые отзывы.
  // Идём от старых к новым: каждый следующий встаёт первым, и самый новый оказывается вверху
  loadReviews().reverse().forEach(showReview);

  reviewForm.addEventListener('submit', function (event) {
    event.preventDefault(); // не перезагружаем страницу

    const name = document.querySelector('#review-name').value.trim();
    const direction = document.querySelector('#review-direction').value;
    const text = document.querySelector('#review-text').value.trim();

    // Поля из одних пробелов браузер считает заполненными — проверяем сами
    if (name === '' || text === '') {
      reviewMessage.textContent = 'Заполни имя и текст отзыва.';
      return;
    }

    const review = { id: Date.now(), name: name, direction: direction, text: text };

    const reviews = loadReviews();
    reviews.unshift(review); // новый отзыв — в начало списка
    saveReviews(reviews);

    const card = showReview(review);
    card.scrollIntoView({ behavior: 'smooth', block: 'center' }); // показываем, где он появился

    reviewForm.reset();
    reviewMessage.textContent = 'Спасибо! Отзыв добавлен первым в списке.';
    reviewBubble.textContent = 'Ура, спасибо за твою историю!';
  });
}