// tests/ship.test.js
import createShip from '../src/ship';

describe('createShip', () => {
  test('should throw error for non-positive length', () => {
    expect(() => createShip(0)).toThrow('Ship length must be greater than 0');
    expect(() => createShip(-2)).toThrow('Ship length must be greater than 0');
  });

  test('should initialize ship properties correctly', () => {
    const ship = createShip(3, 'Destroyer');

    expect(ship.length).toBe(3);
    expect(ship.name).toBe('Destroyer');
    expect(ship.hits).toEqual([false, false, false]);
    expect(ship.placed).toBe(false);
    expect(ship.coordinates).toEqual([]);
  });

  test('should set placement correctly for horizontal orientation', () => {
    const ship = createShip(3);
    ship.setPlacement(1, 2, 'horizontal');

    expect(ship.placed).toBe(true);
    expect(ship.orientation).toBe('horizontal');
    expect(ship.startX).toBe(1);
    expect(ship.startY).toBe(2);
    expect(ship.coordinates).toEqual([
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
    ]);
  });

  test('should set placement correctly for vertical orientation', () => {
    const ship = createShip(2);
    ship.setPlacement(0, 0, 'vertical');

    expect(ship.placed).toBe(true);
    expect(ship.orientation).toBe('vertical');
    expect(ship.startX).toBe(0);
    expect(ship.startY).toBe(0);
    expect(ship.coordinates).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 1 },
    ]);
  });

  test('should register hits by index', () => {
    const ship = createShip(2);
    ship.setPlacement(0, 0, 'horizontal');

    ship.hit(0);
    expect(ship.hits).toEqual([true, false]);

    ship.hit(1);
    expect(ship.hits).toEqual([true, true]);
  });

  test('should register hits by coordinates', () => {
    const ship = createShip(3);
    ship.setPlacement(2, 2, 'horizontal');

    ship.hit(3, 2); // middle segment
    expect(ship.hits).toEqual([false, true, false]);

    ship.hit(2, 2); // first segment
    ship.hit(4, 2); // last segment
    expect(ship.hits).toEqual([true, true, true]);
  });

  test('should correctly report if sunk', () => {
    const ship = createShip(2);
    ship.setPlacement(0, 0, 'vertical');

    expect(ship.isSunk()).toBe(false);
    ship.hit(0);
    expect(ship.isSunk()).toBe(false);
    ship.hit(1);
    expect(ship.isSunk()).toBe(true);
  });

  test('hit does nothing if ship not placed', () => {
    const ship = createShip(2);
    ship.hit(0);
    expect(ship.hits).toEqual([false, false]);
  });
});
