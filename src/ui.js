// ui.js
// Handles DOM rendering, ship previews, UI updates, drag/click-to-place, and messages

let shipPreviewLabel = null;
let currentOrientation = 'horizontal';
let pickedShipName = null;
let pickedShipLength = 0;
let ghostShipCells = [];

// --- Orientation ---
export function toggleOrientation(buttonEl) {
  currentOrientation = currentOrientation === 'horizontal' ? 'vertical' : 'horizontal';
  if (buttonEl) buttonEl.textContent = `Rotate Ship: ${capitalize(currentOrientation)}`;
  showMessage(`Orientation: ${capitalize(currentOrientation)}`, 1000);
  return currentOrientation;
}

export function getOrientation() {
  return currentOrientation;
}

// --- Ship Preview Label ---
export function createShipPreviewLabel() {
  if (!shipPreviewLabel) {
    shipPreviewLabel = document.createElement('div');
    shipPreviewLabel.id = 'ship-preview-label';
    Object.assign(shipPreviewLabel.style, {
      position: 'absolute',
      padding: '5px 10px',
      backgroundColor: 'rgba(50,205,50,0.9)',
      color: '#fff',
      fontWeight: 'bold',
      borderRadius: '5px',
      pointerEvents: 'none',
      zIndex: 20,
      display: 'none',
    });
    document.body.appendChild(shipPreviewLabel);
  }
}

export function updateShipPreviewLabel(x, y, length, orientation, shipName = '', valid = true) {
  if (!shipPreviewLabel) return;
  shipPreviewLabel.textContent = valid ? shipName || `Ship: ${length}` : `${shipName} (Invalid)`;
  shipPreviewLabel.style.left = `${x}px`;
  shipPreviewLabel.style.top = `${y}px`;
}

export function showShipPreviewLabel() {
  if (shipPreviewLabel) shipPreviewLabel.style.display = 'block';
}

export function hideShipPreviewLabel() {
  if (shipPreviewLabel) shipPreviewLabel.style.display = 'none';
}

// --- Grid Rendering ---
export function renderGrid(container, board) {
  if (!container || !board) return;
  container.innerHTML = '';
  const gridSize = container.clientWidth / 10;
  container.style.position = 'relative';

  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.x = x;
      cell.dataset.y = y;
      Object.assign(cell.style, {
        width: `${gridSize}px`,
        height: `${gridSize}px`,
        boxSizing: 'border-box',
        border: '1px solid rgba(0,0,0,0.1)',
        backgroundColor: 'transparent',
      });
      container.appendChild(cell);
    }
  }

  // Render placed ships
  board.forEach((row, y) => {
    row.forEach((cellData, x) => {
      if (cellData?.ship && cellData.ship.placed) {
        const ship = cellData.ship;
        const shipDiv = document.createElement('div');
        shipDiv.classList.add('placed-ship');
        shipDiv.style.width = ship.orientation === 'horizontal'
          ? `${gridSize * ship.length}px`
          : `${gridSize}px`;
        shipDiv.style.height = ship.orientation === 'horizontal'
          ? `${gridSize}px`
          : `${gridSize * ship.length}px`;
        shipDiv.style.top = `${gridSize * ship.startY}px`;
        shipDiv.style.left = `${gridSize * ship.startX}px`;
        shipDiv.style.transform = `rotate(0deg)`;
        shipDiv.title = ship.name;
        container.appendChild(shipDiv);
      }
    });
  });
}

// --- Update individual cell (hit/miss) ---
export function updateCell(container, x, y, result) {
  if (!container) return;
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

// --- Snap coordinates to grid ---
function getGridCoords(clientX, clientY, container, length, orientation) {
  const rect = container.getBoundingClientRect();
  const gridSize = rect.width / 10;

  let x = Math.floor((clientX - rect.left) / gridSize);
  let y = Math.floor((clientY - rect.top) / gridSize);

  if (orientation === 'horizontal') {
    x = Math.min(x, 10 - length);
    y = Math.min(y, 9);
  } else {
    x = Math.min(x, 9);
    y = Math.min(y, 10 - length);
  }

  return { x, y, gridSize };
}

// --- Ghost Ship Preview ---
export function updateGhostShip(container, board, x, y, length, orientation, shipName = '') {
  clearGhostShip();
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

    if (board[hy][hx]?.ship) {
      valid = false;
      cell.classList.add('invalid-preview');
    } else {
      cell.classList.add('valid-preview');
    }

    ghostShipCells.push(cell);
  }

  if (shipPreviewLabel && ghostShipCells.length > 0) {
    const rect = ghostShipCells[0].getBoundingClientRect();
    updateShipPreviewLabel(rect.left, rect.top, length, orientation, shipName, valid);
    showShipPreviewLabel();
  }

  return valid;
}

export function clearGhostShip() {
  ghostShipCells.forEach(cell => {
    cell.classList.remove('valid-preview', 'invalid-preview');
  });
  ghostShipCells = [];
  hideShipPreviewLabel();
}

// --- Drag/Click-to-place Ships ---
export function initDragAndDrop(container, board, placeShipCallback) {
  const ships = document.querySelectorAll('.ship');

  ships.forEach(ship => {
    ship.addEventListener('click', () => pickShip(ship, container));
    ship.addEventListener('touchstart', e => { e.preventDefault(); pickShip(ship, container); });
  });

  const moveHandler = e => {
    if (!pickedShipName) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const { x, y } = getGridCoords(clientX, clientY, container, pickedShipLength, currentOrientation);
    updateGhostShip(container, board, x, y, pickedShipLength, currentOrientation, pickedShipName);
  };

  container.addEventListener('mousemove', moveHandler);
  container.addEventListener('touchmove', e => { e.preventDefault(); moveHandler(e); }, { passive: false });

  const placeHandler = e => {
    if (!pickedShipName) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const { x, y } = getGridCoords(clientX, clientY, container, pickedShipLength, currentOrientation);

    const valid = updateGhostShip(container, board, x, y, pickedShipLength, currentOrientation, pickedShipName);

    if (!valid) {
      showMessage('Invalid placement!', 1200);
      return;
    }

    // Place ship in board data structure
    const placed = placeShipCallback(pickedShipName, x, y, currentOrientation);

    if (placed) {
      renderGrid(container, board);
      showMessage(`${pickedShipName} placed!`);
    } else {
      showMessage('Invalid placement!', 1200);
    }

    pickedShipName = null;
    pickedShipLength = 0;
  };

  container.addEventListener('click', placeHandler);
  container.addEventListener('touchend', e => { e.preventDefault(); placeHandler(e); });

  // --- Listen for rotation key ---
  document.addEventListener('keydown', e => {
    if (!pickedShipName) return;
    if (e.key === 'r' || e.key === 'R') {
      toggleOrientation();
      if (pickedShipName) moveHandler(e); // update ghost ship after rotation
    }
  });
}

// --- Pick a ship helper ---
function pickShip(ship) {
  if (!pickedShipName) {
    pickedShipName = ship.dataset.ship;
    pickedShipLength = parseInt(ship.dataset.length, 10);
    showMessage(`Picked up ${pickedShipName}. Move over grid and click/tap to place.`);
  }
}

// --- Messages ---
export function showMessage(message, duration = 1500) {
  let msgDiv = document.getElementById('message');
  if (!msgDiv) {
    msgDiv = document.createElement('div');
    msgDiv.id = 'message';
    Object.assign(msgDiv.style, {
      position: 'absolute',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '10px 20px',
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: 'white',
      borderRadius: '5px',
      zIndex: 10,
      transition: 'all 0.3s ease',
    });
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

// --- Screens ---
export function toggleScreen(screen = 'intro') {
  const introScreen = document.getElementById('intro-screen');
  const setupScreen = document.getElementById('setup-screen');
  const battleScreen = document.getElementById('battle-screen');

  [introScreen, setupScreen, battleScreen].forEach(s => s?.classList.add('hidden'));

  switch (screen) {
    case 'intro': introScreen?.classList.remove('hidden'); break;
    case 'setup': setupScreen?.classList.remove('hidden'); break;
    case 'battle': battleScreen?.classList.remove('hidden'); break;
  }

  const msgDiv = document.getElementById('message');
  if (msgDiv) msgDiv.style.display = 'none';
}

// --- Helper ---
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
