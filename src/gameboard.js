// gameboard.js
import createShip from './ship';

function createGameboard(size = 10) {
  // 2D board array: null = empty, {type, ship?, index?} = occupied/attacked
  const board = Array.from({ length: size }, () => Array(size).fill(null));
  const ships = [];

  // Check if a ship placement is valid
  function isValidPlacement(length, x, y, direction) {
    if (x < 0 || y < 0 || x >= size || y >= size) return false;

    if (direction === 'horizontal') {
      if (x + length > size) return false; // can't go past right edge
      for (let i = 0; i < length; i++) {
        if (board[y][x + i] !== null) return false;
      }
    } else { // vertical
      if (y + length > size) return false; // can't go past bottom edge
      for (let i = 0; i < length; i++) {
        if (board[y + i][x] !== null) return false;
      }
    }
    return true;
  }

  // Place a ship on the board
  function placeShip(length, x, y, direction = 'horizontal', name = '') {
    if (!isValidPlacement(length, x, y, direction)) {
      console.warn(`Invalid placement for ship "${name}" at (${x}, ${y}) direction: ${direction}`);
      return null;
    }

    const ship = createShip(length, name);

    // Add UI properties
    ship.startX = x;
    ship.startY = y;
    ship.orientation = direction;
    ship.placed = true;

    const positions = [];
    for (let i = 0; i < length; i++) {
      const pos = direction === 'horizontal' ? [x + i, y] : [x, y + i];
      board[pos[1]][pos[0]] = { type: 'ship', ship, index: i };
      positions.push(pos);
    }

    ships.push({ ship, positions });
    return ship;
  }

  // Receive attack at x, y
  function receiveAttack(x, y) {
    if (x < 0 || x >= size || y < 0 || y >= size) return 'invalid';

    const cell = board[y][x];

    if (!cell) {
      board[y][x] = { type: 'miss' };
      return { result: 'miss' };
    }

    if (cell.type === 'miss' || (cell.type === 'ship' && cell.ship.hits[cell.index])) {
      return 'already attacked';
    }

    if (cell.type === 'ship') {
      cell.ship.hit(cell.index);
      return { result: 'hit', shipName: cell.ship.name || '' };
    }

    return 'error';
  }

  // Check if all ships are sunk
  function allShipsSunk() {
    return ships.every(entry => entry.ship.isSunk());
  }

  // Get the cell at coordinates
  function getCell(x, y) {
    if (x < 0 || x >= size || y < 0 || y >= size) return null;
    return board[y][x];
  }

  // Reset the board
  function resetBoard() {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        board[y][x] = null;
      }
    }
    ships.length = 0;
  }

  return {
    board,
    ships,
    size,
    placeShip,
    receiveAttack,
    allShipsSunk,
    isValidPlacement,
    getCell,
    resetBoard,
  };
}

export default createGameboard;
