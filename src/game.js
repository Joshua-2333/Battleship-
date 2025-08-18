// game.js
import createGameboard from './gameboard';

export function createGame() {
  const playerBoard = createGameboard();
  const enemyBoard = createGameboard();
  const shipLengths = [5, 4, 3, 3, 2];
  let currentShipIndex = 0;
  let orientation = 'horizontal';
  let gameStarted = false;

  // Toggle horizontal/vertical
  function toggleOrientation() {
    orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
    return orientation;
  }

  // Place player ship
  function placePlayerShip(x, y) {
    if (currentShipIndex >= shipLengths.length) return false;

    const length = shipLengths[currentShipIndex];
    if (!playerBoard.isValidPlacement(length, x, y, orientation)) return false;

    playerBoard.placeShip(length, x, y, orientation);
    currentShipIndex++;
    return true;
  }

  // Automatically place enemy ships
  function placeEnemyShipsRandomly() {
    for (const length of shipLengths) {
      let placed = false;
      while (!placed) {
        const dir = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const x = Math.floor(Math.random() * enemyBoard.size);
        const y = Math.floor(Math.random() * enemyBoard.size);
        if (enemyBoard.isValidPlacement(length, x, y, dir)) {
          enemyBoard.placeShip(length, x, y, dir);
          placed = true;
        }
      }
    }
  }

  // Player attacks enemy
  function attackEnemy(x, y) {
    const result = enemyBoard.receiveAttack(x, y);
    if (result !== 'already attacked' && !enemyBoard.allShipsSunk()) {
      setTimeout(computerAttack, 500); // Enemy attacks after 0.5s
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
    shipLengths,
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
