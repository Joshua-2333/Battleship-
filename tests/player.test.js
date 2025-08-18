// player.test.js
import createPlayer from '../src/player';

test('player can place ships and track hits', () => {
  const player = createPlayer('Captain Jack');
  const ship = player.placeShip(2, [0, 1]);

  expect(player.ships.length).toBe(1);
  expect(player.ships[0].ship.hits).toEqual([false, false]);

  expect(player.receiveAttack(0)).toBe('hit');
  expect(player.ships[0].ship.hits).toEqual([true, false]);
  expect(player.receiveAttack(5)).toBe('miss');
});

test('player can check if all ships are sunk', () => {
  const player = createPlayer('Anne Bonny');
  const ship = player.placeShip(2, [0, 1]);
  player.receiveAttack(0);
  expect(player.allShipsSunk()).toBe(false);
  player.receiveAttack(1);
  expect(player.allShipsSunk()).toBe(true);
});
