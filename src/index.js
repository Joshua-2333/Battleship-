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

// Grab elements
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

// Initialize game and UI
const game = createGame();
createShipPreviewLabel();

// Render initial grids
renderGrid(playerGridContainer, game.playerBoard.board);
renderGrid(battlePlayerGridContainer, game.playerBoard.board);
renderGrid(enemyGridContainer, game.enemyBoard.board);

let playerTurn = true;

// --- Turn indicator ---
function updateTurnIndicator() {
  if (playerTurn) {
    battlePlayerGridContainer.classList.add('blinking-turn');
    enemyGridContainer.classList.remove('blinking-turn');
  } else {
    battlePlayerGridContainer.classList.remove('blinking-turn');
    enemyGridContainer.classList.add('blinking-turn');
  }
}

// --- Setup ship dock UI ---
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
      window.pickedShipName = shipEl.dataset.ship;
      const shipData = game.shipsInfo.find(s => s.name === window.pickedShipName);
      window.pickedShipLength = shipData ? shipData.length : 0;
    });
  });
}

// --- Drag/drop placement ---
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
  document.querySelectorAll('#ship-dock .ship').forEach(s => s.classList.remove('picked'));

  const allPlaced = game.shipsInfo.every(s => game.placedShips[s.name]);
  confirmBtn.disabled = !allPlaced;
  if (allPlaced) showMessage('All ships placed! Confirm to start the battle!');
  return true;
});

// --- Player name input ---
playerNameInput.addEventListener('input', () => {
  startBtn.disabled = playerNameInput.value.trim().length === 0;
});

// --- Orientation toggle ---
orientationBtn.addEventListener('click', () => toggleOrientation(orientationBtn));

// --- Game over modal ---
function showGameOverModal(playerLost) {
  const modal = document.getElementById('game-over-modal');
  const message = document.getElementById('game-over-message');
  message.textContent = playerLost
    ? 'You lost! Your fleet has been destroyed! ☠️'
    : 'You won! All enemy ships sunk! 🎉';
  modal.style.display = 'block';
  playerTurn = false;
  updateTurnIndicator();
  gameOverCleanup();
}

function gameOverCleanup() {
  enemyGridContainer.style.pointerEvents = 'none';
}

// Close modal
document.getElementById('game-over-modal').addEventListener('click', e => {
  if (e.target.classList.contains('close') || e.target.classList.contains('modal')) {
    e.currentTarget.style.display = 'none';
  }
});

// --- Enemy attack ---
function enemyAttack() {
  if (!game.gameStarted || game.gameOver) return;

  const result = game.computerAttack();
  if (!result) { 
    playerTurn = true; 
    updateTurnIndicator(); 
    return; 
  }

  updateCell(battlePlayerGridContainer, result.x, result.y, result.result, result.isSunk);

  if (result.result === 'hit') {
    hitSound.currentTime = 0; hitSound.play();
    showMessage('Enemy hit your ship!');
    if (result.isSunk && result.shipName) {
      const shipEntry = game.playerBoard.ships.find(s => s.ship.name === result.shipName);
      if (shipEntry) {
        shipEntry.positions.forEach(pos => updateCell(battlePlayerGridContainer, pos[0], pos[1], 'hit', true));
        showMessage(`The enemy sunk your ${result.shipName}! ☠️`);
      }
    }
  } else if (result.result === 'miss') {
    missSound.currentTime = 0; missSound.play();
    showMessage('Enemy missed!');
  }

  if (result.gameOver || game.playerBoard.allShipsSunk()) { 
    showGameOverModal(true); 
    return; 
  }
  playerTurn = true;
  updateTurnIndicator();
}

// --- Player attack ---
function handleEnemyClick(e) {
  if (!game.gameStarted || game.gameOver) return showMessage('Game is over or not started!');
  if (!playerTurn) return showMessage('Wait for your turn!');

  const cell = e.target;
  if (!cell.dataset.x || !cell.dataset.y) return;
  if (cell.classList.contains('attacked')) return showMessage('Already attacked this tile!');

  const x = +cell.dataset.x;
  const y = +cell.dataset.y;
  const result = game.attackEnemy(x, y);

  cell.classList.add('attacked');

  if (result.result === 'hit') {
    updateCell(enemyGridContainer, x, y, 'hit', !!result.isSunk);
    hitSound.currentTime = 0; hitSound.play();
    showMessage(result.shipName ? `Hit! ${result.shipName}` : 'Hit!');
    if (result.isSunk && result.shipName) {
      const shipEntry = game.enemyBoard.ships.find(s => s.ship.name === result.shipName);
      if (shipEntry) {
        shipEntry.positions.forEach(pos => updateCell(enemyGridContainer, pos[0], pos[1], 'hit', true));
        showMessage(`You sunk the enemy's ${result.shipName}!`);
      }
    }
  } else if (result.result === 'miss') {
    updateCell(enemyGridContainer, x, y, 'miss');
    missSound.currentTime = 0; missSound.play();
    showMessage('Miss!');
  }

  if (result.gameOver || game.enemyBoard.allShipsSunk()) { 
    showGameOverModal(false); 
    return; 
  }

  playerTurn = false;
  updateTurnIndicator();
  setTimeout(enemyAttack, 800);
}

// --- Start screen button ---
startBtn.addEventListener('click', () => {
  const playerName = playerNameInput.value.trim();
  if (!playerName) return showMessage('Enter your captain name!');
  toggleScreen('setup');

  game.resetGame();
  game.placedShips = {};

  renderGrid(playerGridContainer, game.playerBoard.board);
  setupShipDock();

  orientationBtn.classList.remove('hidden');
  controls.classList.remove('hidden');
  confirmBtn.disabled = true;

  playerTurn = true;
  updateTurnIndicator();

  showMessage(`Welcome Captain ${playerName}, place your ships!`);
});

// --- Confirm placements ---
confirmBtn.addEventListener('click', () => {
  const allPlaced = game.shipsInfo.every(s => game.placedShips[s.name]);
  if (!allPlaced) return showMessage('You must place all ships first!');

  game.startGame();
  playerTurn = true;
  updateTurnIndicator();

  toggleScreen('battle');
  renderGrid(battlePlayerGridContainer, game.playerBoard.board);
  renderGrid(enemyGridContainer, game.enemyBoard.board);

  orientationBtn.classList.add('hidden');
  confirmBtn.disabled = true;

  if (battleMusic) { battleMusic.volume = 0.2; battleMusic.loop = true; battleMusic.play(); }
  showMessage('Battle started! Attack the enemy!');

  if (!enemyGridContainer.dataset.listener) {
    enemyGridContainer.addEventListener('click', handleEnemyClick);
    enemyGridContainer.dataset.listener = 'true';
  }
});

// --- Reset button ---
resetBtn.addEventListener('click', () => {
  game.resetGame();
  game.placedShips = {};
  playerTurn = true;
  updateTurnIndicator();

  renderGrid(playerGridContainer, game.playerBoard.board);
  setupShipDock();
  window.pickedShipName = null;
  window.pickedShipLength = 0;

  renderGrid(battlePlayerGridContainer, game.playerBoard.board);
  confirmBtn.disabled = true;

  showMessage('Placements cleared. Place your ships again!');
});

// --- Logo resets game ---
logo.addEventListener('click', () => {
  toggleScreen('intro');
  if (battleMusic) { battleMusic.pause(); battleMusic.currentTime = 0; }

  playerNameInput.value = '';
  orientationBtn.classList.add('hidden');
  controls.classList.add('hidden');

  game.resetGame();
  game.placedShips = {};
  playerTurn = true;
  updateTurnIndicator();

  renderGrid(playerGridContainer, game.playerBoard.board);
  renderGrid(enemyGridContainer, game.enemyBoard.board);
  setupShipDock();
});
