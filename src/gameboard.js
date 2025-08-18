// gameboard.js
import createShip from './ship';

function createGameboard(size = 10) {
  const board = Array.from({ length: size }, () => Array(size).fill(null));
  const ships = [];

  function isValidPlacement(length, x, y, direction) {
    if (direction === 'horizontal') {
      if (x + length > size) return false;
      for (let i = 0; i < length; i++) {
        if (board[y][x + i] !== null) return false;
      }
    } else {
      if (y + length > size) return false;
      for (let i = 0; i < length; i++) {
        if (board[y + i][x] !== null) return false;
      }
    }
    return true;
  }

  // Place a ship with optional name
  function placeShip(length, x, y, direction = 'horizontal', name = '') {
    if (!isValidPlacement(length, x, y, direction)) throw new Error('Invalid placement');
    const ship = createShip(length, name); // Pass name to ship
    const positions = [];

    for (let i = 0; i < length; i++) {
      const pos = direction === 'horizontal' ? [x + i, y] : [x, y + i];
      board[pos[1]][pos[0]] = { type: 'ship', ship, index: i };
      positions.push(pos);
    }

    ships.push({ ship, positions });
    return ship;
  }

  // Receive an attack at x,y
  function receiveAttack(x, y) {
    if (x < 0 || x >= size || y < 0 || y >= size) return 'invalid';

    const cell = board[y][x];

    if (!cell) {
      board[y][x] = { type: 'miss' };
      return 'miss';
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

  function allShipsSunk() {
    return ships.every(entry => entry.ship.isSunk());
  }

  function getCell(x, y) {
    if (x < 0 || x >= size || y < 0 || y >= size) return null;
    return board[y][x];
  }

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
