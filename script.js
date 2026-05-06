(function () {
  const STORAGE_KEY = "dicePokerTelegramAppState";
  const tg = window.Telegram && window.Telegram.WebApp;

  const categories = [
    { id: "ones", label: "1", type: "input", groupStart: false },
    { id: "twos", label: "2", type: "input", groupStart: false },
    { id: "threes", label: "3", type: "input", groupStart: false },
    { id: "fours", label: "4", type: "input", groupStart: false },
    { id: "fives", label: "5", type: "input", groupStart: false },
    { id: "sixes", label: "6", type: "input", groupStart: false },
    { id: "topSum", label: "ИТОГО / СУММА", type: "summary", groupStart: false },
    { id: "pair", label: "Пара (П)", type: "input", groupStart: true },
    { id: "twoPairs", label: "Две пары (ПП)", type: "input", groupStart: false },
    { id: "set", label: "Сет (S)", type: "input", groupStart: false },
    { id: "smallStraight", label: "Малый стрит (MS)", type: "input", groupStart: false },
    { id: "largeStraight", label: "Большой стрит (BS)", type: "input", groupStart: false },
    { id: "fullHouse", label: "Фулл-хаус (F)", type: "input", groupStart: false },
    { id: "fourKind", label: "Каре (K)", type: "input", groupStart: false },
    { id: "poker", label: "Покер (П)", type: "input", groupStart: false },
    { id: "chance", label: "Мусор (M)", type: "input", groupStart: false },
    { id: "grandTotal", label: "ОБЩИЙ ИТОГ", type: "total", groupStart: true },
  ];

  const upperSectionIds = ["ones", "twos", "threes", "fours", "fives", "sixes"];
  const lowerSectionIds = [
    "pair",
    "twoPairs",
    "set",
    "smallStraight",
    "largeStraight",
    "fullHouse",
    "fourKind",
    "poker",
    "chance",
  ];
  const categoryBonuses = {
    smallStraight: 10,
    largeStraight: 20,
    fullHouse: 30,
    fourKind: 40,
    poker: 50,
  };
  const scoringIds = categories.filter((category) => category.type === "input").map((category) => category.id);

  const state = {
    playerCount: 0,
    players: [],
    scores: {},
  };

  const introScreen = document.getElementById("introScreen");
  const setupScreen = document.getElementById("setupScreen");
  const gameScreen = document.getElementById("gameScreen");
  const playerOptions = document.getElementById("playerOptions");
  const playersCountLabel = document.getElementById("playersCountLabel");
  const tableHead = document.getElementById("tableHead");
  const tableBody = document.getElementById("tableBody");
  const startBtn = document.getElementById("startBtn");
  const newGameBtn = document.getElementById("newGameBtn");
  const saveBtn = document.getElementById("saveBtn");
  const resetBtn = document.getElementById("resetBtn");
  const nameModal = document.getElementById("nameModal");
  const playerNameInput = document.getElementById("playerNameInput");
  const saveNameBtn = document.getElementById("saveNameBtn");
  const cancelNameBtn = document.getElementById("cancelNameBtn");

  let editingPlayerIndex = null;
  let introSeen = false;

  initTelegram();
  createPlayerButtons();
  loadState();
  render();

  function initTelegram() {
    if (!tg) {
      return;
    }

    tg.ready();
    tg.expand();

    const theme = tg.themeParams || {};
    setThemeColor("--bg", theme.bg_color);
    setThemeColor("--panel", theme.secondary_bg_color);
    setThemeColor("--text", theme.text_color);
    setThemeColor("--muted", theme.hint_color);
    setThemeColor("--accent", theme.button_color);
    setThemeColor("--accent-strong", theme.link_color || theme.button_color);
  }

  function setThemeColor(name, value) {
    if (value) {
      document.documentElement.style.setProperty(name, value);
    }
  }

  function createPlayerButtons() {
    for (let count = 2; count <= 6; count += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(count);
      button.addEventListener("click", () => startGame(count));
      playerOptions.appendChild(button);
    }
  }

  function startGame(playerCount) {
    state.playerCount = playerCount;
    state.players = Array.from({ length: playerCount }, (_, index) => `Игрок ${index + 1}`);
    state.scores = {};

    for (let playerIndex = 0; playerIndex < playerCount; playerIndex += 1) {
      state.scores[playerIndex] = {};
      scoringIds.forEach((categoryId) => {
        state.scores[playerIndex][categoryId] = "";
      });
    }

    saveState();
    render();
  }

  function render() {
    playersCountLabel.textContent = String(state.playerCount);
    document.documentElement.style.setProperty("--player-count", String(state.playerCount || 2));

    if (!introSeen && !state.playerCount) {
      introScreen.classList.remove("hidden");
      setupScreen.classList.add("hidden");
      gameScreen.classList.add("hidden");
      return;
    }

    if (!state.playerCount) {
      introScreen.classList.add("hidden");
      setupScreen.classList.remove("hidden");
      gameScreen.classList.add("hidden");
      return;
    }

    introScreen.classList.add("hidden");
    setupScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    renderTable();
  }

  function renderTable() {
    const table = tableHead.parentElement;

    tableHead.innerHTML = "";
    tableBody.innerHTML = "";
    table.querySelector("colgroup")?.remove();

    const colGroup = document.createElement("colgroup");
    const categoryCol = document.createElement("col");
    categoryCol.className = "category-col";
    colGroup.appendChild(categoryCol);

    state.players.forEach(() => {
      const playerCol = document.createElement("col");
      playerCol.className = "player-col";
      colGroup.appendChild(playerCol);
    });

    table.prepend(colGroup);

    const headRow = document.createElement("tr");
    headRow.appendChild(createHeaderCell("Категория"));

    state.players.forEach((playerName, playerIndex) => {
      const th = document.createElement("th");
      const button = document.createElement("button");
      const icon = document.createElement("span");

      button.type = "button";
      button.className = "player-name-btn";
      button.textContent = playerName;
      button.addEventListener("click", () => openNameModal(playerIndex));

      icon.className = "edit-icon";
      icon.textContent = "✎";
      button.appendChild(icon);
      th.appendChild(button);
      headRow.appendChild(th);
    });

    tableHead.appendChild(headRow);

    categories.forEach((category) => {
      const row = document.createElement("tr");

      if (category.groupStart) {
        row.classList.add("block-start");
      }

      if (category.type === "summary") {
        row.classList.add("summary-row");
      }

      if (category.type === "total") {
        row.classList.add("total-row");
      }

      const labelCell = document.createElement("td");
      labelCell.textContent = category.label;
      row.appendChild(labelCell);

      state.players.forEach((_, playerIndex) => {
        const cell = document.createElement("td");

        if (category.type === "input") {
          const input = document.createElement("input");
          input.className = "score-input";
          input.type = "text";
          input.inputMode = "text";
          input.enterKeyHint = "done";
          input.pattern = "-?[0-9]*";
          input.value = getScoreValue(playerIndex, category.id);
          input.dataset.playerIndex = String(playerIndex);
          input.dataset.categoryId = category.id;
          input.addEventListener("input", handleScoreInput);
          input.addEventListener("beforeinput", handleScoreBeforeInput);
          input.addEventListener("keydown", handleScoreKeydown);
          input.addEventListener("keyup", handleScoreKeydown);
          cell.appendChild(input);
        } else {
          const value = category.type === "summary" ? getUpperSum(playerIndex) : getGrandTotal(playerIndex);
          const score = document.createElement("span");
          score.className = "readonly-score";
          score.textContent = String(value);
          cell.appendChild(score);
        }

        row.appendChild(cell);
      });

      tableBody.appendChild(row);
    });
  }

  function createHeaderCell(text) {
    const th = document.createElement("th");
    th.textContent = text;
    return th;
  }

  function handleScoreInput(event) {
    const input = event.target;
    const playerIndex = input.dataset.playerIndex;
    const categoryId = input.dataset.categoryId;
    const cleanValue = normalizeScoreInput(input.value);

    input.value = cleanValue;
    state.scores[playerIndex][categoryId] = cleanValue;
    saveState();
    updateTotalsOnly();
  }

  function handleScoreBeforeInput(event) {
    if (event.inputType === "insertLineBreak") {
      event.preventDefault();
      event.target.blur();
    }
  }

  function handleScoreKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.target.blur();
    }
  }

  function updateTotalsOnly() {
    state.players.forEach((_, playerIndex) => {
      const summaryRowIndex = categories.findIndex((category) => category.id === "topSum");
      const totalRowIndex = categories.findIndex((category) => category.id === "grandTotal");
      const summaryCell = tableBody.rows[summaryRowIndex].cells[playerIndex + 1];
      const totalCell = tableBody.rows[totalRowIndex].cells[playerIndex + 1];

      summaryCell.textContent = String(getUpperSum(playerIndex));
      totalCell.textContent = String(getGrandTotal(playerIndex));
    });
  }

  function getScoreValue(playerIndex, categoryId) {
    return (state.scores[playerIndex] && state.scores[playerIndex][categoryId]) || "";
  }

  function getUpperSum(playerIndex) {
    const sum = upperSectionIds.reduce((total, categoryId) => total + toScore(getScoreValue(playerIndex, categoryId)), 0);
    return sum * 10;
  }

  function getGrandTotal(playerIndex) {
    const lowerSum = lowerSectionIds.reduce(
      (sum, categoryId) => sum + getCategoryScore(playerIndex, categoryId),
      0
    );

    return getUpperSum(playerIndex) + lowerSum;
  }

  function getCategoryScore(playerIndex, categoryId) {
    const value = getScoreValue(playerIndex, categoryId);

    if (value === "") {
      return 0;
    }

    const score = toScore(value);
    const bonus = score === 0 ? 0 : categoryBonuses[categoryId] || 0;

    return score + bonus;
  }

  function normalizeScoreInput(value) {
    const hasMinus = value.trim().startsWith("-");
    const digits = value.replace(/[^\d]/g, "");
    return hasMinus ? `-${digits}` : digits;
  }

  function toScore(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function openNameModal(playerIndex) {
    editingPlayerIndex = playerIndex;
    playerNameInput.value = state.players[playerIndex];
    nameModal.classList.remove("hidden");
    window.setTimeout(() => {
      playerNameInput.focus();
      playerNameInput.select();
    }, 0);
  }

  function closeNameModal() {
    editingPlayerIndex = null;
    nameModal.classList.add("hidden");
  }

  function savePlayerName() {
    if (editingPlayerIndex === null) {
      return;
    }

    const nextName = playerNameInput.value.trim() || `Игрок ${editingPlayerIndex + 1}`;
    state.players[editingPlayerIndex] = nextName;
    saveState();
    closeNameModal();
    renderTable();
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      if (!parsed || !parsed.playerCount || !Array.isArray(parsed.players)) {
        return;
      }

      state.playerCount = parsed.playerCount;
      state.players = parsed.players;
      state.scores = parsed.scores || {};
      normalizeScores();
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function normalizeScores() {
    for (let playerIndex = 0; playerIndex < state.playerCount; playerIndex += 1) {
      if (!state.scores[playerIndex]) {
        state.scores[playerIndex] = {};
      }

      scoringIds.forEach((categoryId) => {
        if (typeof state.scores[playerIndex][categoryId] === "undefined") {
          state.scores[playerIndex][categoryId] = "";
        }
      });
    }
  }

  function resetGame() {
    if (!state.playerCount) {
      return;
    }

    scoringIds.forEach((categoryId) => {
      for (let playerIndex = 0; playerIndex < state.playerCount; playerIndex += 1) {
        state.scores[playerIndex][categoryId] = "";
      }
    });

    saveState();
    renderTable();
  }

  function newGame() {
    localStorage.removeItem(STORAGE_KEY);
    state.playerCount = 0;
    state.players = [];
    state.scores = {};
    introSeen = false;
    render();
  }

  startBtn.addEventListener("click", () => {
    introSeen = true;
    render();
  });
  newGameBtn.addEventListener("click", newGame);
  saveBtn.addEventListener("click", saveState);
  resetBtn.addEventListener("click", resetGame);
  saveNameBtn.addEventListener("click", savePlayerName);
  cancelNameBtn.addEventListener("click", closeNameModal);

  nameModal.addEventListener("click", (event) => {
    if (event.target === nameModal) {
      closeNameModal();
    }
  });

  playerNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      savePlayerName();
    }

    if (event.key === "Escape") {
      closeNameModal();
    }
  });
})();
