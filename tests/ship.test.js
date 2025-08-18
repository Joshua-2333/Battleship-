// ship.test.js
import createShip from '../src/ship';

test('ship can be hit and track hits', () => {
  const ship = createShip(3);
  ship.hit(0);
  ship.hit(2);
  expect(ship.hits).toEqual([true, false, true]);
});

test('ship is not sunk until all hits', () => {
  const ship = createShip(2);
  ship.hit(0);
  expect(ship.isSunk()).toBe(false);
  ship.hit(1);
  expect(ship.isSunk()).toBe(true);
});

test('hitting invalid position throws error', () => {
  const ship = createShip(2);
  expect(() => ship.hit(2)).toThrow();
  expect(() => ship.hit(-1)).toThrow();
});
