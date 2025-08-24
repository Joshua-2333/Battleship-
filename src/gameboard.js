// gameboard.js
import createShip from './ship';

function createGameboard(size = 10) {
  const board = Array.from({ length: size }, () => Array(size).fill(null));
  const ships = [];
  const misses = [];

  function isValidPlacement(length, x, y, direction) {
    if (x < 0 || y < 0 || x >= size || y >= size) return false;

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

  function placeShip(length, x, y, direction = 'horizontal', name = '') {
    if (!isValidPlacement(length, x, y, direction)) {
      console.warn(`Invalid placement for ship "${name}" at (${x}, ${y}) direction: ${direction}`);
      return null;
    }

    const ship = createShip(length, name);
    ship.setPlacement(x, y, direction);

    const positions = [];
    for (let i = 0; i < length; i++) {
      const pos = direction === 'horizontal' ? { x: x + i, y } : { x, y: y + i };
      board[pos.y][pos.x] = { type: 'ship', ship, index: i };
      positions.push(pos);
    }

    ships.push({ ship, positions });
    return ship;
  }

  function receiveAttack(x, y) {
    if (x < 0 || x >= size || y < 0 || y >= size) 
      return { result: 'invalid', x, y, gameOver: allShipsSunk() };

    const cell = board[y][x];

    if (!cell) {
      board[y][x] = { type: 'miss' };
      misses.push({ x, y });
      return { result: 'miss', x, y, gameOver: allShipsSunk() };
    }

    if (cell.type === 'miss') {
      return { result: 'already attacked', x, y, gameOver: allShipsSunk() };
    }

    if (cell.type === 'ship') {
      // Use ship.hit() instead of hitsCount
      if (!cell.ship.placed) return { result: 'error', x, y, gameOver: allShipsSunk() };

      cell.ship.hit(cell.index);
      const sunk = cell.ship.isSunk();

      return { 
        result: 'hit', 
        shipName: cell.ship.name, 
        x, 
        y, 
        isSunk: sunk,
        gameOver: allShipsSunk() 
      };
    }

    return { result: 'error', x, y, gameOver: allShipsSunk() };
  }

  function allShipsSunk() {
    return ships.length > 0 && ships.every(entry => entry.ship.isSunk());
  }

  function getCell(x, y) {
    if (x < 0 || x >= size || y < 0 || y >= size) return null;
    return board[y][x];
  }

  function resetBoard() {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) board[y][x] = null;
    }
    ships.length = 0;
    misses.length = 0;
  }

  return {
    board,
    ships,
    misses,
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
