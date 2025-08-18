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

  let currentShipIndex = 0;
  let orientation = 'horizontal';
  let gameStarted = false;

  // Toggle horizontal/vertical
  function toggleOrientation() {
    orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
    return orientation;
  }

  // Place player ship with name
  function placePlayerShip(x, y) {
    if (currentShipIndex >= shipsInfo.length) return false;

    const { length, name } = shipsInfo[currentShipIndex];
    if (!playerBoard.isValidPlacement(length, x, y, orientation)) return false;

    playerBoard.placeShip(length, x, y, orientation, name);
    currentShipIndex++;
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
    currentShipIndex = 0;
    orientation = 'horizontal';
    gameStarted = false;
  }

  return {
    playerBoard,
    enemyBoard,
    shipsInfo,
    currentShipIndex,
    orientation,
    gameStarted,
    toggleOrientation,
    placePlayerShip,
    attackEnemy,
    computerAttack,
    startGame,
    resetGame,
  };
}
