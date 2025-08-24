// tests/player.test.js
import createPlayer from '../src/player';
import createGameboard from '../src/gameboard';

describe('Player functionality', () => {
  let player;
  let opponent;

  beforeEach(() => {
    player = createPlayer('Alice');
    opponent = createPlayer('Bob');
  });

  test('should initialize with correct properties', () => {
    expect(player.name).toBe('Alice');
    expect(player.isComputer).toBe(false);
    expect(player.gameboard).toBeDefined();
    expect(typeof player.attack).toBe('function');
  });

  test('should attack opponent board and return a valid result', () => {
    // Place a ship for opponent
    opponent.gameboard.placeShip(2, 0, 0, 'horizontal', 'Destroyer');
    const result = player.attack(opponent.gameboard, 0, 0);

    expect(['hit', 'miss', 'invalid']).toContain(result.result);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  test('should record a hit correctly', () => {
    opponent.gameboard.placeShip(2, 0, 0, 'horizontal', 'Destroyer');
    const hitResult = player.attack(opponent.gameboard, 0, 0);
    expect(hitResult.result).toBe('hit');
    expect(hitResult.shipName).toBe('Destroyer');
  });

  test('should record a miss correctly', () => {
    opponent.gameboard.placeShip(2, 0, 0, 'horizontal', 'Destroyer');
    const missResult = player.attack(opponent.gameboard, 5, 5);
    expect(missResult.result).toBe('miss');
    expect(opponent.gameboard.misses).toContainEqual({ x: 5, y: 5 });
  });

  test('should return already attacked if attacking same spot twice', () => {
    opponent.gameboard.placeShip(2, 0, 0, 'horizontal', 'Destroyer');
    player.attack(opponent.gameboard, 0, 0);
    const repeatAttack = player.attack(opponent.gameboard, 0, 0);
    expect(repeatAttack.result === 'already attacked' || repeatAttack === 'already attacked').toBe(true);
  });

  describe('Computer player behavior', () => {
    let computer;

    beforeEach(() => {
      computer = createPlayer('AI', true);
    });

    test('should track attempted attacks', () => {
      opponent.gameboard.placeShip(2, 0, 0, 'horizontal', 'Destroyer');
      const firstAttack = computer.attack(opponent.gameboard, 0, 0);
      const secondAttack = computer.attack(opponent.gameboard, 0, 0);

      // Second attack on same coords should return 'already attacked'
      expect(secondAttack).toBe('already attacked');
    });

    test('should allow valid attacks at different positions', () => {
      opponent.gameboard.placeShip(2, 0, 0, 'horizontal', 'Destroyer');
      const firstAttack = computer.attack(opponent.gameboard, 0, 0);
      const secondAttack = computer.attack(opponent.gameboard, 1, 0);
      expect(firstAttack.result).toBeDefined();
      expect(secondAttack.result).toBeDefined();
    });
  });
});
