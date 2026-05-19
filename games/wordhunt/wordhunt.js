const game = {
  validWords: new Set(),
  answerWords: [],
  targetWord: "",
  guesses: [],
  currentGuess: "",
  isGameOver: false,

  UnlimitedGuesses: true,
  maxGuesses: 10,
};

async function initGame(unlimitedGuesses = true, maxGuesses = 10) {
  const validWords = await fetch("data/valid_words.json").then(r => r.json());

  const answerWords = await fetch("data/answer_words.json").then(r => r.json());

  game.validWords = new Set(validWords);
  game.answerWords = answerWords;
  game.targetWord = answerWords[Math.floor(Math.random() * answerWords.length)];

  game.guesses = [];
  game.currentGuess = "";
  game.isGameOver = false;
  game.UnlimitedGuesses = unlimitedGuesses;
  game.maxGuesses = maxGuesses;

  console.log("Target:", game.targetWord);

  document.querySelector(".wordhunt-grid").innerHTML = "";
  document.querySelector(".wordhunt-end").style.display = "none";

  addRow(true);

  for (let i = 0; i < (unlimitedGuesses ? 2 : maxGuesses - 1); i++) {
    addRow();
  }
}

function addRow(isActive = false) {
  const grid = document.querySelector(".wordhunt-grid");

  const row = document.createElement("div");

  row.classList.add("wordhunt-row");
  if (isActive) {
    row.classList.add("active");
  }

  row.innerHTML = `
    <div class="wordhunt-num-correct"></div>
    <div class="wordhunt-num-present"></div>

    ${Array.from({ length: 5 })
      .map((_, i) => `
        <div 
          class="wordhunt-cell empty"
          style="animation-delay: ${i * 100}ms;"
        ></div>
      `)
      .join("")}
  `;
  grid.appendChild(row);
}

function getActiveRow() {
  return document.querySelector(".wordhunt-row.active");
}

function getGuessFromRow(row) {
  return Array.from(row.querySelectorAll(".wordhunt-cell.filled"))
    .map(cell => cell.textContent)
    .join("");
}

function addLetter(letter) {
  if (game.isGameOver) return;

  const row = getActiveRow();
  if (!row) return;

  const emptyCell = row.querySelector(".wordhunt-cell.empty");
  if (emptyCell) {
    emptyCell.textContent = letter;
    emptyCell.classList.remove("empty");
    emptyCell.classList.add("filled");
  }
}

function removeLetter() {
  if (game.isGameOver) return;

  const row = getActiveRow();
  if (!row) return;
  row.classList.remove("incorrect");

  const filledCells = row.querySelectorAll(".wordhunt-cell.filled");
  if (filledCells.length > 0) {
    filledCells[filledCells.length - 1].textContent = "";
    filledCells[filledCells.length - 1].classList.remove("filled");
    filledCells[filledCells.length - 1].classList.add("empty");
  }
}

function evaluateGuess(guess, target) {
  let correct = 0;
  let present = 0;

  let usedTarget = Array(5).fill(false);
  let usedGuess = Array(5).fill(false);

  // Check for exact matches
  for (let i = 0; i < 5; i++) {
    if (guess[i] === target[i]) {
      correct++;

      usedTarget[i] = true;
      usedGuess[i] = true;
    }
  }

  // Check for misplaced matches
  for (let i = 0; i < 5; i++) {
    if (usedGuess[i]) continue;

    for (let j = 0; j < 5; j++) {
      if (usedTarget[j]) continue;

      if (guess[i] === target[j]) {
        present++;

        usedTarget[j] = true;
        usedGuess[i] = true;

        break;
      }
    }
  }

  return { correct, present };
}

function showError(message) {
  const error = document.querySelector(".wordhunt-error");

  error.textContent = message;
  error.style.opacity = 1;

  setTimeout(() => {
    error.style.opacity = 0;
  }, 2000);
}

function showInfo(correct, present) {
  const info = document.querySelector(".wordhunt-info");

  info.textContent = "You have " + correct + " correct and " + present + " misplaced letters.";
  info.style.opacity = 1;

  setTimeout(() => {
    info.style.opacity = 0;
  }, 2000);
}

function endGame(row, success) {
  game.isGameOver = true;
  const div = document.querySelector(".wordhunt-end");
  if (success) {
    row.classList.add("correct");
    div.textContent = 'Congratulations! You guessed the word in ' + game.guesses.length + ' guesses.';
  } else {
    row.classList.add("incorrect");
    div.textContent = 'Sorry, you failed to guess the word. The word was ' + game.targetWord + '.';
  }
  div.style.display = "block";
}

function submitWord() {
  if (game.isGameOver) return;

  const rows = document.querySelectorAll(".wordhunt-row");
  const row = getActiveRow();

  if (!row) return;

  const filledCells = row.querySelectorAll(".wordhunt-cell.filled");

  if (filledCells.length !== 5) return;

  const guess = getGuessFromRow(row);

  if (!game.validWords.has(guess)) {
    row.classList.add("incorrect");

    showError("Word not in list!");

    return;
  }

  row.classList.remove("active");
  row.classList.add("filled");

  game.guesses.push(guess);

  // add click event listener to toggle the cell state
  filledCells.forEach(cell => {
    cell.addEventListener("click", () => {
      toggle_cell(cell);
    });
    cell.addEventListener('contextmenu', (event) => {
      // Prevent the default browser menu from appearing
      event.preventDefault();
      toggle_cell(cell, true);
    });
  });

  if (guess === game.targetWord) {
    endGame(row, true);
    return;
  }

  const result = evaluateGuess(guess, game.targetWord);

  row.querySelector(".wordhunt-num-correct").textContent = result.correct;
  row.querySelector(".wordhunt-num-present").textContent = result.present;

  showInfo(result.correct, result.present);

  if (game.UnlimitedGuesses || game.guesses.length < game.maxGuesses) {

    let nextRow = row.nextElementSibling;
    if (!nextRow) {
      addRow(true);
    } else {
      nextRow.classList.add("active");
    }
  } else {
    endGame(row, false);
  }
}

function toggle_cell(cell, isRightClick = false) {
  if (isRightClick) {
    cell.classList.remove("highlight1", "highlight2", "highlight3");
    return;
  }

  if (cell.classList.contains("highlight1")) {
    cell.classList.remove("highlight1");
    cell.classList.add("highlight2");
  } else if (cell.classList.contains("highlight2")) {
    cell.classList.remove("highlight2");
    cell.classList.add("highlight3");
  } else if (cell.classList.contains("highlight3")) {
    cell.classList.remove("highlight3");
  } else {
    cell.classList.add("highlight1");
  }
}

// event listener to add or remove letters on the active wordhunt row
document.addEventListener("keydown", (event) => {
  if (game.isGameOver) return;

  if (event.key === "Backspace") {
    removeLetter();
  } else if (event.key === "Enter") {
    submitWord();
  } else if (/^[a-zA-Z]$/.test(event.key)) {
    addLetter(event.key.toLowerCase());
  }
});

const new_game_btn = document.getElementById("new-game-btn");

new_game_btn.addEventListener("click", () => {
  document.querySelector(".wordhunt-container").classList.remove("visible");
  document.querySelector(".wordhunt-btn-container").classList.remove("visible");

  setTimeout(() => {
    initGame();
  }, 200);

  setTimeout(() => {
    document.querySelector(".wordhunt-container").classList.add("visible");
    document.querySelector(".wordhunt-btn-container").classList.add("visible");
  }, 500);
});

initGame();
