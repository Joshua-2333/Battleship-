// ui.js
// Handles DOM rendering, hover previews, UI updates, and drag-and-drop ship placement

let shipPreviewLabel = null;
let currentOrientation = 'horizontal'; // default orientation
let draggedShip = null; // Ship being dragged
let dragOffset = { x: 0, y: 0 }; // offset for touch/mouse dragging

// --- Orientation Functions ---
export function toggleOrientation(buttonEl) {
  currentOrientation = currentOrientation === 'horizontal' ? 'vertical' : 'horizontal';
  if (buttonEl) buttonEl.textContent = `Rotate Ship: ${capitalize(currentOrientation)}`;
  return currentOrientation;
}

export function getOrientation() {
  return currentOrientation;
}

// --- Floating Ship Preview ---
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
      transition: 'transform 0.1s ease, opacity 0.2s ease',
      display: 'none',
    });
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
  if (!container || !board) return;
  container.innerHTML = '';
  const cellSize = 50;
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.style.width = `${cellSize}px`;
      cell.style.height = `${cellSize}px`;
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

// --- Ship Placement Preview ---
export function highlightPreview(container, board, x, y, length, orientation, shipName = '', clientX = 0, clientY = 0) {
  if (!container || !board) return;

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
    if (!boardCell || !boardCell.ship) {
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
  if (!container || !board) return;
  container.querySelectorAll('.cell').forEach(c => {
    const x = parseInt(c.dataset.x, 10);
    const y = parseInt(c.dataset.y, 10);
    const boardCell = board[y][x];
    c.style.backgroundColor = boardCell && boardCell.ship ? '#808080' : 'transparent';
    c.classList.remove('valid-preview', 'invalid-preview');
  });
  hideShipPreviewLabel();
}

// --- Drag & Drop Handlers ---
export function initDragAndDrop(container, board, placeShipCallback) {
  if (!container || !board) return;
  const ships = document.querySelectorAll('.ship');

  ships.forEach(ship => {
    ship.addEventListener('dragstart', e => {
      draggedShip = ship;
      e.dataTransfer.setData('text/plain', ship.dataset.ship);
    });

    ship.addEventListener('touchstart', e => {
      draggedShip = ship;
      const touch = e.touches[0];
      dragOffset.x = touch.clientX - ship.getBoundingClientRect().left;
      dragOffset.y = touch.clientY - ship.getBoundingClientRect().top;
      ship.style.position = 'absolute';
      ship.style.zIndex = 1000;
      ship.style.pointerEvents = 'none';
    });
  });

  // Desktop drop
  container.addEventListener('dragover', e => e.preventDefault());
  container.addEventListener('drop', e => {
    e.preventDefault();
    if (!draggedShip) return;
    const rect = container.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / 10));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / 10));
    placeShipCallback(draggedShip.dataset.ship, x, y, currentOrientation);
    draggedShip.remove();
    draggedShip = null;
    clearPreview(container, board);
  });

  // Touch move & drop
  document.addEventListener('touchmove', e => {
    if (!draggedShip) return;
    const touch = e.touches[0];
    draggedShip.style.left = `${touch.clientX - dragOffset.x}px`;
    draggedShip.style.top = `${touch.clientY - dragOffset.y}px`;

    const rect = container.getBoundingClientRect();
    const x = Math.floor((touch.clientX - rect.left) / (rect.width / 10));
    const y = Math.floor((touch.clientY - rect.top) / (rect.height / 10));

    highlightPreview(
      container,
      board,
      x,
      y,
      parseInt(draggedShip.dataset.length, 10),
      currentOrientation,
      draggedShip.dataset.ship,
      touch.clientX,
      touch.clientY
    );
  });

  document.addEventListener('touchend', e => {
    if (!draggedShip) return;
    const rect = container.getBoundingClientRect();
    const touch = e.changedTouches[0];
    const x = Math.floor((touch.clientX - rect.left) / (rect.width / 10));
    const y = Math.floor((touch.clientY - rect.top) / (rect.height / 10));

    placeShipCallback(draggedShip.dataset.ship, x, y, currentOrientation);
    draggedShip.remove();
    draggedShip = null;
    clearPreview(container, board);
  });
}

// --- Message Functions ---
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

// --- Screen / Flow Functions ---
export function toggleScreen(screen = 'intro') {
  const introScreen = document.getElementById('intro-screen');
  const setupScreen = document.getElementById('setup-screen');
  const battleScreen = document.getElementById('battle-screen');

  [introScreen, setupScreen, battleScreen].forEach(s => s?.classList.add('hidden'));

  switch (screen) {
    case 'intro': introScreen?.classList.remove('hidden'); break;
    case 'setup': setupScreen?.classList.remove('hidden'); break;
    case 'battle': battleScreen?.classList.remove('hidden'); break;
    default: console.warn(`Unknown screen: ${screen}`);
  }

  const msgDiv = document.getElementById('message');
  if (msgDiv) msgDiv.style.display = 'none';
}

// --- Helper ---
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
