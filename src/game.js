// game.js
import createGameboard from './gameboard';
import { checkGameOver } from './gameOver';

export function createGame() {
  const playerBoard = createGameboard();
  const enemyBoard = createGameboard();

  const shipsInfo = [
    { length: 5, name: 'Carrier' },
    { length: 4, name: 'Battleship' },
    { length: 3, name: 'Cruiser' },
    { length: 3, name: 'Submarine' },
    { length: 2, name: 'Destroyer' }
  ];

  let placedShips = {};
  let orientation = 'horizontal';
  let gameStarted = false;
  let _gameOver = false; // Internal state

  const enemyMemory = {
    attacks: new Set(),
    hits: [],
  };

  const gameAPI = {
    playerBoard,
    enemyBoard,
    shipsInfo,
    placedShips,
    get gameStarted() { return gameStarted; },
    get gameOver() { return _gameOver; },
    set gameOver(value) { _gameOver = value; },
    toggleOrientation,
    placePlayerShipByName,
    attackEnemy,
    computerAttack,
    startGame,
    resetGame,
    getPlayerName,
  };

  function toggleOrientation() {
    orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
    return orientation;
  }

  function getPlayerName() {
    const input = typeof document !== 'undefined' ? document.getElementById("player-name") : null;
    return input && input.value.trim() ? input.value.trim() : "Sailor";
  }

  function placePlayerShipByName(shipName, x, y, shipOrientation = orientation) {
    if (_gameOver) return false;
    const shipInfo = shipsInfo.find(s => s.name.toLowerCase() === shipName.toLowerCase());
    if (!shipInfo || placedShips[shipName]) return false;
    const valid = playerBoard.isValidPlacement(shipInfo.length, x, y, shipOrientation);
    if (!valid) return false;
    const ship = playerBoard.placeShip(shipInfo.length, x, y, shipOrientation, shipName);
    if (!ship) return false;
    placedShips[shipName] = { x, y, orientation: shipOrientation };
    return true;
  }

  function placeEnemyShipsRandomly() {
    for (const { length, name } of shipsInfo) {
      let placed = false;
      while (!placed) {
        const dir = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const x = Math.floor(Math.random() * enemyBoard.size);
        const y = Math.floor(Math.random() * enemyBoard.size);
        if (enemyBoard.isValidPlacement(length, x, y, dir)) {
          enemyBoard.placeShip(length, x, y, dir, name);
          placed = true;
        }
      }
    }
  }

  function attackEnemy(x, y) {
    if (_gameOver) return { result: 'game over', x, y };

    const result = enemyBoard.receiveAttack(x, y);
    checkGameOver(gameAPI);
    return result;
  }

  function computerAttack() {
    if (_gameOver) return { result: 'game over' };
    const size = playerBoard.size;
    let x, y, key;

    const getAdjacentTargets = (hx, hy) => {
      const adj = [
        [hx + 1, hy], [hx - 1, hy],
        [hx, hy + 1], [hx, hy - 1]
      ];
      return adj
        .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < size && ny < size)
        .map(([nx, ny]) => `${nx},${ny}`)
        .filter(k => !enemyMemory.attacks.has(k));
    };

    // Remove hits of sunk ships from memory
    enemyMemory.hits = enemyMemory.hits.filter(h => {
      const cell = playerBoard.getCell(h.x, h.y);
      return cell && cell.type === 'ship' && !cell.ship.isSunk();
    });

    // Target adjacent cells of last unsunk hit
    if (enemyMemory.hits.length > 0) {
      const lastHit = enemyMemory.hits[enemyMemory.hits.length - 1];
      const adjTargets = getAdjacentTargets(lastHit.x, lastHit.y);
      if (adjTargets.length > 0) {
        const choice = adjTargets[Math.floor(Math.random() * adjTargets.length)];
        [x, y] = choice.split(',').map(Number);
      }
    }

    // If no adjacent target, pick a random untried cell
    if (x === undefined || y === undefined) {
      do {
        x = Math.floor(Math.random() * size);
        y = Math.floor(Math.random() * size);
        key = `${x},${y}`;
      } while (enemyMemory.attacks.has(key));
    } else {
      key = `${x},${y}`;
    }

    const result = playerBoard.receiveAttack(x, y);
    enemyMemory.attacks.add(key);

    // Only remember hits for unsunk ships
    if (result.result === 'hit' && !result.isSunk) {
      enemyMemory.hits.push({ x, y });
    }

    checkGameOver(gameAPI);
    return { x, y, ...result };
  }

  function startGame() {
    placeEnemyShipsRandomly();
    gameStarted = true;
    _gameOver = false;
  }

  function resetGame() {
    playerBoard.resetBoard();
    enemyBoard.resetBoard();
    placedShips = {};
    orientation = 'horizontal';
    gameStarted = false;
    _gameOver = false;
    enemyMemory.attacks.clear();
    enemyMemory.hits = [];
  }

  return gameAPI;
}
