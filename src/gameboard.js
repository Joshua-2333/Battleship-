import createShip from './ship';

function createGameboard(size = 10) {
  const board = Array(size).fill(null).map(() => Array(size).fill(null));
  const ships = [];

  function isValidPlacement(length, x, y, direction) {
    if (direction === 'horizontal') {
      if (x + length > size) return false;
      for (let i = 0; i < length; i++) if (board[y][x + i] !== null) return false;
    } else {
      if (y + length > size) return false;
      for (let i = 0; i < length; i++) if (board[y + i][x] !== null) return false;
    }
    return true;
  }

  function placeShip(length, x, y, direction = 'horizontal') {
    if (!isValidPlacement(length, x, y, direction)) throw new Error('Invalid placement');
    const ship = createShip(length);
    const positions = [];

    for (let i = 0; i < length; i++) {
      const pos = direction === 'horizontal' ? [x + i, y] : [x, y + i];
      board[pos[1]][pos[0]] = { ship, index: i };
      positions.push(pos);
    }

    ships.push({ ship, positions });
    return ship;
  }

  function receiveAttack(x, y) {
    const cell = board[y][x];
    if (cell === 'miss' || (cell && cell.ship && cell.ship.hits[cell.index])) {
      return 'already attacked';
    }
    if (cell === null) {
      board[y][x] = 'miss';
      return 'miss';
    } else {
      const { ship, index } = cell;
      ship.hit(index);
      return 'hit';
    }
  }

  function allShipsSunk() {
    return ships.every(entry => entry.ship.isSunk());
  }

  return {
    board,
    ships,
    placeShip,
    receiveAttack,
    allShipsSunk,
    isValidPlacement,
  };
}

export default createGameboard;
