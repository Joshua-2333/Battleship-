// ship.js
function createShip(length, name = '') {
  if (length <= 0) throw new Error('Ship length must be greater than 0');

  const hits = Array(length).fill(false);

  // Mark a specific segment of the ship as hit
  function hit(index) {
    if (index < 0 || index >= length) return;
    hits[index] = true;
  }

  // Check if all segments of the ship are hit
  function isSunk() {
    return hits.every(h => h === true);
  }

  return {
    length,
    name,     // Ship name for UI and tracking
    hits,     // Array of hits for each segment
    hit,      // Function to register a hit
    isSunk,   // Function to check if sunk
  };
}

export default createShip;
