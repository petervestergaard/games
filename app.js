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
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}${tenths ? `.${fraction}` : ""}`;
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
    console.error("Could not read the local leaderboard.", error);
    return [];
  }
}

function renderLeaderboard() {
  const records = getLeaderboard()
    .sort((left, right) => left.time - right.time)
    .slice(0, 10);

  if (records.length === 0) {
    leaderboardContent.innerHTML = '<div class="empty-leaderboard">Your first finish earns a spot here.<br>Ready to make the list?</div>';
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
    date.textContent = new Date(record.date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
  startButton.hidden = true;
  resultPanel.hidden = true;
  answerInput.disabled = false;
  keypad.querySelectorAll("button").forEach((button) => { button.disabled = false; });
  submitButton.disabled = false;
  playerNameInput.disabled = true;
  messageElement.textContent = "Solve it, then hit enter.";
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
  cancelAnimationFrame(timerFrame);
  const elapsed = Math.round(performance.now() - startedAt);
  timerElement.textContent = formatTime(elapsed, true);
  resultTime.textContent = formatTime(elapsed, true);
  resultPanel.hidden = false;
  answerInput.disabled = true;
  keypad.querySelectorAll("button").forEach((button) => { button.disabled = true; });
  submitButton.disabled = true;
  playerNameInput.disabled = false;
  startButton.textContent = "Play again";
  startButton.hidden = false;
  messageElement.textContent = "Challenge complete!";
  messageElement.className = "game-message is-correct";

  const record = {
    name: playerNameInput.value.trim().slice(0, 18) || "Player",
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
    console.error("Could not save your result to the local leaderboard.", error);
    messageElement.textContent = "Finished! Your time could not be saved on this device.";
    messageElement.className = "game-message is-wrong";
  }
}

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isPlaying || answerInput.value.trim() === "") return;

  const [a, b] = questions[questionIndex];
  if (Number(answerInput.value) !== a * b) {
    messageElement.textContent = "Not quite — give it another try.";
    messageElement.className = "game-message is-wrong";
    return;
  }

  questionIndex += 1;
  setProgress(questionIndex);
  if (questionIndex === TOTAL_QUESTIONS) {
    finishGame();
    return;
  }

  messageElement.textContent = "That's it! Keep going.";
  messageElement.className = "game-message is-correct";
  showQuestion();
});

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || button.disabled || !isPlaying) return;

  if (button.dataset.action === "backspace") {
    answerInput.value = answerInput.value.slice(0, -1);
    return;
  }

  if (button.dataset.digit !== undefined) {
    answerInput.value += button.dataset.digit;
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
