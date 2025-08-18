// gameboard.test.js
import createGameboard from '../src/gameboard';

test('place ship and validate board', () => {
  const board = createGameboard();
  const ship = board.placeShip(3, 0, 0, 'horizontal');

  expect(board.board[0][0]).toBe(ship);
  expect(board.board[0][1]).toBe(ship);
  expect(board.board[0][2]).toBe(ship);
  expect(board.isValidPlacement(2, 0, 0, 'horizontal')).toBe(false); // overlaps
});

test('receive attacks', () => {
  const board = createGameboard();
  const ship = board.placeShip(2, 0, 0, 'horizontal');

  expect(board.receiveAttack(0,0)).toBe('hit');
  expect(board.receiveAttack(1,0)).toBe('hit');
  expect(board.allShipsSunk()).toBe(true);

  expect(board.receiveAttack(5,5)).toBe('miss');
});
