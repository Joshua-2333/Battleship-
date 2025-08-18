// player.js
import createShip from './ship';

function createPlayer(name) {
  const ships = [];
  const attacksReceived = [];

  function placeShip(length, positions) {
    if (!Array.isArray(positions) || positions.length !== length) {
      throw new Error('Positions must match ship length');
    }
    const ship = createShip(length);
    ships.push({ ship, positions });
    return ship;
  }

  function receiveAttack(position) {
    attacksReceived.push(position);
    for (const entry of ships) {
      const index = entry.positions.indexOf(position);
      if (index !== -1) {
        entry.ship.hit(index);
        return 'hit';
      }
    }
    return 'miss';
  }

  function allShipsSunk() {
    return ships.every(entry => entry.ship.isSunk());
  }

  return {
    name,
    ships,
    attacksReceived,
    placeShip,
    receiveAttack,
    allShipsSunk,
  };
}

export default createPlayer;
