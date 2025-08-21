// game.js
import createGameboard from './gameboard';
import { updateCell } from './ui';

export function createGame() {
  const playerBoard = createGameboard();
  const enemyBoard = createGameboard();

  // Ship definitions
  const shipsInfo = [
    { length: 5, name: 'Carrier' },
    { length: 4, name: 'Battleship' },
    { length: 3, name: 'Cruiser' },
    { length: 3, name: 'Submarine' },
    { length: 2, name: 'Destroyer' }
  ];

  let placedShips = {}; // Tracks ships placed by player
  let orientation = 'horizontal';
  let gameStarted = false;

  // --- Enemy AI State ---
  const enemyMemory = {
    attacks: new Set(),  // Stores attacked coordinates as 'x,y'
    hits: [],            // Stack of hits to target adjacent cells
  };

  // Toggle horizontal/vertical orientation
  function toggleOrientation() {
    orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
    return orientation;
  }

  // Place a ship on the player board by name
  function placePlayerShipByName(shipName, x, y, shipOrientation = orientation) {
    const shipInfo = shipsInfo.find(s => s.name.toLowerCase() === shipName.toLowerCase());
    if (!shipInfo) return false;
    if (placedShips[shipName]) return false;

    const valid = playerBoard.isValidPlacement(shipInfo.length, x, y, shipOrientation);
    if (!valid) return false;

    const ship = playerBoard.placeShip(shipInfo.length, x, y, shipOrientation, shipName);
    if (!ship) return false;

    placedShips[shipName] = { x, y, orientation: shipOrientation };
    return true;
  }

  // Randomly place enemy ships
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

  // Player attacks enemy
  function attackEnemy(x, y) {
    const coordKey = `${x},${y}`;
    if (enemyBoard.getCell(x, y)?.attacked) {
      return { result: 'already attacked' };
    }

    const result = enemyBoard.receiveAttack(x, y);

    return result.result === 'hit'
      ? { result: 'hit', shipName: result.ship?.name, x, y }
      : { result: 'miss', x, y };
  }

  // --- Enemy AI attack ---
  function computerAttack(playerContainer) {
    const size = playerBoard.size;
    let x, y, key, result;

    const getAdjacentTargets = (hx, hy) => {
      const adj = [
        [hx + 1, hy], [hx - 1, hy],
        [hx, hy + 1], [hx, hy - 1]
      ];
      return adj.filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < size && ny < size)
                .map(([nx, ny]) => `${nx},${ny}`)
                .filter(k => !enemyMemory.attacks.has(k));
    };

    // If previous hits exist, target adjacent cells
    if (enemyMemory.hits.length > 0) {
      const lastHit = enemyMemory.hits[enemyMemory.hits.length - 1];
      const adjTargets = getAdjacentTargets(lastHit.x, lastHit.y);
      if (adjTargets.length > 0) {
        const choice = adjTargets[Math.floor(Math.random() * adjTargets.length)];
        [x, y] = choice.split(',').map(Number);
      }
    }

    // Otherwise pick random untried cell
    if (x === undefined || y === undefined) {
      do {
        x = Math.floor(Math.random() * size);
        y = Math.floor(Math.random() * size);
        key = `${x},${y}`;
      } while (enemyMemory.attacks.has(key));
    } else {
      key = `${x},${y}`;
    }

    result = playerBoard.receiveAttack(x, y);
    enemyMemory.attacks.add(key);

    if (result.result === 'hit') {
      enemyMemory.hits.push({ x, y });
    }

    // If ship is sunk, clear its hit cells from memory
    if (result.ship?.isSunk()) {
      enemyMemory.hits = enemyMemory.hits.filter(
        h => !result.ship.coordinates.some(p => p.x === h.x && p.y === h.y)
      );
    }

    // Update UI directly for player grid
    updateCell(playerContainer, x, y, result.result);

    return { x, y, result: result.result };
  }

  // Start the game
  function startGame() {
    placeEnemyShipsRandomly();
    gameStarted = true;
  }

  // Reset game
  function resetGame() {
    playerBoard.resetBoard();
    enemyBoard.resetBoard();
    placedShips = {};
    orientation = 'horizontal';
    gameStarted = false;
    enemyMemory.attacks.clear();
    enemyMemory.hits = [];
  }

  return {
    playerBoard,
    enemyBoard,
    shipsInfo,
    placedShips,
    orientation,
    gameStarted,
    toggleOrientation,
    placePlayerShipByName,
    attackEnemy,
    computerAttack,
    startGame,
    resetGame,
  };
}
