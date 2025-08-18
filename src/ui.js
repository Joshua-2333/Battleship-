// ui.js
// Handles DOM rendering, hover previews, and UI updates

// Render a 10x10 grid
export function renderGrid(container, board, showShips = false) {
  container.innerHTML = '';
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
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
      cell.style.transition = 'all 0.3s ease';

      const boardCell = board[y][x];
      if (showShips && boardCell && boardCell.ship) {
        cell.style.backgroundColor = '#808080'; // ship gray
      }

      container.appendChild(cell);
    }
    container.appendChild(document.createElement('br'));
  }
}

export function updateCell(container, x, y, result) {
  const cell = container.querySelector(`div[data-x='${x}'][data-y='${y}']`);
  if (!cell) return;

  if (result === 'hit') {
    cell.style.backgroundColor = 'red';
    cell.style.transform = 'scale(1.1) rotate(-5deg)';
    cell.style.transition = 'transform 0.1s ease, background-color 0.2s ease';
    setTimeout(() => {
      cell.style.transform = 'scale(1) rotate(0deg)';
    }, 200);
  } else if (result === 'miss') {
    cell.style.backgroundColor = 'white';
    cell.style.opacity = '0.7';
    cell.style.transition = 'opacity 0.3s ease, background-color 0.3s ease';
    setTimeout(() => {
      cell.style.opacity = '1';
    }, 300);
  }
}

export function highlightPreview(container, board, x, y, length, orientation) {
  container.querySelectorAll('.cell').forEach(c => {
    const cx = parseInt(c.dataset.x, 10);
    const cy = parseInt(c.dataset.y, 10);
    const boardCell = board[cy][cx];
    c.style.backgroundColor = boardCell && boardCell.ship ? '#808080' : '#87CEFA';
  });

  for (let i = 0; i < length; i++) {
    const hx = orientation === 'horizontal' ? x + i : x;
    const hy = orientation === 'horizontal' ? y : y + i;
    if (hx >= board.length || hy >= board.length) break;

    const cell = container.querySelector(`div[data-x='${hx}'][data-y='${hy}']`);
    if (!cell) continue;

    const boardCell = board[hy][hx];
    if (!boardCell) {
      cell.style.backgroundColor = '#32CD32'; // green valid
    } else {
      cell.style.backgroundColor = '#FF6347'; // red invalid
    }
  }
}

export function clearPreview(container, board) {
  container.querySelectorAll('.cell').forEach(c => {
    const x = parseInt(c.dataset.x, 10);
    const y = parseInt(c.dataset.y, 10);
    const boardCell = board[y][x];
    if (boardCell && boardCell.ship) {
      c.style.backgroundColor = '#808080';
    } else {
      c.style.backgroundColor = '#87CEFA';
    }
  });
}

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

export function toggleScreen(showIntro) {
  const introScreen = document.getElementById('intro-screen');
  const gameScreen = document.getElementById('game-screen');
  if (showIntro) {
    introScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
  } else {
    introScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
  }
}
