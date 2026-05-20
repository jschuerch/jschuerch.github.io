const game = {
  validWords: new Set(),
  answerWords: [],
  targetWord: "",
  guesses: [],
  currentGuess: "",
  isGameOver: false,

  wordLength: 5,
  unlimitedGuesses: true,
  maxGuesses: 10,
};

const keyboardRows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
const highlightClasses = ["none", "highlight1", "highlight2", "highlight3", "highlight4", "highlight5", "highlight6"];
let selectedHighlightClass = "none";
let initGameId = 0;

function animateWordhuntResize(updateLayout) {
  const section = document.querySelector(".section");
  const startHeight = section.offsetHeight;

  section.style.height = `${startHeight}px`;
  section.style.overflow = "hidden";

  updateLayout();

  const endHeight = section.scrollHeight;
  section.style.transition = "height 360ms ease";

  requestAnimationFrame(() => {
    section.style.height = `${endHeight}px`;
  });

  setTimeout(() => {
    section.style.height = "";
    section.style.overflow = "";
    section.style.transition = "";
  }, 380);
}

function getSelectedGameOptions() {
  const wordLengthSelect = document.getElementById("word-length-select");
  const triesSelect = document.getElementById("tries-select");
  const triesValue = triesSelect?.value || "unlimited";

  return {
    wordLength: Number(wordLengthSelect?.value || game.wordLength),
    unlimitedGuesses: triesValue === "unlimited",
    maxGuesses: triesValue === "unlimited" ? game.maxGuesses : Number(triesValue),
  };
}

async function initGame(options = getSelectedGameOptions()) {
  const currentInitGameId = ++initGameId;
  const { wordLength, unlimitedGuesses, maxGuesses } = options;
  const suffix = `${wordLength}letters`;
  const validWords = await fetch(`data/valid_words_${suffix}.json`).then(r => r.json());

  const answerWords = await fetch(`data/answer_words_${suffix}.json`).then(r => r.json());
  // In case the game was restarted while the async operations were still pending, skip
  if (currentInitGameId !== initGameId) return;

  game.validWords = new Set(validWords);
  game.answerWords = answerWords;
  game.targetWord = answerWords[Math.floor(Math.random() * answerWords.length)];

  game.guesses = [];
  game.currentGuess = "";
  game.isGameOver = false;
  game.wordLength = wordLength;
  game.unlimitedGuesses = unlimitedGuesses;
  game.maxGuesses = maxGuesses;

  console.log("Target:", game.targetWord);

  const grid = document.querySelector(".wordhunt-grid");
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${wordLength + 2}, 1fr)`;

  document.querySelector(".wordhunt-end").classList.remove("visible");
  resetKeyboard();

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

    ${Array.from({ length: game.wordLength })
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

  let usedTarget = Array(game.wordLength).fill(false);
  let usedGuess = Array(game.wordLength).fill(false);

  // Check for exact matches
  for (let i = 0; i < game.wordLength; i++) {
    if (guess[i] === target[i]) {
      correct++;

      usedTarget[i] = true;
      usedGuess[i] = true;
    }
  }

  // Check for misplaced matches
  for (let i = 0; i < game.wordLength; i++) {
    if (usedGuess[i]) continue;

    for (let j = 0; j < game.wordLength; j++) {
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
  error.classList.add("visible");

  setTimeout(() => {
    error.classList.remove("visible");
  }, 2000);
}

function showInfo(correct, present) {
  const info = document.querySelector(".wordhunt-info");

  info.textContent = "You have " + correct + " correct and " + present + " misplaced letters.";
  info.classList.add("visible");

  setTimeout(() => {
    info.classList.remove("visible");
  }, 2000);
}

function buildKeyboard() {
  const keyboard = document.querySelector(".wordhunt-keyboard");
  keyboard.innerHTML = "";

  keyboardRows.forEach(rowLetters => {
    const row = document.createElement("div");
    row.classList.add("wordhunt-keyboard-row");

    rowLetters.split("").forEach(letter => {
      const key = document.createElement("button");
      key.type = "button";
      key.classList.add("wordhunt-key");
      key.dataset.key = letter;
      key.textContent = letter;
      key.tabIndex = -1;
      key.setAttribute("aria-label", `${letter.toUpperCase()} letter marker`);

      key.addEventListener("click", (event) => {
        if (selectedHighlightClass === "none") {
          // press the key if no highlight is selected
          flashKey(letter);
          addLetter(letter);
        } else {
          toggleSelectedHighlight(key, event.shiftKey);
        }
        key.blur();
      });

      key.addEventListener("contextmenu", event => {
        event.preventDefault();
        clearHighlight(key);
        key.blur();
      });

      key.addEventListener("mouseenter", () => {
        setLetterHover(key.dataset.key, true);
      });

      key.addEventListener("mouseleave", () => {
        setLetterHover(key.dataset.key, false);
      });

      row.appendChild(key);
    });

    keyboard.appendChild(row);
  });

  const row = document.createElement("div");
  row.classList.add("wordhunt-keyboard-row");

  const enterKey = document.createElement("button");
  enterKey.type = "button";
  enterKey.classList.add("wordhunt-key", "wordhunt-action-key");
  enterKey.dataset.key = "enter";
  enterKey.textContent = "Enter";
  enterKey.tabIndex = -1;
  enterKey.setAttribute("aria-label", "Enter key");

  enterKey.addEventListener("click", (event) => {
    submitWord();
    enterKey.blur();
  });
  row.appendChild(enterKey);

  const backspaceKey = document.createElement("button");
  backspaceKey.type = "button";
  backspaceKey.classList.add("wordhunt-key", "wordhunt-action-key");
  backspaceKey.dataset.key = "backspace";
  backspaceKey.textContent = "Backspace";
  backspaceKey.tabIndex = -1;
  backspaceKey.setAttribute("aria-label", "Backspace key");

  backspaceKey.addEventListener("click", (event) => {
    removeLetter();
    backspaceKey.blur();
  });

  row.appendChild(backspaceKey);
  row.appendChild(enterKey);

  keyboard.appendChild(row);
}

function resetKeyboard() {
  document.querySelectorAll(".wordhunt-key").forEach(clearHighlight);
}

function clearHighlight(element) {
  element.classList.remove(...highlightClasses);
}

function toggleSelectedHighlight(element, propagateToCells = false) {
  const containsClass = element.classList.contains(selectedHighlightClass);
  clearHighlight(element);
  if (containsClass) return;
  element.classList.add(selectedHighlightClass);
  if (selectedHighlightClass === "highlight1" || propagateToCells) {
    let letter;
    if (element.classList.contains("wordhunt-key")) {
      letter = element.dataset.key;
    } else if (element.classList.contains("wordhunt-cell")) {
      letter = element.textContent.toLowerCase();
    }
    if (letter) {
      propagateHighlight(letter, selectedHighlightClass);
    }
  }
}

function propagateHighlight(letter, highlightClass) {
  document.querySelectorAll(`.wordhunt-key[data-key="${letter}"]`).forEach(key => {
    key.classList.remove(...highlightClasses);
    key.classList.add(highlightClass);
  });

  document.querySelectorAll(".wordhunt-cell.filled").forEach(cell => {
    if (cell.textContent.toLowerCase() === letter) {
      const hasHighlight = highlightClasses.some(cls =>
        cls !== "none" && cell.classList.contains(cls)
      );
      if (hasHighlight) return;

      cell.classList.remove(...highlightClasses);
      cell.classList.add(highlightClass);
    }
  });
}

function selectHighlight(highlightClass) {
  selectedHighlightClass = highlightClass;
  document.querySelectorAll(".wordhunt-marker-btn").forEach(button => {
    button.classList.toggle("active", button.dataset.highlight === highlightClass);
  });
}

function setLetterHover(letter, isActive) {
  document.querySelectorAll(".wordhunt-cell.filled").forEach(cell => {
    if (cell.textContent.toLowerCase() === letter) {
      cell.classList.toggle("same-letter-hover", isActive);
    }
  });

  document.querySelectorAll(`.wordhunt-key[data-key="${letter}"]`).forEach(key => {
    key.classList.toggle("same-letter-hover", isActive);
  });
}

function flashKey(letter) {
  const key = document.querySelector(`.wordhunt-key[data-key="${letter.toLowerCase()}"]`);
  if (!key) return;

  key.classList.add("pressed");
  setTimeout(() => {
    key.classList.remove("pressed");
  }, 120);
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
  div.classList.add("visible");
}

function giveUp() {
  if (game.isGameOver) return;

  const row = getActiveRow();
  if (row) {
    row.classList.remove("active");
    row.classList.add("incorrect");
  }

  game.isGameOver = true;
  const div = document.querySelector(".wordhunt-end");
  div.textContent = 'The word was ' + game.targetWord + '.';
  div.classList.add("visible");
}

function submitWord() {
  if (game.isGameOver) return;

  const row = getActiveRow();

  if (!row) return;

  const filledCells = row.querySelectorAll(".wordhunt-cell.filled");

  if (filledCells.length !== game.wordLength) return;

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
    cell.addEventListener("click", (event) => {
      toggleSelectedHighlight(cell, event.shiftKey);
    });
    cell.addEventListener('contextmenu', (event) => {
      // Prevent the default browser menu from appearing
      event.preventDefault();
      clearHighlight(cell);
    });
    cell.addEventListener("mouseenter", () => {
      setLetterHover(cell.textContent.toLowerCase(), true);
    });
    cell.addEventListener("mouseleave", () => {
      setLetterHover(cell.textContent.toLowerCase(), false);
    });
  });

  if (guess === game.targetWord) {
    animateWordhuntResize(() => {
      endGame(row, true);
    });
    return;
  }

  const result = evaluateGuess(guess, game.targetWord);

  row.querySelector(".wordhunt-num-correct").textContent = result.correct;
  row.querySelector(".wordhunt-num-present").textContent = result.present;

  showInfo(result.correct, result.present);

  if (game.unlimitedGuesses || game.guesses.length < game.maxGuesses) {

    let nextRow = row.nextElementSibling;
    if (!nextRow) {
      animateWordhuntResize(() => {
        addRow(true);
      });
    } else {
      nextRow.classList.add("active");
      if (!nextRow.nextElementSibling) {
        animateWordhuntResize(() => {
          addRow();
        });
      }
    }
  } else {
    animateWordhuntResize(() => {
      endGame(row, false);
    });
  }
}

// event listener to add or remove letters on the active wordhunt row
document.addEventListener("keydown", (event) => {
  const target = event.target;
  if (["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return;
  if (
    target.tagName === "BUTTON" &&
    !target.classList.contains("wordhunt-key") &&
    !target.classList.contains("wordhunt-marker-btn")
  ) return;
  if (game.isGameOver) return;

  if (event.key === "Backspace") {
    event.preventDefault();
    removeLetter();
  } else if (event.key === "Enter") {
    event.preventDefault();
    submitWord();
  } else if (/^[a-zA-Z]$/.test(event.key)) {
    flashKey(event.key);
    addLetter(event.key.toLowerCase());
  }
});

const new_game_btn = document.getElementById("new-game-btn");
const give_up_btn = document.getElementById("give-up-btn");
const gameTransitionElements = [
  ".wordhunt-container",
  ".wordhunt-keyboard",
];

function setGameTransitionVisible(isVisible) {
  gameTransitionElements.forEach(selector => {
    document.querySelector(selector).classList.toggle("visible", isVisible);
  });
}

function restartGameWithFade() {
  setGameTransitionVisible(false);
  setTimeout(() => {
    initGame();
  }, 500);

  setTimeout(() => {
    setGameTransitionVisible(true);
  }, 500);
}

new_game_btn.addEventListener("click", () => {
  new_game_btn.blur();
  restartGameWithFade();
});

give_up_btn.addEventListener("click", () => {
  give_up_btn.blur();
  giveUp();
});

document.querySelectorAll(".wordhunt-marker-btn").forEach(button => {
  button.addEventListener("click", () => {
    selectHighlight(button.dataset.highlight);
    button.blur();
  });
});

document.getElementById("word-length-select").addEventListener("change", (event) => {
  event.target.blur();
  restartGameWithFade();
});

document.getElementById("tries-select").addEventListener("change", (event) => {
  event.target.blur();
  restartGameWithFade();
});

buildKeyboard();
initGame();
