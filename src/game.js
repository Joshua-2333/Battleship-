// game.js
import createGameboard from './gameboard';

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

  // Toggle horizontal/vertical orientation
  function toggleOrientation() {
    orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
    return orientation;
  }

  // Place a ship on the player board by name
  function placePlayerShipByName(shipName, x, y, shipOrientation = orientation) {
    const shipInfo = shipsInfo.find(s => s.name.toLowerCase() === shipName.toLowerCase());
    if (!shipInfo) return false;            // Invalid ship
    if (placedShips[shipName]) return false; // Already placed

    const valid = playerBoard.isValidPlacement(shipInfo.length, x, y, shipOrientation);
    if (!valid) {
      console.warn(`Cannot place ${shipName} at (${x}, ${y}) orientation: ${shipOrientation}`);
      return false;
    }

    const ship = playerBoard.placeShip(shipInfo.length, x, y, shipOrientation, shipName);
    if (!ship) return false; // Defensive: placeShip can fail

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
    const cell = enemyBoard.getCell(x, y);
    const result = enemyBoard.receiveAttack(x, y);

    if (result.result === 'hit' && cell && cell.ship) {
      return { result: 'hit', shipName: cell.ship.name };
    }

    return result;
  }

  // Enemy AI attack
  function computerAttack() {
    let x, y, result;
    do {
      x = Math.floor(Math.random() * playerBoard.size);
      y = Math.floor(Math.random() * playerBoard.size);
      result = playerBoard.receiveAttack(x, y);
    } while (result === 'already attacked');
    return { x, y, result };
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
