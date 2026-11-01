const TOTAL_QUESTIONS = 100;
const LEADERBOARD_KEY = "times-tables-leaderboard-v1";

const timerElement = document.querySelector("#timer");
const countElement = document.querySelector("#progress-count");
const progressBar = document.querySelector("#progress-bar");
const progressFill = document.querySelector("#progress-fill");
const messageElement = document.querySelector("#game-message");
const factorAElement = document.querySelector("#factor-a");
const factorBElement = document.querySelector("#factor-b");
const answerInput = document.querySelector("#answer-input");
const answerForm = document.querySelector("#answer-form");
const submitButton = document.querySelector("#submit-button");
const keypad = document.querySelector(".keypad");
const startButton = document.querySelector("#start-button");
const cancelGameButton = document.querySelector("#cancel-game-button");
const playerNameInput = document.querySelector("#player-name");
const resultPanel = document.querySelector("#result-panel");
const resultTime = document.querySelector("#result-time");
const leaderboardContent = document.querySelector("#leaderboard-content");

let questions = [];
let questionIndex = 0;
let startedAt = 0;
let timerFrame = 0;
let isPlaying = false;

function formatTime(milliseconds, tenths = false) {
  const totalTenths = Math.floor(milliseconds / 100);
  const minutes = Math.floor(totalTenths / 600);
  const seconds = Math.floor(totalTenths / 10) % 60;
  const fraction = totalTenths % 10;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}${tenths ? `,${fraction}` : ""}`;
}

function getLeaderboard() {
  try {
    const records = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
    return Array.isArray(records)
      ? records.filter((record) =>
          record &&
          typeof record.name === "string" &&
          Number.isFinite(record.time) &&
          typeof record.date === "string"
        )
      : [];
  } catch (error) {
    console.error("Kunne ikke læse listen over bedste tider.", error);
    return [];
  }
}

function renderLeaderboard() {
  const records = getLeaderboard()
    .sort((left, right) => left.time - right.time)
    .slice(0, 10);

  if (records.length === 0) {
    leaderboardContent.innerHTML = '<div class="empty-leaderboard">Din første gennemførte runde giver dig en plads her.<br>Klar til at komme på listen?</div>';
    return;
  }

  const list = document.createElement("div");
  list.className = "leaderboard-list";
  records.forEach((record, index) => {
    const row = document.createElement("div");
    row.className = "leaderboard-row";
    const rank = document.createElement("span");
    rank.className = "rank";
    rank.textContent = `#${String(index + 1).padStart(2, "0")}`;
    const player = document.createElement("div");
    player.className = "player-cell";
    const name = document.createElement("strong");
    name.textContent = record.name;
    const date = document.createElement("span");
    date.textContent = new Date(record.date).toLocaleDateString("da-DK", { month: "short", day: "numeric" });
    player.append(name, date);
    const time = document.createElement("span");
    time.className = "record-time";
    time.textContent = formatTime(record.time);
    row.append(rank, player, time);
    list.append(row);
  });
  leaderboardContent.replaceChildren(list);
}

function setProgress(completed) {
  countElement.textContent = `${completed} / ${TOTAL_QUESTIONS}`;
  progressFill.style.width = `${completed}%`;
  progressBar.setAttribute("aria-valuenow", String(completed));
}

function showQuestion() {
  const [a, b] = questions[questionIndex];
  factorAElement.textContent = String(a);
  factorBElement.textContent = String(b);
  answerInput.value = "";
  answerInput.classList.remove("is-wrong");
}

function startGame() {
  questions = [];
  for (let a = 1; a <= 10; a += 1) {
    for (let b = 1; b <= 10; b += 1) questions.push([a, b]);
  }
  for (let index = questions.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [questions[index], questions[randomIndex]] = [questions[randomIndex], questions[index]];
  }

  questionIndex = 0;
  isPlaying = true;
  startedAt = performance.now();
  document.body.classList.add("game-mode");
  startButton.hidden = true;
  resultPanel.hidden = true;
  answerInput.disabled = false;
  keypad.querySelectorAll("button").forEach((button) => { button.disabled = false; });
  submitButton.disabled = false;
  playerNameInput.disabled = true;
  messageElement.textContent = "Løs stykket, og tryk på enterknappen.";
  messageElement.className = "game-message";
  timerElement.textContent = "00:00.0";
  setProgress(0);
  showQuestion();
  updateTimer();
}

function updateTimer() {
  if (!isPlaying) return;
  timerElement.textContent = formatTime(performance.now() - startedAt, true);
  timerFrame = requestAnimationFrame(updateTimer);
}

function finishGame() {
  isPlaying = false;
  document.body.classList.remove("game-mode");
  cancelAnimationFrame(timerFrame);
  const elapsed = Math.round(performance.now() - startedAt);
  timerElement.textContent = formatTime(elapsed, true);
  resultTime.textContent = formatTime(elapsed, true);
  resultPanel.hidden = false;
  answerInput.disabled = true;
  keypad.querySelectorAll("button").forEach((button) => { button.disabled = true; });
  submitButton.disabled = true;
  playerNameInput.disabled = false;
  startButton.textContent = "Spil igen";
  startButton.hidden = false;
  messageElement.textContent = "Udfordringen er klaret!";
  messageElement.className = "game-message is-correct";

  const record = {
    name: playerNameInput.value.trim().slice(0, 18) || "Spiller",
    time: elapsed,
    date: new Date().toISOString(),
  };
  try {
    const records = [...getLeaderboard(), record]
      .sort((left, right) => left.time - right.time)
      .slice(0, 10);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(records));
    renderLeaderboard();
  } catch (error) {
    console.error("Kunne ikke gemme dit resultat på listen over bedste tider.", error);
    messageElement.textContent = "Færdig! Din tid kunne ikke gemmes på denne enhed.";
    messageElement.className = "game-message is-wrong";
  }
}

function cancelGame() {
  if (!isPlaying) return;

  isPlaying = false;
  cancelAnimationFrame(timerFrame);
  document.body.classList.remove("game-mode");
  questions = [];
  questionIndex = 0;
  factorAElement.textContent = "?";
  factorBElement.textContent = "?";
  answerInput.value = "";
  answerInput.classList.remove("is-wrong");
  answerInput.disabled = true;
  keypad.querySelectorAll("button").forEach((button) => { button.disabled = true; });
  playerNameInput.disabled = false;
  timerElement.textContent = "00:00,0";
  setProgress(0);
  messageElement.textContent = "Klar, når du er.";
  messageElement.className = "game-message";
  resultPanel.hidden = true;
  startButton.innerHTML = 'Start udfordringen <span aria-hidden="true">→</span>';
  startButton.hidden = false;
}

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isPlaying || answerInput.value.trim() === "") return;

  const [a, b] = questions[questionIndex];
  if (Number(answerInput.value) !== a * b) {
    messageElement.textContent = "Ikke helt – prøv igen.";
    messageElement.className = "game-message is-wrong";
    answerInput.classList.add("is-wrong");
    return;
  }

  questionIndex += 1;
  setProgress(questionIndex);
  if (questionIndex === TOTAL_QUESTIONS) {
    finishGame();
    return;
  }

  messageElement.textContent = "Lige præcis! Fortsæt sådan.";
  messageElement.className = "game-message is-correct";
  showQuestion();
});

cancelGameButton.addEventListener("click", cancelGame);

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || button.disabled || !isPlaying) return;

  if (button.dataset.action === "backspace") {
    answerInput.value = answerInput.value.slice(0, -1);
    answerInput.classList.remove("is-wrong");
    return;
  }

  if (button.dataset.digit !== undefined) {
    answerInput.value = answerInput.classList.contains("is-wrong")
      ? button.dataset.digit
      : answerInput.value + button.dataset.digit;
    answerInput.classList.remove("is-wrong");
  }
});

startButton.addEventListener("click", startGame);
renderLeaderboard();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("Could not register the offline service worker.", error);
    });
  });
}
