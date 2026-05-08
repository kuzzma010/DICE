(function () {
  const STORAGE_KEY = "dicePokerTelegramAppState";
  const SUPABASE_URL = "https://nntczgqazcwecrgbpwnl.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_HSOdAIIx84jYiM67vVOn9A_yIBVKutA";
  const tg = window.Telegram && window.Telegram.WebApp;
  const supabaseClient =
    SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase
      ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      : null;

  const categories = [
    { id: "ones", label: "1", type: "input", groupStart: false },
    { id: "twos", label: "2", type: "input", groupStart: false },
    { id: "threes", label: "3", type: "input", groupStart: false },
    { id: "fours", label: "4", type: "input", groupStart: false },
    { id: "fives", label: "5", type: "input", groupStart: false },
    { id: "sixes", label: "6", type: "input", groupStart: false },
    { id: "topSum", label: "ИТОГО / СУММА", type: "summary", groupStart: false },
    { id: "pair", label: "П", type: "input", groupStart: true },
    { id: "twoPairs", label: "ПП", type: "input", groupStart: false },
    { id: "set", label: "С", type: "input", groupStart: false },
    { id: "smallStraight", label: "МС", type: "input", groupStart: false },
    { id: "largeStraight", label: "БС", type: "input", groupStart: false },
    { id: "fullHouse", label: "Ф", type: "input", groupStart: false },
    { id: "fourKind", label: "К", type: "input", groupStart: false },
    { id: "poker", label: "П", type: "input", groupStart: false },
    { id: "chance", label: "М", type: "input", groupStart: false },
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
    version: "",
    gameId: "",
    isOnline: false,
    playerCount: 0,
    players: [],
    scores: {},
    gameStarted: false,
  };

  const versionScreen = document.getElementById("versionScreen");
  const introScreen = document.getElementById("introScreen");
  const onlineScreen = document.getElementById("onlineScreen");
  const setupScreen = document.getElementById("setupScreen");
  const playersScreen = document.getElementById("playersScreen");
  const gameScreen = document.getElementById("gameScreen");
  const app = document.querySelector(".app");
  const playerOptions = document.getElementById("playerOptions");
  const playerNameFields = document.getElementById("playerNameFields");
  const playersCountLabel = document.getElementById("playersCountLabel");
  const tableHead = document.getElementById("tableHead");
  const tableBody = document.getElementById("tableBody");
  const startBtn = document.getElementById("startBtn");
  const showOnlineBtn = document.getElementById("showOnlineBtn");
  const backToIntroBtn = document.getElementById("backToIntroBtn");
  const createOnlineGameBtn = document.getElementById("createOnlineGameBtn");
  const continueOnlineSetupBtn = document.getElementById("continueOnlineSetupBtn");
  const onlineShareBox = document.getElementById("onlineShareBox");
  const onlineShareLink = document.getElementById("onlineShareLink");
  const copyOnlineLinkBtn = document.getElementById("copyOnlineLinkBtn");
  const onlineStatus = document.getElementById("onlineStatus");
  const onlineGameBar = document.getElementById("onlineGameBar");
  const onlineGameLabel = document.getElementById("onlineGameLabel");
  const copyGameLinkBtn = document.getElementById("copyGameLinkBtn");
  const backToCountBtn = document.getElementById("backToCountBtn");
  const continueToGameBtn = document.getElementById("continueToGameBtn");
  const newGameBtn = document.getElementById("newGameBtn");
  const resetBtn = document.getElementById("resetBtn");
  const nameModal = document.getElementById("nameModal");
  const resetModal = document.getElementById("resetModal");
  const playerNameInput = document.getElementById("playerNameInput");
  const saveNameBtn = document.getElementById("saveNameBtn");
  const cancelNameBtn = document.getElementById("cancelNameBtn");
  const confirmResetBtn = document.getElementById("confirmResetBtn");
  const cancelResetBtn = document.getElementById("cancelResetBtn");
  const versionButtons = document.querySelectorAll(".version-btn");

  let editingPlayerIndex = null;
  let introSeen = false;
  let onlineSetupActive = false;
  let namesSetupActive = false;
  let realtimeChannel = null;
  let realtimeGameId = "";
  let isApplyingRemoteState = false;
  let syncTimer = null;

  initTelegram();
  createPlayerButtons();
  loadState();
  openGameFromUrl();
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
    state.gameStarted = false;
    namesSetupActive = true;

    for (let playerIndex = 0; playerIndex < playerCount; playerIndex += 1) {
      state.scores[playerIndex] = {};
      scoringIds.forEach((categoryId) => {
        state.scores[playerIndex][categoryId] = "";
      });
    }

    saveState();
    render();
    window.setTimeout(() => {
      playerNameFields.querySelector("input")?.focus();
    }, 0);
  }

  function render() {
    playersCountLabel.textContent = String(state.playerCount);
    document.documentElement.style.setProperty("--player-count", String(state.playerCount || 2));
    updateOnlineBar();

    if (!state.version) {
      versionScreen.classList.remove("hidden");
      introScreen.classList.add("hidden");
      onlineScreen.classList.add("hidden");
      setupScreen.classList.add("hidden");
      playersScreen.classList.add("hidden");
      gameScreen.classList.add("hidden");
      app.classList.remove("is-game-active");
      return;
    }

    if (onlineSetupActive) {
      versionScreen.classList.add("hidden");
      introScreen.classList.add("hidden");
      onlineScreen.classList.remove("hidden");
      setupScreen.classList.add("hidden");
      playersScreen.classList.add("hidden");
      gameScreen.classList.add("hidden");
      app.classList.remove("is-game-active");
      return;
    }

    if (!introSeen && !state.playerCount) {
      versionScreen.classList.add("hidden");
      introScreen.classList.remove("hidden");
      onlineScreen.classList.add("hidden");
      setupScreen.classList.add("hidden");
      playersScreen.classList.add("hidden");
      gameScreen.classList.add("hidden");
      app.classList.remove("is-game-active");
      return;
    }

    if (!state.playerCount) {
      versionScreen.classList.add("hidden");
      introScreen.classList.add("hidden");
      onlineScreen.classList.add("hidden");
      setupScreen.classList.remove("hidden");
      playersScreen.classList.add("hidden");
      gameScreen.classList.add("hidden");
      app.classList.remove("is-game-active");
      return;
    }

    if (namesSetupActive || !state.gameStarted) {
      versionScreen.classList.add("hidden");
      introScreen.classList.add("hidden");
      onlineScreen.classList.add("hidden");
      setupScreen.classList.add("hidden");
      playersScreen.classList.remove("hidden");
      gameScreen.classList.add("hidden");
      app.classList.remove("is-game-active");
      renderPlayerNameFields();
      return;
    }

    versionScreen.classList.add("hidden");
    introScreen.classList.add("hidden");
    onlineScreen.classList.add("hidden");
    setupScreen.classList.add("hidden");
    playersScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    app.classList.add("is-game-active");
    renderTable();
  }

  function chooseVersion(version) {
    state.version = version;
    saveState();
    render();
  }

  function showOnlineScreen() {
    onlineSetupActive = true;
    createOnlineGameBtn.classList.remove("hidden");
    continueOnlineSetupBtn.classList.add("hidden");
    onlineShareBox.classList.add("hidden");
    onlineShareLink.value = "";
    onlineStatus.textContent = supabaseClient
      ? ""
      : "Supabase не настроен. Заполните SUPABASE_URL и SUPABASE_ANON_KEY в script.js.";
    render();
  }

  function backToIntro() {
    onlineSetupActive = false;
    render();
  }

  async function createOnlineGame() {
    if (!supabaseClient) {
      onlineStatus.textContent = "Supabase не настроен. Онлайн-режим пока недоступен.";
      return;
    }

    state.gameId = generateGameId();
    state.isOnline = true;
    state.playerCount = 0;
    state.players = [];
    state.scores = {};
    state.gameStarted = false;
    namesSetupActive = false;

    onlineStatus.textContent = "Создаю онлайн-игру...";
    const ok = await syncOnlineState(true);

    if (!ok) {
      onlineStatus.textContent = "Не удалось создать онлайн-игру. Проверьте настройки Supabase.";
      return;
    }

    setGameUrl(state.gameId);
    showShareLink();
    onlineStatus.textContent = "Онлайн-игра создана.";
    introSeen = true;
    saveState();
    subscribeToOnlineGame();
    createOnlineGameBtn.classList.add("hidden");
    continueOnlineSetupBtn.classList.remove("hidden");
  }

  function continueOnlineSetup() {
    onlineSetupActive = false;
    introSeen = true;
    render();
  }

  function generateGameId() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let id = "";

    for (let index = 0; index < 8; index += 1) {
      id += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    return id;
  }

  function showShareLink() {
    if (!state.gameId) {
      return;
    }

    onlineShareLink.value = getGameUrl(state.gameId);
    onlineShareBox.classList.remove("hidden");
  }

  function updateOnlineBar() {
    const isOnlineGame = Boolean(state.isOnline && state.gameId);

    onlineGameBar.classList.toggle("hidden", !isOnlineGame);

    if (isOnlineGame) {
      onlineGameLabel.textContent = `Онлайн-игра ${state.gameId}`;
    }
  }

  async function copyOnlineLink() {
    const link = onlineShareLink.value || (state.gameId ? getGameUrl(state.gameId) : "");

    if (!link) {
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      onlineStatus.textContent = "Ссылка скопирована.";
    } catch (error) {
      onlineShareLink.select();
      onlineStatus.textContent = "Скопируйте ссылку вручную.";
    }
  }

  function getGameUrl(gameId) {
    const url = new URL(window.location.href);
    url.searchParams.set("game", gameId);
    return url.toString();
  }

  function setGameUrl(gameId) {
    const url = new URL(window.location.href);

    if (gameId) {
      url.searchParams.set("game", gameId);
    } else {
      url.searchParams.delete("game");
    }

    window.history.replaceState({}, "", url.toString());
  }

  async function openGameFromUrl() {
    const gameId = new URLSearchParams(window.location.search).get("game");

    if (!gameId) {
      return;
    }

    if (!supabaseClient) {
      state.gameId = gameId;
      state.isOnline = false;
      return;
    }

    await loadOnlineGame(gameId);
  }

  function renderPlayerNameFields() {
    playerNameFields.innerHTML = "";

    state.players.forEach((playerName, playerIndex) => {
      const field = document.createElement("label");
      const caption = document.createElement("span");
      const input = document.createElement("input");

      field.className = "player-name-field";
      caption.textContent = `Игрок ${playerIndex + 1}`;
      input.type = "text";
      input.maxLength = 24;
      input.autocomplete = "off";
      input.value = playerName;
      input.dataset.playerIndex = String(playerIndex);
      input.addEventListener("input", handleInitialNameInput);
      input.addEventListener("keydown", handleInitialNameKeydown);

      field.appendChild(caption);
      field.appendChild(input);
      playerNameFields.appendChild(field);
    });
  }

  function handleInitialNameInput(event) {
    const playerIndex = Number(event.target.dataset.playerIndex);
    state.players[playerIndex] = event.target.value;
    saveState();
  }

  function handleInitialNameKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      const inputs = Array.from(playerNameFields.querySelectorAll("input"));
      const currentIndex = inputs.indexOf(event.target);
      const nextInput = inputs[currentIndex + 1];

      if (nextInput) {
        nextInput.focus();
        nextInput.select();
        return;
      }

      continueToGame();
    }
  }

  function continueToGame() {
    state.players = state.players.map((playerName, index) => playerName.trim() || `Игрок ${index + 1}`);
    namesSetupActive = false;
    state.gameStarted = true;
    saveState();
    render();
  }

  function backToPlayerCount() {
    state.playerCount = 0;
    state.players = [];
    state.scores = {};
    state.gameStarted = false;
    namesSetupActive = false;
    saveState();
    render();
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

    if (state.version === "koro") {
      return sum < 0 ? sum - 50 : sum;
    }

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

    if (state.isOnline && state.gameId && !isApplyingRemoteState) {
      scheduleOnlineSync();
    }
  }

  function scheduleOnlineSync() {
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(() => {
      syncOnlineState();
    }, 250);
  }

  async function syncOnlineState(isInitialCreate = false) {
    if (!supabaseClient || !state.isOnline || !state.gameId) {
      return false;
    }

    const gameRow = {
      id: state.gameId,
      version: state.version,
      player_count: state.playerCount,
      game_started: state.gameStarted,
      updated_at: new Date().toISOString(),
    };

    const { error: gameError } = await supabaseClient.from("games").upsert(gameRow, { onConflict: "id" });

    if (gameError) {
      console.error(gameError);
      return false;
    }

    if (state.players.length) {
      const playerRows = state.players.map((name, playerIndex) => ({
        game_id: state.gameId,
        player_index: playerIndex,
        name: name || `Игрок ${playerIndex + 1}`,
      }));
      const { error: playersError } = await supabaseClient
        .from("players")
        .upsert(playerRows, { onConflict: "game_id,player_index" });

      if (playersError) {
        console.error(playersError);
        return false;
      }
    }

    const scoreRows = [];

    for (let playerIndex = 0; playerIndex < state.playerCount; playerIndex += 1) {
      scoringIds.forEach((categoryId) => {
        scoreRows.push({
          game_id: state.gameId,
          player_index: playerIndex,
          category_id: categoryId,
          value: getScoreValue(playerIndex, categoryId),
        });
      });
    }

    if (scoreRows.length) {
      const { error: scoresError } = await supabaseClient
        .from("scores")
        .upsert(scoreRows, { onConflict: "game_id,player_index,category_id" });

      if (scoresError) {
        console.error(scoresError);
        return false;
      }
    }

    if (!isInitialCreate) {
      onlineStatus.textContent = "Онлайн-игра синхронизирована.";
    }

    return true;
  }

  async function loadOnlineGame(gameId) {
    if (!supabaseClient) {
      return false;
    }

    const { data: game, error: gameError } = await supabaseClient.from("games").select("*").eq("id", gameId).single();

    if (gameError || !game) {
      console.error(gameError);
      onlineStatus.textContent = "Онлайн-игра не найдена.";
      return false;
    }

    const [{ data: players }, { data: scores }] = await Promise.all([
      supabaseClient.from("players").select("*").eq("game_id", gameId).order("player_index"),
      supabaseClient.from("scores").select("*").eq("game_id", gameId),
    ]);

    isApplyingRemoteState = true;
    state.gameId = game.id;
    state.isOnline = true;
    state.version = game.version || "kuzma";
    state.playerCount = Number(game.player_count) || 0;
    state.players = Array.from({ length: state.playerCount }, (_, index) => `Игрок ${index + 1}`);
    state.scores = {};
    state.gameStarted = Boolean(game.game_started);
    introSeen = true;
    onlineSetupActive = false;
    namesSetupActive = state.playerCount > 0 && !state.gameStarted;

    for (let playerIndex = 0; playerIndex < state.playerCount; playerIndex += 1) {
      state.scores[playerIndex] = {};
      scoringIds.forEach((categoryId) => {
        state.scores[playerIndex][categoryId] = "";
      });
    }

    (players || []).forEach((player) => {
      state.players[player.player_index] = player.name;
    });

    (scores || []).forEach((score) => {
      if (!state.scores[score.player_index]) {
        state.scores[score.player_index] = {};
      }

      state.scores[score.player_index][score.category_id] = score.value || "";
    });

    saveState();
    isApplyingRemoteState = false;
    subscribeToOnlineGame();
    render();
    return true;
  }

  function subscribeToOnlineGame() {
    if (!supabaseClient || !state.gameId) {
      return;
    }

    if (realtimeChannel && realtimeGameId === state.gameId) {
      return;
    }

    if (realtimeChannel) {
      supabaseClient.removeChannel(realtimeChannel);
    }

    realtimeGameId = state.gameId;
    realtimeChannel = supabaseClient
      .channel(`dice-poker-${state.gameId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games", filter: `id=eq.${state.gameId}` },
        () => loadOnlineGame(state.gameId)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `game_id=eq.${state.gameId}` },
        () => loadOnlineGame(state.gameId)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scores", filter: `game_id=eq.${state.gameId}` },
        () => loadOnlineGame(state.gameId)
      )
      .subscribe();
  }

  function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      if (!parsed) {
        return;
      }

      state.version = typeof parsed.version === "string" ? parsed.version : "";
      state.gameId = typeof parsed.gameId === "string" ? parsed.gameId : "";
      state.isOnline = Boolean(parsed.isOnline && state.gameId);
      state.playerCount = Number(parsed.playerCount) || 0;
      state.players = Array.isArray(parsed.players) ? parsed.players : [];
      state.scores = parsed.scores || {};
      state.gameStarted = typeof parsed.gameStarted === "boolean" ? parsed.gameStarted : true;

      if (state.playerCount) {
        normalizeScores();
      }
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

  function openResetModal() {
    resetModal.classList.remove("hidden");
  }

  function closeResetModal() {
    resetModal.classList.add("hidden");
  }

  function confirmResetGame() {
    closeResetModal();
    resetGame();
  }

  function newGame() {
    if (realtimeChannel && supabaseClient) {
      supabaseClient.removeChannel(realtimeChannel);
      realtimeChannel = null;
      realtimeGameId = "";
    }

    setGameUrl("");
    localStorage.removeItem(STORAGE_KEY);
    state.version = "";
    state.gameId = "";
    state.isOnline = false;
    state.playerCount = 0;
    state.players = [];
    state.scores = {};
    state.gameStarted = false;
    introSeen = false;
    onlineSetupActive = false;
    namesSetupActive = false;
    render();
  }

  startBtn.addEventListener("click", () => {
    introSeen = true;
    render();
  });
  showOnlineBtn.addEventListener("click", showOnlineScreen);
  backToIntroBtn.addEventListener("click", backToIntro);
  createOnlineGameBtn.addEventListener("click", createOnlineGame);
  continueOnlineSetupBtn.addEventListener("click", continueOnlineSetup);
  copyOnlineLinkBtn.addEventListener("click", copyOnlineLink);
  copyGameLinkBtn.addEventListener("click", copyOnlineLink);
  versionButtons.forEach((button) => {
    button.addEventListener("click", () => chooseVersion(button.dataset.version));
  });
  backToCountBtn.addEventListener("click", backToPlayerCount);
  continueToGameBtn.addEventListener("click", continueToGame);
  newGameBtn.addEventListener("click", newGame);
  resetBtn.addEventListener("click", openResetModal);
  saveNameBtn.addEventListener("click", savePlayerName);
  cancelNameBtn.addEventListener("click", closeNameModal);
  confirmResetBtn.addEventListener("click", confirmResetGame);
  cancelResetBtn.addEventListener("click", closeResetModal);

  nameModal.addEventListener("click", (event) => {
    if (event.target === nameModal) {
      closeNameModal();
    }
  });

  resetModal.addEventListener("click", (event) => {
    if (event.target === resetModal) {
      closeResetModal();
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
