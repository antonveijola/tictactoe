// gameboard IIFE factory (need only one instance)
const gameboard = (function () {
  const board = new Array(9).fill(null);

  const clearBoard = () => board.fill(null);

  const getGameboard = () => board;

  const setMarker = (index, marker) => {
    if (getMarker()) throw new Error("there is already marker in this cell");
    board[index] = marker;
  };

  const getMarker = (index) => board[index];

  const checkTie = () => {
    return !checkWinner() && board.every((cell) => cell !== null);
  };

  const checkWinner = () => {
    const winConditions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const winCondition of winConditions) {
      const [index1, index2, index3] = winCondition;

      if (
        board[index1] &&
        board[index1] === board[index2] &&
        board[index1] === board[index3]
      ) {
        return true;
      }
    }
    return false;
  };

  return {
    getGameboard,
    checkWinner,
    checkTie,
    clearBoard,
    setMarker,
    getMarker,
  };
})();

// Player factory (need many instances)
function createPlayer(name, marker) {
  const getName = () => name;
  const setName = (newName) => (name = newName);

  const getMarker = () => marker;
  return { getName, setName, getMarker };
}

// GameController IIFE factory (need only one instance)
const gameController = (function () {
  let isGameover;
  let activePlayer;
  let player1;
  let player2;

  const playGame = (playerNames) => {
    isGameover = false;
    gameboard.clearBoard();
    setPlayers(playerNames);
    displayController.drawBoard();
    changeActivePlayer();
  };

  const setPlayers = (playerNames) => {
    const [name1, name2] = playerNames;
    player1 = createPlayer(name1, "X");
    player2 = createPlayer(name2, "O");
  };

  const playRound = (index) => {
    if (isGameover) {
      gameOver();
      return;
    }

    try {
      gameboard.setMarker(index, activePlayer.getMarker());
      displayController.placeMarker(index, activePlayer.getMarker());

      if (gameboard.checkWinner()) {
        gameOver(activePlayer);
        return;
      }

      if (gameboard.checkTie()) {
        gameOver();
        return;
      }

      changeActivePlayer();
      displayController.drawBoard();
    } catch (error) {
      console.log(error);
    }
  };

  const gameOver = (winner = null) => {
    isGameover = true;
    displayController.gameOver(winner);
  };

  const changeActivePlayer = () => {
    activePlayer = activePlayer === player1 ? player2 : player1;
  };

  return { playRound, playGame, setPlayers };
})();

// displayController IIFE factory (need only one instance)
displayController = (function () {
  const startBtn = document.querySelector(".start-btn");
  const optionsDiv = document.querySelector(".options");

  startBtn.addEventListener("click", () => {
    const player1name = document.querySelector("#player1-name").value;
    const player2name = document.querySelector("#player2-name").value;
    
    console.log(player1name)
    console.log(player2name)
    if (!player1name || !player2name) {
      alert("need to add both player names!");
      return;
    }
    
    optionsDiv.classList.add("hidden");
    gameController.playGame([player1name, player2name]);
  });

  const drawBoard = () => {
    const gameContainer = document.querySelector(".game");
    gameContainer.innerHTML = "";

    const gameboardElement = document.createElement("div");
    gameboardElement.classList.add("gameboard");

    for (const [i, cell] of gameboard.getGameboard().entries()) {
      const cellElement = document.createElement("div");
      cellElement.classList.add("cell");
      cellElement.textContent = cell;
      cellElement.addEventListener("click", () => {
        gameController.playRound(i);
      });
      gameboardElement.appendChild(cellElement);
      gameContainer.appendChild(gameboardElement);
    }
  };

  const placeMarker = (index, marker) => {
    const cells = Array.from(document.querySelectorAll(".cell"));
    cells[index].textContent = marker;
    drawBoard();
  };

  const gameOver = (player = null) => {
    const resultDiv = document.querySelector(".result");

    resultDiv.textContent = player
      ? `The winner is ${player.getName()} (${player.getMarker()})!`
      : "The game was tie!";

    const startBtn = document.querySelector(".start-btn");
    startBtn.textContent = "Play again?";
    optionsDiv.classList.toggle("hidden");
  };

  return { drawBoard, placeMarker, gameOver };
})();
