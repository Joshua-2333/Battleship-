// player.js
import createGameboard from './gameboard';

function createPlayer(name, isComputer = false) {
  const gameboard = createGameboard();

  // For AI/computer: track possible moves
  const attemptedAttacks = [];

  function attack(opponentBoard, x, y) {
    if (isComputer) {
      // Prevent repeat attacks
      if (attemptedAttacks.some(pos => pos[0] === x && pos[1] === y)) {
        return 'already attacked';
      }
      attemptedAttacks.push([x, y]);
    }
    return opponentBoard.receiveAttack(x, y);
  }

  return {
    name,
    isComputer,
    gameboard,
    attack,
  };
}

export default createPlayer;
