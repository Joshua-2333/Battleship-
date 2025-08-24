// gameOver.js
import { toggleScreen } from './ui';
import { battleMusic } from './dom';

/**
 * Checks if the game is over and handles ending logic.
 * @param {Object} game - The main game object
 * @returns {boolean} true if game ended, false otherwise
 */
export function checkGameOver(game) {
  if (!game.gameStarted || game.gameOver) return false;

  let winner = null;
  if (game.playerBoard.allShipsSunk()) winner = 'enemy';
  else if (game.enemyBoard.allShipsSunk()) winner = 'player';

  if (!winner) return false;

  game.gameOver = true;

  // Stop battle music safely
  if (battleMusic && typeof battleMusic.pause === 'function') {
    try {
      battleMusic.pause();
      battleMusic.currentTime = 0;
    } catch (e) {
      console.warn('Battle music could not be stopped:', e);
    }
  }

  // Show game-over modal
  const modal = document.getElementById('game-over-modal');
  const title = document.getElementById('game-over-title');
  const restartBtn = document.getElementById('game-over-restart');
  const battleScreen = document.getElementById('battle-screen');

  if (!modal || !title || !restartBtn) {
    console.warn('Game over modal elements are missing in HTML!');
    return true;
  }

  // Hide the battle screen while modal is visible
  if (battleScreen) battleScreen.classList.add('hidden');

  // Get player name from input
  const playerNameInput = document.getElementById('player-name');
  const playerName = playerNameInput ? playerNameInput.value.trim() || 'Captain' : 'Captain';

  // Set winner message dynamically
  if (winner === 'player') {
    title.textContent = `🎉 Congrats ${playerName}! You sunk BlackBeard's fleet!`;
  } else {
    title.textContent = `💀 BlackBeard sunk Captain ${playerName}'s fleet! Better luck next time!`;
  }

  modal.classList.remove('hidden');

  // Restart button logic
  restartBtn.onclick = () => {
    modal.classList.add('hidden');
    if (battleScreen) battleScreen.classList.add('hidden'); // keep hidden until setup
    toggleScreen('intro');
    game.resetGame();
    game.placedShips = {};
    window.gameOverHandled = false;
    if (playerNameInput) playerNameInput.value = '';
  };

  return true;
}
