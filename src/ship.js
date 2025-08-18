// ship.js
function createShip(length, name = '') {
  const hits = Array(length).fill(false);

  function hit(index) {
    if (index >= 0 && index < length) hits[index] = true;
  }

  function isSunk() {
    return hits.every(h => h);
  }

  return {
    length,
    name,     // Store ship name
    hits,
    hit,
    isSunk,
  };
}

export default createShip;
