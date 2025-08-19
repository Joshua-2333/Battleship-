// ui.js
// Handles DOM rendering, hover previews, UI updates, and floating ship preview

let shipPreviewLabel = null;

// --- Floating Ship Preview Functions ---
export function createShipPreviewLabel() {
  if (!shipPreviewLabel) {
    shipPreviewLabel = document.createElement('div');
    shipPreviewLabel.id = 'ship-preview-label';
    shipPreviewLabel.style.position = 'absolute';
    shipPreviewLabel.style.padding = '5px 10px';
    shipPreviewLabel.style.backgroundColor = 'rgba(50,205,50,0.9)';
    shipPreviewLabel.style.color = '#fff';
    shipPreviewLabel.style.fontWeight = 'bold';
    shipPreviewLabel.style.borderRadius = '5px';
    shipPreviewLabel.style.pointerEvents = 'none';
    shipPreviewLabel.style.zIndex = 20;
    shipPreviewLabel.style.transition = 'transform 0.1s ease, opacity 0.2s ease';
    shipPreviewLabel.style.display = 'none';
    document.body.appendChild(shipPreviewLabel);
  }
}

export function updateShipPreviewLabel(x, y, length, orientation, shipName = '') {
  if (!shipPreviewLabel) return;
  shipPreviewLabel.textContent = shipName || `Ship: ${length} (${orientation})`;
  shipPreviewLabel.style.left = `${x + 15}px`;
  shipPreviewLabel.style.top = `${y + 15}px`;
}

export function showShipPreviewLabel() {
  if (shipPreviewLabel) shipPreviewLabel.style.display = 'block';
}

export function hideShipPreviewLabel() {
  if (shipPreviewLabel) shipPreviewLabel.style.display = 'none';
}

// --- Grid Rendering Functions ---
export function renderGrid(container, board, showShips = false) {
  container.innerHTML = '';
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.x = x;
      cell.dataset.y = y;
      container.appendChild(cell);

      const boardCell = board[y][x];
      if (showShips && boardCell && boardCell.ship) {
        cell.style.backgroundColor = '#808080';
      }
    }
  }
}

// --- Update individual cell on hit/miss ---
export function updateCell(container, x, y, result) {
  const cell = container.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
  if (!cell) return;

  if (result === 'hit') {
    cell.style.backgroundColor = 'red';
    cell.classList.add('hit');
    setTimeout(() => cell.classList.remove('hit'), 200);
  } else if (result === 'miss') {
    cell.style.backgroundColor = 'white';
    cell.classList.add('miss');
    setTimeout(() => cell.classList.remove('miss'), 300);
  }
}

// --- Ship Placement Preview Functions ---
export function highlightPreview(container, board, x, y, length, orientation, shipName = '', clientX = 0, clientY = 0) {
  container.querySelectorAll('.cell').forEach(c => {
    const cx = parseInt(c.dataset.x, 10);
    const cy = parseInt(c.dataset.y, 10);
    const boardCell = board[cy][cx];
    c.style.backgroundColor = boardCell && boardCell.ship ? '#808080' : 'transparent';
    c.classList.remove('valid-preview', 'invalid-preview');
  });

  let valid = true;

  for (let i = 0; i < length; i++) {
    const hx = orientation === 'horizontal' ? x + i : x;
    const hy = orientation === 'horizontal' ? y : y + i;

    if (hx >= board[0].length || hy >= board.length) {
      valid = false;
      break;
    }

    const cell = container.querySelector(`.cell[data-x='${hx}'][data-y='${hy}']`);
    if (!cell) continue;

    const boardCell = board[hy][hx];
    if (!boardCell) {
      cell.classList.add('valid-preview');
    } else {
      cell.classList.add('invalid-preview');
      valid = false;
    }
  }

  if (shipName) {
    showShipPreviewLabel();
    updateShipPreviewLabel(clientX, clientY, length, orientation, valid ? shipName : `${shipName} (Invalid)`);
  }
}

export function clearPreview(container, board) {
  container.querySelectorAll('.cell').forEach(c => {
    const x = parseInt(c.dataset.x, 10);
    const y = parseInt(c.dataset.y, 10);
    const boardCell = board[y][x];
    c.style.backgroundColor = boardCell && boardCell.ship ? '#808080' : 'transparent';
    c.classList.remove('valid-preview', 'invalid-preview');
  });
  hideShipPreviewLabel();
}

// --- Message Functions ---
export function showMessage(message, duration = 1500) {
  let msgDiv = document.getElementById('message');
  if (!msgDiv) {
    msgDiv = document.createElement('div');
    msgDiv.id = 'message';
    msgDiv.style.position = 'absolute';
    msgDiv.style.top = '10px';
    msgDiv.style.left = '50%';
    msgDiv.style.transform = 'translateX(-50%)';
    msgDiv.style.padding = '10px 20px';
    msgDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
    msgDiv.style.color = 'white';
    msgDiv.style.borderRadius = '5px';
    msgDiv.style.zIndex = 10;
    msgDiv.style.transition = 'all 0.3s ease';
    document.body.appendChild(msgDiv);
  }
  msgDiv.textContent = message;
  msgDiv.style.display = 'block';
  msgDiv.style.opacity = '1';

  setTimeout(() => {
    msgDiv.style.opacity = '0';
    setTimeout(() => { msgDiv.style.display = 'none'; }, 300);
  }, duration);
}

// --- Screen / Flow Functions ---
export function toggleScreen(screen = 'intro') {
  const introScreen = document.getElementById('intro-screen');
  const gameScreen = document.getElementById('game-screen');
  const setupScreen = document.getElementById('setup-screen');
  const battleScreen = document.getElementById('battle-screen');

  if (introScreen) introScreen.classList.add('hidden');
  if (gameScreen) gameScreen.classList.add('hidden');
  if (setupScreen) setupScreen.classList.add('hidden');
  if (battleScreen) battleScreen.classList.add('hidden');

  switch (screen) {
    case 'intro':
      if (introScreen) introScreen.classList.remove('hidden');
      break;
    case 'setup':
      if (gameScreen) gameScreen.classList.remove('hidden');
      if (setupScreen) setupScreen.classList.remove('hidden');
      break;
    case 'battle':
      if (gameScreen) gameScreen.classList.remove('hidden');
      if (battleScreen) battleScreen.classList.remove('hidden');
      break;
    default:
      console.warn(`Unknown screen: ${screen}`);
  }

  const msgDiv = document.getElementById('message');
  if (msgDiv) msgDiv.style.display = 'none';
}
