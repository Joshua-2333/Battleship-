// gameOver.test.js
import { checkGameOver, resetGameOverFlag } from '../src/gameOver';
import { showMessage, toggleScreen } from '../src/ui';
import { battleMusic } from '../src/dom';

// Mock dependencies
jest.mock('../src/ui', () => ({
  showMessage: jest.fn(),
  toggleScreen: jest.fn(),
}));

jest.mock('../src/dom', () => ({
  battleMusic: {
    pause: jest.fn(),
    currentTime: 0,
  },
}));

// Helper to create mock game state
function createMockGame(playerSunk = false, enemySunk = false) {
  return {
    playerBoard: {
      allShipsSunk: jest.fn(() => playerSunk),
    },
    enemyBoard: {
      allShipsSunk: jest.fn(() => enemySunk),
    },
    gameOver: false,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  resetGameOverFlag();
});

describe('checkGameOver', () => {
  test('returns false if no game object provided', () => {
    expect(checkGameOver(null)).toBe(false);
    expect(showMessage).not.toHaveBeenCalled();
  });

  test('triggers game over when player loses', () => {
    const game = createMockGame(true, false);
    const result = checkGameOver(game);

    expect(result).toBe(true);
    expect(game.gameOver).toBe(true);
    expect(showMessage).toHaveBeenCalledWith('You lost! All your ships were sunk.', 3000);
    expect(toggleScreen).toHaveBeenCalledWith('game-over');
    expect(battleMusic.pause).toHaveBeenCalled();
  });

  test('triggers game over when enemy loses', () => {
    const game = createMockGame(false, true);
    const result = checkGameOver(game);

    expect(result).toBe(true);
    expect(game.gameOver).toBe(true);
    expect(showMessage).toHaveBeenCalledWith('You win! All enemy ships were sunk.', 3000);
    expect(toggleScreen).toHaveBeenCalledWith('game-over');
    expect(battleMusic.pause).toHaveBeenCalled();
  });

  test('returns false when no ships are sunk', () => {
    const game = createMockGame(false, false);
    const result = checkGameOver(game);

    expect(result).toBe(false);
    expect(showMessage).not.toHaveBeenCalled();
    expect(toggleScreen).not.toHaveBeenCalled();
  });

  test('does not trigger twice due to window.gameOverHandled flag', () => {
    const game = createMockGame(true, false);
    expect(checkGameOver(game)).toBe(true);
    // Second call should not trigger anything again
    expect(checkGameOver(game)).toBe(false);
    expect(showMessage).toHaveBeenCalledTimes(1);
  });
});
