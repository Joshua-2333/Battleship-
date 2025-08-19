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
renderGrid(playerGridContainer, game.playerBoard.board, true);
renderGrid(battlePlayerGridContainer, game.playerBoard.board, true);
renderGrid(enemyGridContainer, game.enemyBoard.board, false);

// --- Setup ship dock & drag/drop ---
function setupShipDock() {
  const dockShips = document.querySelectorAll('#ship-dock .ship');

  dockShips.forEach(shipEl => {
    shipEl.style.display = game.placedShips[shipEl.dataset.ship] ? 'none' : 'flex';
    shipEl.classList.remove('picked'); // remove highlight on setup
  });

  initDragAndDrop(playerGridContainer, game.playerBoard.board, (shipName, x, y, orientation) => {
    const placed = game.placePlayerShipByName(shipName, x, y, orientation);
    if (!placed) {
      showMessage('Invalid placement!');
      return false;
    }

    renderGrid(playerGridContainer, game.playerBoard.board, true);

    const shipEl = document.querySelector(`#ship-dock .ship[data-ship='${shipName}']`);
    if (shipEl) shipEl.style.display = 'none';

    game.placedShips[shipName] = true;

    // Remove highlight from any picked ship
    dockShips.forEach(s => s.classList.remove('picked'));

    // Enable confirm if all ships placed
    const allPlaced = game.shipsInfo.every(s => game.placedShips[s.name]);
    confirmBtn.disabled = !allPlaced;
    if (allPlaced) showMessage('All ships placed! Confirm to start the battle!');
    return true;
  });

  // Highlight picked ship in dock
  dockShips.forEach(shipEl => {
    shipEl.addEventListener('click', () => {
      dockShips.forEach(s => s.classList.remove('picked'));
      shipEl.classList.add('picked');
    });
  });
}

// --- Enable Start button only when player name is entered ---
playerNameInput.addEventListener('input', () => {
  startBtn.disabled = playerNameInput.value.trim().length === 0;
});

// --- Orientation toggle ---
orientationBtn.addEventListener('click', () => {
  toggleOrientation(orientationBtn);
});

// --- Enemy attack handler ---
function handleEnemyClick(e) {
  if (!game.gameStarted) {
    showMessage('Confirm your placements first!');
    return;
  }

  const cell = e.target;
  if (!cell.dataset.x || !cell.dataset.y) return;

  const x = +cell.dataset.x;
  const y = +cell.dataset.y;

  const result = game.attackEnemy(x, y);
  const boardCell = game.enemyBoard.getCell(x, y);

  renderGrid(enemyGridContainer, game.enemyBoard.board, false);
  renderGrid(battlePlayerGridContainer, game.playerBoard.board, true);

  if (result.result === 'hit') {
    hitSound.currentTime = 0;
    hitSound.play();
    updateCell(enemyGridContainer, x, y, 'hit');
    showMessage(boardCell?.ship ? `Hit! ${boardCell.ship.name}` : 'Hit!');
  } else if (result.result === 'miss') {
    missSound.currentTime = 0;
    missSound.play();
    updateCell(enemyGridContainer, x, y, 'miss');
    showMessage('Miss!');
  }

  if (game.enemyBoard.allShipsSunk()) showMessage('You won! All enemy ships sunk! 🎉', 3000);
  if (game.playerBoard.allShipsSunk()) showMessage('You lost! Your fleet has been destroyed! ☠️', 3000);
}

// --- Screen flow ---
// Start button → setup screen
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

  renderGrid(playerGridContainer, game.playerBoard.board, true);
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

  toggleScreen('battle');

  renderGrid(battlePlayerGridContainer, game.playerBoard.board, true);
  renderGrid(enemyGridContainer, game.enemyBoard.board, false);

  orientationBtn.classList.add('hidden');
  confirmBtn.disabled = true;

  showMessage('Battle started! Attack the enemy!');

  if (!enemyGridContainer.dataset.listener) {
    enemyGridContainer.addEventListener('click', handleEnemyClick);
    enemyGridContainer.dataset.listener = 'true';
  }
});

// Reset placements → empty player board
resetBtn.addEventListener('click', () => {
  game.resetGame();
  game.placedShips = {};
  game.gameStarted = false;

  renderGrid(playerGridContainer, game.playerBoard.board, true);
  setupShipDock();
  confirmBtn.disabled = true;

  showMessage('Placements cleared. Place your ships again!');
});

// Logo → reset everything
logo.addEventListener('click', () => {
  toggleScreen('intro');

  battleMusic.pause();
  battleMusic.currentTime = 0;
  playerNameInput.value = '';
  orientationBtn.classList.add('hidden');
  controls.classList.add('hidden');

  game.resetGame();
  game.placedShips = {};
  game.gameStarted = false;

  renderGrid(playerGridContainer, game.playerBoard.board, true);
  renderGrid(enemyGridContainer, game.enemyBoard.board, false);
  setupShipDock();
});
