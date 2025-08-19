// game.js
import createGameboard from './gameboard';

export function createGame() {
  const playerBoard = createGameboard();
  const enemyBoard = createGameboard();

  // Ship lengths and corresponding names
  const shipsInfo = [
    { length: 5, name: 'Carrier' },
    { length: 4, name: 'Battleship' },
    { length: 3, name: 'Cruiser' },
    { length: 3, name: 'Submarine' },
    { length: 2, name: 'Destroyer' }
  ];

  let placedShips = {}; // Track placed ships by name
  let orientation = 'horizontal';
  let gameStarted = false;

  // Toggle horizontal/vertical
  function toggleOrientation() {
    orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
    return orientation;
  }

  // Place a ship on the player board
  // Returns true if successful, false if invalid or already placed
  function placePlayerShipByName(shipName, x, y, shipOrientation = orientation) {
    const shipInfo = shipsInfo.find(s => s.name.toLowerCase() === shipName.toLowerCase());
    if (!shipInfo) return false; // Unknown ship
    if (placedShips[shipName]) return false; // Already placed

    if (!playerBoard.isValidPlacement(shipInfo.length, x, y, shipOrientation)) return false;

    playerBoard.placeShip(shipInfo.length, x, y, shipOrientation, shipName);
    placedShips[shipName] = { x, y, orientation: shipOrientation };
    return true;
  }

  // Automatically place enemy ships with names
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

  // Enemy attacks player
  function computerAttack() {
    let x, y, result;
    do {
      x = Math.floor(Math.random() * playerBoard.size);
      y = Math.floor(Math.random() * playerBoard.size);
      result = playerBoard.receiveAttack(x, y);
    } while (result === 'already attacked');
    return { x, y, result };
  }

  // Start game
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
