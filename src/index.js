import './styles.css';
import createGameboard from './gameboard';

// Import images
import logoImg from './images/logo.png';
import scrollBgImg from './images/pirateScroll.png';
import startBtnImg from './images/start_btn.png';
import player1Img from './images/player1.png';
import player2Img from './images/player2.png';
import woodTextureImg from './images/wood_texture.jpg';

// Import audio
import battleSong from './sfx/battleSong.mp3';
import hitSoundFile from './sfx/hitSound.mp3';
import missSoundFile from './sfx/missSound.mp3';

// Set wood background
document.body.style.backgroundImage = `url(${woodTextureImg})`;
document.body.style.backgroundSize = 'cover';
document.body.style.backgroundRepeat = 'no-repeat';

// Attach images
document.getElementById('logo').src = logoImg;
document.getElementById('scroll-bg').src = scrollBgImg;
document.getElementById('player1-img').src = player1Img;
document.getElementById('player2-img').src = player2Img;

// Start button styling
const startBtn = document.getElementById('start-btn');
startBtn.style.backgroundImage = `url(${startBtnImg})`;
startBtn.style.backgroundSize = 'contain';
startBtn.style.backgroundRepeat = 'no-repeat';
startBtn.style.width = '250px';
startBtn.style.height = '120px';
startBtn.setAttribute('aria-label', 'Start Game'); 
startBtn.style.cursor = 'pointer';
startBtn.disabled = true; // disabled until all ships are placed

// Audio
const battleMusic = document.getElementById('battle-music');
battleMusic.src = battleSong;
const hitSound = new Audio(hitSoundFile);
const missSound = new Audio(missSoundFile);

// DOM elements
const introScreen = document.getElementById('intro-screen');
const gameScreen = document.getElementById('game-screen');
const playerNameInput = document.getElementById('player-name');
const logo = document.getElementById('logo');
const playerGridContainer = document.getElementById('player-grid');
const enemyGridContainer = document.getElementById('enemy-grid');

// Initialize gameboards
const playerBoard = createGameboard();
const enemyBoard = createGameboard();

// Ship placement config
const shipLengths = [5, 4, 3, 3, 2]; // example fleet
let currentShipIndex = 0;
let orientation = 'horizontal'; // default

// Render grid helper
function renderGrid(container, board, showShips = false) {
  container.innerHTML = '';
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.style.width = '30px';
      cell.style.height = '30px';
      cell.style.border = '1px solid #000';
      cell.style.display = 'inline-block';
      cell.style.boxSizing = 'border-box';
      cell.style.backgroundColor = '#87CEFA'; // water

      if (showShips && board.board[y][x] && board.board[y][x] !== 'miss') {
        cell.style.backgroundColor = '#808080'; // ship gray
      }

      container.appendChild(cell);
    }
    container.appendChild(document.createElement('br'));
  }
}

// Function to highlight hover preview
function highlightPreview(x, y, length, orientation) {
  document.querySelectorAll('.cell').forEach(c => {
    if (!playerBoard.board[c.dataset.y][c.dataset.x]) {
      c.style.backgroundColor = '#87CEFA';
    }
  });

  for (let i = 0; i < length; i++) {
    let hx = orientation === 'horizontal' ? x + i : x;
    let hy = orientation === 'horizontal' ? y : y + i;

    if (hx >= 10 || hy >= 10) break;

    const cell = playerGridContainer.querySelector(`div[data-x='${hx}'][data-y='${hy}']`);
    if (!cell) continue;

    if (playerBoard.board[hy][hx] === null) {
      cell.style.backgroundColor = '#32CD32'; // green valid
    } else {
      cell.style.backgroundColor = '#FF6347'; // red invalid
    }
  }
}

// Initial render
renderGrid(playerGridContainer, playerBoard, true);
renderGrid(enemyGridContainer, enemyBoard, false);

// Toggle orientation button
const orientationBtn = document.createElement('button');
orientationBtn.textContent = 'Orientation: Horizontal';
orientationBtn.style.margin = '10px';
orientationBtn.addEventListener('click', () => {
  orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
  orientationBtn.textContent = `Orientation: ${orientation.charAt(0).toUpperCase() + orientation.slice(1)}`;
});
document.body.insertBefore(orientationBtn, gameScreen);

// Player ship hover preview
playerGridContainer.addEventListener('mousemove', (e) => {
  const cell = e.target;
  if (!cell.dataset.x || !cell.dataset.y) return;
  if (currentShipIndex >= shipLengths.length) return;

  const x = parseInt(cell.dataset.x, 10);
  const y = parseInt(cell.dataset.y, 10);
  const length = shipLengths[currentShipIndex];

  highlightPreview(x, y, length, orientation);
});

// Remove highlight when leaving grid
playerGridContainer.addEventListener('mouseleave', () => {
  renderGrid(playerGridContainer, playerBoard, true);
});

// Player ship placement
playerGridContainer.addEventListener('click', (e) => {
  const cell = e.target;
  if (!cell.dataset.x || !cell.dataset.y) return;
  if (currentShipIndex >= shipLengths.length) return;

  const x = parseInt(cell.dataset.x, 10);
  const y = parseInt(cell.dataset.y, 10);
  const length = shipLengths[currentShipIndex];

  if (!playerBoard.isValidPlacement(length, x, y, orientation)) {
    alert('Invalid placement!');
    return;
  }

  playerBoard.placeShip(length, x, y, orientation);
  currentShipIndex++;
  renderGrid(playerGridContainer, playerBoard, true);

  if (currentShipIndex === shipLengths.length) {
    startBtn.disabled = false;
    alert('All ships placed! Start the battle!');
  }
});

// Random enemy ship placement
function placeEnemyShipsRandomly() {
  for (const length of shipLengths) {
    let placed = false;
    while (!placed) {
      const dir = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const x = Math.floor(Math.random() * 10);
      const y = Math.floor(Math.random() * 10);
      if (enemyBoard.isValidPlacement(length, x, y, dir)) {
        enemyBoard.placeShip(length, x, y, dir);
        placed = true;
      }
    }
  }
}

placeEnemyShipsRandomly();
renderGrid(enemyGridContainer, enemyBoard, false);

// Attack functions
function attackEnemy(x, y) {
  const result = enemyBoard.receiveAttack(x, y);
  const cell = enemyGridContainer.querySelector(`div[data-x='${x}'][data-y='${y}']`);
  if (!cell) return;

  if (result === 'hit') {
    cell.style.backgroundColor = 'red';
    hitSound.play().catch(() => {});
  } else if (result === 'miss') {
    cell.style.backgroundColor = 'white';
    missSound.play().catch(() => {});
  }

  if (enemyBoard.allShipsSunk()) {
    alert('You win!');
  } else {
    setTimeout(computerAttack, 500); // computer attacks after 0.5s
  }

  return result;
}

function computerAttack() {
  let x, y, result;
  do {
    x = Math.floor(Math.random() * 10);
    y = Math.floor(Math.random() * 10);
    result = playerBoard.receiveAttack(x, y);
  } while (result === 'already attacked');

  const cell = playerGridContainer.querySelector(`div[data-x='${x}'][data-y='${y}']`);
  if (!cell) return;

  if (result === 'hit') {
    cell.style.backgroundColor = 'red';
    hitSound.play().catch(() => {});
  } else if (result === 'miss') {
    cell.style.backgroundColor = 'white';
    missSound.play().catch(() => {});
  }

  if (playerBoard.allShipsSunk()) {
    alert('Computer wins!');
  }
}

// Enemy grid click
enemyGridContainer.addEventListener('click', (e) => {
  const cell = e.target;
  if (!cell.dataset.x || !cell.dataset.y) return;
  attackEnemy(parseInt(cell.dataset.x, 10), parseInt(cell.dataset.y, 10));
});

// Start Game button
startBtn.addEventListener('click', () => {
  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    alert('Please enter your captain name!');
    return;
  }

  introScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');

  battleMusic.play().catch(err => console.log('Autoplay blocked:', err));

  console.log(`Captain ${playerName} has entered the battle!`);
});

// Logo click handler
logo.addEventListener('click', () => {
  gameScreen.classList.add('hidden');
  introScreen.classList.remove('hidden');
  battleMusic.pause();
  battleMusic.currentTime = 0;
  playerNameInput.value = '';
  playerBoard.ships.length = 0;
  currentShipIndex = 0;
  startBtn.disabled = true;
  renderGrid(playerGridContainer, playerBoard, true);
});
