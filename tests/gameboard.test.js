// tests/gameboard.test.js
import createGameboard from '../src/gameboard';

describe('Gameboard', () => {
  let board;

  beforeEach(() => {
    board = createGameboard();
  });

  test('initializes with empty board of default size', () => {
    expect(board.board.length).toBe(10);
    expect(board.board.every(row => row.length === 10)).toBe(true);
    expect(board.ships).toEqual([]);
    expect(board.misses).toEqual([]);
  });

  test('validates ship placement correctly', () => {
    expect(board.isValidPlacement(3, 0, 0, 'horizontal')).toBe(true);
    expect(board.isValidPlacement(3, 8, 0, 'horizontal')).toBe(false); // out of bounds
    expect(board.isValidPlacement(3, 0, 8, 'vertical')).toBe(false);
  });

  test('places ship horizontally', () => {
    const ship = board.placeShip(3, 0, 0, 'horizontal', 'Destroyer');
    expect(ship).toBeTruthy();
    expect(board.ships.length).toBe(1);
    expect(board.getCell(0, 0).type).toBe('ship');
    expect(board.getCell(1, 0).type).toBe('ship');
    expect(board.getCell(2, 0).type).toBe('ship');
  });

  test('places ship vertically', () => {
    const ship = board.placeShip(2, 0, 0, 'vertical', 'Patrol');
    expect(ship).toBeTruthy();
    expect(board.getCell(0, 0).type).toBe('ship');
    expect(board.getCell(0, 1).type).toBe('ship');
  });

  test('prevents overlapping ship placement', () => {
    board.placeShip(2, 0, 0, 'horizontal');
    const invalid = board.placeShip(2, 0, 0, 'vertical');
    expect(invalid).toBeNull();
  });

  test('records misses correctly', () => {
    const result = board.receiveAttack(5, 5);
    expect(result.result).toBe('miss');
    expect(board.misses).toContainEqual({ x: 5, y: 5 });
    expect(board.getCell(5, 5).type).toBe('miss');
  });

  test('registers hit and sunk correctly', () => {
    board.placeShip(2, 0, 0, 'horizontal', 'Patrol');
    const hit1 = board.receiveAttack(0, 0);
    expect(hit1.result).toBe('hit');
    expect(hit1.isSunk).toBe(false);

    const hit2 = board.receiveAttack(1, 0);
    expect(hit2.result).toBe('hit');
    expect(hit2.isSunk).toBe(true); // second hit sinks it
  });

  test('detects allShipsSunk', () => {
    board.placeShip(1, 0, 0, 'horizontal', 'Sub');
    expect(board.allShipsSunk()).toBe(false);
    board.receiveAttack(0, 0);
    expect(board.allShipsSunk()).toBe(true);
  });

  test('returns already attacked for repeated hit', () => {
    board.placeShip(1, 0, 0);
    board.receiveAttack(0, 0);
    const repeat = board.receiveAttack(0, 0);
    expect(repeat.result).toBe('already attacked');
  });

  test('returns invalid for out-of-bounds attack', () => {
    const result = board.receiveAttack(20, 20);
    expect(result.result).toBe('invalid');
  });

  test('resets board', () => {
    board.placeShip(1, 0, 0);
    board.receiveAttack(0, 0);
    board.resetBoard();
    expect(board.ships.length).toBe(0);
    expect(board.misses.length).toBe(0);
    expect(board.board.flat().every(c => c === null)).toBe(true);
  });
});
