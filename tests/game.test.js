// tests/game.test.js
import { createGame } from '../src/game';
import * as gameOverModule from '../src/gameOver';
import * as uiModule from '../src/ui';

describe('Game.js - Game Over Behavior', () => {
  let game;
  let checkGameOverSpy;
  let showMessageSpy;
  let toggleScreenSpy;

  beforeEach(() => {
    // Reset window.gameOverHandled
    if (typeof window !== 'undefined') window.gameOverHandled = false;

    // Spy on UI methods to check handleGameOver triggers
    showMessageSpy = jest.spyOn(uiModule, 'showMessage').mockImplementation(() => {});
    toggleScreenSpy = jest.spyOn(uiModule, 'toggleScreen').mockImplementation(() => {});

    // Spy on checkGameOver
    checkGameOverSpy = jest.spyOn(gameOverModule, 'checkGameOver');

    // Create fresh game
    game = createGame();
    game.startGame();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('gameOver flag is false initially', () => {
    expect(game.gameOver).toBe(false);
  });

  test('attackEnemy stops further attacks if gameOver', () => {
    // Force game over
    game.gameOver = true;
    const result = game.attackEnemy(0, 0);
    expect(result.result).toBe('game over');
  });

  test('computerAttack stops further attacks if gameOver', () => {
    game.gameOver = true;
    const result = game.computerAttack();
    expect(result.result).toBe('game over');
  });

  test('checkGameOver is called after player attack', () => {
    game.attackEnemy(0, 0);
    expect(checkGameOverSpy).toHaveBeenCalled();
  });

  test('checkGameOver is called after computer attack', () => {
    game.computerAttack();
    expect(checkGameOverSpy).toHaveBeenCalled();
  });

  test('handleGameOver triggers when all enemy ships are sunk', () => {
    // Sink all enemy ships manually
    const enemyBoard = game.enemyBoard;
    enemyBoard.ships.forEach(shipEntry => {
      shipEntry.positions.forEach(pos => {
        enemyBoard.receiveAttack(pos.x, pos.y);
      });
    });

    // Force checkGameOver manually
    gameOverModule.checkGameOver(game);

    expect(game.gameOver).toBe(true);
    expect(showMessageSpy).toHaveBeenCalled();
    expect(toggleScreenSpy).toHaveBeenCalled();
  });

  test('handleGameOver triggers only once', () => {
    const enemyBoard = game.enemyBoard;
    enemyBoard.ships.forEach(shipEntry => {
      shipEntry.positions.forEach(pos => {
        enemyBoard.receiveAttack(pos.x, pos.y);
      });
    });

    gameOverModule.checkGameOver(game);
    gameOverModule.checkGameOver(game); // Call again

    expect(showMessageSpy).toHaveBeenCalledTimes(1);
    expect(toggleScreenSpy).toHaveBeenCalledTimes(1);
  });
});
