// gameOver.js
import { showMessage, toggleScreen } from './ui';
import { battleMusic } from './dom';

/**
 * Checks if the game is over and handles ending logic.
 * @param {Object} game - The main game object
 * @returns {boolean} true if game ended, false otherwise
 */
export function checkGameOver(game) {
  if (!game) return false;

  // Guard to prevent repeated triggers
  if (window.gameOverHandled) return false;

  // Player lost
  if (game.playerBoard.allShipsSunk()) {
    game.gameOver = true;           // Set gameOver flag
    handleGameOver('You lost! All your ships were sunk.');
    return true;
  }

  // Player won
  if (game.enemyBoard.allShipsSunk()) {
    game.gameOver = true;           // Set gameOver flag
    handleGameOver('You win! All enemy ships were sunk.');
    return true;
  }

  return false;
}

/**
 * Handles all end-of-game actions: stops music, shows UI message/modal.
 * @param {string} message - Message to display on game over
 */
function handleGameOver(message) {
  // Prevent multiple executions
  if (window.gameOverHandled) return;
  window.gameOverHandled = true;

  // Stop battle music safely
  if (battleMusic && typeof battleMusic.pause === 'function') {
    try {
      battleMusic.pause();
      battleMusic.currentTime = 0;
    } catch (e) {
      console.warn('Battle music could not be stopped:', e);
    }
  }

  // Show message
  showMessage(message, 3000);

  // Display a "game over" modal or screen
  toggleScreen('game-over'); // Make sure your HTML has an element with this ID
}

/**
 * Resets the game-over flag (call this in game.resetGame())
 */
export function resetGameOverFlag() {
  window.gameOverHandled = false;
}
