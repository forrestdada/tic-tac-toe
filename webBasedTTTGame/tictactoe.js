
//第一部分
"use strict";

window.addEventListener("load", handleRunGame);

//====================================
//Define relevant variables and data

//about game setting
let isAI;
let sizeSelect = document.getElementById("board-size");
let sizeSelectIndex = sizeSelect.selectedIndex;
let modeSelect = document.getElementById("game-mode");
let modeSelectIndex = modeSelect.selectedIndex;
let currentState;
let currentCondition;
const gameStatesArray = [
  ["", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ],
];
const winningConditionsArray = [
  [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ],
  [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15],
    [0, 4, 8, 12],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
    [0, 5, 10, 15],
    [3, 6, 9, 12],
  ],
  [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20],
  ],
];

//about the status of the game
let disapperArray = [];
let clickType = 0;
let gameTurn = 0;
let gameActive = true;

//Commonly used dom nodes
const allCell = document.querySelectorAll(".cell");
const setUpForm = document.querySelector(".set-up-form");
const restartBtn = document.querySelector(".game-restart");
const backBtn = document.querySelector(".back");
const gameSetting = document.querySelector(".game-setting");
const statusDisplay = document.querySelector(".game-status");
const msgBoard = document.querySelector(".message-board");
const infoAndOperate = document.querySelector(".info-operate");
const gameBody = document.querySelector(".game-body");

//Object in game
let currentPlayer;
let firstPlayer;
let playerX;
let playerO;
let itemObject;

//Create a function that creates a player object
function creatPlayer(name, symbol) {
  let playerObj = new Object();
  playerObj.name = name;
  playerObj.symbol = symbol;
  playerObj.itemsActive = [true, true, true];
  playerObj.activeItems = function () {
    this.itemsActive = [true, true, true];
  };
  playerObj.itemThisTurn = 2;
  playerObj.activeTurnItem = function () {
    this.itemThisTurn = 2;
  };
  playerObj.canUseItem = true;
  playerObj.activeCanUseItem = function () {
    this.canUseItem = true;
  };

  return playerObj;
}

//Create a function that creates an ai object
function creatAi(name, symbol) {
  let aiObj = new Object();
  aiObj.name = name;
  aiObj.symbol = symbol;

  //Simple AI
  aiObj.aiEasyTurn = function () {
    let availableArray = [];
    let aiMove;

    for (let index = 0; index < currentState.length; index++) {
      if (currentState[index] === "") {
        availableArray.push(index);
      }
    }

    let randomIndex = Math.floor(Math.random() * availableArray.length);
    aiMove = availableArray[randomIndex];
    currentState[aiMove] = "O";
    let cellsParentNode = document.querySelector(".game-container-3");
    cellsParentNode.children[aiMove].innerHTML =
      "<img src = 'o.png' alt = 'O' width = '95' height = '95'>";
  };

  //Hard AI
  aiObj.aiHardTurn = function () {
    let aiMove;
    let bestScore = -Infinity;
    for (let index = 0; index < currentState.length; index++) {
      if (currentState[index] === "") {
        currentState[index] = "O";
        let score = this.minimax(currentState, 0, false);
        currentState[index] = "";
        if (score > bestScore) {
          bestScore = score;
          aiMove = index;
        }
      }
    }

    currentState[aiMove] = "O";
    let cellsParentNode = document.querySelector(".game-container-3");
    cellsParentNode.children[aiMove].innerHTML =
      "<img src = 'o.png' alt = 'O' width = '95' height = '95'>";
  };

  //Minimax algorithm
  aiObj.minimax = function minimax(currentState, depth, isMaximizing) {
    let result = handleResultCheck();

    if (result !== null) {
      switch (result) {
        case 0:
          return 0;
        case 1:
          return -10;
        case 2:
          return 10;
      }
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let index = 0; index < currentState.length; index++) {
        if (currentState[index] === "") {
          currentState[index] = "O";
          let score = this.minimax(currentState, depth + 1, false);
          currentState[index] = "";
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let index = 0; index < currentState.length; index++) {
        if (currentState[index] === "") {
          currentState[index] = "X";
          let score = this.minimax(currentState, depth + 1, true);
          currentState[index] = "";
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  return aiObj;
}

//第二部分
//Create a function that creates a item mode object
function creatItemObj() {
  let itemObj = new Object();

  itemObj.itemsDisplay = document.querySelector(".items-status");
  itemObj.freezeBtn = document.querySelector(".freeze");
  itemObj.bombBtn = document.querySelector(".bomb");
  itemObj.exchangeBtn = document.querySelector(".exchange-btn");
  itemObj.itemsOperate = document.querySelector(".items-operate");
  itemObj.exchangeSelect = document.querySelector(".exchange-container");
  itemObj.exchangeOption = [];
  itemObj.frozeArray = [];

  //Checking and setting when starting a game
  itemObj.itemSettingStart = function () {
    if (modeSelect.selectedIndex === 1) {
      this.itemsOperate.classList.remove("hide");
      //show appropriate exchange selection
      this.exchangeSelect.children[2 * sizeSelectIndex].classList.remove(
        "hide"
      );
      this.exchangeSelect.children[2 * sizeSelectIndex + 1].classList.remove(
        "hide"
      );
      //in case players set names, make the Item count hint information show right name
      this.itemsDisplay.children[0].innerHTML = `2 Items are available for ${playerX.name}`;
      this.itemsDisplay.children[1].innerHTML = `2 Items are available for ${playerO.name}`;
    }
  };

  //Settings when restarting a game
  itemObj.itemSettingRestart = function () {
    if (modeSelectIndex === 1) {
      msgBoard.innerHTML = "";
      this.exchangeOption.forEach((option) => option.classList.remove("hide"));
      this.frozeArray.length = 0;
      this.itemsDisplay.classList.add("hide");
      this.itemsDisplay.children[0].innerHTML = `2 Items are available for ${playerX.name}`;
      this.itemsDisplay.children[1].innerHTML = `2 Items are available for ${playerO.name}`;
      playerX.activeItems();
      playerO.activeItems();
      playerX.activeTurnItem();
      playerO.activeTurnItem();
      playerX.activeCanUseItem();
      playerO.activeCanUseItem();
    }
  };

  //Setting when going back to the main menu
  itemObj.itemSettingBackToMenu = function () {
    this.itemsOperate.classList.add("hide");
    this.exchangeSelect.children[2 * sizeSelectIndex].classList.add("hide");
    this.exchangeSelect.children[2 * sizeSelectIndex + 1].classList.add("hide");
  };

  //Clear the item message board
  itemObj.emptyItemMsgBoard = function () {
    msgBoard.innerHTML = "";
  };

  //Update the item information bar
  itemObj.handleItemDisplay = function () {
    switch (currentPlayer) {
      case playerX:
        this.itemsDisplay.children[0].innerHTML = `${playerX.itemThisTurn} Items are available for ${playerX.name}`;
        break;
      case playerO:
        this.itemsDisplay.children[1].innerHTML = `${playerO.itemThisTurn} Items are available for ${playerO.name}`;
        break;
    }
  };

  //Function attached to the freeze button
  itemObj.handleFreeze = function () {
    // The use of a item is subject to the game running and after five discs have been played and the item has not been used before and the item has a number of uses
    if (
      gameActive &&
      gameTurn > 4 &&
      currentPlayer.itemsActive[0] &&
      currentPlayer.itemThisTurn !== 0 &&
      currentPlayer.canUseItem
    ) {
      clickType = 1;
      msgBoard.innerHTML = "Click a cell to freeze.";
      // No more props can be used this turn
      currentPlayer.canUseItem = false;
    }
  };

  //Perform freezing operation
  itemObj.freezeTakesEffect = function (clickedCell, clickedCellIndex) {
    //Record the index of the frozen cell
    this.frozeArray.push(clickedCellIndex);
    putFrozeImg(clickedCell, clickedCellIndex);

    // Change the drop-down list of replaceable rows of "Exchange" item
    let frozeCol;
    let frozeRow;
    const boardSize = sizeSelectIndex + 3;

    frozeCol = clickedCellIndex % boardSize;
    frozeRow = (clickedCellIndex - frozeCol) / boardSize;
    let exchangeOptionClassName = ".exchangeOption" + boardSize;
    this.exchangeOption = document.querySelectorAll(exchangeOptionClassName);
    this.exchangeOption[frozeRow].classList.add("hide");
    this.exchangeOption[frozeCol + boardSize].classList.add("hide");
    this.exchangeOption[frozeRow + 2 * boardSize].classList.add("hide");
    this.exchangeOption[frozeCol + 3 * boardSize].classList.add("hide");

    this.emptyItemMsgBoard();
    clickType = 0;

    //Zero the number of times the freeze function has been used by the current player
    currentPlayer.itemsActive[0] = false;
    //Reduce the number of times a player uses item in the game
    currentPlayer.itemThisTurn !== 0 ? currentPlayer.itemThisTurn-- : 0;
    this.handleItemDisplay();
  };

  //Function attached to the bomb button
  itemObj.handleBomb = function () {
    // The use of a item is subject to the game running and after five discs have been played and the item has not been used before and the item has a number of uses
    if (
      gameActive &&
      gameTurn > 4 &&
      currentPlayer.itemsActive[1] &&
      currentPlayer.itemThisTurn !== 0 &&
      currentPlayer.canUseItem
    ) {
      clickType = 2;
      msgBoard.innerHTML = "Click a cell to bomb.";
      // No more props can be used this turn
      currentPlayer.canUseItem = false;
    }
  };

  //Perform bomb operation
  itemObj.bombTakesEffect = function (clickedCell, clickedCellIndex) {
    if (this.frozeArray.includes(clickedCellIndex)) {
      putNormalImg(clickedCell, clickedCellIndex);
      for (let i = 0; i < this.frozeArray.length; i++) {
        if (this.frozeArray[i] === clickedCellIndex) {
          this.frozeArray.splice(i, 1);
        }
      }
      // Change the drop-down list of replaceable rows of "Exchange" item
      let frozeCol;
      let frozeRow;
      const boardSize = sizeSelectIndex + 3;
      frozeCol = clickedCellIndex % boardSize;
      frozeRow = (clickedCellIndex - frozeCol) / boardSize;
      let exchangeOptionClassName = ".exchangeOption" + boardSize;
      this.exchangeOption = document.querySelectorAll(exchangeOptionClassName);
      this.exchangeOption[frozeRow].classList.remove("hide");
      this.exchangeOption[frozeCol + boardSize].classList.remove("hide");
      this.exchangeOption[frozeRow + 2 * boardSize].classList.remove("hide");
      this.exchangeOption[frozeCol + 3 * boardSize].classList.remove("hide");
    } else {
      currentState[clickedCellIndex] = "";
      clickedCell.innerHTML = "";
    }
    this.emptyItemMsgBoard();
    clickType = 0;
    //Zero the number of times the freeze function has been used by the current player
    currentPlayer.itemsActive[1] = false;
    //Reduce the number of times a player uses item in the game
    currentPlayer.itemThisTurn !== 0 ? currentPlayer.itemThisTurn-- : 0;
    this.handleItemDisplay();
  };

  //Function attached to the exchange button, also perform exchange operation
  itemObj.handleExchange = function (event) {
    event.preventDefault();
    // The use of a item is subject to the game running and after five discs have been played and the item has not been used before and the item has a number of uses
    if (
      !(
        gameActive &&
        gameTurn > 4 &&
        currentPlayer.itemsActive[2] &&
        currentPlayer.itemThisTurn !== 0 &&
        currentPlayer.canUseItem
      )
    ) {
      return;
    }
    // No more props can be used this turn
    currentPlayer.canUseItem = false;

    let exchangeIndex1 =
      this.exchangeSelect.children[sizeSelectIndex * 2].selectedIndex;
    let exchangeIndex2 =
      this.exchangeSelect.children[sizeSelectIndex * 2 + 1].selectedIndex;

    // Cannot select the same row or col
    if (exchangeIndex1 === exchangeIndex2) {
      return;
    }

    let exchangeArray1 = [];
    let exchangeArray2 = [];
    let exchangeStateArray1 = [];
    let exchangeStateArray2 = [];

    // Get the row/col to be exchanged
    function getExchangeArray(sizeIndex) {
      if (exchangeIndex1 < sizeIndex) {
        for (let index = 0; index < sizeIndex; index++) {
          exchangeArray1.push(exchangeIndex1 * sizeIndex + index);
          exchangeStateArray1.push(
            currentState[exchangeIndex1 * sizeIndex + index]
          );
        }
      } else {
        for (let index = 0; index < sizeIndex; index++) {
          exchangeArray1.push(exchangeIndex1 - sizeIndex + index * sizeIndex);
          exchangeStateArray1.push(
            currentState[exchangeIndex1 - sizeIndex + index * sizeIndex]
          );
        }
      }
      if (exchangeIndex2 < sizeIndex) {
        for (let index = 0; index < sizeIndex; index++) {
          exchangeArray2.push(exchangeIndex2 * sizeIndex + index);
          exchangeStateArray2.push(
            currentState[exchangeIndex2 * sizeIndex + index]
          );
        }
      } else {
        for (let index = 0; index < sizeIndex; index++) {
          exchangeArray2.push(exchangeIndex2 - sizeIndex + index * sizeIndex);
          exchangeStateArray2.push(
            currentState[exchangeIndex2 - sizeIndex + index * sizeIndex]
          );
        }
      }
    }

    getExchangeArray(sizeSelectIndex + 3);

    let cellsParentNode = document.querySelector(
      ".game-container-" + (sizeSelectIndex + 3)
    );

    //empty the cells to be exchanged, then fill them in, if you still encounter non-empty cells then make them empty
    // first make the record array and cell empty
    for (let index = 0; index < sizeSelectIndex + 3; index++) {
      currentState[exchangeArray1[index]] = "";
      currentState[exchangeArray2[index]] = "";
      cellsParentNode.children[exchangeArray1[index]].innerHTML = "";
      cellsParentNode.children[exchangeArray2[index]].innerHTML = "";
    }

    // Fill in the first option first
    for (let index = 0; index < sizeSelectIndex + 3; index++) {
      currentState[exchangeArray1[index]] = exchangeStateArray2[index];
      switch (exchangeStateArray2[index]) {
        case "X":
          cellsParentNode.children[exchangeArray1[index]].innerHTML =
            "<img src = 'x.png' alt = 'X' width = '95' height = '95'>";
          break;
        case "O":
          cellsParentNode.children[exchangeArray1[index]].innerHTML =
            "<img src = 'o.png' alt = 'O' width = '95' height = '95'>";
          break;
      }
    }

    //Fill in the second option, and if it is already filled in, check that it does not conflict with the one you want to fill in.
    for (let index = 0; index < sizeSelectIndex + 3; index++) {
      if (currentState[exchangeArray2[index]] === "") {
        currentState[exchangeArray2[index]] = exchangeStateArray1[index];
        switch (exchangeStateArray1[index]) {
          case "X":
            cellsParentNode.children[exchangeArray2[index]].innerHTML =
              "<img src = 'x.png' alt = 'X' width = '95' height = '95'>";
            break;
          case "O":
            cellsParentNode.children[exchangeArray2[index]].innerHTML =
              "<img src = 'o.png' alt = 'O' width = '95' height = '95'>";
            break;
        }
      } else if (
        currentState[exchangeArray2[index]] !== exchangeStateArray1[index]
      ) {
        currentState[exchangeArray2[index]] = "";
        cellsParentNode.children[exchangeArray2[index]].innerHTML = "";
      }
    }

    // Zero the number of times the current player exchange function is used
    currentPlayer.itemsActive[2] = false;
    //Reduces the number of times a player can use game items in the game
    currentPlayer.itemThisTurn !== 0 ? currentPlayer.itemThisTurn-- : 0;
    this.handleItemDisplay();

    handleResultValidation();
  };

  //Five ticks before you can use the item and the number of available items will be displayed
  itemObj.canUseItemFromNow = function () {
    if (modeSelectIndex === 1 && gameTurn > 4) {
      this.itemsDisplay.classList.remove("hide");
    }
  };

  return itemObj;
}

//第三部分
//====================================
// Game start
function handleStartGame(event) {
  //Prevent default function triggering of keys
  event.preventDefault();

  // Get setting parameters
  isAI =
    document.getElementById("player-type").selectedIndex === 0 ? false : true;
  modeSelectIndex = modeSelect.selectedIndex;
  sizeSelectIndex = sizeSelect.selectedIndex;

  //Create prop objects and initialize them, if not prop mode will have no effect on the game as a whole
  itemObject = creatItemObj();
  itemObject.freezeBtn.addEventListener("click", itemObject.handleFreeze);
  itemObject.bombBtn.addEventListener("click", itemObject.handleBomb);
  itemObject.exchangeBtn.addEventListener(
    "click",
    itemObject.handleExchange.bind(itemObject)
  );

  // Currently only Classic Match 3*3 supports ai
  if (isAI && (modeSelectIndex !== 0 || sizeSelectIndex !== 0)) {
    alert(
      "Sorry, only 3*3 classic mode has computer player due to the game version now. Please chose correct setting! We are working on it!"
    );
    return;
  }

  // If the user has not given himself a name, the default name is used
  if (this.playerX.value === "" || this.playerO.value === "") {
    playerX = creatPlayer("X", "X");
    if (isAI) {
      playerO = creatAi("O", "O");
    } else {
      playerO = creatPlayer("O", "O");
    }
  } else {
    playerX = creatPlayer(this.playerX.value, "X");
    if (!isAI) {
      playerO = creatPlayer(this.playerO.value, "O");
    } else {
      playerO = creatAi(this.playerO.value, "O");
    }
  }

  //hide the settings screen
  gameSetting.classList.add("hide");

  // Display of the board and action area according to the board size and game mode selected by the user
  gameBody.children[sizeSelectIndex].classList.remove("hide");

  //Display operating area
  infoAndOperate.classList.remove("hide");

  //Setting about the item
  itemObject.itemSettingStart();

  // Select the appropriate board record array and win condition
  currentState = gameStatesArray[sizeSelectIndex];
  currentCondition = winningConditionsArray[sizeSelectIndex];

  //Setting the first player
  let firstPlayerChoseIndex =
    document.getElementById("first-player").selectedIndex;
  switch (firstPlayerChoseIndex) {
    case 0:
      const randomValue = Math.random() < 0.5 ? playerX : playerO;
      firstPlayer = randomValue;
      break;

    case 1:
      firstPlayer = playerX;
      break;

    case 1:
      firstPlayer = playerO;
      break;
  }
  currentPlayer = firstPlayer;
  statusDisplay.innerHTML = `It's ${currentPlayer.name}'s turn`;

  // Check if ai goes first
  if (isAI && firstPlayer === playerO) {
    if (document.getElementById("player-type").selectedIndex === 1) {
      playerO.aiEasyTurn();
    } else {
      playerO.aiHardTurn();
    }
    handlePlayerChange();
  }
}

//====================================
// Restart a game
function handleRestartGame() {
  gameTurn = 0;
  gameActive = true;
  currentPlayer = firstPlayer;
  for (let index = 0; index < currentState.length; index++) {
    currentState[index] = "";
  }
  statusDisplay.innerHTML = `It's ${currentPlayer.name}'s turn`;

  allCell.forEach((cell) => (cell.innerHTML = ""));
  clickType = 0;

  // If in prop mode, reset prop-related parameters
  itemObject.itemSettingRestart();

  //reset disappear mode parameter
  disapperArray = [];

  // If not return to main menu for whether ai first go check
  let gameBodyClassList = gameBody.children[sizeSelectIndex].classList;
  if (isAI && !gameBodyClassList.contains("hide") && firstPlayer === playerO) {
    if (document.getElementById("player-type").selectedIndex === 1) {
      playerO.aiEasyTurn();
    } else {
      playerO.aiHardTurn();
    }
    handlePlayerChange();
  }
}

//====================================
//Back to main setting menu
function handleBackToMenu() {
  document.getElementById("playerX").value = "";
  document.getElementById("playerO").value = "";
  gameSetting.classList.remove("hide");
  gameBody.children[sizeSelectIndex].classList.add("hide");
  infoAndOperate.classList.add("hide");
  // If in prop mode, reset prop-related parameters
  itemObject.itemSettingBackToMenu();
  // Also need to restart the game
  handleRestartGame();
  currentPlayer = "";
}

//====================================
// click function attached to cells
function handleCellClick(clickedCellEvent) {
  //Get the clicked cell and its index
  const clickedCell = clickedCellEvent.currentTarget;
  const clickedCellIndex = parseInt(
    clickedCell.getAttribute("data-cell-index")
  );

  // Different functions depending on the type of click
  switch (clickType) {
    case 0:
      //Normal click check
      if (!gameActive || currentState[clickedCellIndex] !== "") {
        return;
      }
      break;
    case 1:
      //Freeze click check
      if (
        !gameActive ||
        currentState[clickedCellIndex] == "" ||
        itemObject.frozeArray.includes(clickedCellIndex)
      ) {
        return;
      }
      break;
    case 2:
      //Bomb click check
      if (!gameActive || currentState[clickedCellIndex] == "") {
        return;
      }
      break;
  }

  handleCellPlayed(clickedCell, clickedCellIndex);
}

//====================================
// function for placing images on cells
function putNormalImg(clickedCell, clickedCellIndex) {
  if (currentState[clickedCellIndex] == "X") {
    clickedCell.innerHTML =
      "<img src = 'x.png' alt = 'X' width = '95' height = '95'>";
  } else {
    clickedCell.innerHTML =
      "<img src = 'o.png' alt = 'O' width = '95' height = '95'>";
  }
}
function putFrozeImg(clickedCell, clickedCellIndex) {
  if (currentState[clickedCellIndex] == "X") {
    clickedCell.innerHTML = "";
    clickedCell.innerHTML =
      "<img src = 'frozeX.png' alt = 'frozeX' width = '98' height = '98'>";
  } else {
    clickedCell.innerHTML = "";
    clickedCell.innerHTML =
      "<img src = 'frozeO.png' alt = 'frozeO' width = '98' height = '98'>";
  }
}

//====================================
// Processing of cells after clicking on them
function handleCellPlayed(clickedCell, clickedCellIndex) {
  // Different actions depending on the type of click
  switch (clickType) {
    //Normal click
    case 0:
      currentState[clickedCellIndex] = currentPlayer.symbol;
      putNormalImg(clickedCell, clickedCellIndex);
      disapperArray.push(clickedCellIndex);
      gameTurn += 1;
      msgBoard.innerHTML = "";
      itemObject.emptyItemMsgBoard();
      handleResultValidation();
      if (gameActive) {
        handlePlayerChange();
        itemObject.canUseItemFromNow();
      }
      break;
    //freeze click
    case 1:
      itemObject.freezeTakesEffect(clickedCell, clickedCellIndex);
      break;
    //bomb click
    case 2:
      itemObject.bombTakesEffect(clickedCell, clickedCellIndex);
      break;
  }
}

//====================================
//Checking whether there is a winner or tie
function handleResultCheck() {
  let result = null;
  //check the winner according to the symbol in the cell
  function checkWinner(aCell) {
    switch (aCell) {
      case "X":
        result = 1;
        break;
      case "O":
        result = 2;
        break;
    }
  }
  //check result basec on current board
  switch (currentCondition.length) {
    case 8:
      currentCondition.forEach((condition) => {
        let cell0 = condition[0];
        let cell1 = condition[1];
        let cell2 = condition[2];

        if (
          currentState[cell0] === currentState[cell1] &&
          currentState[cell1] === currentState[cell2] &&
          currentState[cell0] !== ""
        ) {
          checkWinner(currentState[cell0]);
        }
      });
      break;
    case 10:
      currentCondition.forEach((condition) => {
        let cell0 = condition[0];
        let cell1 = condition[1];
        let cell2 = condition[2];
        let cell3 = condition[3];

        if (
          currentState[cell0] === currentState[cell1] &&
          currentState[cell1] === currentState[cell2] &&
          currentState[cell2] === currentState[cell3] &&
          currentState[cell0] !== ""
        ) {
          //result = 1;
          checkWinner(currentState[cell0]);
        }
      });
      break;
    case 12:
      currentCondition.forEach((condition) => {
        let cell0 = condition[0];
        let cell1 = condition[1];
        let cell2 = condition[2];
        let cell3 = condition[3];
        let cell4 = condition[4];

        if (
          currentState[cell0] === currentState[cell1] &&
          currentState[cell1] === currentState[cell2] &&
          currentState[cell2] === currentState[cell3] &&
          currentState[cell3] === currentState[cell4] &&
          currentState[cell0] !== ""
        ) {
          //result = 1;
          checkWinner(currentState[cell0]);
        }
      });
      break;
  }
  //tie
  if (!currentState.includes("") && result === null) {
    result = 0;
  }
  return result;
}

//第三部分
//====================================
//Validate the checking result
function handleResultValidation() {
  let roundResult = null;

  // If in disappear mode then board elimination first
  if (
    disapperArray.length > (sizeSelectIndex + 3) * 2 &&
    modeSelectIndex === 2
  ) {
    currentState[disapperArray[0]] = "";
    gameBody.children[sizeSelectIndex].firstElementChild.children[
      disapperArray[0]
    ].innerHTML = "";
    disapperArray.shift();
  }

  //Get the results
  roundResult = handleResultCheck();

  //Someone won
  if (roundResult === 1 || roundResult === 2) {
    statusDisplay.innerHTML = `Player ${currentPlayer.name} has won!`;
    gameActive = false;
    //change first player
    firstPlayer = firstPlayer === playerX ? playerO : playerX;
    currentPlayer = firstPlayer;
    return;
  }

  //Tie game
  if (roundResult === 0) {
    statusDisplay.innerHTML = `Game ended in a draw!`;
    gameActive = false;
    //change first player
    firstPlayer = firstPlayer === playerX ? playerO : playerX;
    currentPlayer = firstPlayer;
    return;
  }

  // If it is ai mode and a non-computer player has played before, check if it is time for ai
  if (gameActive && isAI && currentPlayer === playerX) {
    if (document.getElementById("player-type").selectedIndex === 1) {
      playerO.aiEasyTurn();
    } else {
      playerO.aiHardTurn();
    }
    handlePlayerChange();
    handleResultValidation();
  }
}

//====================================
//Players change
function handlePlayerChange() {
  // if Prop mode reactive the current player's prop availability per game
  if (modeSelectIndex === 1) {
    currentPlayer.activeCanUseItem();
  }
  currentPlayer = currentPlayer === playerX ? playerO : playerX;
  statusDisplay.innerHTML = `It's ${currentPlayer.name}'s turn`;
}

//====================================
//Run the game
function handleRunGame() {
  setUpForm.addEventListener("submit", handleStartGame);
  allCell.forEach((cell) => cell.addEventListener("click", handleCellClick));
  restartBtn.addEventListener("click", handleRestartGame);
  backBtn.addEventListener("click", handleBackToMenu);
}

//结束，请回答问题
