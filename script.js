const flashcard = document.getElementById('flashcard');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const FLIP_TRANSITION_MS = 500;

const flashcards = [
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

let currentIndex = 0;
let isAnimating = false;

const questionEl = flashcard.querySelector('.flashcard__face--front .flashcard__content');
const answerEl = flashcard.querySelector('.flashcard__face--back .flashcard__content');

function toggleFlashcard() {
  if (isAnimating) {
    return;
  }

  const isFlipped = flashcard.classList.toggle('is-flipped');
  flashcard.setAttribute('aria-pressed', String(isFlipped));
}

function showFlashcard(index) {
  const nextIndex = (index + flashcards.length) % flashcards.length;

  if (isAnimating) {
    return;
  }

  if (!flashcard.classList.contains('is-flipped')) {
    currentIndex = nextIndex;
    questionEl.textContent = flashcards[currentIndex].question;
    answerEl.textContent = flashcards[currentIndex].answer;
    flashcard.setAttribute('aria-pressed', 'false');
    return;
  }

  isAnimating = true;
  flashcard.classList.remove('is-flipped');
  flashcard.setAttribute('aria-pressed', 'false');

  window.setTimeout(() => {
    currentIndex = nextIndex;
    questionEl.textContent = flashcards[currentIndex].question;
    answerEl.textContent = flashcards[currentIndex].answer;
    isAnimating = false;
  }, FLIP_TRANSITION_MS);
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

showFlashcard(0);
