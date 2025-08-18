// ship.js
function createShip(length) {
  if (length <= 0) throw new Error('Ship length must be greater than 0');

  const hits = Array(length).fill(false);

  function hit(position) {
    if (position < 0 || position >= length) {
      throw new Error(`Invalid position: ${position}`);
    }
    hits[position] = true;
  }

  function isSunk() {
    return hits.every(Boolean);
  }

  return { length, hits, hit, isSunk };
}

export default createShip;
