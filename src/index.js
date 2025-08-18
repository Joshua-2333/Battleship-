// index.js
import './styles.css';
import { createGame } from './game';
import { renderGrid, highlightPreview, clearPreview, showMessage, toggleScreen } from './ui';
import { logo, startBtn, playerNameInput, playerGridContainer, enemyGridContainer, battleMusic } from './dom';

const game = createGame();

// Initial render
renderGrid(playerGridContainer, game.playerBoard.board, true);
renderGrid(enemyGridContainer, game.enemyBoard.board, false);

// Orientation button
const orientationBtn = document.createElement('button');
orientationBtn.textContent = 'Orientation: Horizontal';
orientationBtn.style.margin = '10px';
orientationBtn.addEventListener('click', () => {
  const newOrientation = game.toggleOrientation();
  orientationBtn.textContent = `Orientation: ${newOrientation.charAt(0).toUpperCase() + newOrientation.slice(1)}`;
});
document.body.insertBefore(orientationBtn, document.getElementById('game-screen'));

// Player grid hover preview
playerGridContainer.addEventListener('mousemove', (e) => {
  const cell = e.target;
  if (!cell.dataset.x || !cell.dataset.y) return;

  const x = parseInt(cell.dataset.x, 10);
  const y = parseInt(cell.dataset.y, 10);
  const length = game.shipLengths[game.currentShipIndex];

  highlightPreview(playerGridContainer, game.playerBoard.board, x, y, length, game.orientation);
});

playerGridContainer.addEventListener('mouseleave', () => {
  clearPreview(playerGridContainer, game.playerBoard.board);
});

// Player grid click for placing ships
playerGridContainer.addEventListener('click', (e) => {
  const cell = e.target;
  if (!cell.dataset.x || !cell.dataset.y) return;

  const x = parseInt(cell.dataset.x, 10);
  const y = parseInt(cell.dataset.y, 10);

  if (!game.placePlayerShip(x, y)) {
    showMessage('Invalid placement!');
    return;
  }

  renderGrid(playerGridContainer, game.playerBoard.board, true);

  if (game.currentShipIndex === game.shipLengths.length) {
    startBtn.disabled = false;
    showMessage('All ships placed! Start the battle!');
  }
});

// Enemy grid click for attacking
enemyGridContainer.addEventListener('click', (e) => {
  const cell = e.target;
  if (!cell.dataset.x || !cell.dataset.y) return;

  const x = parseInt(cell.dataset.x, 10);
  const y = parseInt(cell.dataset.y, 10);

  const result = game.attackEnemy(x, y);
  renderGrid(enemyGridContainer, game.enemyBoard.board, false);
  renderGrid(playerGridContainer, game.playerBoard.board, true);

  if (result === 'hit') {
    showMessage('Hit!');
  } else if (result === 'miss') {
    showMessage('Miss!');
  }
});

// Start button
startBtn.addEventListener('click', () => {
  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    showMessage('Please enter your captain name!');
    return;
  }

  game.startGame();
  toggleScreen(false);
  battleMusic.play().catch(err => console.log('Autoplay blocked:', err));
});

// Logo click resets game
logo.addEventListener('click', () => {
  toggleScreen(true);
  battleMusic.pause();
  battleMusic.currentTime = 0;
  playerNameInput.value = '';
  startBtn.disabled = true;
  game.resetGame();
  renderGrid(playerGridContainer, game.playerBoard.board, true);
  renderGrid(enemyGridContainer, game.enemyBoard.board, false);
});
