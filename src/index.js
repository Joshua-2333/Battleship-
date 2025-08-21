// index.js
import './styles.css';
import { createGame } from './game';
import { 
  renderGrid, showMessage, toggleScreen, updateCell, 
  createShipPreviewLabel, initDragAndDrop, toggleOrientation
} from './ui';
import { 
  getLogo, getStartBtn, getPlayerNameInput, getPlayerGridContainer,
  getBattlePlayerGridContainer, getEnemyGridContainer,
  getOrientationBtn, getConfirmBtn, getResetBtn, getControls, getBattleMusic,
  hitSound, missSound
} from './dom';

// --- Grab elements ---
const logo = getLogo();
const startBtn = getStartBtn();
const playerNameInput = getPlayerNameInput();
const playerGridContainer = getPlayerGridContainer();
const battlePlayerGridContainer = getBattlePlayerGridContainer();
const enemyGridContainer = getEnemyGridContainer();
const orientationBtn = getOrientationBtn();
const confirmBtn = getConfirmBtn();
const resetBtn = getResetBtn();
const controls = getControls();
const battleMusic = getBattleMusic();

// --- Initialize game and UI ---
const game = createGame();
createShipPreviewLabel(); // floating ghost ship preview

// --- Render initial grids ---
renderGrid(playerGridContainer, game.playerBoard.board);
renderGrid(battlePlayerGridContainer, game.playerBoard.board);
renderGrid(enemyGridContainer, game.enemyBoard.board);

// --- Track player turn ---
let playerTurn = true;

// --- Setup ship dock & drag/drop ---
function setupShipDock() {
  const dockShips = document.querySelectorAll('#ship-dock .ship');

  dockShips.forEach(shipEl => {
    shipEl.style.display = game.placedShips[shipEl.dataset.ship] ? 'none' : 'flex';
    shipEl.classList.remove('picked');
  });

  dockShips.forEach(shipEl => {
    shipEl.addEventListener('click', () => {
      dockShips.forEach(s => s.classList.remove('picked'));
      shipEl.classList.add('picked');
    });
  });
}

// --- Initialize drag/drop ONCE ---
initDragAndDrop(playerGridContainer, game.playerBoard.board, (shipName, x, y, orientation) => {
  const placed = game.placePlayerShipByName(shipName, x, y, orientation);
  if (!placed) {
    showMessage('Invalid placement!');
    return false;
  }

  renderGrid(playerGridContainer, game.playerBoard.board);

  const shipEl = document.querySelector(`#ship-dock .ship[data-ship='${shipName}']`);
  if (shipEl) shipEl.style.display = 'none';

  game.placedShips[shipName] = true;

  // Unpick all ships
  document.querySelectorAll('#ship-dock .ship').forEach(s => s.classList.remove('picked'));

  const allPlaced = game.shipsInfo.every(s => game.placedShips[s.name]);
  confirmBtn.disabled = !allPlaced;
  if (allPlaced) showMessage('All ships placed! Confirm to start the battle!');
  return true;
});

// --- Enable Start button only when player name is entered ---
playerNameInput.addEventListener('input', () => {
  startBtn.disabled = playerNameInput.value.trim().length === 0;
});

// --- Orientation toggle button ---
orientationBtn.addEventListener('click', () => {
  toggleOrientation(orientationBtn);
});

// --- Enemy AI attack ---
function enemyAttack() {
  const { x, y, result } = game.computerAttack();
  const cell = game.playerBoard.getCell(x, y);
  if (!cell) return;

  if (result === 'hit') {
    hitSound.currentTime = 0;
    hitSound.play();
    updateCell(battlePlayerGridContainer, x, y, 'hit'); // ✅ mark only that cell red
    showMessage(`Enemy hit your ship!`);
  } else {
    missSound.currentTime = 0;
    missSound.play();
    updateCell(battlePlayerGridContainer, x, y, 'miss'); // ✅ mark only that cell gray
    showMessage(`Enemy missed!`);
  }

  if (game.playerBoard.allShipsSunk()) {
    showMessage('You lost! Your fleet has been destroyed! ☠️', 3000);
    playerTurn = false;
    return;
  }

  playerTurn = true;
}

// --- Handle player attack ---
function handleEnemyClick(e) {
  if (!game.gameStarted) {
    showMessage('Confirm your placements first!');
    return;
  }

  if (!playerTurn) {
    showMessage('Wait for your turn!');
    return;
  }

  const cell = e.target;
  if (!cell.dataset.x || !cell.dataset.y) return;

  const x = +cell.dataset.x;
  const y = +cell.dataset.y;

  const boardCell = game.enemyBoard.getCell(x, y);
  if (boardCell?.attacked) {
    showMessage('You already attacked this tile!');
    return;
  }

  const result = game.attackEnemy(x, y);

  if (result.result === 'hit') {
    hitSound.currentTime = 0;
    hitSound.play();
    updateCell(enemyGridContainer, x, y, 'hit'); // ✅ keep enemy hit cell red
    showMessage(boardCell?.ship ? `Hit! ${boardCell.ship.name}` : 'Hit!');
  } else {
    missSound.currentTime = 0;
    missSound.play();
    updateCell(enemyGridContainer, x, y, 'miss'); // ✅ keep enemy miss cell gray
    showMessage('Miss!');
  }

  // ❌ removed renderGrid() calls here (they were wiping the hit/miss classes)

  if (game.enemyBoard.allShipsSunk()) {
    showMessage('You won! All enemy ships sunk! 🎉', 3000);
    playerTurn = false;
    return;
  }

  playerTurn = false;
  setTimeout(enemyAttack, 800);
}

// --- Screen flow ---
startBtn.addEventListener('click', () => {
  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    showMessage('Please enter your captain name!');
    return;
  }

  toggleScreen('setup');

  game.resetGame();
  game.placedShips = {};
  game.gameStarted = false;

  renderGrid(playerGridContainer, game.playerBoard.board);
  setupShipDock();

  orientationBtn.classList.remove('hidden');
  controls.classList.remove('hidden');
  confirmBtn.disabled = true;

  showMessage(`Welcome Captain ${playerName}, place your ships!`);
});

// Confirm placements → battle screen
confirmBtn.addEventListener('click', () => {
  const allPlaced = game.shipsInfo.every(s => game.placedShips[s.name]);
  if (!allPlaced) {
    showMessage('You must place all ships first!');
    return;
  }

  game.startGame();
  game.gameStarted = true;
  playerTurn = true;

  toggleScreen('battle');

  renderGrid(battlePlayerGridContainer, game.playerBoard.board);
  renderGrid(enemyGridContainer, game.enemyBoard.board);

  orientationBtn.classList.add('hidden');
  confirmBtn.disabled = true;

  if (battleMusic) {
    battleMusic.volume = 0.2;
    battleMusic.loop = true;
    battleMusic.play();
  }

  showMessage('Battle started! Attack the enemy!');

  if (!enemyGridContainer.dataset.listener) {
    enemyGridContainer.addEventListener('click', handleEnemyClick);
    enemyGridContainer.dataset.listener = 'true';
  }
});

// --- Reset placements → empty player board ---
resetBtn.addEventListener('click', () => {
  game.resetGame();
  game.placedShips = {};
  game.gameStarted = false;
  playerTurn = true;

  renderGrid(playerGridContainer, game.playerBoard.board);
  setupShipDock();

  // Reset ghost ship state so 'r' key works
  window.pickedShipName = null;
  window.pickedShipLength = 0;

  renderGrid(battlePlayerGridContainer, game.playerBoard.board);
  confirmBtn.disabled = true;

  showMessage('Placements cleared. Place your ships again!');
});

// --- Logo → reset everything ---
logo.addEventListener('click', () => {
  toggleScreen('intro');

  if (battleMusic) {
    battleMusic.pause();
    battleMusic.currentTime = 0;
  }

  playerNameInput.value = '';
  orientationBtn.classList.add('hidden');
  controls.classList.add('hidden');

  game.resetGame();
  game.placedShips = {};
  game.gameStarted = false;
  playerTurn = true;

  renderGrid(playerGridContainer, game.playerBoard.board);
  renderGrid(enemyGridContainer, game.enemyBoard.board);
  setupShipDock();
});
