let validWords = [];
let answerWords = [];
let targetWord = "";

async function wordhunt_init() {
  validWords = await fetch("data/valid_words.json").then(r => r.json());
  answerWords = await fetch("data/answer_words.json").then(r => r.json());
  targetWord = "";

  targetWord = answerWords[Math.floor(Math.random() * answerWords.length)];
  console.log("Target word:", targetWord);

  let grid = document.querySelector(".wordhunt-grid");
  grid.innerHTML = "";
  wordhunt_add_row(true);
  for (let i = 0; i < 2; i++) {
    wordhunt_add_row();
  }
}

function wordhunt_add_row(isActive = false) {
  let grid = document.querySelector(".wordhunt-grid");
  let new_row = document.createElement("div");
  new_row.classList.add("wordhunt-row");
  if (isActive) {
    new_row.classList.add("active");
  }
  new_row.innerHTML = `
    <div class="wordhunt-num-correct"></div>
    <div class="wordhunt-num-present"></div>
    <div class="wordhunt-cell empty" style="animation-delay: 0ms;"></div>
    <div class="wordhunt-cell empty" style="animation-delay: 100ms;"></div>
    <div class="wordhunt-cell empty" style="animation-delay: 200ms;"></div>
    <div class="wordhunt-cell empty" style="animation-delay: 300ms;"></div>
    <div class="wordhunt-cell empty" style="animation-delay: 400ms;"></div>
  `;
  grid.appendChild(new_row);
}

// event listener to add or remove letters on the active wordhunt row
document.addEventListener("keydown", (event) => {
  if (event.key === "Backspace") {
    remove_letter();
  } else if (event.key === "Enter") {
    submit_word();
  } else if (event.key.length === 1 && event.key.match(/[a-zA-Z]/)) {
    add_letter(event.key.toLowerCase());
  }
});

new_game_btn = document.getElementById("new-game-btn");
new_game_btn.addEventListener("click", () => {
  document.querySelector(".wordhunt-container").classList.remove("visible");
  document.querySelector(".wordhunt-btn-container").classList.remove("visible");
  setTimeout(() => {
    wordhunt_init();
  }, 200);
  setTimeout(() => {
    document.querySelector(".wordhunt-container").classList.add("visible");
    document.querySelector(".wordhunt-btn-container").classList.add("visible");
  }, 500);
});

function toggle_cell(cell) {
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

function add_letter(letter) {
  let active_row = document.querySelector(".wordhunt-row.active");
  if (active_row) {
    let empty_cell = active_row.querySelector(".wordhunt-cell.empty");
    if (empty_cell) {
      empty_cell.textContent = letter;
      empty_cell.classList.remove("empty");
      empty_cell.classList.add("filled");
    }
  }
}

function remove_letter() {
  let active_row = document.querySelector(".wordhunt-row.active");
  if (active_row) {
    active_row.classList.remove("incorrect");
    let filled_cells = active_row.querySelectorAll(".wordhunt-cell.filled");
    if (filled_cells.length > 0) {
      let last_filled_cell = filled_cells[filled_cells.length - 1];
      last_filled_cell.textContent = "";
      last_filled_cell.classList.remove("filled");
      last_filled_cell.classList.add("empty");
    }
  }
}

function submit_word() {
  let rows = document.querySelectorAll(".wordhunt-row");
  let active_row_id = Array.from(rows).findIndex(row => row.classList.contains("active"));
  let active_row = rows[active_row_id];
  if (active_row) {
    let filled_cells = active_row.querySelectorAll(".wordhunt-cell.filled");
    if (filled_cells.length === 5) {
      let guessed_word = Array.from(filled_cells).map(cell => cell.textContent).join("");
      if (validWords.includes(guessed_word)) {
        // Mark the row as correct and move to the next row
        active_row.classList.remove("active");
        active_row.classList.add("filled");
        // add click event listener to toggle the cell state
        filled_cells.forEach(cell => {
          cell.addEventListener("click", () => {
            toggle_cell(cell);
          });
        });
        if (guessed_word === targetWord) {
          active_row.classList.add("correct");
          let num_attempts = Array.from(rows).filter(row => row.classList.contains("filled")).length;
          document.querySelector(".wordhunt-success").querySelector("span").textContent = num_attempts;
          document.querySelector(".wordhunt-success").style.display = "block";
          return;
        } else {
          let num_correct = 0;
          let num_present = 0;

          let usedTarget = Array(5).fill(false);
          let usedGuess = Array(5).fill(false);

          for (let i = 0; i < 5; i++) {
            if (filled_cells[i].textContent === targetWord[i]) {
              num_correct++;
              usedTarget[i] = true;
              usedGuess[i] = true;
            }
          }

          for (let i = 0; i < 5; i++) {
            if (usedGuess[i]) continue;
            for (let j = 0; j < 5; j++) {
              if (usedTarget[j]) continue;
              if (filled_cells[i].textContent === targetWord[j]) {
                num_present++;
                usedTarget[j] = true;
                usedGuess[i] = true;
                break;
              }
            }
          }

          let num_correct_cell = active_row.querySelector(".wordhunt-num-correct");
          num_correct_cell.textContent = num_correct;

          let num_present_cell = active_row.querySelector(".wordhunt-num-present");
          num_present_cell.textContent = num_present;

          wordhuntInfo = document.querySelector(".wordhunt-info");
          wordhuntInfo.querySelector("span").textContent = num_correct;
          wordhuntInfo.style.opacity = 1;
          setTimeout(() => {
            wordhuntInfo.style.opacity = 0;
          }, 2000);
          let next_row = active_row.nextElementSibling;
          if (next_row) {
            next_row.classList.add("active");
          }
        }
        if (active_row_id === rows.length - 1) {
          wordhunt_add_row(true);
        }
      } else {
        // Mark the row as incorrect
        active_row.classList.add("incorrect");

        wordhuntError = document.querySelector(".wordhunt-error");
        wordhuntError.style.opacity = 1;
        setTimeout(() => {
          wordhuntError.style.opacity = 0;
        }, 2000);
      }
    }
  }
}


wordhunt_init();