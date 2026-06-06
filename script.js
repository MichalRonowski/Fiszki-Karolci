const flashcard = document.getElementById('flashcard');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const deleteBtn = document.getElementById('deleteBtn');
const addFlashcardForm = document.getElementById('addFlashcardForm');
const questionInput = document.getElementById('newQuestion');
const answerInput = document.getElementById('newAnswer');
const emptyState = document.getElementById('emptyState');
const progressCurrent = document.getElementById('progressCurrent');
const progressTotal = document.getElementById('progressTotal');
const FLIP_TRANSITION_MS = 500;
const STORAGE_KEY = 'fiszki-karolci-flashcards';

const defaultFlashcards = [
  {
    question: 'Jak po angielsku jest „kot”?',
    answer: 'Cat',
  },
  {
    question: 'Jak po angielsku jest „pies”?',
    answer: 'Dog',
  },
  {
    question: 'Jak po angielsku jest „dom”?',
    answer: 'House',
  },
  {
    question: 'Jak po angielsku jest „książka”?',
    answer: 'Book',
  },
];

function cloneFlashcards(list) {
  return list.map((flashcardData) => ({
    question: flashcardData.question,
    answer: flashcardData.answer,
  }));
}

function isValidFlashcard(flashcardData) {
  return Boolean(
    flashcardData
    && typeof flashcardData.question === 'string'
    && typeof flashcardData.answer === 'string'
    && flashcardData.question.trim()
    && flashcardData.answer.trim(),
  );
}

function saveFlashcards() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(flashcards));
}

function loadFlashcards() {
  const storedFlashcards = window.localStorage.getItem(STORAGE_KEY);

  if (!storedFlashcards) {
    const fallbackFlashcards = cloneFlashcards(defaultFlashcards);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackFlashcards));
    return fallbackFlashcards;
  }

  try {
    const parsedFlashcards = JSON.parse(storedFlashcards);

    if (!Array.isArray(parsedFlashcards)) {
      throw new Error('Stored flashcards are not an array.');
    }

    return parsedFlashcards
      .filter(isValidFlashcard)
      .map((flashcardData) => ({
        question: flashcardData.question.trim(),
        answer: flashcardData.answer.trim(),
      }));
  } catch {
    const fallbackFlashcards = cloneFlashcards(defaultFlashcards);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackFlashcards));
    return fallbackFlashcards;
  }
}

const flashcards = loadFlashcards();

let currentIndex = 0;
let isAnimating = false;

const questionEl = flashcard.querySelector('.flashcard__face--front .flashcard__content');
const answerEl = flashcard.querySelector('.flashcard__face--back .flashcard__content');

function updateProgress() {
  progressCurrent.textContent = String(flashcards.length === 0 ? 0 : currentIndex + 1);
  progressTotal.textContent = String(flashcards.length);
}

function renderCurrentFlashcard() {
  if (flashcards.length === 0) {
    return;
  }

  questionEl.textContent = flashcards[currentIndex].question;
  answerEl.textContent = flashcards[currentIndex].answer;
  updateProgress();
}

function resetToFront() {
  flashcard.classList.remove('is-flipped');
  flashcard.setAttribute('aria-pressed', 'false');
}

function renderEmptyState() {
  emptyState.hidden = false;
  flashcard.hidden = true;
  prevBtn.disabled = true;
  nextBtn.disabled = true;
  shuffleBtn.disabled = true;
  deleteBtn.disabled = true;
  flashcard.removeAttribute('aria-pressed');
  updateProgress();
}

function renderFlashcardState() {
  emptyState.hidden = true;
  flashcard.hidden = false;
  prevBtn.disabled = false;
  nextBtn.disabled = false;
  shuffleBtn.disabled = false;
  deleteBtn.disabled = false;
  renderCurrentFlashcard();
}

function syncView() {
  if (flashcards.length === 0) {
    renderEmptyState();
    return;
  }

  if (currentIndex < 0) {
    currentIndex = 0;
  }

  if (currentIndex >= flashcards.length) {
    currentIndex = flashcards.length - 1;
  }

  renderFlashcardState();
}

function toggleFlashcard() {
  if (isAnimating || flashcards.length === 0) {
    return;
  }

  const isFlipped = flashcard.classList.toggle('is-flipped');
  flashcard.setAttribute('aria-pressed', String(isFlipped));
}

function showFlashcard(index) {
  if (flashcards.length === 0) {
    return;
  }

  const nextIndex = (index + flashcards.length) % flashcards.length;

  if (isAnimating) {
    return;
  }

  if (!flashcard.classList.contains('is-flipped')) {
    currentIndex = nextIndex;
    renderCurrentFlashcard();
    flashcard.setAttribute('aria-pressed', 'false');
    return;
  }

  isAnimating = true;
  resetToFront();

  window.setTimeout(() => {
    currentIndex = nextIndex;
    renderCurrentFlashcard();
    isAnimating = false;
  }, FLIP_TRANSITION_MS);
}

function shuffleFlashcards() {
  if (isAnimating || flashcards.length === 0) {
    return;
  }

  for (let index = flashcards.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [flashcards[index], flashcards[randomIndex]] = [flashcards[randomIndex], flashcards[index]];
  }

  currentIndex = 0;
  resetToFront();
  renderCurrentFlashcard();
  saveFlashcards();
}

function deleteCurrentFlashcard() {
  if (flashcards.length === 0) {
    return;
  }

  const shouldDelete = window.confirm('Czy na pewno chcesz usunąć tę fiszkę?');

  if (!shouldDelete) {
    return;
  }

  flashcards.splice(currentIndex, 1);

  if (currentIndex >= flashcards.length) {
    currentIndex = flashcards.length - 1;
  }

  if (flashcards.length === 0) {
    currentIndex = 0;
  }

  saveFlashcards();
  resetToFront();
  syncView();
}

function addFlashcard(event) {
  event.preventDefault();

  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();

  if (!question || !answer) {
    return;
  }

  flashcards.push({ question, answer });
  saveFlashcards();

  questionInput.value = '';
  answerInput.value = '';
  currentIndex = flashcards.length - 1;
  syncView();
}

function showNextFlashcard() {
  showFlashcard(currentIndex + 1);
}

function showPreviousFlashcard() {
  showFlashcard(currentIndex - 1);
}

flashcard.addEventListener('click', toggleFlashcard);

flashcard.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleFlashcard();
  }
});

prevBtn.addEventListener('click', showPreviousFlashcard);
nextBtn.addEventListener('click', showNextFlashcard);
shuffleBtn.addEventListener('click', shuffleFlashcards);
deleteBtn.addEventListener('click', deleteCurrentFlashcard);
addFlashcardForm.addEventListener('submit', addFlashcard);

syncView();

if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}
