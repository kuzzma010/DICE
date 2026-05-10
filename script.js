(function () {
  const STORAGE_KEY = "dicePokerTelegramAppState";
  const GUEST_ID_KEY = "dicePokerGuestId";
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
  const diceSymbols = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  const diceCategoryOptions = categories.filter((category) => category.type === "input");
  const MAX_DICE_ROLLS = 3;
  const upperDiceCategoryIds = ["ones", "twos", "threes", "fours", "fives", "sixes"];
  const faceByUpperDiceCategory = {
    ones: 1,
    twos: 2,
    threes: 3,
    fours: 4,
    fives: 5,
    sixes: 6,
  };

  const state = {
    version: "",
    gameId: "",
    isOnline: false,
    playerCount: 0,
    players: [],
    scores: {},
    gameStarted: false,
    currentTurnPlayerIndex: 0,
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
  const turnBar = document.getElementById("turnBar");
  const turnPlayerLabel = document.getElementById("turnPlayerLabel");
  const turnStatusLabel = document.getElementById("turnStatusLabel");
  const onlineDiceViewer = document.getElementById("onlineDiceViewer");
  const onlineDicePlayer = document.getElementById("onlineDicePlayer");
  const onlineDiceRoll = document.getElementById("onlineDiceRoll");
  const onlineDiceValues = document.getElementById("onlineDiceValues");
  const onlineDiceMode = document.getElementById("onlineDiceMode");
  const backToCountBtn = document.getElementById("backToCountBtn");
  const continueToGameBtn = document.getElementById("continueToGameBtn");
  const newGameBtn = document.getElementById("newGameBtn");
  const resetBtn = document.getElementById("resetBtn");
  const openDiceBtn = document.getElementById("openDiceBtn");
  const nameModal = document.getElementById("nameModal");
  const resetModal = document.getElementById("resetModal");
  const diceModal = document.getElementById("diceModal");
  const playerNameInput = document.getElementById("playerNameInput");
  const saveNameBtn = document.getElementById("saveNameBtn");
  const cancelNameBtn = document.getElementById("cancelNameBtn");
  const confirmResetBtn = document.getElementById("confirmResetBtn");
  const cancelResetBtn = document.getElementById("cancelResetBtn");
  const closeDiceBtn = document.getElementById("closeDiceBtn");
  const rollDiceBtn = document.getElementById("rollDiceBtn");
  const rerollDiceBtn = document.getElementById("rerollDiceBtn");
  const writeDiceBtn = document.getElementById("writeDiceBtn");
  const confirmDiceWriteBtn = document.getElementById("confirmDiceWriteBtn");
  const diceSet = document.getElementById("diceSet");
  const diceRollCounter = document.getElementById("diceRollCounter");
  const diceActivePlayerSelect = document.getElementById("diceActivePlayerSelect");
  const diceHint = document.getElementById("diceHint");
  const diceValues = document.getElementById("diceValues");
  const diceSum = document.getElementById("diceSum");
  const diceCombo = document.getElementById("diceCombo");
  const diceWritePanel = document.getElementById("diceWritePanel");
  const dicePlayerSelect = document.getElementById("dicePlayerSelect");
  const diceCategorySelect = document.getElementById("diceCategorySelect");
  const diceBaseScore = document.getElementById("diceBaseScore");
  const diceDoubleBonus = document.getElementById("diceDoubleBonus");
  const diceFinalScore = document.getElementById("diceFinalScore");
  const versionButtons = document.querySelectorAll(".version-btn");

  let editingPlayerIndex = null;
  let introSeen = false;
  let onlineSetupActive = false;
  let namesSetupActive = false;
  let realtimeChannel = null;
  let realtimeGameId = "";
  let isApplyingRemoteState = false;
  let isPollingOnlineState = false;
  let syncTimer = null;
  let pollTimer = null;
  let lastLocalScoreEditAt = 0;
  let hasPendingScoreEdit = false;
  let isCommittingScoreEdit = false;
  let onlineDiceState = null;
  const localClientId = getLocalClientId();
  let localPlayerIndex = null;
  const diceState = {
    values: [0, 0, 0, 0, 0],
    firstRollFlags: [false, false, false, false, false],
    rerollSelected: [false, false, false, false, false],
    rollCount: 0,
    isRolling: false,
  };

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

  function getLocalClientId() {
    const telegramUserId = tg?.initDataUnsafe?.user?.id;

    if (telegramUserId) {
      return `tg:${telegramUserId}`;
    }

    const savedGuestId = localStorage.getItem(GUEST_ID_KEY);

    if (savedGuestId) {
      return savedGuestId;
    }

    const generatedGuestId = `guest:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(GUEST_ID_KEY, generatedGuestId);
    return generatedGuestId;
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
    state.currentTurnPlayerIndex = 0;
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
    updateTurnUi();
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
    state.currentTurnPlayerIndex = 0;
    namesSetupActive = false;

    onlineStatus.textContent = "Создаю онлайн-игру...";
    const ok = await syncOnlineState(true);

    if (!ok) {
      if (!onlineStatus.textContent.startsWith("Ошибка Supabase")) {
        onlineStatus.textContent = "Не удалось создать онлайн-игру. Проверьте настройки Supabase.";
      }
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
    turnBar.classList.toggle("hidden", !isOnlineGame || !state.gameStarted || !state.playerCount);

    if (isOnlineGame) {
      onlineGameLabel.textContent = `Онлайн-игра ${state.gameId}`;
    }

    updateTurnUi();
  }

  function getCurrentTurnPlayerIndex() {
    const index = Number(state.currentTurnPlayerIndex) || 0;
    return state.playerCount ? Math.min(Math.max(index, 0), state.playerCount - 1) : 0;
  }

  function getCurrentTurnPlayerName() {
    const index = getCurrentTurnPlayerIndex();
    return state.players[index] || `Игрок ${index + 1}`;
  }

  function isMyOnlineTurn() {
    return !state.isOnline || !state.gameId || Number(localPlayerIndex) === getCurrentTurnPlayerIndex();
  }

  function getPlayerBindingKey(gameId = state.gameId) {
    return gameId ? `${STORAGE_KEY}:player:${gameId}` : "";
  }

  function bindLocalPlayer(playerIndex) {
    if (!state.isOnline || !state.gameId || !Number.isInteger(Number(playerIndex))) {
      return;
    }

    localPlayerIndex = Number(playerIndex);
    localStorage.setItem(getPlayerBindingKey(), String(localPlayerIndex));
    claimOnlinePlayer(localPlayerIndex);
  }

  async function claimOnlinePlayer(playerIndex) {
    if (!supabaseClient || !state.isOnline || !state.gameId || !Number.isInteger(Number(playerIndex))) {
      return false;
    }

    const { error } = await supabaseClient
      .from("players")
      .update({ client_id: localClientId })
      .eq("game_id", state.gameId)
      .eq("player_index", Number(playerIndex));

    if (error) {
      console.error(error);
      return false;
    }

    return true;
  }

  function resolveLocalPlayerIndex(players = []) {
    const savedBinding = Number(localStorage.getItem(getPlayerBindingKey()));

    if (Number.isInteger(savedBinding) && savedBinding >= 0 && savedBinding < state.playerCount) {
      localPlayerIndex = savedBinding;
      return savedBinding;
    }

    const ownedPlayer = players.find((player) => player.client_id === localClientId);

    if (ownedPlayer) {
      bindLocalPlayer(Number(ownedPlayer.player_index));
      return Number(ownedPlayer.player_index);
    }

    const freePlayer = players.find((player) => !player.client_id);

    if (freePlayer) {
      bindLocalPlayer(Number(freePlayer.player_index));
      return Number(freePlayer.player_index);
    }

    localPlayerIndex = null;
    return null;
  }

  function updateTurnUi() {
    const isOnlineGame = Boolean(state.isOnline && state.gameId);
    const currentTurnName = getCurrentTurnPlayerName();
    const isMyTurn = isMyOnlineTurn();

    if (isOnlineGame && state.gameStarted && state.playerCount) {
      turnPlayerLabel.textContent = `Сейчас ход: ${currentTurnName}`;
      turnStatusLabel.textContent = isMyTurn ? "Ваш ход" : `Ожидайте ход игрока ${currentTurnName}`;
    }

    openDiceBtn.disabled = Boolean(isOnlineGame && state.gameStarted && !isMyTurn);
    openDiceBtn.title = isOnlineGame && state.gameStarted && !isMyTurn ? `Сейчас ход: ${currentTurnName}` : "";
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
    state.currentTurnPlayerIndex = getCurrentTurnPlayerIndex();
    bindLocalPlayer(0);
    saveState();
    render();
  }

  function backToPlayerCount() {
    state.playerCount = 0;
    state.players = [];
    state.scores = {};
    state.gameStarted = false;
    state.currentTurnPlayerIndex = 0;
    localPlayerIndex = null;
    namesSetupActive = false;
    saveState();
    render();
  }

  function openDiceModal() {
    if (!isMyOnlineTurn()) {
      updateTurnUi();
      return;
    }

    resetDiceState();
    populateDiceWriteOptions();
    diceModal.classList.remove("hidden");
    renderDicePanel();
    syncOnlineDiceState();
  }

  function closeDiceModal() {
    diceModal.classList.add("hidden");
    resetDiceState();
    renderDicePanel();
    clearOnlineDiceState();
  }

  function resetDiceState() {
    diceState.values = [0, 0, 0, 0, 0];
    diceState.firstRollFlags = [false, false, false, false, false];
    diceState.rerollSelected = [false, false, false, false, false];
    diceState.rollCount = 0;
    diceState.isRolling = false;
    diceWritePanel.classList.add("hidden");
  }

  function renderDicePanel() {
    diceSet.innerHTML = "";
    const canControlDice = isMyOnlineTurn();

    diceState.values.forEach((value, index) => {
      const button = document.createElement("button");
      const label = document.createElement("span");

      button.type = "button";
      button.className = "die-btn";
      button.disabled = !canControlDice || diceState.rollCount === 0 || diceState.rollCount >= MAX_DICE_ROLLS || diceState.isRolling;
      button.dataset.index = String(index);
      button.setAttribute("aria-pressed", String(diceState.rerollSelected[index]));
      button.addEventListener("click", () => toggleDieSelection(index));

      if (diceState.rerollSelected[index]) {
        button.classList.add("is-selected");
      }

      if (diceState.isRolling) {
        button.classList.add("is-rolling");
      }

      button.textContent = value ? diceSymbols[value] : "🎲";
      label.textContent = diceState.rerollSelected[index] ? "Перекинуть" : "Оставить";
      button.appendChild(label);
      diceSet.appendChild(button);
    });

    const hasRoll = diceState.rollCount > 0;
    const hasSelectedDice = diceState.rerollSelected.some(Boolean);
    const analysis = analyzeDice(diceState.values);

    diceRollCounter.textContent = `Бросок ${diceState.rollCount} из ${MAX_DICE_ROLLS}`;
    diceValues.textContent = hasRoll ? diceState.values.join(", ") : "-";
    diceSum.textContent = String(hasRoll ? analysis.sum : 0);
    diceCombo.textContent = hasRoll ? analysis.combo : "-";

    rollDiceBtn.classList.toggle("hidden", hasRoll);
    rerollDiceBtn.classList.toggle("hidden", !hasRoll);
    writeDiceBtn.classList.toggle("hidden", !hasRoll);
    rollDiceBtn.disabled = !canControlDice || diceState.isRolling;
    rerollDiceBtn.disabled = !canControlDice || !hasRoll || diceState.rollCount >= MAX_DICE_ROLLS || !hasSelectedDice || diceState.isRolling;
    writeDiceBtn.disabled = !canControlDice || !hasRoll || diceState.isRolling;

    if (!canControlDice) {
      diceHint.textContent = `Сейчас ход: ${getCurrentTurnPlayerName()}`;
    } else if (!hasRoll) {
      diceHint.textContent = "Нажмите “Бросить”, чтобы начать ход.";
    } else if (diceState.rollCount >= MAX_DICE_ROLLS) {
      diceHint.textContent = "Броски закончились — запишите результат.";
    } else if (!hasSelectedDice) {
      diceHint.textContent = "Выберите кости для переброса или запишите результат.";
    } else {
      diceHint.textContent = "Выбранные кости будут перекинуты.";
    }
  }

  function toggleDieSelection(index) {
    if (!isMyOnlineTurn()) {
      return;
    }

    if (diceState.rollCount === 0 || diceState.rollCount >= MAX_DICE_ROLLS || diceState.isRolling) {
      return;
    }

    diceState.rerollSelected[index] = !diceState.rerollSelected[index];
    renderDicePanel();
    syncOnlineDiceState();
  }

  function rollDice() {
    if (!isMyOnlineTurn()) {
      return;
    }

    if (diceState.rollCount > 0 || diceState.isRolling) {
      return;
    }

    performDiceRoll([true, true, true, true, true]);
  }

  function rerollSelectedDice() {
    if (!isMyOnlineTurn()) {
      return;
    }

    if (diceState.rollCount === 0 || diceState.rollCount >= MAX_DICE_ROLLS || diceState.isRolling) {
      return;
    }

    if (!diceState.rerollSelected.some(Boolean)) {
      diceHint.textContent = "Выберите хотя бы одну кость для переброса.";
      return;
    }

    performDiceRoll(diceState.rerollSelected);
  }

  function performDiceRoll(rollMask) {
    if (!isMyOnlineTurn()) {
      return;
    }

    if (diceState.rollCount >= MAX_DICE_ROLLS) {
      return;
    }

    diceState.isRolling = true;
    renderDicePanel();

    window.setTimeout(() => {
      const isFirstRoll = diceState.rollCount === 0;
      diceState.values = diceState.values.map((value, index) => (rollMask[index] ? randomDieValue() : value));
      diceState.firstRollFlags = diceState.firstRollFlags.map((isFirst, index) =>
        rollMask[index] ? isFirstRoll : isFirst
      );
      diceState.rerollSelected = [false, false, false, false, false];
      diceState.rollCount += 1;
      diceState.isRolling = false;
      diceWritePanel.classList.add("hidden");
      renderDicePanel();
      syncOnlineDiceState();
    }, 260);
  }

  function randomDieValue() {
    return Math.floor(Math.random() * 6) + 1;
  }

  function getDiceActivePlayerIndex() {
    if (state.isOnline && state.gameId && state.playerCount) {
      return getCurrentTurnPlayerIndex();
    }

    const index = Number(diceActivePlayerSelect.value || dicePlayerSelect.value || 0);
    return Number.isInteger(index) && index >= 0 ? index : 0;
  }

  function syncDicePlayerSelects(sourceSelect) {
    const value = sourceSelect.value;

    if (diceActivePlayerSelect.value !== value) {
      diceActivePlayerSelect.value = value;
    }

    if (dicePlayerSelect.value !== value) {
      dicePlayerSelect.value = value;
    }

    syncOnlineDiceState();
  }

  async function syncOnlineDiceState() {
    if (!supabaseClient || !state.isOnline || !state.gameId) {
      return false;
    }

    const row = {
      game_id: state.gameId,
      active_player_index: getDiceActivePlayerIndex(),
      dice_values: diceState.rollCount > 0 ? diceState.values : [],
      reroll_selected: diceState.rollCount > 0 ? diceState.rerollSelected : [],
      roll_count: diceState.rollCount,
      updated_at: new Date().toISOString(),
    };

    onlineDiceState = row;
    renderOnlineDiceViewer();

    const { error } = await supabaseClient.from("dice_state").upsert(row, { onConflict: "game_id" });

    if (error) {
      console.error(error);
      onlineStatus.textContent = `Ошибка Supabase dice_state: ${error.message || error.code || "нет доступа"}`;
      return false;
    }

    return true;
  }

  async function clearOnlineDiceState() {
    if (!supabaseClient || !state.isOnline || !state.gameId) {
      return false;
    }

    onlineDiceState = null;
    renderOnlineDiceViewer();

    const { error } = await supabaseClient.from("dice_state").delete().eq("game_id", state.gameId);

    if (error) {
      console.error(error);
      onlineStatus.textContent = `Ошибка Supabase dice_state: ${error.message || error.code || "нет доступа"}`;
      return false;
    }

    return true;
  }

  async function loadOnlineDiceState(gameId) {
    if (!supabaseClient || !gameId) {
      return false;
    }

    const { data, error } = await supabaseClient.from("dice_state").select("*").eq("game_id", gameId).maybeSingle();

    if (error) {
      console.error(error);
      onlineStatus.textContent = `Ошибка Supabase dice_state: ${error.message || error.code || "нет доступа"}`;
      return false;
    }

    onlineDiceState = data || null;
    renderOnlineDiceViewer();
    return true;
  }

  function renderOnlineDiceViewer() {
    const values = Array.isArray(onlineDiceState?.dice_values) ? onlineDiceState.dice_values : [];
    const selected = Array.isArray(onlineDiceState?.reroll_selected) ? onlineDiceState.reroll_selected : [];
    const rollCount = Number(onlineDiceState?.roll_count) || 0;

    if (!state.isOnline || !values.some(Boolean) || rollCount <= 0) {
      onlineDiceViewer.classList.add("hidden");
      onlineDiceValues.innerHTML = "";
      return;
    }

    const activePlayerIndex = Number(onlineDiceState.active_player_index);
    const playerName = state.players[activePlayerIndex] || `Игрок ${activePlayerIndex + 1}`;
    const rerollPositions = selected
      .map((isSelected, index) => (isSelected ? index + 1 : null))
      .filter(Boolean);

    onlineDicePlayer.textContent = `${playerName} бросает кости`;
    onlineDiceRoll.textContent = `Бросок ${rollCount} из ${MAX_DICE_ROLLS}`;
    onlineDiceMode.textContent = rerollPositions.length
      ? `Перекинуть: ${rerollPositions.join(", ")}. Остальные оставить.`
      : "Все кости оставлены.";
    onlineDiceValues.innerHTML = "";

    values.forEach((value, index) => {
      const die = document.createElement("span");
      die.textContent = diceSymbols[value] || "🎲";

      if (selected[index]) {
        die.classList.add("is-reroll");
        die.title = "Перекинуть";
      } else {
        die.title = "Оставить";
      }

      onlineDiceValues.appendChild(die);
    });

    onlineDiceViewer.classList.remove("hidden");
  }

  function analyzeDice(values) {
    const activeValues = values.filter(Boolean);
    const sum = activeValues.reduce((total, value) => total + value, 0);
    const counts = new Map();

    activeValues.forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });

    const countValues = Array.from(counts.values()).sort((a, b) => b - a);
    const unique = Array.from(counts.keys()).sort((a, b) => a - b).join("");
    let combo = "мусор";

    if (countValues[0] === 5) {
      combo = "покер";
    } else if (countValues[0] === 4) {
      combo = "каре";
    } else if (countValues[0] === 3 && countValues[1] === 2) {
      combo = "фулл-хаус";
    } else if (unique === "12345" || unique === "23456") {
      combo = "большой стрит";
    } else if (hasSmallStraight(counts)) {
      combo = "малый стрит";
    } else if (countValues[0] === 3) {
      combo = "сет";
    } else if (countValues[0] === 2 && countValues[1] === 2) {
      combo = "две пары";
    } else if (countValues[0] === 2) {
      combo = "пара";
    }

    return { sum, combo };
  }

  function hasSmallStraight(counts) {
    const straights = [
      [1, 2, 3, 4],
      [2, 3, 4, 5],
      [3, 4, 5, 6],
    ];

    return straights.some((straight) => straight.every((value) => counts.has(value)));
  }

  function calculateUpperDiceCategoryScore(categoryId, byValue) {
    const face = faceByUpperDiceCategory[categoryId];
    const count = (byValue.get(face) || []).length;

    if (count === 0) {
      return { base: 0, final: 0, hasDouble: false, isUnavailable: true };
    }

    const multiplierByCount = {
      1: -2,
      2: -1,
      3: 0,
      4: 1,
      5: 2,
    };
    const value = multiplierByCount[count] * face;

    return { base: value, final: value, hasDouble: false, isUnavailable: false };
  }

  function calculateDiceCategoryScore(categoryId) {
    const values = diceState.values;
    const byValue = new Map();

    values.forEach((value, index) => {
      if (!value) {
        return;
      }

      if (!byValue.has(value)) {
        byValue.set(value, []);
      }

      byValue.get(value).push(index);
    });

    if (isUpperDiceCategory(categoryId)) {
      return calculateUpperDiceCategoryScore(categoryId, byValue);
    }

    const candidates = [];
    const faces = Array.from(byValue.keys()).sort((a, b) => b - a);

    if (categoryId === "pair") {
      faces.forEach((face) => addSameFaceCandidates(candidates, byValue.get(face), 2));
    } else if (categoryId === "twoPairs") {
      for (let first = 0; first < faces.length; first += 1) {
        for (let second = first + 1; second < faces.length; second += 1) {
          const firstPair = pickDiceIndices(byValue.get(faces[first]), 2);
          const secondPair = pickDiceIndices(byValue.get(faces[second]), 2);

          if (firstPair.length === 2 && secondPair.length === 2) {
            candidates.push(makeDiceScore([...firstPair, ...secondPair]));
          }
        }
      }
    } else if (categoryId === "set") {
      faces.forEach((face) => addSameFaceCandidates(candidates, byValue.get(face), 3));
    } else if (categoryId === "smallStraight") {
      addStraightCandidates(candidates, byValue, [
        [1, 2, 3, 4],
        [2, 3, 4, 5],
        [3, 4, 5, 6],
      ]);
    } else if (categoryId === "largeStraight") {
      addStraightCandidates(candidates, byValue, [
        [1, 2, 3, 4, 5],
        [2, 3, 4, 5, 6],
      ]);
    } else if (categoryId === "fullHouse") {
      faces.forEach((tripleFace) => {
        faces.forEach((pairFace) => {
          if (tripleFace === pairFace) {
            return;
          }

          const triple = pickDiceIndices(byValue.get(tripleFace), 3);
          const pair = pickDiceIndices(byValue.get(pairFace), 2);

          if (triple.length === 3 && pair.length === 2) {
            candidates.push(makeDiceScore([...triple, ...pair]));
          }
        });
      });
    } else if (categoryId === "fourKind") {
      faces.forEach((face) => addSameFaceCandidates(candidates, byValue.get(face), 4));
    } else if (categoryId === "poker") {
      faces.forEach((face) => addSameFaceCandidates(candidates, byValue.get(face), 5));
    } else if (categoryId === "chance") {
      candidates.push(makeDiceScore(values.map((value, index) => (value ? index : null)).filter((index) => index !== null)));
    }

    return pickBestDiceScore(candidates);
  }

  function addSameFaceCandidates(candidates, indices = [], amount) {
    const picked = pickDiceIndices(indices, amount);

    if (picked.length === amount) {
      candidates.push(makeDiceScore(picked));
    }

    const firstRollPicked = indices.filter((index) => diceState.firstRollFlags[index]).slice(0, amount);

    if (firstRollPicked.length === amount) {
      candidates.push(makeDiceScore(firstRollPicked));
    }
  }

  function addStraightCandidates(candidates, byValue, straights) {
    straights.forEach((straight) => {
      if (!straight.every((face) => byValue.has(face))) {
        return;
      }

      candidates.push(makeDiceScore(straight.map((face) => pickDiceIndices(byValue.get(face), 1)[0])));

      const firstRollIndices = straight.map((face) =>
        (byValue.get(face) || []).find((index) => diceState.firstRollFlags[index])
      );

      if (firstRollIndices.every((index) => typeof index === "number")) {
        candidates.push(makeDiceScore(firstRollIndices));
      }
    });
  }

  function pickDiceIndices(indices = [], amount) {
    return indices.slice(0, amount);
  }

  function makeDiceScore(indices, options = {}) {
    const allowDouble = options.allowDouble !== false;
    const base = indices.reduce((sum, index) => sum + diceState.values[index], 0);
    const hasDouble =
      allowDouble && base > 0 && indices.length > 0 && indices.every((index) => diceState.firstRollFlags[index]);

    return {
      base,
      final: hasDouble ? base * 2 : base,
      hasDouble,
    };
  }

  function pickBestDiceScore(candidates) {
    if (!candidates.length) {
      return { base: 0, final: 0, hasDouble: false };
    }

    return candidates.reduce((best, candidate) => {
      if (candidate.final > best.final) {
        return candidate;
      }

      if (candidate.final === best.final && candidate.base > best.base) {
        return candidate;
      }

      return best;
    });
  }

  function showDiceWritePanel() {
    if (!isMyOnlineTurn()) {
      diceHint.textContent = `Сейчас ход: ${getCurrentTurnPlayerName()}`;
      return;
    }

    if (diceState.rollCount === 0) {
      return;
    }

    populateDiceWriteOptions();
    updateDiceScorePreview();
    diceWritePanel.classList.remove("hidden");

    if (diceState.rollCount < MAX_DICE_ROLLS) {
      diceHint.textContent = "Комбинации можно записывать только после 3-го броска";
    }
  }

  function populateDiceWriteOptions() {
    const previousActivePlayer = diceActivePlayerSelect.value;
    dicePlayerSelect.innerHTML = "";
    diceActivePlayerSelect.innerHTML = "";
    diceCategorySelect.innerHTML = "";

    state.players.forEach((playerName, playerIndex) => {
      const option = document.createElement("option");
      option.value = String(playerIndex);
      option.textContent = playerName || `Игрок ${playerIndex + 1}`;
      dicePlayerSelect.appendChild(option);
      diceActivePlayerSelect.appendChild(option.cloneNode(true));
    });

    if (previousActivePlayer && Array.from(diceActivePlayerSelect.options).some((option) => option.value === previousActivePlayer)) {
      diceActivePlayerSelect.value = previousActivePlayer;
      dicePlayerSelect.value = previousActivePlayer;
    }

    if (state.isOnline && state.gameId && state.playerCount) {
      const turnIndex = String(getCurrentTurnPlayerIndex());
      diceActivePlayerSelect.value = turnIndex;
      dicePlayerSelect.value = turnIndex;
      diceActivePlayerSelect.disabled = true;
      dicePlayerSelect.disabled = true;
    } else {
      diceActivePlayerSelect.disabled = false;
      dicePlayerSelect.disabled = false;
    }

    diceCategoryOptions.forEach((category) => {
      const option = document.createElement("option");
      const isLocked = isDiceCombinationCategoryLocked(category.id);
      const isUnavailableUpperCategory = isUpperDiceCategoryUnavailable(category.id);
      option.value = category.id;
      option.disabled = isLocked || isUnavailableUpperCategory;
      option.textContent = getDiceCategoryOptionLabel(category, isLocked, isUnavailableUpperCategory);
      diceCategorySelect.appendChild(option);
    });

    if (isDiceCombinationCategoryLocked(diceCategorySelect.value) || isUpperDiceCategoryUnavailable(diceCategorySelect.value)) {
      const firstAvailableOption = Array.from(diceCategorySelect.options).find((option) => !option.disabled);

      if (firstAvailableOption) {
        diceCategorySelect.value = firstAvailableOption.value;
      }
    }
  }

  function updateDiceScorePreview() {
    const score = calculateDiceCategoryScore(diceCategorySelect.value);

    diceBaseScore.textContent = String(score.base);
    diceDoubleBonus.textContent = score.hasDouble ? "x2 за первый бросок" : "нет";
    diceFinalScore.textContent = String(score.final);
  }

  function isUpperDiceCategory(categoryId) {
    return upperDiceCategoryIds.includes(categoryId);
  }

  function isDiceCombinationCategoryLocked(categoryId) {
    return !isUpperDiceCategory(categoryId) && diceState.rollCount < MAX_DICE_ROLLS;
  }

  function isUpperDiceCategoryUnavailable(categoryId) {
    if (!isUpperDiceCategory(categoryId)) {
      return false;
    }

    return diceState.values.filter((value) => value === faceByUpperDiceCategory[categoryId]).length === 0;
  }

  function getDiceCategoryOptionLabel(category, isLocked, isUnavailableUpperCategory) {
    if (isUnavailableUpperCategory) {
      return `${category.label} — нет такого кубика`;
    }

    if (isLocked) {
      return `${category.label} — доступно после 3-го броска`;
    }

    return category.label;
  }

  async function writeDiceResult() {
    if (!isMyOnlineTurn()) {
      diceHint.textContent = `Сейчас ход: ${getCurrentTurnPlayerName()}`;
      return;
    }

    if (diceState.rollCount === 0) {
      return;
    }

    const playerIndex = Number(dicePlayerSelect.value);
    const categoryId = diceCategorySelect.value;

    if (isDiceCombinationCategoryLocked(categoryId)) {
      diceHint.textContent = "Комбинации можно записывать только после 3-го броска";
      return;
    }

    const score = calculateDiceCategoryScore(categoryId);

    if (score.isUnavailable) {
      diceHint.textContent = "Нет такого кубика";
      return;
    }

    const result = score.final;

    if (!state.scores[playerIndex]) {
      state.scores[playerIndex] = {};
    }

    state.scores[playerIndex][categoryId] = String(result);
    hasPendingScoreEdit = false;
    lastLocalScoreEditAt = Date.now();
    advanceTurnLocally();
    renderTable();

    if (!state.isOnline || !state.gameId) {
      saveState();
      closeDiceModal();
      return;
    }

    window.clearTimeout(syncTimer);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    isCommittingScoreEdit = true;

    try {
      const ok = await syncOnlineState();

      if (ok) {
        await clearOnlineDiceState();
        await loadOnlineGame(state.gameId, { force: true });
      }
    } finally {
      isCommittingScoreEdit = false;
      closeDiceModal();
    }
  }

  function advanceTurnLocally() {
    if (!state.isOnline || !state.gameId || !state.playerCount) {
      return;
    }

    state.currentTurnPlayerIndex = (getCurrentTurnPlayerIndex() + 1) % state.playerCount;
    resetDiceState();
    updateTurnUi();
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
          input.addEventListener("blur", handleScoreBlur);
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
    lastLocalScoreEditAt = Date.now();
    hasPendingScoreEdit = true;
    state.scores[playerIndex][categoryId] = cleanValue;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateTotalsOnly();
  }

  function handleScoreBeforeInput(event) {
    if (event.inputType === "insertLineBreak") {
      event.preventDefault();
      commitScoreInput(event.target);
    }
  }

  function handleScoreKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitScoreInput(event.target);
    }
  }

  function handleScoreBlur(event) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    if (hasPendingScoreEdit && !isCommittingScoreEdit) {
      commitScoreInput(event.target);
    }
  }

  async function commitScoreInput(input) {
    if (isCommittingScoreEdit) {
      return;
    }

    isCommittingScoreEdit = true;
    input.blur();

    if (!state.isOnline || !state.gameId) {
      hasPendingScoreEdit = false;
      saveState();
      isCommittingScoreEdit = false;
      return;
    }

    window.clearTimeout(syncTimer);
    try {
      const ok = await syncOnlineState();

      if (ok) {
        hasPendingScoreEdit = false;
        window.setTimeout(() => loadOnlineGame(state.gameId, { force: true }), 500);
      }
    } finally {
      isCommittingScoreEdit = false;
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
    }, 900);
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
      current_turn_player_index: getCurrentTurnPlayerIndex(),
      updated_at: new Date().toISOString(),
    };

    const { error: gameError } = await supabaseClient.from("games").upsert(gameRow, { onConflict: "id" });

    if (gameError) {
      console.error(gameError);
      onlineStatus.textContent = `Ошибка Supabase games: ${gameError.message || gameError.code || "нет доступа"}`;
      return false;
    }

    if (state.players.length) {
      const playerRows = state.players.map((name, playerIndex) => ({
        game_id: state.gameId,
        player_index: playerIndex,
        name: name || `Игрок ${playerIndex + 1}`,
        client_id: playerIndex === localPlayerIndex ? localClientId : undefined,
      }));
      const { error: playersError } = await supabaseClient
        .from("players")
        .upsert(playerRows, { onConflict: "game_id,player_index" });

      if (playersError) {
        console.error(playersError);
        onlineStatus.textContent = `Ошибка Supabase players: ${playersError.message || playersError.code || "нет доступа"}`;
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
        onlineStatus.textContent = `Ошибка Supabase scores: ${scoresError.message || scoresError.code || "нет доступа"}`;
        return false;
      }
    }

    if (!isInitialCreate) {
      onlineStatus.textContent = "Онлайн-игра синхронизирована.";
    }

    startOnlinePolling();

    return true;
  }

  async function loadOnlineGame(gameId, options = {}) {
    if (!supabaseClient) {
      return false;
    }

    if (
      document.activeElement &&
      (document.activeElement.classList.contains("score-input") || playerNameFields.contains(document.activeElement)) &&
      !options.force
    ) {
      return false;
    }

    if (!options.force && (isCommittingScoreEdit || Date.now() - lastLocalScoreEditAt < 1500)) {
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
    state.currentTurnPlayerIndex = Number(game.current_turn_player_index) || 0;
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

    resolveLocalPlayerIndex(players || []);

    (scores || []).forEach((score) => {
      if (!state.scores[score.player_index]) {
        state.scores[score.player_index] = {};
      }

      state.scores[score.player_index][score.category_id] = score.value || "";
    });

    saveState();
    isApplyingRemoteState = false;
    subscribeToOnlineGame();
    startOnlinePolling();
    loadOnlineDiceState(state.gameId);
    render();

    if (!diceModal.classList.contains("hidden")) {
      renderDicePanel();
    }

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
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dice_state", filter: `game_id=eq.${state.gameId}` },
        () => loadOnlineDiceState(state.gameId)
      )
      .subscribe();

    startOnlinePolling();
  }

  function startOnlinePolling() {
    if (!supabaseClient || !state.isOnline || !state.gameId || pollTimer) {
      return;
    }

    pollTimer = window.setInterval(() => {
      if (!state.isOnline || !state.gameId || isApplyingRemoteState || isPollingOnlineState) {
        return;
      }

      isPollingOnlineState = true;
      loadOnlineGame(state.gameId)
        .then(() => loadOnlineDiceState(state.gameId))
        .catch((error) => console.error(error))
        .finally(() => {
          isPollingOnlineState = false;
        });
    }, 2500);
  }

  function stopOnlinePolling() {
    if (pollTimer) {
      window.clearInterval(pollTimer);
      pollTimer = null;
    }
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
      state.currentTurnPlayerIndex = Number(parsed.currentTurnPlayerIndex) || 0;
      localPlayerIndex = Number(localStorage.getItem(getPlayerBindingKey()));

      if (!Number.isInteger(localPlayerIndex) || localPlayerIndex < 0) {
        localPlayerIndex = null;
      }

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

    state.currentTurnPlayerIndex = 0;
    resetDiceState();
    clearOnlineDiceState();
    saveState();
    renderTable();
    updateTurnUi();
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
    clearOnlineDiceState();
    stopOnlinePolling();

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
    state.currentTurnPlayerIndex = 0;
    localPlayerIndex = null;
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
  openDiceBtn.addEventListener("click", openDiceModal);
  closeDiceBtn.addEventListener("click", closeDiceModal);
  rollDiceBtn.addEventListener("click", rollDice);
  rerollDiceBtn.addEventListener("click", rerollSelectedDice);
  writeDiceBtn.addEventListener("click", showDiceWritePanel);
  diceCategorySelect.addEventListener("change", updateDiceScorePreview);
  diceActivePlayerSelect.addEventListener("change", () => syncDicePlayerSelects(diceActivePlayerSelect));
  dicePlayerSelect.addEventListener("change", () => syncDicePlayerSelects(dicePlayerSelect));
  confirmDiceWriteBtn.addEventListener("click", writeDiceResult);
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

  diceModal.addEventListener("click", (event) => {
    if (event.target === diceModal) {
      closeDiceModal();
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
