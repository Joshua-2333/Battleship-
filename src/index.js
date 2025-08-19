// index.js
import './styles.css';
import { createGame } from './game';
import { 
  renderGrid, highlightPreview, clearPreview, showMessage, 
  toggleScreen, updateCell, hideShipPreviewLabel, createShipPreviewLabel 
} from './ui';
import { 
  logo, startBtn, playerNameInput, 
  playerGridContainer, battlePlayerGridContainer, enemyGridContainer, 
  battleMusic, hitSound, missSound,
  orientationBtn, confirmBtn, resetBtn, controls
} from './dom';

// --- Initialize game and UI ---
const game = createGame();
createShipPreviewLabel(); // initialize floating ship preview

// --- Render initial grids ---
renderGrid(playerGridContainer, game.playerBoard.board, true);
renderGrid(battlePlayerGridContainer, game.playerBoard.board, true);
renderGrid(enemyGridContainer, game.enemyBoard.board, false);

// --- Enable Start button only when player name is entered ---
playerNameInput.addEventListener('input', () => {
  startBtn.disabled = playerNameInput.value.trim().length === 0;
});

// --- Orientation toggle ---
orientationBtn.addEventListener('click', () => {
  const newOrientation = game.toggleOrientation();
  orientationBtn.textContent = `Orientation: ${newOrientation.charAt(0).toUpperCase() + newOrientation.slice(1)}`;
});

// --- Helper to get coords from mouse/touch events ---
function getCoordsFromEvent(e) {
  if (e.touches && e.touches.length > 0) {
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!target?.dataset.x || !target?.dataset.y) return null;
    return { x: +target.dataset.x, y: +target.dataset.y, clientX: touch.clientX, clientY: touch.clientY };
  } else {
    const target = e.target;
    if (!target?.dataset.x || !target?.dataset.y) return null;
    return { x: +target.dataset.x, y: +target.dataset.y, clientX: e.clientX, clientY: e.clientY };
  }
}

// --- Ship preview ---
function handlePreview(e) {
  const coords = getCoordsFromEvent(e);
  if (!coords) return;

  const shipsInfo = game.shipsInfo;
  if (!shipsInfo || game.currentShipIndex >= shipsInfo.length) return;

  const length = shipsInfo[game.currentShipIndex].length;
  const name = shipsInfo[game.currentShipIndex].name;

  highlightPreview(
    playerGridContainer,
    game.playerBoard.board,
    coords.x,
    coords.y,
    length,
    game.orientation,
    name,
    coords.clientX,
    coords.clientY
  );
}

// --- Place ship ---
function placeShipHandler(e) {
  const coords = getCoordsFromEvent(e);
  if (!coords) return;

  const placed = game.placePlayerShip(coords.x, coords.y);
  if (!placed) {
    showMessage('Invalid placement!');
    return;
  }

  renderGrid(playerGridContainer, game.playerBoard.board, true);

  if (game.currentShipIndex === game.shipsInfo.length) {
    confirmBtn.disabled = false;
    showMessage('All ships placed! Confirm to start the battle!');
  }
}

// --- Enable / disable placement listeners ---
function enablePlacementListeners() {
  playerGridContainer.addEventListener('mousemove', handlePreview);
  playerGridContainer.addEventListener('touchmove', handlePreview, { passive: false });
  playerGridContainer.addEventListener('click', placeShipHandler);
  playerGridContainer.addEventListener('touchend', placeShipHandler);
}

function disablePlacementListeners() {
  playerGridContainer.removeEventListener('mousemove', handlePreview);
  playerGridContainer.removeEventListener('touchmove', handlePreview);
  playerGridContainer.removeEventListener('click', placeShipHandler);
  playerGridContainer.removeEventListener('touchend', placeShipHandler);
  hideShipPreviewLabel();
}

// --- Enemy attack ---
function handleEnemyClick(e) {
  if (!game.isConfirmed) {
    showMessage('Confirm your placements first!');
    return;
  }

  const cell = e.target;
  if (!cell.dataset.x || !cell.dataset.y) return;

  const x = +cell.dataset.x;
  const y = +cell.dataset.y;

  const result = game.attackEnemy(x, y);
  const boardCell = game.enemyBoard.getCell(x, y);

  // Update grids
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

  if (game.enemyBoard.allShipsSunk()) {
    showMessage('You won! All enemy ships sunk! 🎉', 3000);
  } else if (game.playerBoard.allShipsSunk()) {
    showMessage('You lost! Your fleet has been destroyed! ☠️', 3000);
  }
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
  game.currentShipIndex = 0;
  game.isConfirmed = false;

  renderGrid(playerGridContainer, game.playerBoard.board, true);

  orientationBtn.classList.remove('hidden');
  controls.classList.remove('hidden');
  confirmBtn.disabled = true;

  enablePlacementListeners();

  showMessage(`Welcome Captain ${playerName}, place your ships!`);
});

// Confirm placements → battle screen
confirmBtn.addEventListener('click', () => {
  if (game.currentShipIndex < game.shipsInfo.length) {
    showMessage('You must place all ships first!');
    return;
  }

  game.startGame();
  game.isConfirmed = true;

  toggleScreen('battle');

  renderGrid(battlePlayerGridContainer, game.playerBoard.board, true);
  renderGrid(enemyGridContainer, game.enemyBoard.board, false);

  orientationBtn.classList.add('hidden');
  confirmBtn.disabled = true;

  disablePlacementListeners();

  showMessage('Battle started! Attack the enemy!');

  enemyGridContainer.addEventListener('click', handleEnemyClick);
});

// Reset placements → empty player board
resetBtn.addEventListener('click', () => {
  game.resetGame();
  game.currentShipIndex = 0;
  game.isConfirmed = false;

  renderGrid(playerGridContainer, game.playerBoard.board, true);
  confirmBtn.disabled = true;

  enablePlacementListeners();
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
  renderGrid(playerGridContainer, game.playerBoard.board, true);
  renderGrid(enemyGridContainer, game.enemyBoard.board, false);

  disablePlacementListeners();
});
