// index.js
import './styles.css';
import { createGame } from './game';
import { renderGrid, highlightPreview, clearPreview, showMessage, toggleScreen, updateCell } from './ui';
import { 
  logo, startBtn, playerNameInput, 
  playerGridContainer, enemyGridContainer, 
  battleMusic, hitSound, missSound,
  orientationBtn, confirmBtn, resetBtn, controls
} from './dom';

const game = createGame();

// Initial render (empty grids)
renderGrid(playerGridContainer, game.playerBoard.board, true);
renderGrid(enemyGridContainer, game.enemyBoard.board, false);

// ------------------ INPUT WATCHER ------------------ //
playerNameInput.addEventListener('input', () => {
  startBtn.disabled = playerNameInput.value.trim().length === 0;
});

// ------------------ ORIENTATION ------------------ //
orientationBtn.addEventListener('click', () => {
  const newOrientation = game.toggleOrientation();
  orientationBtn.textContent = `Orientation: ${newOrientation.charAt(0).toUpperCase() + newOrientation.slice(1)}`;
});

// ------------------ PREVIEW HELPERS ------------------ //
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

function handlePreview(e) {
  const coords = getCoordsFromEvent(e);
  if (!coords) return;

  // Ensure playerBoard and shipLengths exist
  if (!game.playerBoard?.board || !Array.isArray(game.shipLengths)) return;

  // Only preview if still placing ships
  if (game.currentShipIndex >= game.shipLengths.length) return;

  const length = game.shipLengths[game.currentShipIndex];
  highlightPreview(
    playerGridContainer,
    game.playerBoard.board,
    coords.x,
    coords.y,
    length,
    game.orientation,
    `Ship ${game.currentShipIndex + 1}`,
    coords.clientX,
    coords.clientY
  );
}

// ------------------ SHIP PLACEMENT ------------------ //
function placeShipHandler(e) {
  const coords = getCoordsFromEvent(e);
  if (!coords) return;

  if (!game.placePlayerShip(coords.x, coords.y)) {
    showMessage('Invalid placement!');
    return;
  }

  renderGrid(playerGridContainer, game.playerBoard.board, true);

  if (game.currentShipIndex === game.shipLengths.length) {
    confirmBtn.disabled = false;
    showMessage('All ships placed! Confirm to start the battle!');
  }
}

// ------------------ ENEMY ATTACKS ------------------ //
enemyGridContainer.addEventListener('click', (e) => {
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

  renderGrid(enemyGridContainer, game.enemyBoard.board, false);
  renderGrid(playerGridContainer, game.playerBoard.board, true);

  if (result.result === 'hit') {
    hitSound.currentTime = 0;
    hitSound.play();
    showMessage(boardCell?.ship ? `Hit! ${boardCell.ship.name}` : 'Hit!');
    updateCell(enemyGridContainer, x, y, 'hit');
  } else if (result.result === 'miss') {
    missSound.currentTime = 0;
    missSound.play();
    showMessage('Miss!');
    updateCell(enemyGridContainer, x, y, 'miss');
  }

  if (game.enemyBoard.allShipsSunk()) {
    showMessage('You won! All enemy ships sunk! 🎉', 3000);
  } else if (game.playerBoard.allShipsSunk()) {
    showMessage('You lost! Your fleet has been destroyed! ☠️', 3000);
  }
});

// ------------------ SCREEN FLOW ------------------ //
// Start button → placement screen
startBtn.addEventListener('click', () => {
  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    showMessage('Please enter your captain name!');
    return;
  }

  toggleScreen(false);
  battleMusic.play().catch(err => console.log('Autoplay blocked:', err));

  // Reset placement state
  game.resetGame();
  game.currentShipIndex = 0;
  game.isConfirmed = false;

  renderGrid(playerGridContainer, game.playerBoard.board, true);
  renderGrid(enemyGridContainer, game.enemyBoard.board, false);

  orientationBtn.classList.remove('hidden');
  controls.classList.remove('hidden');
  confirmBtn.disabled = true;

  // Enable preview & placement
  playerGridContainer.addEventListener('mousemove', handlePreview);
  playerGridContainer.addEventListener('touchmove', handlePreview, { passive: false });
  playerGridContainer.addEventListener('click', placeShipHandler);
  playerGridContainer.addEventListener('touchend', placeShipHandler);

  showMessage(`Welcome Captain ${playerName}, place your ships!`);
});

// Confirm placements → start game
confirmBtn.addEventListener('click', () => {
  if (!Array.isArray(game.shipLengths) || game.currentShipIndex < game.shipLengths.length) {
    showMessage('You must place all ships first!');
    return;
  }

  game.startGame();
  game.isConfirmed = true;
  confirmBtn.disabled = true;
  orientationBtn.classList.add('hidden');
  showMessage('Battle started! Attack the enemy!');
});

// Reset placements → back to empty player board
resetBtn.addEventListener('click', () => {
  game.resetGame();
  game.currentShipIndex = 0;
  game.isConfirmed = false;
  renderGrid(playerGridContainer, game.playerBoard.board, true);
  renderGrid(enemyGridContainer, game.enemyBoard.board, false);
  confirmBtn.disabled = true;
  showMessage('Placements cleared. Place your ships again!');
});

// Logo resets everything
logo.addEventListener('click', () => {
  toggleScreen(true);
  battleMusic.pause();
  battleMusic.currentTime = 0;
  playerNameInput.value = '';
  orientationBtn.classList.add('hidden');
  controls.classList.add('hidden');
  game.resetGame();
  renderGrid(playerGridContainer, game.playerBoard.board, true);
  renderGrid(enemyGridContainer, game.enemyBoard.board, false);
});
